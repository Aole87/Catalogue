import { FastifyRequest, FastifyReply } from 'fastify';
import { PaymentService } from '../services/payment.service';
import {
  createPaymentSchema,
  submitSlipSchema,
  verifySlipSchema,
  rejectSlipSchema,
  refundPaymentSchema,
} from '../schemas/payment.schema';

export class PaymentController {
  static async createPayment(request: FastifyRequest, reply: FastifyReply) {
    const body = createPaymentSchema.parse(request.body);
    const userId = request.user?.id;

    const payment = await PaymentService.createPayment({
      ...body,
      userId,
    });

    return reply.status(201).send({ data: payment });
  }

  static async getPaymentById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.id;
    const userRoles = request.user?.roles || [];

    const payment = await PaymentService.getPaymentById(id, userId, userRoles);
    return reply.send({ data: payment });
  }

  static async getPaymentByOrderId(request: FastifyRequest, reply: FastifyReply) {
    const { orderId } = request.params as { orderId: string };
    const userId = request.user?.id;
    const userRoles = request.user?.roles || [];

    const payment = await PaymentService.getPaymentByOrderId(orderId, userId, userRoles);
    return reply.send({ data: payment });
  }

  static async submitSlip(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = submitSlipSchema.parse(request.body);
    const userId = request.user?.id;

    const slip = await PaymentService.submitSlip(
      id,
      {
        ...body,
        transferredAt: body.transferredAt ? new Date(body.transferredAt) : undefined,
      },
      userId
    );

    return reply.status(201).send({ data: slip });
  }

  static async verifySlip(request: FastifyRequest, reply: FastifyReply) {
    const { slipId } = request.params as { slipId: string };
    const body = verifySlipSchema.parse(request.body);
    const staffUserId = request.user!.id;

    const payment = await PaymentService.verifySlip(slipId, body, staffUserId);
    return reply.send({ data: payment });
  }

  static async rejectSlip(request: FastifyRequest, reply: FastifyReply) {
    const { slipId } = request.params as { slipId: string };
    const body = rejectSlipSchema.parse(request.body);
    const staffUserId = request.user!.id;

    const slip = await PaymentService.rejectSlip(slipId, body, staffUserId);
    return reply.send({ data: slip });
  }

  static async handleWebhook(request: FastifyRequest, reply: FastifyReply) {
    const { provider } = request.params as { provider: string };
    const rawBody = request.body;
    const headers = request.headers;

    const result = await PaymentService.handleWebhook(provider, rawBody, headers);
    return reply.status(200).send(result);
  }

  static async refundPayment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = refundPaymentSchema.parse(request.body);
    const staffUserId = request.user!.id;

    const result = await PaymentService.refundPayment(id, body, staffUserId);
    return reply.send({ data: result });
  }
}
