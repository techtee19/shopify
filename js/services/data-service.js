// Data Service - Handles local JSON data operations

class DataService {
  constructor() {
    this.products = [];
    this.categories = [];
    this.brands = [];
    this.initialized = false;
  }

  async init() {
    try {
      const response = await fetch("/data/products.json");
      const data = await response.json();

      this.products = data.products;
      this.categories = data.categories;
      this.brands = data.brands;
      this.initialized = true;

      return true;
    } catch (error) {
      console.error("Error initializing data service:", error);
      return false;
    }
  }

  // Product methods
  async getProduct(id) {
    await this.ensureInitialized();
    return this.products.find((product) => product.id === parseInt(id));
  }

  async getProductsByCategory(category) {
    await this.ensureInitialized();
    return this.products.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getProductsByBrand(brand) {
    await this.ensureInitialized();
    return this.products.filter(
      (product) => product.brand.toLowerCase() === brand.toLowerCase()
    );
  }

  async searchProducts(query) {
    await this.ensureInitialized();
    const searchTerm = query.toLowerCase();
    return this.products.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm)
    );
  }

  // Category methods
  async getAllCategories() {
    await this.ensureInitialized();
    return this.categories;
  }

  async getCategory(id) {
    await this.ensureInitialized();
    return this.categories.find((category) => category.id === id);
  }

  // Brand methods
  async getAllBrands() {
    await this.ensureInitialized();
    return this.brands;
  }

  async getBrand(id) {
    await this.ensureInitialized();
    return this.brands.find((brand) => brand.id === id);
  }

  // Helper methods
  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
  }

  // Filter methods
  async filterProducts(filters) {
    await this.ensureInitialized();
    return this.products.filter((product) => {
      return Object.entries(filters).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.includes(product[key]);
        }
        return product[key] === value;
      });
    });
  }

  // Sort methods
  async sortProducts(products, sortBy, order = "asc") {
    return [...products].sort((a, b) => {
      let comparison = 0;
      if (typeof a[sortBy] === "string") {
        comparison = a[sortBy].localeCompare(b[sortBy]);
      } else {
        comparison = a[sortBy] - b[sortBy];
      }
      return order === "asc" ? comparison : -comparison;
    });
  }
}

// Create and export a singleton instance
export const dataService = new DataService();
