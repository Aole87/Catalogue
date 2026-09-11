import { prisma } from '@car-parts/database';

export class RoleRepository {
  static async findByName(name: string) {
    return prisma.role.findUnique({
      where: { name },
    });
  }

  static async getOrCreateDefaultCustomerRole() {
    const role = await prisma.role.findUnique({
      where: { name: 'CUSTOMER' },
    });

    if (role) return role;

    return prisma.role.create({
      data: {
        name: 'CUSTOMER',
        description: 'Standard consumer account',
      },
    });
  }
}
