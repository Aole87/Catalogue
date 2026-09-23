export interface AddCartItemParams {
    userId?: string;
    sessionToken?: string;
    productId: string;
    quantity: number;
    vehicleVariantId?: string | null;
}
export interface UpdateCartItemParams {
    userId?: string;
    sessionToken?: string;
    itemId: string;
    quantity: number;
}
export interface RemoveCartItemParams {
    userId?: string;
    sessionToken?: string;
    itemId: string;
}
export declare class CartService {
    /**
     * Helper to retrieve or lazily create an active cart.
     */
    private static getOrCreateCart;
    /**
     * Formats and enriches a cart with server-authoritative calculations.
     */
    private static formatCartResponse;
    /**
     * Retrieves the current cart for a user or guest.
     */
    static getCart(userId?: string, sessionToken?: string): Promise<{
        id: null;
        items: never[];
        totals: import("./pricing.service").CalculatedOrderTotals;
        userId?: undefined;
        sessionToken?: undefined;
        expiresAt?: undefined;
    } | {
        id: any;
        userId: any;
        sessionToken: any;
        expiresAt: any;
        items: any[];
        totals: import("./pricing.service").CalculatedOrderTotals;
    }>;
    /**
     * Adds an item to the cart.
     */
    static addItem(params: AddCartItemParams): Promise<{
        id: null;
        items: never[];
        totals: import("./pricing.service").CalculatedOrderTotals;
        userId?: undefined;
        sessionToken?: undefined;
        expiresAt?: undefined;
    } | {
        id: any;
        userId: any;
        sessionToken: any;
        expiresAt: any;
        items: any[];
        totals: import("./pricing.service").CalculatedOrderTotals;
    }>;
    /**
     * Updates the quantity of an item in the cart.
     */
    static updateQuantity(params: UpdateCartItemParams): Promise<{
        id: null;
        items: never[];
        totals: import("./pricing.service").CalculatedOrderTotals;
        userId?: undefined;
        sessionToken?: undefined;
        expiresAt?: undefined;
    } | {
        id: any;
        userId: any;
        sessionToken: any;
        expiresAt: any;
        items: any[];
        totals: import("./pricing.service").CalculatedOrderTotals;
    }>;
    /**
     * Removes an item from the cart.
     */
    static removeItem(params: RemoveCartItemParams): Promise<{
        id: null;
        items: never[];
        totals: import("./pricing.service").CalculatedOrderTotals;
        userId?: undefined;
        sessionToken?: undefined;
        expiresAt?: undefined;
    } | {
        id: any;
        userId: any;
        sessionToken: any;
        expiresAt: any;
        items: any[];
        totals: import("./pricing.service").CalculatedOrderTotals;
    }>;
    /**
     * Clears all items from the cart.
     */
    static clearCart(userId?: string, sessionToken?: string): Promise<{
        id: string | null;
        items: never[];
        totals: import("./pricing.service").CalculatedOrderTotals;
    }>;
    /**
     * Merges guest cart items into authenticated user cart upon login.
     */
    static mergeCart(sessionToken: string, userId: string): Promise<{
        id: null;
        items: never[];
        totals: import("./pricing.service").CalculatedOrderTotals;
        userId?: undefined;
        sessionToken?: undefined;
        expiresAt?: undefined;
    } | {
        id: any;
        userId: any;
        sessionToken: any;
        expiresAt: any;
        items: any[];
        totals: import("./pricing.service").CalculatedOrderTotals;
    } | null>;
}
