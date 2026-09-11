import crypto from 'crypto';
import { PaymentRepository } from '../repositories/payment.repository';
import { OrderRepository } from '../repositories/order.repository';
import { UserRepository } from '../repositories/user.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { PaymentProviderFactory } from './payment/providers/provider.factory';
import { NotFoundException, BadRequestException, ForbiddenException } from '../errors/app-error';
import { PaymentStatus, OrderStatus } from '@prisma/client';

export interface CreatePaymentInput {
  orderId: string;
  provider?: string;
  method?: string;
  idempotencyKey?: string;
  userId?: string;
}

export interface SubmitSlipInput {
  slipUrl: string;
  bankName?: string;
  transferAmount?: string;
  transferredAt?: Date;
  notes?: string;
}

export interface VerifySlipInput {
  verifiedAmount?: string;
  note?: string;
}

export interface RejectSlipInput {
  rejectionReason: string;
}

export interface RefundPaymentInput {
  amount: string;
  reason: string;
}

export class PaymentService {
  /**
   * Generates a unique, non-guessable internal payment reference.
   */
  private static generateInternalReference(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `PAY-${year}${month}${day}-${randomHex}`;
  }

  /**
   * Formats payment data for client JSON responses.
   */
  static formatPaymentResponse(payment: any) {
    if (!payment) return null;

    return {
      id: payment.id,
      orderId: payment.orderId,
      internalReference: payment.internalReference,
      idempotencyKey: payment.idempotencyKey,
      provider: payment.provider,
      method: payment.method,
      status: payment.status,
      amount: Number(payment.amount).toFixed(2),
      currency: payment.currency,
      providerReference: payment.providerReference,
      metadata: payment.metadata,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      order: payment.order
        ? {
            id: payment.order.id,
            orderNumber: payment.order.orderNumber,
            status: payment.order.status,
            grandTotal: Number(payment.order.grandTotal).toFixed(2),
            currency: payment.order.currency,
          }
        : undefined,
      events: (payment.events || []).map((e: any) => ({
        id: e.id,
        eventType: e.eventType,
        fromStatus: e.fromStatus,
        toStatus: e.toStatus,
        reason: e.reason,
        createdAt: e.createdAt,
      })),
      slips: (payment.slips || []).map((s: any) => ({
        id: s.id,
        slipUrl: s.slipUrl,
        bankName: s.bankName,
        transferAmount: s.transferAmount ? Number(s.transferAmount).toFixed(2) : null,
        transferredAt: s.transferredAt,
        status: s.status,
        rejectionReason: s.rejectionReason,
        verifiedAt: s.verifiedAt,
        createdAt: s.createdAt,
      })),
      refunds: (payment.refunds || []).map((r: any) => ({
        id: r.id,
        refundReference: r.refundReference,
        amount: Number(r.amount).toFixed(2),
        currency: r.currency,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,
      })),
    };
  }

