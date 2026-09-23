"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierRepository = void 0;
const database_1 = require("@car-parts/database");
class SupplierRepository {
    static async findSuppliers(params = {}, tx = database_1.prisma) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(100, Math.max(1, params.limit || 20));
        const skip = params.offset !== undefined ? params.offset : (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.isActive !== undefined) {
            where.isActive = params.isActive;
        }
        if (params.code) {
            where.code = { contains: params.code.trim(), mode: 'insensitive' };
        }
        if (params.name) {
            where.name = { contains: params.name.trim(), mode: 'insensitive' };
        }
        const searchQuery = (params.q || params.search)?.trim();
        if (searchQuery) {
            where.OR = [
                { code: { contains: searchQuery, mode: 'insensitive' } },
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { displayName: { contains: searchQuery, mode: 'insensitive' } },
                { contactName: { contains: searchQuery, mode: 'insensitive' } },
                { email: { contains: searchQuery, mode: 'insensitive' } },
                { phone: { contains: searchQuery, mode: 'insensitive' } },
            ];
        }
        const orderByField = params.sortBy || 'createdAt';
        const orderDirection = params.sortOrder || 'desc';
        const [suppliers, total] = await Promise.all([
            tx.supplier.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            supplierProducts: true,
                            purchaseOrders: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { [orderByField]: orderDirection },
            }),
            tx.supplier.count({ where }),
        ]);
        return {
            suppliers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async findById(id, tx = database_1.prisma) {
        return tx.supplier.findFirst({
            where: { id, deletedAt: null },
            include: {
                supplierProducts: {
                    where: { deletedAt: null },
                    include: {
                        product: {
                            include: {
                                brand: true,
                                category: true,
                                prices: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        purchaseOrders: true,
                    },
                },
            },
        });
    }
    static async findByCode(code, tx = database_1.prisma) {
        return tx.supplier.findFirst({
            where: { code: code.trim().toUpperCase(), deletedAt: null },
        });
    }
    static async create(data, tx = database_1.prisma) {
        return tx.supplier.create({
            data: {
                ...data,
                code: data.code.trim().toUpperCase(),
            },
        });
    }
    static async update(id, data, tx = database_1.prisma) {
        const updateData = { ...data };
        if (typeof updateData.code === 'string') {
            updateData.code = updateData.code.trim().toUpperCase();
        }
        return tx.supplier.update({
            where: { id },
            data: updateData,
        });
    }
    static async softDelete(id, tx = database_1.prisma) {
        return tx.supplier.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
    }
}
exports.SupplierRepository = SupplierRepository;
//# sourceMappingURL=supplier.repository.js.map