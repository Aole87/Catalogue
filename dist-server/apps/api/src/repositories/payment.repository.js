"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const database_1 = require("@car-parts/database");
const client_1 = require("@prisma/client");
const payment_state_machine_1 = require("../services/payment/payment-state-machine");
const app_error_1 = require("../errors/app-error");
class PaymentRepository {
    static paymentIncludes = {
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
            orderBy: { createdAt: 'asc' },
        },
        transactions: {
            orderBy: { createdAt: 'desc' },
        },
        refunds: {
            orderBy: { createdAt: 'desc' },
        },
        slips: {
            orderBy: { createdAt: 'desc' },
        },
    };
    /**
     * Atomically creates a Payment record and its initial PaymentEvent.
     */
    static async createPayment(params) {
        return database_1.prisma.$transaction(async (tx) => {
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
                    status: client_1.PaymentStatus.PENDING,
                    amount: params.amount,
                    currency: params.currency || 'THB',
                    providerReference: params.providerReference || null,
                    metadata: params.metadata || client_1.Prisma.JsonNull,
                    events: {
                        create: {
                            eventType: 'PAYMENT_CREATED',
                            fromStatus: null,
                            toStatus: client_1.PaymentStatus.PENDING,
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
    static async findById(id) {
        return database_1.prisma.payment.findUnique({
            where: { id },
            include: this.paymentIncludes,
        });
    }
    static async findByInternalReference(internalReference) {
        return database_1.prisma.payment.findUnique({
            where: { internalReference },
            include: this.paymentIncludes,
        });
    }
    static async findByProviderReference(providerReference) {
        return database_1.prisma.payment.findFirst({
            where: { providerReference },
            include: this.paymentIncludes,
        });
    }
    static async findByOrderId(orderId) {
        return database_1.prisma.payment.findMany({
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
    static async settlePayment(params) {
        return database_1.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id: params.paymentId },
                include: { order: true },
            });
            if (!payment) {
                throw new app_error_1.NotFoundException('Payment not found');
            }
            // Idempotency: If already PAID, return current state without re-executing transitions
            if (payment.status === client_1.PaymentStatus.PAID) {
                return tx.payment.findUnique({
                    where: { id: params.paymentId },
                    include: this.paymentIncludes,
                });
            }
            // Validate legal transition
            payment_state_machine_1.PaymentStateMachine.validateTransition(payment.status, client_1.PaymentStatus.PAID);
            const now = new Date();
            // Update Payment to PAID
            const updatedPayment = await tx.payment.update({
                where: { id: params.paymentId },
                data: {
                    status: client_1.PaymentStatus.PAID,
                    paidAt: now,
                    providerReference: params.providerReference || payment.providerReference,
                },
            });
            // Update Order to PAYMENT_CONFIRMED
            await tx.order.update({
                where: { id: payment.orderId },
                data: {
                    status: client_1.OrderStatus.PAYMENT_CONFIRMED,
                },
            });
            // Append OrderStatusHistory
            await tx.orderStatusHistory.create({
                data: {
                    orderId: payment.orderId,
                    fromStatus: payment.order.status,
                    toStatus: client_1.OrderStatus.PAYMENT_CONFIRMED,
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
                    toStatus: client_1.PaymentStatus.PAID,
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
                    gatewayResponse: params.gatewayResponse || client_1.Prisma.JsonNull,
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
    static async submitSlip(params) {
        return database_1.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id: params.paymentId },
            });
            if (!payment) {
                throw new app_error_1.NotFoundException('Payment not found');
            }
            if (payment.status === client_1.PaymentStatus.PAID) {
                throw new app_error_1.BadRequestException('Payment is already settled and confirmed');
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
    static async verifySlip(params) {
        return database_1.prisma.$transaction(async (tx) => {
            const slip = await tx.paymentSlip.findUnique({
                where: { id: params.slipId },
                include: {
                    payment: {
                        include: { order: true },
                    },
                },
            });
            if (!slip) {
                throw new app_error_1.NotFoundException('Payment slip not found');
            }
            if (slip.status === 'VERIFIED') {
                throw new app_error_1.BadRequestException('Slip is already verified');
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
                throw new app_error_1.BadRequestException(`Verified amount (฿${submittedAmount}) does not match order grand total (฿${expectedAmount})`);
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
            payment_state_machine_1.PaymentStateMachine.validateTransition(payment.status, client_1.PaymentStatus.PAID);
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: client_1.PaymentStatus.PAID,
                    paidAt: now,
                },
            });
            await tx.order.update({
                where: { id: payment.orderId },
                data: {
                    status: client_1.OrderStatus.PAYMENT_CONFIRMED,
                },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId: payment.orderId,
                    fromStatus: payment.order.status,
                    toStatus: client_1.OrderStatus.PAYMENT_CONFIRMED,
                    note: params.note || 'Bank transfer slip verified by staff',
                    changedByUserId: params.verifiedByUserId,
                },
            });
            await tx.paymentEvent.create({
                data: {
                    paymentId: payment.id,
                    eventType: 'SLIP_VERIFIED',
                    fromStatus: payment.status,
                    toStatus: client_1.PaymentStatus.PAID,
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
    static async rejectSlip(params) {
        return database_1.prisma.$transaction(async (tx) => {
            const slip = await tx.paymentSlip.findUnique({
                where: { id: params.slipId },
                include: { payment: true },
            });
            if (!slip) {
                throw new app_error_1.NotFoundException('Payment slip not found');
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
    static async recordWebhookEvent(provider, eventId, eventType, payload) {
        try {
            const existing = await database_1.prisma.webhookEvent.findUnique({
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
            const webhookEvent = await database_1.prisma.webhookEvent.create({
                data: {
                    provider,
                    eventId,
                    eventType,
                    payload: payload || {},
                    status: 'RECEIVED',
                },
            });
            return { isDuplicate: false, webhookEvent };
        }
        catch (err) {
            if (err.code === 'P2002') {
                // Concurrency race: another thread created the webhook event record simultaneously
                const existing = await database_1.prisma.webhookEvent.findUnique({
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
    static async markWebhookProcessed(id, status = 'PROCESSED') {
        return database_1.prisma.webhookEvent.update({
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
    static async refundPayment(params) {
        return database_1.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id: params.paymentId },
                include: {
                    order: true,
                    refunds: true,
                },
            });
            if (!payment) {
                throw new app_error_1.NotFoundException('Payment not found');
            }
            if (payment.status !== client_1.PaymentStatus.PAID && payment.status !== client_1.PaymentStatus.PARTIALLY_REFUNDED) {
                throw new app_error_1.BadRequestException(`Cannot refund a payment with status '${payment.status}'. Only PAID payments can be refunded.`);
            }
            // Calculate total existing refunds
            const totalRefundedSoFar = payment.refunds
                .filter((r) => r.status === 'COMPLETED')
                .reduce((sum, r) => sum + Number(r.amount), 0);
            const requestedRefund = Number(params.amount);
            const paidAmount = Number(payment.amount);
            if (requestedRefund <= 0) {
                throw new app_error_1.BadRequestException('Refund amount must be greater than 0');
            }
            if (totalRefundedSoFar + requestedRefund > paidAmount + 0.001) {
                throw new app_error_1.BadRequestException(`Refund amount exceeds paid total. Paid: ฿${paidAmount.toFixed(2)}, Already Refunded: ฿${totalRefundedSoFar.toFixed(2)}, Requested: ฿${requestedRefund.toFixed(2)}`);
            }
            const isFullRefund = Math.abs(totalRefundedSoFar + requestedRefund - paidAmount) < 0.01;
            const targetPaymentStatus = isFullRefund ? client_1.PaymentStatus.REFUNDED : client_1.PaymentStatus.PARTIALLY_REFUNDED;
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
                        status: client_1.OrderStatus.REFUNDED,
                    },
                });
                await tx.orderStatusHistory.create({
                    data: {
                        orderId: payment.orderId,
                        fromStatus: payment.order.status,
                        toStatus: client_1.OrderStatus.REFUNDED,
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
exports.PaymentRepository = PaymentRepository;
//# sourceMappingURL=payment.repository.js.map