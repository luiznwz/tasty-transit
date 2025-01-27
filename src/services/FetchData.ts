import {
  Cart,
  Collection,
  IFetchData,
  Product,
} from "../types/IFetchData.interface";
import { CartService } from "./cart/CartService";
import { ProductService } from "./product/ProductService";

export default class FetchData implements IFetchData {
  private cartService: CartService;
  private productService: ProductService;

  constructor() {
    this.cartService = new CartService();
    this.productService = new ProductService();
  }

  getCart(): Promise<Cart> {
    return this.cartService.getCart();
  }

  getProducts(): Promise<Product[]> {
    return this.productService.getProducts();
  }

  getProduct(productHandle: string): Promise<Product> {
    return this.productService.getProduct(productHandle);
  }

  getProductByUrl(url: string): Promise<Product> {
    return this.productService.getProductByUrl(url);
  }

  getCollection(collectionHandle: string): Promise<Collection> {
    return this.productService.getCollection(collectionHandle);
  }

  async addToCart(
    productId: string,
    variantId: string,
    quantity: number = 1
  ): Promise<Cart> {
    return this.cartService.addToCart(variantId, quantity);
  }

  removeFromCart(variantId: string): Promise<Cart> {
    return this.cartService.removeFromCart(variantId);
  }

  updateCart(variantId: string, quantity: number): Promise<Cart> {
    return this.cartService.updateCart(variantId, quantity);
  }
}
