"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleController = void 0;
const vehicle_service_1 = require("../services/vehicle.service");
const vehicle_schema_1 = require("../schemas/vehicle.schema");
class VehicleController {
    // ==========================================
    // PUBLIC STOREFRONT HANDLERS
    // ==========================================
    static async listMakes(req, reply) {
        const query = vehicle_schema_1.vehicleMakeQuerySchema.parse(req.query);
        const makes = await vehicle_service_1.VehicleService.listMakes(query.isActive ?? true);
        return reply.status(200).send({ makes });
    }
    static async getMake(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        const make = await vehicle_service_1.VehicleService.getMakeById(id);
        return reply.status(200).send({ make });
    }
    static async listModels(req, reply) {
        const query = vehicle_schema_1.vehicleModelQuerySchema.parse(req.query);
        const models = await vehicle_service_1.VehicleService.listModels(query);
        return reply.status(200).send({ models });
    }
    static async getModel(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        const model = await vehicle_service_1.VehicleService.getModelById(id);
        return reply.status(200).send({ model });
    }
    static async listGenerations(req, reply) {
        const query = vehicle_schema_1.vehicleGenerationQuerySchema.parse(req.query);
        const generations = await vehicle_service_1.VehicleService.listGenerations(query);
        return reply.status(200).send({ generations });
    }
    static async getGeneration(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        const generation = await vehicle_service_1.VehicleService.getGenerationById(id);
        return reply.status(200).send({ generation });
    }
    static async listEngines(_req, reply) {
        const engines = await vehicle_service_1.VehicleService.listEngines();
        return reply.status(200).send({ engines });
    }
    static async getEngine(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        const engine = await vehicle_service_1.VehicleService.getEngineById(id);
        return reply.status(200).send({ engine });
    }
    static async listVariants(req, reply) {
        const query = vehicle_schema_1.vehicleVariantQuerySchema.parse(req.query);
        const variants = await vehicle_service_1.VehicleService.listVariants(query);
        return reply.status(200).send({ variants });
    }
    static async getVariant(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        const variant = await vehicle_service_1.VehicleService.getVariantById(id);
        return reply.status(200).send({ variant });
    }
    // ==========================================
    // ADMIN VEHICLE MASTER CRUD HANDLERS
    // ==========================================
    static async createMake(req, reply) {
        const input = vehicle_schema_1.createVehicleMakeSchema.parse(req.body);
        const make = await vehicle_service_1.VehicleService.createMake(req.user.id, input, req.ip, req.headers['user-agent']);
        return reply.status(201).send({ make });
    }
    static async updateMake(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        const input = vehicle_schema_1.updateVehicleMakeSchema.parse(req.body);
        const make = await vehicle_service_1.VehicleService.updateMake(req.user.id, id, input, req.ip, req.headers['user-agent']);
        return reply.status(200).send({ make });
    }
    static async deleteMake(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        await vehicle_service_1.VehicleService.deleteMake(req.user.id, id, req.ip, req.headers['user-agent']);
        return reply.status(204).send();
    }
    static async createModel(req, reply) {
        const input = vehicle_schema_1.createVehicleModelSchema.parse(req.body);
        const model = await vehicle_service_1.VehicleService.createModel(req.user.id, input, req.ip, req.headers['user-agent']);
        return reply.status(201).send({ model });
    }
    static async updateModel(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        const input = vehicle_schema_1.updateVehicleModelSchema.parse(req.body);
        const model = await vehicle_service_1.VehicleService.updateModel(req.user.id, id, input, req.ip, req.headers['user-agent']);
        return reply.status(200).send({ model });
    }
    static async deleteModel(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        await vehicle_service_1.VehicleService.deleteModel(req.user.id, id, req.ip, req.headers['user-agent']);
        return reply.status(204).send();
    }
    static async createGeneration(req, reply) {
        const input = vehicle_schema_1.createVehicleGenerationSchema.parse(req.body);
        const generation = await vehicle_service_1.VehicleService.createGeneration(req.user.id, input, req.ip, req.headers['user-agent']);
        return reply.status(201).send({ generation });
    }
    static async updateGeneration(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        const input = vehicle_schema_1.updateVehicleGenerationSchema.parse(req.body);
        const generation = await vehicle_service_1.VehicleService.updateGeneration(req.user.id, id, input, req.ip, req.headers['user-agent']);
        return reply.status(200).send({ generation });
    }
    static async deleteGeneration(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        await vehicle_service_1.VehicleService.deleteGeneration(req.user.id, id, req.ip, req.headers['user-agent']);
        return reply.status(204).send();
    }
    static async createEngine(req, reply) {
        const input = vehicle_schema_1.createVehicleEngineSchema.parse(req.body);
        const engine = await vehicle_service_1.VehicleService.createEngine(req.user.id, input, req.ip, req.headers['user-agent']);
        return reply.status(201).send({ engine });
    }
    static async updateEngine(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        const input = vehicle_schema_1.updateVehicleEngineSchema.parse(req.body);
        const engine = await vehicle_service_1.VehicleService.updateEngine(req.user.id, id, input, req.ip, req.headers['user-agent']);
        return reply.status(200).send({ engine });
    }
    static async deleteEngine(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        await vehicle_service_1.VehicleService.deleteEngine(req.user.id, id, req.ip, req.headers['user-agent']);
        return reply.status(204).send();
    }
    static async createVariant(req, reply) {
        const input = vehicle_schema_1.createVehicleVariantSchema.parse(req.body);
        const variant = await vehicle_service_1.VehicleService.createVariant(req.user.id, input, req.ip, req.headers['user-agent']);
        return reply.status(201).send({ variant });
    }
    static async updateVariant(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        const input = vehicle_schema_1.updateVehicleVariantSchema.parse(req.body);
        const variant = await vehicle_service_1.VehicleService.updateVariant(req.user.id, id, input, req.ip, req.headers['user-agent']);
        return reply.status(200).send({ variant });
    }
    static async deleteVariant(req, reply) {
        const { id } = vehicle_schema_1.vehicleParamSchema.parse(req.params);
        await vehicle_service_1.VehicleService.deleteVariant(req.user.id, id, req.ip, req.headers['user-agent']);
        return reply.status(204).send();
    }
}
exports.VehicleController = VehicleController;
//# sourceMappingURL=vehicle.controller.js.map