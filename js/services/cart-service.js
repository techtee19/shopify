// Cart Service - Handles cart functionality

import { UIService } from "./ui-services.js";
import { dataService } from "./data-service.js";

export class CartService {
  static cart = JSON.parse(localStorage.getItem("cart")) || [];

  static async addToCart(productId, quantity = 1) {
    try {
      // Initialize data service if needed
      await dataService.init();

      // Get product details
      const product = await dataService.getProduct(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Check if product is already in cart
      const existingItem = this.cart.find((item) => item.id === productId);

      if (existingItem) {
        // Update quantity
        existingItem.quantity += quantity;
        existingItem.total = existingItem.price * existingItem.quantity;
      } else {
        // Add new item
        this.cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.images[0],
          quantity: quantity,
          total: product.price * quantity,
        });
      }

      // Save to localStorage
      this.saveCart();

      return this.cart;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  static removeFromCart(productId) {
    try {
      this.cart = this.cart.filter((item) => item.id !== productId);
      this.saveCart();
      return this.cart;
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }

  static updateQuantity(productId, quantity) {
    try {
      const item = this.cart.find((item) => item.id === productId);
      if (item) {
        item.quantity = quantity;
        item.total = item.price * quantity;
        this.saveCart();
      }
      return this.cart;
    } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
    }
  }

  static clearCart() {
    try {
      this.cart = [];
      this.saveCart();
      return this.cart;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }

  static getCart() {
    return this.cart;
  }

  static getCartItemCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  static getCartTotal() {
    return this.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  static saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }

  static async checkout(orderData) {
    // Simulate a delay and success
    return new Promise((resolve) => {
      setTimeout(() => {
        this.clearCart();
        resolve({
          success: true,
          orderId: Math.floor(Math.random() * 1000000),
        });
      }, 500);
    });
  }
}
