"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
const database_1 = require("@car-parts/database");
class RoleRepository {
    static async findByName(name) {
        return database_1.prisma.role.findUnique({
            where: { name },
        });
    }
    static async getOrCreateDefaultCustomerRole() {
        const role = await database_1.prisma.role.findUnique({
            where: { name: 'CUSTOMER' },
        });
        if (role)
            return role;
        return database_1.prisma.role.create({
            data: {
                name: 'CUSTOMER',
                description: 'Standard consumer account',
            },
        });
    }
}
exports.RoleRepository = RoleRepository;
//# sourceMappingURL=role.repository.js.map