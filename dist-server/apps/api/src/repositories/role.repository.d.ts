export declare class RoleRepository {
    static findByName(name: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    static getOrCreateDefaultCustomerRole(): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
