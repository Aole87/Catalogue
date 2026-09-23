import { CreateBrandInput, UpdateBrandInput } from '../schemas/brand.schema';
export declare class BrandService {
    static listBrands(onlyActive?: boolean): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        logoUrl: string | null;
        websiteUrl: string | null;
    }[]>;
    static getBrandById(id: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        logoUrl: string | null;
        websiteUrl: string | null;
    }>;
    static getBrandBySlug(slug: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        logoUrl: string | null;
        websiteUrl: string | null;
    }>;
    static createBrand(input: CreateBrandInput, metadata?: {
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
    }): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        logoUrl: string | null;
        websiteUrl: string | null;
    }>;
    static updateBrand(id: string, input: UpdateBrandInput, metadata?: {
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
    }): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        logoUrl: string | null;
        websiteUrl: string | null;
    }>;
    static deleteBrand(id: string, metadata?: {
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
    }): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        logoUrl: string | null;
        websiteUrl: string | null;
    }>;
}
