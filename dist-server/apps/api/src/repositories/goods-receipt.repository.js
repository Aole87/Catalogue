"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodsReceiptRepository = void 0;
const database_1 = require("@car-parts/database");
class GoodsReceiptRepository {
    static async findReceipts(params = {}, tx = database_1.prisma) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(100, Math.max(1, params.limit || 20));
        const skip = (page - 1) * limit;
        const where = {};
        if (params.purchaseOrderId) {
            where.purchaseOrderId = params.purchaseOrderId;
        }
        if (params.warehouseId) {
            where.warehouseId = params.warehouseId;
        }
        if (params.receiptNumber) {
            where.receiptNumber = { contains: params.receiptNumber.trim(), mode: 'insensitive' };
        }
        if (params.dateFrom || params.dateTo) {
            where.receivedAt = {};
            if (params.dateFrom)
                where.receivedAt.gte = params.dateFrom;
            if (params.dateTo)
                where.receivedAt.lte = params.dateTo;
        }
        const [receipts, total] = await Promise.all([
            tx.goodsReceipt.findMany({
                where,
                include: {
                    purchaseOrder: {
                        select: { id: true, poNumber: true, status: true, supplier: true },
                    },
                    warehouse: true,
                    location: true,
                    receivedByUser: {
                        select: { id: true, displayName: true, firstName: true, lastName: true, email: true },
                    },
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { receivedAt: 'desc' },
            }),
            tx.goodsReceipt.count({ where }),
        ]);
        return {
            receipts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async findById(id, tx = database_1.prisma) {
        return tx.goodsReceipt.findUnique({
            where: { id },
            include: {
                purchaseOrder: {
                    include: { supplier: true },
                },
                warehouse: true,
                location: true,
                receivedByUser: {
                    select: { id: true, displayName: true, firstName: true, lastName: true, email: true },
                },
                items: {
                    include: {
                        product: true,
                        purchaseOrderItem: true,
                    },
                },
            },
        });
    }
    static async findByIdempotencyKey(idempotencyKey, tx = database_1.prisma) {
        return tx.goodsReceipt.findUnique({
            where: { idempotencyKey },
            include: {
                purchaseOrder: true,
                warehouse: true,
                items: true,
            },
        });
    }
    static async create(data, items, tx = database_1.prisma) {
        return tx.goodsReceipt.create({
            data: {
                ...data,
                items: {
                    create: items,
                },
            },
            include: {
                purchaseOrder: true,
                warehouse: true,
                location: true,
                items: true,
            },
        });
    }
    static async generateGrnNumber(tx = database_1.prisma) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const prefix = `GRN-${dateStr}-`;
        const latest = await tx.goodsReceipt.findFirst({
            where: {
                receiptNumber: { startsWith: prefix },
            },
            orderBy: { receiptNumber: 'desc' },
            select: { receiptNumber: true },
        });
        let sequence = 1;
        if (latest && latest.receiptNumber) {
            const parts = latest.receiptNumber.split('-');
            if (parts.length === 3) {
                const parsedSeq = parseInt(parts[2], 10);
                if (!isNaN(parsedSeq)) {
                    sequence = parsedSeq + 1;
                }
            }
        }
        const paddedSeq = sequence.toString().padStart(5, '0');
        return `${prefix}${paddedSeq}`;
    }
}
exports.GoodsReceiptRepository = GoodsReceiptRepository;
//# sourceMappingURL=goods-receipt.repository.js.map