  /**
   * Authorizes that a user owns the order linked to a payment, or has staff/admin privileges.
   */
  private static async verifyOrderOwnership(order: any, userId?: string, userRoles: string[] = []) {
    const isStaff = userRoles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'SALES_REP', 'ACCOUNTANT'].includes(r));
    if (isStaff) return;

    if (!order.customerId && !userId) {
      return; // Guest checkout access allowed via session token
    }

    if (userId) {
      const user = await UserRepository.findById(userId);
      if (user?.customerProfile && order.customerId === user.customerProfile.id) {
        return; // Valid owner
      }
    }

    throw new ForbiddenException('You do not have permission to view or manage this payment');
  }

  /**
   * Initiates payment for an order with server-authoritative amount and unique reference.
   */
  static async createPayment(input: CreatePaymentInput) {
    const { orderId, provider: requestedProvider = 'PROMPTPAY', method, idempotencyKey, userId } = input;

    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(`Cannot initiate payment for order in status '${order.status}'`);
    }

    if (userId) {
      await this.verifyOrderOwnership(order, userId);
    }

    const providerInstance = PaymentProviderFactory.getProvider(requestedProvider);
    const internalReference = this.generateInternalReference();
    const authoritativeAmount = Number(order.grandTotal).toFixed(2);
    const authoritativeCurrency = 'THB';

    // Provider creation invocation
    const providerResult = await providerInstance.createPayment({
      paymentId: '', // Will be assigned by DB
      orderId: order.id,
      orderNumber: order.orderNumber,
      internalReference,
      amount: authoritativeAmount,
      currency: authoritativeCurrency,
      customerName: order.customer?.user?.displayName || undefined,
      customerPhone: order.customer?.phone || undefined,
      customerEmail: order.customer?.user?.email || undefined,
      idempotencyKey,
    });

    const payment = await PaymentRepository.createPayment({
      orderId: order.id,
      provider: providerResult.provider,
      method: method || providerResult.method,
      amount: authoritativeAmount,
      currency: authoritativeCurrency,
      internalReference,
      idempotencyKey,
      providerReference: providerResult.providerReference,
      metadata: {
        ...providerResult.metadata,
        qrPayload: providerResult.qrPayload,
        bankDetails: providerResult.bankDetails,
        paymentUrl: providerResult.paymentUrl,
        expiresAt: providerResult.expiresAt,
      },
      actorId: userId || null,
    });

    return {
      ...this.formatPaymentResponse(payment),
      qrPayload: providerResult.qrPayload,
      bankDetails: providerResult.bankDetails,
      paymentUrl: providerResult.paymentUrl,
    };
  }

  /**
   * Retrieves payment by its UUID with IDOR authorization protection.
   */
  static async getPaymentById(paymentId: string, userId?: string, userRoles: string[] = []) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    await this.verifyOrderOwnership(payment.order, userId, userRoles);
    return this.formatPaymentResponse(payment);
  }

  /**
   * Retrieves payment by order ID with IDOR protection.
   */
  static async getPaymentByOrderId(orderId: string, userId?: string, userRoles: string[] = []) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.verifyOrderOwnership(order, userId, userRoles);

    const payments = await PaymentRepository.findByOrderId(orderId);
    if (payments.length === 0) {
      throw new NotFoundException('No payment found for this order');
    }

    return this.formatPaymentResponse(payments[0]);
  }

  /**
   * Customer submits bank transfer slip.
   */
  static async submitSlip(paymentId: string, input: SubmitSlipInput, userId?: string) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (userId) {
      await this.verifyOrderOwnership(payment.order, userId);
    }

    if (!input.slipUrl) {
      throw new BadRequestException('Slip URL / image is required');
    }

    const slip = await PaymentRepository.submitSlip({
      paymentId,
      slipUrl: input.slipUrl,
      bankName: input.bankName,
      transferAmount: input.transferAmount || Number(payment.amount).toFixed(2),
      transferredAt: input.transferredAt,
      notes: input.notes,
      actorId: userId || null,
    });

    return slip;
  }

  /**
   * Staff verifies bank transfer slip and moves Order to PAYMENT_CONFIRMED.
   */
  static async verifySlip(slipId: string, input: VerifySlipInput, staffUserId: string) {
    const updatedPayment = await PaymentRepository.verifySlip({
      slipId,
      verifiedByUserId: staffUserId,
      verifiedAmount: input.verifiedAmount,
      note: input.note,
    });

    await AuditRepository.record({
      userId: staffUserId,
      action: 'PAYMENT_VERIFIED',
      resource: 'Payment',
      resourceId: updatedPayment?.id,
      after: {
        slipId,
        status: PaymentStatus.PAID,
        orderStatus: OrderStatus.PAYMENT_CONFIRMED,
      },
    });

    return this.formatPaymentResponse(updatedPayment);
  }

  /**
   * Staff rejects bank transfer slip.
   */
  static async rejectSlip(slipId: string, input: RejectSlipInput, staffUserId: string) {
    if (!input.rejectionReason) {
      throw new BadRequestException('Rejection reason is required');
    }

    const rejectedSlip = await PaymentRepository.rejectSlip({
      slipId,
      verifiedByUserId: staffUserId,
      rejectionReason: input.rejectionReason,
    });

    await AuditRepository.record({
      userId: staffUserId,
      action: 'PAYMENT_SLIP_REJECTED',
      resource: 'PaymentSlip',
      resourceId: slipId,
      after: {
        status: 'REJECTED',
        rejectionReason: input.rejectionReason,
      },
    });

    return rejectedSlip;
  }

  /**
   * Authoritative inbound webhook handler with HMAC signature verification, replay protection, and idempotency.
   */
  static async handleWebhook(providerName: string, rawBody: any, headers: Record<string, any>) {
    const providerInstance = PaymentProviderFactory.getProvider(providerName);

    // 1. Provider signature verification & payload parsing
    const verifiedEvent = await providerInstance.handleWebhook({
      rawBody,
      headers,
    });

    if (!verifiedEvent.isValid) {
      throw new BadRequestException(verifiedEvent.failureReason || 'Invalid webhook signature or expired payload');
    }

    // 2. Persistent Idempotency Check
    const { isDuplicate, webhookEvent } = await PaymentRepository.recordWebhookEvent(
      providerInstance.name,
      verifiedEvent.eventId,
      verifiedEvent.eventType,
      verifiedEvent.rawPayload
    );

    if (isDuplicate) {
      return {
        status: 'ALREADY_PROCESSED',
        duplicate: true,
        eventId: verifiedEvent.eventId,
      };
    }

    try {
      // 3. Find matching internal Payment record
      let payment = verifiedEvent.internalReference
        ? await PaymentRepository.findByInternalReference(verifiedEvent.internalReference)
        : null;

      if (!payment && verifiedEvent.providerReference) {
        payment = await PaymentRepository.findByProviderReference(verifiedEvent.providerReference);
      }

      if (!payment) {
        await PaymentRepository.markWebhookProcessed(webhookEvent.id, 'FAILED');
        throw new NotFoundException(`Payment not found for reference: ${verifiedEvent.internalReference || verifiedEvent.providerReference}`);
      }

      // 4. Financial Invariant Verifications:
      // Verify Currency === THB
      if (verifiedEvent.currency.toUpperCase() !== 'THB') {
        await PaymentRepository.markWebhookProcessed(webhookEvent.id, 'FAILED');
        throw new BadRequestException(`Unsupported payment currency: '${verifiedEvent.currency}'. Only THB is supported.`);
      }

      // Verify Exact Amount Match (Immunity to underpayment / overpayment tampering)
      const expectedAmount = Number(payment.amount).toFixed(2);
      const reportedAmount = Number(verifiedEvent.amount).toFixed(2);

      if (expectedAmount !== reportedAmount) {
        await PaymentRepository.markWebhookProcessed(webhookEvent.id, 'FAILED');
        throw new BadRequestException(
          `Payment amount mismatch! Expected: ฿${expectedAmount}, Reported: ฿${reportedAmount}`
        );
      }

      // 5. Execute state transition based on status
      if (verifiedEvent.status === 'PAID') {
        const settledPayment = await PaymentRepository.settlePayment({
          paymentId: payment.id,
          providerReference: verifiedEvent.providerReference,
          providerTransactionId: verifiedEvent.eventId,
          reason: `Automated webhook settlement from ${providerInstance.name}`,
          gatewayResponse: verifiedEvent.rawPayload,
        });

        await PaymentRepository.markWebhookProcessed(webhookEvent.id, 'PROCESSED');

        return {
          status: 'SUCCESS',
          paymentId: settledPayment?.id,
          orderStatus: OrderStatus.PAYMENT_CONFIRMED,
        };
      } else {
        await PaymentRepository.markWebhookProcessed(webhookEvent.id, 'PROCESSED');
        return {
          status: 'PROCESSED_NON_PAYMENT',
          paymentId: payment.id,
        };
      }
    } catch (err: any) {
      await PaymentRepository.markWebhookProcessed(webhookEvent.id, 'FAILED');
      throw err;
    }
  }

  /**
   * Processes a refund for an existing settled payment.
   */
  static async refundPayment(paymentId: string, input: RefundPaymentInput, staffUserId: string) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (!input.amount || Number(input.amount) <= 0) {
      throw new BadRequestException('Refund amount must be a positive number');
    }

    if (!input.reason) {
      throw new BadRequestException('Refund reason is required');
    }

    const providerInstance = PaymentProviderFactory.getProvider(payment.provider);
    const refundResult = await providerInstance.refundPayment({
      paymentId: payment.id,
      internalReference: payment.internalReference,
      providerReference: payment.providerReference || undefined,
      refundAmount: Number(input.amount).toFixed(2),
      currency: payment.currency,
      reason: input.reason,
    });

    const { refund, payment: updatedPayment } = await PaymentRepository.refundPayment({
      paymentId: payment.id,
      refundReference: refundResult.refundReference,
      amount: Number(input.amount).toFixed(2),
      currency: payment.currency,
      reason: input.reason,
      actorId: staffUserId,
    });

    await AuditRepository.record({
      userId: staffUserId,
      action: 'PAYMENT_REFUNDED',
      resource: 'PaymentRefund',
      resourceId: refund.id,
      after: {
        paymentId: payment.id,
        refundAmount: input.amount,
        reason: input.reason,
        newPaymentStatus: updatedPayment?.status,
      },
    });

    return {
      refund,
      payment: this.formatPaymentResponse(updatedPayment),
    };
  }
}
