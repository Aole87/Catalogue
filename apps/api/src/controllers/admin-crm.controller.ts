import { FastifyRequest, FastifyReply } from 'fastify';
import { CrmRepository } from '../repositories/crm.repository';
import { CustomerActivityRepository } from '../repositories/customer-activity.repository';
import { OrderRepository } from '../repositories/order.repository';
import { CustomerSegmentService } from '../services/customer-segment.service';
import { AuditRepository } from '../repositories/audit.repository';
import {
  customerQuerySchema,
  updateAdminCustomerSchema,
  createTagSchema,
  createSegmentSchema,
  updateSegmentSchema,
} from '../schemas/crm.schema';
import { NotFoundException } from '../errors/app-error';

export class AdminCrmController {
  /**
   * GET /api/v1/admin/customers
   */
  static async listCustomers(request: FastifyRequest, reply: FastifyReply) {
    const query = customerQuerySchema.parse(request.query);
    const result = await CrmRepository.queryCustomers(query);
    return reply.status(200).send(result);
  }

  /**
   * GET /api/v1/admin/customers/:id
   */
  static async getCustomerById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const customer = await CrmRepository.findCustomerById(id);
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }
    return reply.status(200).send({ data: customer });
  }

  /**
   * PATCH /api/v1/admin/customers/:id
   */
  static async updateCustomer(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateAdminCustomerSchema.parse(request.body);
    const customer = await CrmRepository.findCustomerById(id);
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const updated = await CrmRepository.updateCustomerProfile(customer.id, body);

    if (request.user) {
      await AuditRepository.record({
        userId: request.user.id,
        action: 'CRM_CUSTOMER_UPDATED',
        resource: 'CustomerProfile',
        resourceId: customer.id,
        before: { customerType: customer.customerType, notes: customer.notes },
        after: body,
      });
    }

    return reply.status(200).send({
      data: updated,
      message: 'Customer profile updated successfully',
    });
  }

  /**
   * DELETE /api/v1/admin/customers/:id
   */
  static async deleteCustomer(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const customer = await CrmRepository.findCustomerById(id);
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    await CrmRepository.deleteCustomer(customer.id);

    if (request.user) {
      await AuditRepository.record({
        userId: request.user.id,
        action: 'CRM_CUSTOMER_DELETED',
        resource: 'CustomerProfile',
        resourceId: customer.id,
        before: { customerType: customer.customerType, email: customer.user?.email },
      });
    }

    return reply.status(200).send({
      message: 'Customer profile deleted successfully',
    });
  }

  /**
   * GET /api/v1/admin/customers/:id/activity
   */
  static async getCustomerActivity(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const activities = await CustomerActivityRepository.listByCustomerId(id, 100);
    return reply.status(200).send({ data: activities });
  }

  /**
   * GET /api/v1/admin/customers/:id/orders
   */
  static async getCustomerOrders(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await OrderRepository.findByCustomerId(id, { limit: 50 });
    return reply.status(200).send(result);
  }

  /**
   * Tags
   */
  static async listTags(_request: FastifyRequest, reply: FastifyReply) {
    const tags = await CrmRepository.listTags();
    return reply.status(200).send({ data: tags });
  }

  static async createTag(request: FastifyRequest, reply: FastifyReply) {
    const body = createTagSchema.parse(request.body);
    const tag = await CrmRepository.createTag(body.name, body.color, body.description || undefined);
    return reply.status(201).send({ data: tag, message: 'Tag created successfully' });
  }

  static async assignTag(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { tagId } = request.body as { tagId: string };
    const assignment = await CrmRepository.assignTag(id, tagId);
    return reply.status(200).send({ data: assignment, message: 'Tag assigned successfully' });
  }

  static async removeTag(request: FastifyRequest, reply: FastifyReply) {
    const { id, tagId } = request.params as { id: string; tagId: string };
    await CrmRepository.removeTag(id, tagId);
    return reply.status(200).send({ message: 'Tag removed successfully' });
  }

  /**
   * Segments
   */
  static async listSegments(_request: FastifyRequest, reply: FastifyReply) {
    const segments = await CrmRepository.listSegments();
    return reply.status(200).send({ data: segments });
  }

  static async getSegmentById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const segment = await CrmRepository.findSegmentById(id);
    if (!segment) {
      throw new NotFoundException('Segment not found');
    }
    return reply.status(200).send({ data: segment });
  }

  static async createSegment(request: FastifyRequest, reply: FastifyReply) {
    const body = createSegmentSchema.parse(request.body);
    const segment = await CrmRepository.createSegment(body);

    if (request.user) {
      await AuditRepository.record({
        userId: request.user.id,
        action: 'CRM_SEGMENT_CREATED',
        resource: 'CustomerSegment',
        resourceId: segment.id,
        after: body,
      });
    }

    return reply.status(201).send({ data: segment, message: 'Segment created successfully' });
  }

  static async updateSegment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateSegmentSchema.parse(request.body);
    const segment = await CrmRepository.updateSegment(id, body);

    if (request.user) {
      await AuditRepository.record({
        userId: request.user.id,
        action: 'CRM_SEGMENT_UPDATED',
        resource: 'CustomerSegment',
        resourceId: segment.id,
        after: body,
      });
    }

    return reply.status(200).send({ data: segment, message: 'Segment updated successfully' });
  }

  static async deleteSegment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await CrmRepository.deleteSegment(id);
    return reply.status(200).send({ message: 'Segment deleted successfully' });
  }

  static async evaluateSegment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await CustomerSegmentService.evaluateSegment(id);
    return reply.status(200).send({
      data: result,
      message: `Segment evaluated: ${result.matchingCount} customers matching criteria`,
    });
  }
}
