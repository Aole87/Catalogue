import { FastifyRequest, FastifyReply } from 'fastify';
import { VehicleService } from '../services/vehicle.service';
import {
  createVehicleMakeSchema,
  updateVehicleMakeSchema,
  createVehicleModelSchema,
  updateVehicleModelSchema,
  createVehicleGenerationSchema,
  updateVehicleGenerationSchema,
  createVehicleEngineSchema,
  updateVehicleEngineSchema,
  createVehicleVariantSchema,
  updateVehicleVariantSchema,
  vehicleMakeQuerySchema,
  vehicleModelQuerySchema,
  vehicleGenerationQuerySchema,
  vehicleVariantQuerySchema,
  vehicleParamSchema,
} from '../schemas/vehicle.schema';

export class VehicleController {
  // ==========================================
  // PUBLIC STOREFRONT HANDLERS
  // ==========================================
  static async listMakes(req: FastifyRequest, reply: FastifyReply) {
    const query = vehicleMakeQuerySchema.parse(req.query);
    const makes = await VehicleService.listMakes(query.isActive ?? true);
    return reply.status(200).send({ makes });
  }

  static async getMake(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    const make = await VehicleService.getMakeById(id);
    return reply.status(200).send({ make });
  }

  static async listModels(req: FastifyRequest, reply: FastifyReply) {
    const query = vehicleModelQuerySchema.parse(req.query);
    const models = await VehicleService.listModels(query);
    return reply.status(200).send({ models });
  }

  static async getModel(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    const model = await VehicleService.getModelById(id);
    return reply.status(200).send({ model });
  }

  static async listGenerations(req: FastifyRequest, reply: FastifyReply) {
    const query = vehicleGenerationQuerySchema.parse(req.query);
    const generations = await VehicleService.listGenerations(query);
    return reply.status(200).send({ generations });
  }

  static async getGeneration(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    const generation = await VehicleService.getGenerationById(id);
    return reply.status(200).send({ generation });
  }

  static async listEngines(_req: FastifyRequest, reply: FastifyReply) {
    const engines = await VehicleService.listEngines();
    return reply.status(200).send({ engines });
  }

  static async getEngine(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    const engine = await VehicleService.getEngineById(id);
    return reply.status(200).send({ engine });
  }

  static async listVariants(req: FastifyRequest, reply: FastifyReply) {
    const query = vehicleVariantQuerySchema.parse(req.query);
    const variants = await VehicleService.listVariants(query);
    return reply.status(200).send({ variants });
  }

  static async getVariant(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    const variant = await VehicleService.getVariantById(id);
    return reply.status(200).send({ variant });
  }

  // ==========================================
  // ADMIN VEHICLE MASTER CRUD HANDLERS
  // ==========================================
  static async createMake(req: FastifyRequest, reply: FastifyReply) {
    const input = createVehicleMakeSchema.parse(req.body);
    const make = await VehicleService.createMake(
      req.user!.id,
      input,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(201).send({ make });
  }

  static async updateMake(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    const input = updateVehicleMakeSchema.parse(req.body);
    const make = await VehicleService.updateMake(
      req.user!.id,
      id,
      input,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(200).send({ make });
  }

  static async deleteMake(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    await VehicleService.deleteMake(
      req.user!.id,
      id,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(204).send();
  }

  static async createModel(req: FastifyRequest, reply: FastifyReply) {
    const input = createVehicleModelSchema.parse(req.body);
    const model = await VehicleService.createModel(
      req.user!.id,
      input,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(201).send({ model });
  }

  static async updateModel(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    const input = updateVehicleModelSchema.parse(req.body);
    const model = await VehicleService.updateModel(
      req.user!.id,
      id,
      input,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(200).send({ model });
  }

  static async deleteModel(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    await VehicleService.deleteModel(
      req.user!.id,
      id,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(204).send();
  }

  static async createGeneration(req: FastifyRequest, reply: FastifyReply) {
    const input = createVehicleGenerationSchema.parse(req.body);
    const generation = await VehicleService.createGeneration(
      req.user!.id,
      input,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(201).send({ generation });
  }

  static async updateGeneration(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    const input = updateVehicleGenerationSchema.parse(req.body);
    const generation = await VehicleService.updateGeneration(
      req.user!.id,
      id,
      input,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(200).send({ generation });
  }

  static async deleteGeneration(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    await VehicleService.deleteGeneration(
      req.user!.id,
      id,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(204).send();
  }

  static async createEngine(req: FastifyRequest, reply: FastifyReply) {
    const input = createVehicleEngineSchema.parse(req.body);
    const engine = await VehicleService.createEngine(
      req.user!.id,
      input,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(201).send({ engine });
  }

  static async updateEngine(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    const input = updateVehicleEngineSchema.parse(req.body);
    const engine = await VehicleService.updateEngine(
      req.user!.id,
      id,
      input,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(200).send({ engine });
  }

  static async deleteEngine(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    await VehicleService.deleteEngine(
      req.user!.id,
      id,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(204).send();
  }

  static async createVariant(req: FastifyRequest, reply: FastifyReply) {
    const input = createVehicleVariantSchema.parse(req.body);
    const variant = await VehicleService.createVariant(
      req.user!.id,
      input,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(201).send({ variant });
  }

  static async updateVariant(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    const input = updateVehicleVariantSchema.parse(req.body);
    const variant = await VehicleService.updateVariant(
      req.user!.id,
      id,
      input,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(200).send({ variant });
  }

  static async deleteVariant(req: FastifyRequest, reply: FastifyReply) {
    const { id } = vehicleParamSchema.parse(req.params);
    await VehicleService.deleteVariant(
      req.user!.id,
      id,
      req.ip,
      req.headers['user-agent']
    );
    return reply.status(204).send();
  }
}
