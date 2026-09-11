import { prisma } from '@car-parts/database';
import { ShipmentStatus, OrderStatus, Prisma } from '@prisma/client';
import { ShipmentStateMachine } from '../services/shipping/shipment-state-machine';
import { BadRequestException, NotFoundException } from '../errors/app-error';

export interface CreateShipmentParams {
  shipmentNumber: string;
  orderId: string;
  shippingMethodId?: string | null;
  carrier?: string | null;
  serviceLevel?: string | null;
  shippingCost?: string;
  currency?: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  subdistrict?: string | null;
  district?: string | null;
  province: string;
  postalCode: string;
  country?: string;
  addressSnapshot?: any;
  metadata?: any;
  actorId?: string | null;
}

export interface UpdateShipmentStatusParams {
  shipmentId: string;
  toStatus: ShipmentStatus;
  description?: string;
  location?: string;
  providerEventId?: string;
  actorId?: string | null;
  occurredAt?: Date;
  metadata?: any;
}

export interface AssignTrackingParams {
  shipmentId: string;
  trackingNumber: string;
  carrier?: string;
  serviceLevel?: string;
  actorId?: string | null;
}

export class ShippingRepository {
  private static shipmentIncludes = {
    order: {
      include: {
        customer: {
          include: {
            user: true,
          },
        },
      },
    },
    shippingMethod: true,
    events: {
      orderBy: { occurredAt: 'asc' as const },
    },
  };

  /**
   * Retrieves all active shipping methods.
   */
  static async listShippingMethods(isActive = true) {
    return prisma.shippingMethod.findMany({
      where: isActive ? { isActive: true } : {},
      orderBy: { basePrice: 'asc' },
    });
  }

  static async findShippingMethodById(id: string) {
    return prisma.shippingMethod.findUnique({ where: { id } });
  }

  static async findShippingMethodByCode(code: string) {
    return prisma.shippingMethod.findUnique({ where: { code } });
  }

