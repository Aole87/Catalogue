"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCrmController = void 0;
const crm_repository_1 = require("../repositories/crm.repository");
const customer_activity_repository_1 = require("../repositories/customer-activity.repository");
const order_repository_1 = require("../repositories/order.repository");
const customer_segment_service_1 = require("../services/customer-segment.service");
const audit_repository_1 = require("../repositories/audit.repository");
const crm_schema_1 = require("../schemas/crm.schema");
const app_error_1 = require("../errors/app-error");
class AdminCrmController {
    /**
     * GET /api/v1/admin/customers
     */
    static async listCustomers(request, reply) {
        const query = crm_schema_1.customerQuerySchema.parse(request.query);
        const result = await crm_repository_1.CrmRepository.queryCustomers(query);
        return reply.status(200).send(result);
    }
    /**
     * GET /api/v1/admin/customers/:id
     */
    static async getCustomerById(request, reply) {
        const { id } = request.params;
        const customer = await crm_repository_1.CrmRepository.findCustomerById(id);
        if (!customer) {
            throw new app_error_1.NotFoundException('Customer profile not found');
        }
        return reply.status(200).send({ data: customer });
    }
    /**
     * PATCH /api/v1/admin/customers/:id
     */
    static async updateCustomer(request, reply) {
        const { id } = request.params;
        const body = crm_schema_1.updateAdminCustomerSchema.parse(request.body);
        const customer = await crm_repository_1.CrmRepository.findCustomerById(id);
        if (!customer) {
            throw new app_error_1.NotFoundException('Customer profile not found');
        }
        const updated = await crm_repository_1.CrmRepository.updateCustomerProfile(customer.id, body);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
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
    static async deleteCustomer(request, reply) {
        const { id } = request.params;
        const customer = await crm_repository_1.CrmRepository.findCustomerById(id);
        if (!customer) {
            throw new app_error_1.NotFoundException('Customer profile not found');
        }
        await crm_repository_1.CrmRepository.deleteCustomer(customer.id);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
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
    static async getCustomerActivity(request, reply) {
        const { id } = request.params;
        const activities = await customer_activity_repository_1.CustomerActivityRepository.listByCustomerId(id, 100);
        return reply.status(200).send({ data: activities });
    }
    /**
     * GET /api/v1/admin/customers/:id/orders
     */
    static async getCustomerOrders(request, reply) {
        const { id } = request.params;
        const result = await order_repository_1.OrderRepository.findByCustomerId(id, { limit: 50 });
        return reply.status(200).send(result);
    }
    /**
     * Tags
     */
    static async listTags(_request, reply) {
        const tags = await crm_repository_1.CrmRepository.listTags();
        return reply.status(200).send({ data: tags });
    }
    static async createTag(request, reply) {
        const body = crm_schema_1.createTagSchema.parse(request.body);
        const tag = await crm_repository_1.CrmRepository.createTag(body.name, body.color, body.description || undefined);
        return reply.status(201).send({ data: tag, message: 'Tag created successfully' });
    }
    static async assignTag(request, reply) {
        const { id } = request.params;
        const { tagId } = request.body;
        const assignment = await crm_repository_1.CrmRepository.assignTag(id, tagId);
        return reply.status(200).send({ data: assignment, message: 'Tag assigned successfully' });
    }
    static async removeTag(request, reply) {
        const { id, tagId } = request.params;
        await crm_repository_1.CrmRepository.removeTag(id, tagId);
        return reply.status(200).send({ message: 'Tag removed successfully' });
    }
    /**
     * Segments
     */
    static async listSegments(_request, reply) {
        const segments = await crm_repository_1.CrmRepository.listSegments();
        return reply.status(200).send({ data: segments });
    }
    static async getSegmentById(request, reply) {
        const { id } = request.params;
        const segment = await crm_repository_1.CrmRepository.findSegmentById(id);
        if (!segment) {
            throw new app_error_1.NotFoundException('Segment not found');
        }
        return reply.status(200).send({ data: segment });
    }
    static async createSegment(request, reply) {
        const body = crm_schema_1.createSegmentSchema.parse(request.body);
        const segment = await crm_repository_1.CrmRepository.createSegment(body);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
                userId: request.user.id,
                action: 'CRM_SEGMENT_CREATED',
                resource: 'CustomerSegment',
                resourceId: segment.id,
                after: body,
            });
        }
        return reply.status(201).send({ data: segment, message: 'Segment created successfully' });
    }
    static async updateSegment(request, reply) {
        const { id } = request.params;
        const body = crm_schema_1.updateSegmentSchema.parse(request.body);
        const segment = await crm_repository_1.CrmRepository.updateSegment(id, body);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
                userId: request.user.id,
                action: 'CRM_SEGMENT_UPDATED',
                resource: 'CustomerSegment',
                resourceId: segment.id,
                after: body,
            });
        }
        return reply.status(200).send({ data: segment, message: 'Segment updated successfully' });
    }
    static async deleteSegment(request, reply) {
        const { id } = request.params;
        await crm_repository_1.CrmRepository.deleteSegment(id);
        return reply.status(200).send({ message: 'Segment deleted successfully' });
    }
    static async evaluateSegment(request, reply) {
        const { id } = request.params;
        const result = await customer_segment_service_1.CustomerSegmentService.evaluateSegment(id);
        return reply.status(200).send({
            data: result,
            message: `Segment evaluated: ${result.matchingCount} customers matching criteria`,
        });
    }
}
exports.AdminCrmController = AdminCrmController;
//# sourceMappingURL=admin-crm.controller.js.map