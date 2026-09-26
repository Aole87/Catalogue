import { CartRepository } from '../repositories/cart.repository';
import { ProductRepository } from '../repositories/product.repository';
import { PricingService } from './pricing.service';
import { FitmentService } from './fitment.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '../errors/app-error';
import { PriceTier } from '@prisma/client';

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

export class CartService {
  /**
   * Helper to retrieve or lazily create an active cart.
   */
  private static async getOrCreateCart(userId?: string, sessionToken?: string) {
    if (!userId && !sessionToken) {
      throw new BadRequestException('Either userId or sessionToken is required to access a cart');
    }

    let cart = await CartRepository.findActiveCart({ userId, sessionToken });
    if (!cart) {
      cart = await CartRepository.createCart({ userId, sessionToken });
    }
    return cart;
  }

  /**
   * Formats and enriches a cart with server-authoritative calculations.
   */
  private static async formatCartResponse(cart: any, userTier: PriceTier = PriceTier.GENERAL) {
    if (!cart) {
      return {
        id: null,
        items: [],
        totals: PricingService.calculateTotals([], userTier),
      };
    }

    const formattedItems = await Promise.all(
      (cart.items || []).map(async (item: any) => {
        const lineCalc = PricingService.calculateLineItem(
          item.product,
          userTier,
          item.quantity,
          item.vehicleVariantId
        );

        // Check fitment compatibility if vehicle context is saved with this item
        let fitmentStatus: { compatible: boolean; reasonCode: string; vehicleName?: string } | null = null;
        if (item.vehicleVariantId && item.vehicleVariant) {
          const v = item.vehicleVariant;
          const makeName = v.generation?.model?.make?.name || '';
          const modelName = v.generation?.model?.name || '';
          const genName = v.generation?.name || '';
          const engineName = v.engine?.name ? ` ${v.engine.name}` : '';
          const variantName = v.name ? ` ${v.name}` : '';
          const vehicleDisplayName = `${makeName} ${modelName} ${genName}${engineName}${variantName}`.trim();

          try {
            const fitmentCheck = await FitmentService.checkProductFitment(item.productId, item.vehicleVariantId);
            fitmentStatus = {
              compatible: fitmentCheck.compatible,
              reasonCode: fitmentCheck.reason,
              vehicleName: vehicleDisplayName,
            };
          } catch {
            fitmentStatus = {
              compatible: false,
              reasonCode: 'INVALID_VEHICLE',
              vehicleName: vehicleDisplayName,
            };
          }
        }

        let itemShippingFee = 0;
        let variantName = null;
        if (item.product?.description && typeof item.product.description === 'string' && item.product.description.startsWith('{')) {
          try {
            const parsed = JSON.parse(item.product.description);
            if (item.vehicleVariantId && Array.isArray(parsed.variants)) {
              const matchedVar = parsed.variants.find((v: any) => v.id === item.vehicleVariantId || v.sku === item.sku);
              if (matchedVar) {
                if (matchedVar.shippingFee !== undefined) itemShippingFee = Number(matchedVar.shippingFee);
                if (matchedVar.name) variantName = matchedVar.name;
              }
            }
            if (!itemShippingFee && parsed.shippingFee !== undefined) {
              itemShippingFee = Number(parsed.shippingFee);
            }
          } catch (_) {}
        }

        return {
          id: item.id,
          cartId: item.cartId,
          productId: item.productId,
          productName: item.product?.name || lineCalc.name,
          sku: item.product?.sku || lineCalc.sku,
          brandName: item.product?.brand?.name || null,
          categoryName: item.product?.category?.name || null,
          primaryImage: lineCalc.primaryImage,
          tier: lineCalc.tier,
          unitPrice: lineCalc.unitPrice,
          compareAtPrice: lineCalc.compareAtPrice,
          quantity: item.quantity,
          lineTotal: lineCalc.lineTotal,
          shippingFee: itemShippingFee,
          variantName: variantName || item.vehicleVariant?.name || null,
          vehicleVariantId: item.vehicleVariantId || null,
          vehicleVariant: item.vehicleVariant || null,
          fitmentStatus,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      })
    );

    const totals = PricingService.calculateTotals(
      formattedItems.map((i) => ({ lineTotal: i.lineTotal, quantity: i.quantity })),
      userTier
    );

    return {
      id: cart.id,
      userId: cart.userId,
      sessionToken: cart.sessionToken,
      expiresAt: cart.expiresAt,
      items: formattedItems,
      totals,
    };
  }

  /**
   * Retrieves the current cart for a user or guest.
   */
  static async getCart(userId?: string, sessionToken?: string) {
    const userTier = await PricingService.resolveUserTier(userId);
    const cart = await this.getOrCreateCart(userId, sessionToken);
    return this.formatCartResponse(cart, userTier);
  }

  /**
   * Adds an item to the cart.
   */
  static async addItem(params: AddCartItemParams) {
    const { userId, sessionToken, productId, quantity, vehicleVariantId } = params;

    if (!quantity || quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    // Verify product exists and is active
    const product = await ProductRepository.findById(productId);
    if (!product || !product.isActive || product.deletedAt) {
      throw new NotFoundException('Product not found or inactive');
    }

    const cart = await this.getOrCreateCart(userId, sessionToken);

    await CartRepository.addItem({
      cartId: cart.id,
      productId,
      quantity,
      vehicleVariantId: vehicleVariantId || null,
    });

    const userTier = await PricingService.resolveUserTier(userId);
    const updatedCart = await CartRepository.findById(cart.id);
    return this.formatCartResponse(updatedCart, userTier);
  }

  /**
   * Updates the quantity of an item in the cart.
   */
  static async updateQuantity(params: UpdateCartItemParams) {
    const { userId, sessionToken, itemId, quantity } = params;

    const item = await CartRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify item belongs to the active cart
    const cart = await CartRepository.findById(item.cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (userId && cart.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this cart item');
    } else if (!userId && sessionToken && cart.sessionToken !== sessionToken) {
      throw new ForbiddenException('Invalid session for this cart item');
    }

    await CartRepository.updateItemQuantity(itemId, quantity);

    const userTier = await PricingService.resolveUserTier(userId);
    const updatedCart = await CartRepository.findById(cart.id);
    return this.formatCartResponse(updatedCart, userTier);
  }

  /**
   * Removes an item from the cart.
   */
  static async removeItem(params: RemoveCartItemParams) {
    const { userId, sessionToken, itemId } = params;

    const item = await CartRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const cart = await CartRepository.findById(item.cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (userId && cart.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this cart item');
    } else if (!userId && sessionToken && cart.sessionToken !== sessionToken) {
      throw new ForbiddenException('Invalid session for this cart item');
    }

    await CartRepository.removeItem(itemId);

    const userTier = await PricingService.resolveUserTier(userId);
    const updatedCart = await CartRepository.findById(cart.id);
    return this.formatCartResponse(updatedCart, userTier);
  }

  /**
   * Clears all items from the cart.
   */
  static async clearCart(userId?: string, sessionToken?: string) {
    const cart = await CartRepository.findActiveCart({ userId, sessionToken });
    if (cart) {
      await CartRepository.clearCart(cart.id);
    }

    const userTier = await PricingService.resolveUserTier(userId);
    return {
      id: cart?.id || null,
      items: [],
      totals: PricingService.calculateTotals([], userTier),
    };
  }

  /**
   * Merges guest cart items into authenticated user cart upon login.
   */
  static async mergeCart(sessionToken: string, userId: string) {
    if (!sessionToken || !userId) return null;
    await CartRepository.mergeGuestCart(sessionToken, userId);
    return this.getCart(userId);
  }
}
