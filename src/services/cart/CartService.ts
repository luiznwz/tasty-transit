import { Cart } from "../../types/IFetchData.interface";

export class CartService {
  async getCart(): Promise<Cart> {
    const response = await fetch("/cart.js");
    const data = await response.json();
    return data as Cart;
  }

  async addToCart(variantId: string, quantity: number = 1): Promise<Cart> {
    const data = {
      items: [
        {
          id: variantId,
          quantity,
        },
      ],
    };

    const response = await fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to add item to cart");
    }

    return this.getCart();
  }

  async updateCart(variantId: string, quantity: number): Promise<Cart> {
    const data = {
      updates: {
        [variantId]: quantity,
      },
    };

    const response = await fetch("/cart/update.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update cart");
    }

    return this.getCart();
  }

  async removeFromCart(variantId: string): Promise<Cart> {
    return this.updateCart(variantId, 0);
  }
}
