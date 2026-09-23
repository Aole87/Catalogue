export interface FindCartParams {
    userId?: string;
    sessionToken?: string;
}
export declare class CartRepository {
    private static cartItemIncludes;
    /**
     * Finds an active cart by userId or sessionToken.
     */
    static findActiveCart(params: FindCartParams): Promise<({
        items: ({
            vehicleVariant: ({
                generation: {
                    model: {
                        make: {
                            name: string;
                            id: string;
                            isActive: boolean;
                            createdAt: Date;
                            updatedAt: Date;
                            slug: string;
                            countryOfOrigin: string | null;
                            logoUrl: string | null;
                        };
                    } & {
                        name: string;
                        id: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        slug: string;
                        makeId: string;
                    };
                } & {
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    modelId: string;
                    code: string | null;
                    startYear: number;
                    endYear: number | null;
                };
                engine: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    engineCode: string | null;
                    displacementCc: number | null;
                    cylinders: number | null;
                    fuelType: import(".prisma/client").$Enums.FuelType;
                    aspiration: string | null;
                } | null;
            } & {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                startYear: number | null;
                endYear: number | null;
                generationId: string;
                engineId: string | null;
                transmission: string | null;
                bodyType: string | null;
                drivetrain: string | null;
            }) | null;
            product: {
                category: {
                    description: string | null;
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    slug: string;
                    parentId: string | null;
                    imageUrl: string | null;
                    sortOrder: number;
                };
                brand: {
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
                };
                prices: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    currency: string;
                    tier: import(".prisma/client").$Enums.PriceTier;
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    costPrice: import("@prisma/client/runtime/library").Decimal | null;
                    validFrom: Date | null;
                    validTo: Date | null;
                }[];
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    sortOrder: number;
                    altText: string | null;
                    isPrimary: boolean;
                }[];
            } & {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                sku: string;
                shortDescription: string | null;
                brandId: string;
                categoryId: string;
                barcode: string | null;
                warrantyText: string | null;
                weightGrams: number | null;
                lengthMm: number | null;
                widthMm: number | null;
                heightMm: number | null;
                isPublished: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            quantity: number;
            vehicleVariantId: string | null;
            cartId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        expiresAt: Date;
        sessionToken: string | null;
    }) | null>;
    /**
     * Finds a cart by its primary ID.
     */
    static findById(id: string): Promise<({
        items: ({
            vehicleVariant: ({
                generation: {
                    model: {
                        make: {
                            name: string;
                            id: string;
                            isActive: boolean;
                            createdAt: Date;
                            updatedAt: Date;
                            slug: string;
                            countryOfOrigin: string | null;
                            logoUrl: string | null;
                        };
                    } & {
                        name: string;
                        id: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        slug: string;
                        makeId: string;
                    };
                } & {
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    modelId: string;
                    code: string | null;
                    startYear: number;
                    endYear: number | null;
                };
                engine: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    engineCode: string | null;
                    displacementCc: number | null;
                    cylinders: number | null;
                    fuelType: import(".prisma/client").$Enums.FuelType;
                    aspiration: string | null;
                } | null;
            } & {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                startYear: number | null;
                endYear: number | null;
                generationId: string;
                engineId: string | null;
                transmission: string | null;
                bodyType: string | null;
                drivetrain: string | null;
            }) | null;
            product: {
                category: {
                    description: string | null;
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    slug: string;
                    parentId: string | null;
                    imageUrl: string | null;
                    sortOrder: number;
                };
                brand: {
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
                };
                prices: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    currency: string;
                    tier: import(".prisma/client").$Enums.PriceTier;
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    costPrice: import("@prisma/client/runtime/library").Decimal | null;
                    validFrom: Date | null;
                    validTo: Date | null;
                }[];
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    sortOrder: number;
                    altText: string | null;
                    isPrimary: boolean;
                }[];
            } & {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                sku: string;
                shortDescription: string | null;
                brandId: string;
                categoryId: string;
                barcode: string | null;
                warrantyText: string | null;
                weightGrams: number | null;
                lengthMm: number | null;
                widthMm: number | null;
                heightMm: number | null;
                isPublished: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            quantity: number;
            vehicleVariantId: string | null;
            cartId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        expiresAt: Date;
        sessionToken: string | null;
    }) | null>;
    /**
     * Creates a new cart for a user or guest session token.
     */
    static createCart(params: {
        userId?: string;
        sessionToken?: string;
        daysToExpire?: number;
    }): Promise<{
        items: ({
            vehicleVariant: ({
                generation: {
                    model: {
                        make: {
                            name: string;
                            id: string;
                            isActive: boolean;
                            createdAt: Date;
                            updatedAt: Date;
                            slug: string;
                            countryOfOrigin: string | null;
                            logoUrl: string | null;
                        };
                    } & {
                        name: string;
                        id: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        slug: string;
                        makeId: string;
                    };
                } & {
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    modelId: string;
                    code: string | null;
                    startYear: number;
                    endYear: number | null;
                };
                engine: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    engineCode: string | null;
                    displacementCc: number | null;
                    cylinders: number | null;
                    fuelType: import(".prisma/client").$Enums.FuelType;
                    aspiration: string | null;
                } | null;
            } & {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                startYear: number | null;
                endYear: number | null;
                generationId: string;
                engineId: string | null;
                transmission: string | null;
                bodyType: string | null;
                drivetrain: string | null;
            }) | null;
            product: {
                category: {
                    description: string | null;
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    slug: string;
                    parentId: string | null;
                    imageUrl: string | null;
                    sortOrder: number;
                };
                brand: {
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
                };
                prices: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    currency: string;
                    tier: import(".prisma/client").$Enums.PriceTier;
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    costPrice: import("@prisma/client/runtime/library").Decimal | null;
                    validFrom: Date | null;
                    validTo: Date | null;
                }[];
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    sortOrder: number;
                    altText: string | null;
                    isPrimary: boolean;
                }[];
            } & {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                sku: string;
                shortDescription: string | null;
                brandId: string;
                categoryId: string;
                barcode: string | null;
                warrantyText: string | null;
                weightGrams: number | null;
                lengthMm: number | null;
                widthMm: number | null;
                heightMm: number | null;
                isPublished: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            quantity: number;
            vehicleVariantId: string | null;
            cartId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        expiresAt: Date;
        sessionToken: string | null;
    }>;
    /**
     * Finds an existing cart item by ID.
     */
    static findItemById(itemId: string): Promise<({
        vehicleVariant: ({
            generation: {
                model: {
                    make: {
                        name: string;
                        id: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        slug: string;
                        countryOfOrigin: string | null;
                        logoUrl: string | null;
                    };
                } & {
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    slug: string;
                    makeId: string;
                };
            } & {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                modelId: string;
                code: string | null;
                startYear: number;
                endYear: number | null;
            };
            engine: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                engineCode: string | null;
                displacementCc: number | null;
                cylinders: number | null;
                fuelType: import(".prisma/client").$Enums.FuelType;
                aspiration: string | null;
            } | null;
        } & {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            startYear: number | null;
            endYear: number | null;
            generationId: string;
            engineId: string | null;
            transmission: string | null;
            bodyType: string | null;
            drivetrain: string | null;
        }) | null;
        product: {
            category: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                parentId: string | null;
                imageUrl: string | null;
                sortOrder: number;
            };
            brand: {
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
            };
            prices: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                currency: string;
                tier: import(".prisma/client").$Enums.PriceTier;
                price: import("@prisma/client/runtime/library").Decimal;
                compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                costPrice: import("@prisma/client/runtime/library").Decimal | null;
                validFrom: Date | null;
                validTo: Date | null;
            }[];
            images: {
                url: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                sortOrder: number;
                altText: string | null;
                isPrimary: boolean;
            }[];
        } & {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            slug: string;
            sku: string;
            shortDescription: string | null;
            brandId: string;
            categoryId: string;
            barcode: string | null;
            warrantyText: string | null;
            weightGrams: number | null;
            lengthMm: number | null;
            widthMm: number | null;
            heightMm: number | null;
            isPublished: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        quantity: number;
        vehicleVariantId: string | null;
        cartId: string;
    }) | null>;
    /**
     * Adds or increments an item in a cart.
     */
    static addItem(params: {
        cartId: string;
        productId: string;
        quantity: number;
        vehicleVariantId?: string | null;
    }): Promise<{
        vehicleVariant: ({
            generation: {
                model: {
                    make: {
                        name: string;
                        id: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        slug: string;
                        countryOfOrigin: string | null;
                        logoUrl: string | null;
                    };
                } & {
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    slug: string;
                    makeId: string;
                };
            } & {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                modelId: string;
                code: string | null;
                startYear: number;
                endYear: number | null;
            };
            engine: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                engineCode: string | null;
                displacementCc: number | null;
                cylinders: number | null;
                fuelType: import(".prisma/client").$Enums.FuelType;
                aspiration: string | null;
            } | null;
        } & {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            startYear: number | null;
            endYear: number | null;
            generationId: string;
            engineId: string | null;
            transmission: string | null;
            bodyType: string | null;
            drivetrain: string | null;
        }) | null;
        product: {
            category: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                parentId: string | null;
                imageUrl: string | null;
                sortOrder: number;
            };
            brand: {
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
            };
            prices: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                currency: string;
                tier: import(".prisma/client").$Enums.PriceTier;
                price: import("@prisma/client/runtime/library").Decimal;
                compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                costPrice: import("@prisma/client/runtime/library").Decimal | null;
                validFrom: Date | null;
                validTo: Date | null;
            }[];
            images: {
                url: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                sortOrder: number;
                altText: string | null;
                isPrimary: boolean;
            }[];
        } & {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            slug: string;
            sku: string;
            shortDescription: string | null;
            brandId: string;
            categoryId: string;
            barcode: string | null;
            warrantyText: string | null;
            weightGrams: number | null;
            lengthMm: number | null;
            widthMm: number | null;
            heightMm: number | null;
            isPublished: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        quantity: number;
        vehicleVariantId: string | null;
        cartId: string;
    }>;
    /**
     * Updates the quantity of an item. Removes it if quantity <= 0.
     */
    static updateItemQuantity(itemId: string, quantity: number): Promise<({
        vehicleVariant: ({
            generation: {
                model: {
                    make: {
                        name: string;
                        id: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        slug: string;
                        countryOfOrigin: string | null;
                        logoUrl: string | null;
                    };
                } & {
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    slug: string;
                    makeId: string;
                };
            } & {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                modelId: string;
                code: string | null;
                startYear: number;
                endYear: number | null;
            };
            engine: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                engineCode: string | null;
                displacementCc: number | null;
                cylinders: number | null;
                fuelType: import(".prisma/client").$Enums.FuelType;
                aspiration: string | null;
            } | null;
        } & {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            startYear: number | null;
            endYear: number | null;
            generationId: string;
            engineId: string | null;
            transmission: string | null;
            bodyType: string | null;
            drivetrain: string | null;
        }) | null;
        product: {
            category: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                parentId: string | null;
                imageUrl: string | null;
                sortOrder: number;
            };
            brand: {
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
            };
            prices: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                currency: string;
                tier: import(".prisma/client").$Enums.PriceTier;
                price: import("@prisma/client/runtime/library").Decimal;
                compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                costPrice: import("@prisma/client/runtime/library").Decimal | null;
                validFrom: Date | null;
                validTo: Date | null;
            }[];
            images: {
                url: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                sortOrder: number;
                altText: string | null;
                isPrimary: boolean;
            }[];
        } & {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            slug: string;
            sku: string;
            shortDescription: string | null;
            brandId: string;
            categoryId: string;
            barcode: string | null;
            warrantyText: string | null;
            weightGrams: number | null;
            lengthMm: number | null;
            widthMm: number | null;
            heightMm: number | null;
            isPublished: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        quantity: number;
        vehicleVariantId: string | null;
        cartId: string;
    }) | null>;
    /**
     * Removes a single item from the cart.
     */
    static removeItem(itemId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        quantity: number;
        vehicleVariantId: string | null;
        cartId: string;
    }>;
    /**
     * Clears all items from the cart.
     */
    static clearCart(cartId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * Merges guest cart items into an authenticated user's cart.
     */
    static mergeGuestCart(sessionToken: string, userId: string): Promise<void>;
}
