// Cart Service
export class CartService {
  constructor() {
    this.cart = [];
    this.loadCart();
  }

  loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        this.cart = JSON.parse(savedCart);
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        this.cart = [];
      }
    }
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }

  getCart() {
    return this.cart;
  }

  getCartCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal() {
    return this.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  addToCart(product, quantity = 1) {
    const existingItemIndex = this.cart.findIndex(
      (item) => item.id === product.id
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      this.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      this.cart.push({
        ...product,
        quantity,
      });
    }

    this.saveCart();
    return this.cart;
  }

  updateQuantity(productId, quantity) {
    const itemIndex = this.cart.findIndex((item) => item.id === productId);

    if (itemIndex !== -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        this.removeFromCart(productId);
      } else {
        // Update quantity
        this.cart[itemIndex].quantity = quantity;
        this.saveCart();
      }
    }

    return this.cart;
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this.saveCart();
    return this.cart;
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    return this.cart;
  }

  calculateSubtotal() {
    return this.getCartTotal();
  }

  calculateShipping() {
    // Simple shipping calculation
    const subtotal = this.calculateSubtotal();
    return subtotal > 50 ? 0 : 10; // Free shipping for orders over $50
  }

  calculateTax() {
    const subtotal = this.calculateSubtotal();
    return subtotal * 0.1; // 10% tax
  }

  calculateTotal() {
    const subtotal = this.calculateSubtotal();
    const shipping = this.calculateShipping();
    const tax = this.calculateTax();

    return subtotal + shipping + tax;
  }
}