  /**
   * Atomically creates a Shipment and its initial ShippingEvent.
   */
  static async createShipment(params: CreateShipmentParams) {
    return prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          shipmentNumber: params.shipmentNumber,
          orderId: params.orderId,
          shippingMethodId: params.shippingMethodId || null,
          carrier: params.carrier || 'Standard Delivery',
          serviceLevel: params.serviceLevel || 'STANDARD',
          shippingCost: params.shippingCost || '0.00',
          currency: params.currency || 'THB',
          status: ShipmentStatus.PENDING,
          recipientName: params.recipientName,
          phone: params.phone,
          addressLine1: params.addressLine1,
          addressLine2: params.addressLine2 || null,
          subdistrict: params.subdistrict || null,
          district: params.district || null,
          province: params.province,
          postalCode: params.postalCode,
          country: params.country || 'TH',
          addressSnapshot: params.addressSnapshot || Prisma.JsonNull,
          metadata: params.metadata || Prisma.JsonNull,
          events: {
            create: {
              status: ShipmentStatus.PENDING,
              description: 'Shipment created and awaiting fulfillment',
              actorId: params.actorId || null,
            },
          },
        },
        include: this.shipmentIncludes,
      });

      return shipment;
    });
  }

  static async findById(id: string) {
    return prisma.shipment.findUnique({
      where: { id },
      include: this.shipmentIncludes,
    });
  }

  static async findByShipmentNumber(shipmentNumber: string) {
    return prisma.shipment.findUnique({
      where: { shipmentNumber },
      include: this.shipmentIncludes,
    });
  }

  static async findByTrackingNumber(trackingNumber: string) {
    return prisma.shipment.findFirst({
      where: { trackingNumber },
      include: this.shipmentIncludes,
    });
  }

  static async findByOrderId(orderId: string) {
    return prisma.shipment.findMany({
      where: { orderId },
      include: this.shipmentIncludes,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Atomically updates shipment status, resolves order status, and logs audit events.
   */
  static async updateShipmentStatus(params: UpdateShipmentStatusParams) {
    return prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.findUnique({
        where: { id: params.shipmentId },
        include: { order: true },
      });

      if (!shipment) {
        throw new NotFoundException('Shipment not found');
      }

      // Idempotency: if already in the target status, return cleanly
      if (shipment.status === params.toStatus) {
        return tx.shipment.findUnique({
          where: { id: params.shipmentId },
          include: this.shipmentIncludes,
        });
      }

      // Stale event protection: ignore out-of-order stale events without crashing
      if (ShipmentStateMachine.isStaleEvent(shipment.status, params.toStatus)) {
        return tx.shipment.findUnique({
          where: { id: params.shipmentId },
          include: this.shipmentIncludes,
        });
      }

      // Validate legal state transition
      ShipmentStateMachine.validateTransition(shipment.status, params.toStatus);

      const now = params.occurredAt || new Date();
      const isShipped = params.toStatus === ShipmentStatus.SHIPPED;
      const isDelivered = params.toStatus === ShipmentStatus.DELIVERED;

      // Update Shipment record
      await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: params.toStatus,
          shippedAt: isShipped ? now : shipment.shippedAt,
          deliveredAt: isDelivered ? now : shipment.deliveredAt,
        },
      });

      // Resolve and update parent Order status
      const targetOrderStatus = ShipmentStateMachine.resolveOrderStatus(params.toStatus);
      if (targetOrderStatus && targetOrderStatus !== shipment.order.status) {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { status: targetOrderStatus },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: shipment.orderId,
            fromStatus: shipment.order.status,
            toStatus: targetOrderStatus,
            note: params.description || `Shipment status updated to ${params.toStatus}`,
            changedByUserId: params.actorId || null,
          },
        });
      }

      // Append ShippingEvent record
      await tx.shippingEvent.create({
        data: {
          shipmentId: shipment.id,
          status: params.toStatus,
          description: params.description || `Shipment status updated to ${params.toStatus}`,
          location: params.location || null,
          providerEventId: params.providerEventId || null,
          actorId: params.actorId || null,
          occurredAt: now,
          metadata: params.metadata || Prisma.JsonNull,
        },
      });

      return tx.shipment.findUnique({
        where: { id: shipment.id },
        include: this.shipmentIncludes,
      });
    });
  }

  /**
   * Assigns tracking number to a shipment.
   */
  static async assignTracking(params: AssignTrackingParams) {
    return prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.findUnique({
        where: { id: params.shipmentId },
        include: { order: true },
      });

      if (!shipment) {
        throw new NotFoundException('Shipment not found');
      }

      const updated = await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          trackingNumber: params.trackingNumber,
          carrier: params.carrier || shipment.carrier,
          serviceLevel: params.serviceLevel || shipment.serviceLevel,
          status: ShipmentStatus.READY_TO_SHIP,
        },
      });

      await tx.shippingEvent.create({
        data: {
          shipmentId: shipment.id,
          status: ShipmentStatus.READY_TO_SHIP,
          description: `Tracking number assigned: ${params.trackingNumber} (${params.carrier || shipment.carrier})`,
          actorId: params.actorId || null,
        },
      });

      return tx.shipment.findUnique({
        where: { id: shipment.id },
        include: this.shipmentIncludes,
      });
    });
  }

  /**
   * Idempotently records courier webhook event with P2002 collision protection.
   */
  static async recordWebhookEvent(provider: string, eventId: string, eventType: string, payload: any) {
    try {
      const existing = await prisma.shippingWebhookEvent.findUnique({
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

      const webhookEvent = await prisma.shippingWebhookEvent.create({
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
        const existing = await prisma.shippingWebhookEvent.findUnique({
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
    return prisma.shippingWebhookEvent.update({
      where: { id },
      data: {
        status,
        processedAt: new Date(),
      },
    });
  }

  /**
   * Paged query for staff admin fulfillment dashboard.
   */
  static async findAdminShipments(params: {
    status?: ShipmentStatus;
    carrier?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.carrier) where.carrier = { contains: params.carrier, mode: 'insensitive' };

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: this.shipmentIncludes,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.shipment.count({ where }),
    ]);

    return {
      shipments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
