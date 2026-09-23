"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCrmRoutes = adminCrmRoutes;
const admin_crm_controller_1 = require("../controllers/admin-crm.controller");
const auth_1 = require("../middleware/auth");
async function adminCrmRoutes(app) {
    const crmRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'SALES_REP'];
    // Customers Query & Detail
    app.get('/admin/customers', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.listCustomers);
    app.get('/admin/customers/:id', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.getCustomerById);
    app.patch('/admin/customers/:id', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.updateCustomer);
    app.delete('/admin/customers/:id', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.deleteCustomer);
    app.get('/admin/customers/:id/activity', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.getCustomerActivity);
    app.get('/admin/customers/:id/orders', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.getCustomerOrders);
    // Tags
    app.get('/admin/customers/tags', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.listTags);
    app.post('/admin/customers/tags', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.createTag);
    app.post('/admin/customers/:id/tags', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.assignTag);
    app.delete('/admin/customers/:id/tags/:tagId', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.removeTag);
    // Segments
    app.get('/admin/customers/segments', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.listSegments);
    app.post('/admin/customers/segments', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.createSegment);
    app.get('/admin/customers/segments/:id', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.getSegmentById);
    app.patch('/admin/customers/segments/:id', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.updateSegment);
    app.delete('/admin/customers/segments/:id', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.deleteSegment);
    app.post('/admin/customers/segments/:id/evaluate', { preHandler: [(0, auth_1.requireRole)(crmRoles)] }, admin_crm_controller_1.AdminCrmController.evaluateSegment);
}
//# sourceMappingURL=admin-crm.routes.js.map