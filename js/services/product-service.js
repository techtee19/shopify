// Product Service
export class ProductService {
  constructor() {
    this.products = [];
    this.categories = [];
    this.API_URL = "https://fakestoreapi.com";
  }

  async loadProducts() {
    try {
      const response = await fetch(`${this.API_URL}/products`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      this.products = await response.json();
      this.extractCategories();
      return this.products;
    } catch (error) {
      console.error("Error loading products:", error);
      throw error;
    }
  }

  extractCategories() {
    const categoriesSet = new Set();

    this.products.forEach((product) => {
      if (product.category) {
        categoriesSet.add(product.category);
      }
    });

    this.categories = Array.from(categoriesSet);
  }

  async getCategories() {
    if (this.categories.length > 0) {
      return this.categories;
    }

    try {
      const response = await fetch(`${this.API_URL}/products/categories`);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      this.categories = await response.json();
      return this.categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async getProductsByCategory(category) {
    try {
      const response = await fetch(
        `${this.API_URL}/products/category/${category}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch products in category ${category}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching products in category ${category}:`, error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const response = await fetch(`${this.API_URL}/products/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch product with ID ${id}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  }

  filterProductsByPriceRange(products, minPrice, maxPrice) {
    return products.filter((product) => {
      const price = product.price;
      return price >= minPrice && price <= maxPrice;
    });
  }

  sortProducts(products, sortOption) {
    const sortedProducts = [...products];

    switch (sortOption) {
      case "price-asc":
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sortedProducts.sort((a, b) => {
          const ratingA = a.rating?.rate || 0;
          const ratingB = b.rating?.rate || 0;
          return ratingB - ratingA;
        });
        break;
      default:
        // Default sorting (no change)
        break;
    }

    return sortedProducts;
  }

  getFeaturedProducts(limit = 8) {
    // For demo purposes, we'll just return random products as "featured"
    const shuffled = [...this.products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }
}

searchProducts(query) {
  if (!query || query.trim() === '') {
      return [];
  }
  
  query = query.toLowerCase().trim();
  
  return this.products.filter(product => {
      return (
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
  });
}
