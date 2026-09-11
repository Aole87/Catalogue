import { prisma } from '@car-parts/database';
import { PaymentStatus, OrderStatus, Prisma } from '@prisma/client';
import { PaymentStateMachine } from '../services/payment/payment-state-machine';
import { BadRequestException, NotFoundException } from '../errors/app-error';

export interface CreatePaymentParams {
  orderId: string;
  provider: string;
  method: string;
  amount: string;
  currency: string;
  internalReference: string;
  idempotencyKey?: string | null;
  providerReference?: string | null;
  metadata?: any;
  actorId?: string | null;
}

export interface SettlePaymentParams {
  paymentId: string;
  providerReference?: string;
  providerTransactionId?: string;
  actorId?: string | null;
  reason?: string;
  gatewayResponse?: any;
}

export interface SubmitSlipParams {
  paymentId: string;
  slipUrl: string;
  bankName?: string;
  transferAmount?: string;
  transferredAt?: Date;
  notes?: string;
  actorId?: string | null;
}

export interface VerifySlipParams {
  slipId: string;
  verifiedByUserId: string;
  verifiedAmount?: string;
  note?: string;
}

export interface RejectSlipParams {
  slipId: string;
  verifiedByUserId: string;
  rejectionReason: string;
}

export interface CreateRefundParams {
  paymentId: string;
  refundReference: string;
  amount: string;
  currency: string;
  reason: string;
  actorId?: string | null;
}

export class PaymentRepository {
  private static paymentIncludes = {
    order: {
      include: {
        customer: {
          include: {
            user: true,
          },
        },
      },
    },
    events: {
      orderBy: { createdAt: 'asc' as const },
    },
    transactions: {
      orderBy: { createdAt: 'desc' as const },
    },
    refunds: {
      orderBy: { createdAt: 'desc' as const },
    },
    slips: {
      orderBy: { createdAt: 'desc' as const },
    },
  };

  /**
   * Atomically creates a Payment record and its initial PaymentEvent.
   */
  static async createPayment(params: CreatePaymentParams) {
    return prisma.$transaction(async (tx) => {
      // If idempotencyKey is provided, check if payment already exists
      if (params.idempotencyKey) {
        const existing = await tx.payment.findUnique({
          where: { idempotencyKey: params.idempotencyKey },
          include: this.paymentIncludes,
        });
        if (existing) {
          return existing;
        }
      }

      const payment = await tx.payment.create({
        data: {
          orderId: params.orderId,
          internalReference: params.internalReference,
          idempotencyKey: params.idempotencyKey || null,
          provider: params.provider,
          method: params.method,
          status: PaymentStatus.PENDING,
          amount: params.amount,
          currency: params.currency || 'THB',
          providerReference: params.providerReference || null,
          metadata: params.metadata || Prisma.JsonNull,
          events: {
            create: {
              eventType: 'PAYMENT_CREATED',
              fromStatus: null,
              toStatus: PaymentStatus.PENDING,
              reason: 'Payment record initiated',
              actorId: params.actorId || null,
              payload: {
                provider: params.provider,
                method: params.method,
                amount: params.amount,
                currency: params.currency,
              },
            },
          },
        },
        include: this.paymentIncludes,
      });

      return payment;
    });
  }

  static async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: this.paymentIncludes,
    });
  }

  static async findByInternalReference(internalReference: string) {
    return prisma.payment.findUnique({
      where: { internalReference },
      include: this.paymentIncludes,
    });
  }

  static async findByProviderReference(providerReference: string) {
    return prisma.payment.findFirst({
      where: { providerReference },
      include: this.paymentIncludes,
    });
  }

  static async findByOrderId(orderId: string) {
    return prisma.payment.findMany({
      where: { orderId },
      include: this.paymentIncludes,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Atomically settles a payment:
   * 1. Validates current payment status.
   * 2. Moves Payment -> PAID.
   * 3. Moves Order -> PAYMENT_CONFIRMED.
   * 4. Logs OrderStatusHistory and PaymentEvent.
   */
  static async settlePayment(params: SettlePaymentParams) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: params.paymentId },
        include: { order: true },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Idempotency: If already PAID, return current state without re-executing transitions
      if (payment.status === PaymentStatus.PAID) {
        return tx.payment.findUnique({
          where: { id: params.paymentId },
          include: this.paymentIncludes,
        });
      }

      // Validate legal transition
      PaymentStateMachine.validateTransition(payment.status, PaymentStatus.PAID);

      const now = new Date();

      // Update Payment to PAID
      const updatedPayment = await tx.payment.update({
        where: { id: params.paymentId },
        data: {
          status: PaymentStatus.PAID,
          paidAt: now,
          providerReference: params.providerReference || payment.providerReference,
        },
      });

      // Update Order to PAYMENT_CONFIRMED
      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.PAYMENT_CONFIRMED,
        },
      });

      // Append OrderStatusHistory
      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          fromStatus: payment.order.status,
          toStatus: OrderStatus.PAYMENT_CONFIRMED,
          note: params.reason || `Payment settled via ${payment.provider}`,
          changedByUserId: params.actorId || null,
        },
      });

      // Append PaymentEvent
      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          eventType: 'PAYMENT_SETTLED',
          fromStatus: payment.status,
          toStatus: PaymentStatus.PAID,
          reason: params.reason || 'Payment successfully verified and settled',
          actorId: params.actorId || null,
          payload: {
            providerTransactionId: params.providerTransactionId,
            paidAt: now,
            gatewayResponse: params.gatewayResponse || null,
          },
        },
      });

      // Append PaymentTransaction
      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          transactionType: 'CHARGE',
          amount: payment.amount,
          currency: payment.currency,
          status: 'SUCCESS',
          providerTransactionId: params.providerTransactionId || null,
          gatewayResponse: params.gatewayResponse || Prisma.JsonNull,
        },
      });

      return tx.payment.findUnique({
        where: { id: params.paymentId },
        include: this.paymentIncludes,
      });
    });
  }

  /**
   * Customer submits a bank transfer slip.
   */
  static async submitSlip(params: SubmitSlipParams) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: params.paymentId },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status === PaymentStatus.PAID) {
        throw new BadRequestException('Payment is already settled and confirmed');
      }

      const slip = await tx.paymentSlip.create({
        data: {
          paymentId: params.paymentId,
          slipUrl: params.slipUrl,
          bankName: params.bankName || null,
          transferAmount: params.transferAmount || payment.amount,
          transferredAt: params.transferredAt || new Date(),
          notes: params.notes || null,
          status: 'PENDING_REVIEW',
        },
      });

      await tx.paymentEvent.create({
        data: {
          paymentId: params.paymentId,
          eventType: 'SLIP_SUBMITTED',
          fromStatus: payment.status,
          toStatus: payment.status,
          reason: 'Customer submitted bank transfer slip for verification',
          actorId: params.actorId || null,
          payload: {
            slipId: slip.id,
            transferAmount: params.transferAmount,
            bankName: params.bankName,
          },
        },
      });

      return slip;
    });
  }

  /**
   * Staff verifies bank transfer slip and settles payment atomically.
   */
  static async verifySlip(params: VerifySlipParams) {
    return prisma.$transaction(async (tx) => {
      const slip = await tx.paymentSlip.findUnique({
        where: { id: params.slipId },
        include: {
          payment: {
            include: { order: true },
          },
        },
      });

      if (!slip) {
        throw new NotFoundException('Payment slip not found');
      }

      if (slip.status === 'VERIFIED') {
        throw new BadRequestException('Slip is already verified');
      }

      const payment = slip.payment;

      // Validate verified amount matches order grandTotal
      const expectedAmount = Number(payment.amount).toFixed(2);
      const submittedAmount = params.verifiedAmount
        ? Number(params.verifiedAmount).toFixed(2)
        : slip.transferAmount
        ? Number(slip.transferAmount).toFixed(2)
        : expectedAmount;

      if (submittedAmount !== expectedAmount) {
        throw new BadRequestException(
          `Verified amount (฿${submittedAmount}) does not match order grand total (฿${expectedAmount})`
        );
      }

      const now = new Date();

      // Update slip status
      await tx.paymentSlip.update({
        where: { id: params.slipId },
        data: {
          status: 'VERIFIED',
          verifiedByUserId: params.verifiedByUserId,
          verifiedAt: now,
          transferAmount: submittedAmount,
        },
      });

      // Settle payment
      PaymentStateMachine.validateTransition(payment.status, PaymentStatus.PAID);

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: now,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.PAYMENT_CONFIRMED,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          fromStatus: payment.order.status,
          toStatus: OrderStatus.PAYMENT_CONFIRMED,
          note: params.note || 'Bank transfer slip verified by staff',
          changedByUserId: params.verifiedByUserId,
        },
      });

      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          eventType: 'SLIP_VERIFIED',
          fromStatus: payment.status,
          toStatus: PaymentStatus.PAID,
          reason: `Bank slip verified by staff (${params.verifiedByUserId})`,
          actorId: params.verifiedByUserId,
          payload: {
            slipId: slip.id,
            verifiedAmount: submittedAmount,
          },
        },
      });

      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          transactionType: 'CHARGE',
          amount: payment.amount,
          currency: payment.currency,
          status: 'SUCCESS',
          providerTransactionId: `SLIP-${slip.id}`,
        },
      });

      return tx.payment.findUnique({
        where: { id: payment.id },
        include: this.paymentIncludes,
      });
    });
  }

  /**
   * Staff rejects bank transfer slip.
   */
  static async rejectSlip(params: RejectSlipParams) {
    return prisma.$transaction(async (tx) => {
      const slip = await tx.paymentSlip.findUnique({
        where: { id: params.slipId },
        include: { payment: true },
      });

      if (!slip) {
        throw new NotFoundException('Payment slip not found');
      }

      const now = new Date();
      const updatedSlip = await tx.paymentSlip.update({
        where: { id: params.slipId },
        data: {
          status: 'REJECTED',
          verifiedByUserId: params.verifiedByUserId,
          verifiedAt: now,
          rejectionReason: params.rejectionReason,
        },
      });

      await tx.paymentEvent.create({
        data: {
          paymentId: slip.paymentId,
          eventType: 'SLIP_REJECTED',
          fromStatus: slip.payment.status,
          toStatus: slip.payment.status,
          reason: `Slip rejected: ${params.rejectionReason}`,
          actorId: params.verifiedByUserId,
          payload: {
            slipId: slip.id,
            rejectionReason: params.rejectionReason,
          },
        },
      });

      return updatedSlip;
    });
  }

  /**
   * Idempotently records a webhook event.
   * If already processed or received (including during concurrent race conditions), returns isDuplicate: true.
   */
  static async recordWebhookEvent(provider: string, eventId: string, eventType: string, payload: any) {
    try {
      const existing = await prisma.webhookEvent.findUnique({
        where: {
          provider_eventId: {
            provider,
            eventId,
          },
        },
      });

      if (existing) {
        return { isDuplicate: true, webhookEvent: existing };
      }

      const webhookEvent = await prisma.webhookEvent.create({
        data: {
          provider,
          eventId,
          eventType,
          payload: payload || {},
          status: 'RECEIVED',
        },
      });

      return { isDuplicate: false, webhookEvent };
    } catch (err: any) {
      if (err.code === 'P2002') {
        // Concurrency race: another thread created the webhook event record simultaneously
        const existing = await prisma.webhookEvent.findUnique({
          where: {
            provider_eventId: {
              provider,
              eventId,
            },
          },
        });
        if (existing) {
          return { isDuplicate: true, webhookEvent: existing };
        }
      }
      throw err;
    }
  }

  static async markWebhookProcessed(id: string, status: 'PROCESSED' | 'FAILED' = 'PROCESSED') {
    return prisma.webhookEvent.update({
      where: { id },
      data: {
        status,
        processedAt: new Date(),
      },
    });
  }

  /**
   * Processes a refund:
   * Validates cumulative refund <= paid amount and updates state.
   */
  static async refundPayment(params: CreateRefundParams) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: params.paymentId },
        include: {
          order: true,
          refunds: true,
        },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== PaymentStatus.PAID && payment.status !== PaymentStatus.PARTIALLY_REFUNDED) {
        throw new BadRequestException(`Cannot refund a payment with status '${payment.status}'. Only PAID payments can be refunded.`);
      }

      // Calculate total existing refunds
      const totalRefundedSoFar = payment.refunds
        .filter((r) => r.status === 'COMPLETED')
        .reduce((sum, r) => sum + Number(r.amount), 0);

      const requestedRefund = Number(params.amount);
      const paidAmount = Number(payment.amount);

      if (requestedRefund <= 0) {
        throw new BadRequestException('Refund amount must be greater than 0');
      }

      if (totalRefundedSoFar + requestedRefund > paidAmount + 0.001) {
        throw new BadRequestException(
          `Refund amount exceeds paid total. Paid: ฿${paidAmount.toFixed(2)}, Already Refunded: ฿${totalRefundedSoFar.toFixed(2)}, Requested: ฿${requestedRefund.toFixed(2)}`
        );
      }

      const isFullRefund = Math.abs(totalRefundedSoFar + requestedRefund - paidAmount) < 0.01;
      const targetPaymentStatus = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

      // Create refund record
      const refund = await tx.paymentRefund.create({
        data: {
          paymentId: payment.id,
          refundReference: params.refundReference,
          amount: params.amount,
          currency: params.currency || 'THB',
          reason: params.reason,
          status: 'COMPLETED',
        },
      });

      // Update payment status
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: targetPaymentStatus,
        },
      });

      // If full refund, update Order to REFUNDED
      if (isFullRefund) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            status: OrderStatus.REFUNDED,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            fromStatus: payment.order.status,
            toStatus: OrderStatus.REFUNDED,
            note: `Order fully refunded. Reason: ${params.reason}`,
            changedByUserId: params.actorId || null,
          },
        });
      }

      // Append PaymentEvent
      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          eventType: 'PAYMENT_REFUNDED',
          fromStatus: payment.status,
          toStatus: targetPaymentStatus,
          reason: params.reason,
          actorId: params.actorId || null,
          payload: {
            refundReference: params.refundReference,
            refundAmount: params.amount,
            isFullRefund,
          },
        },
      });

      // Append PaymentTransaction
      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          transactionType: 'REFUND',
          amount: params.amount,
          currency: params.currency || 'THB',
          status: 'SUCCESS',
          providerTransactionId: params.refundReference,
        },
      });

      return {
        refund,
        payment: await tx.payment.findUnique({
          where: { id: payment.id },
          include: this.paymentIncludes,
        }),
      };
    });
  }
}
