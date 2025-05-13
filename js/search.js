// Search functionality
export function initSearch() {
  const searchToggle = document.getElementById("search-toggle");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const searchOverlay = document.getElementById("search-overlay");
  const closeSearch = document.getElementById("close-search");
  const searchResultsList = document.getElementById("search-results-list");
  const productSearchForm = document.getElementById("product-search-form");

  let searchTimeout;

  // Load all products from JSON once
  let allProducts = [];
  fetch("data/products.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load products.json");
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data.products)) {
        console.error("products.json 'products' is not an array!", data);
        allProducts = [];
      } else {
        allProducts = data.products;
        console.log("Loaded products:", allProducts); // Debug log
      }
    })
    .catch((err) => {
      console.error("Error loading products.json:", err);
      allProducts = [];
    });

  // Toggle search form
  searchToggle.addEventListener("click", () => {
    searchForm.classList.toggle("active");
    if (searchForm.classList.contains("active")) {
      searchInput.focus();
    }
  });

  // Close search form when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchForm.contains(e.target) && !searchToggle.contains(e.target)) {
      searchForm.classList.remove("active");
    }
  });

  // Handle search input
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length >= 2) {
      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      searchResultsList.innerHTML = "";
    }
  });

  // Handle search form submission
  productSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query.length >= 2) {
      performSearch(query);
    }
  });

  // Close search results
  closeSearch.addEventListener("click", () => {
    searchResults.classList.remove("active");
    searchOverlay.classList.remove("active");
  });

  // Close search results when clicking overlay
  searchOverlay.addEventListener("click", () => {
    searchResults.classList.remove("active");
    searchOverlay.classList.remove("active");
  });

  // Perform search
  function performSearch(query) {
    // Show loading state
    searchResultsList.innerHTML = `
      <div class="search-loading">
        <div class="spinner"></div>
        <span>Searching...</span>
      </div>
    `;

    // Show search results panel
    searchResults.classList.add("active");
    searchOverlay.classList.add("active");

    // Only search if allProducts is a non-empty array
    if (!Array.isArray(allProducts)) {
      searchResultsList.innerHTML = `
        <div class="no-results">
          <i class="icon-search"></i>
          <p>Products are not loaded. Please check your products.json file.</p>
        </div>
      `;
      return;
    }
    if (allProducts.length === 0) {
      searchResultsList.innerHTML = `
        <div class="no-results">
          <i class="icon-search"></i>
          <p>No products found for "${query}"</p>
        </div>
      `;
      return;
    }

    // Filter products
    const lowerQuery = query.trim().toLowerCase();
    const results = allProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        (product.category &&
          product.category.toLowerCase().includes(lowerQuery))
    );

    // Display results
    if (results.length === 0) {
      searchResultsList.innerHTML = `
        <div class="no-results">
          <i class="icon-search"></i>
          <p>No products found for "${query}"</p>
        </div>
      `;
    } else {
      searchResultsList.innerHTML = results
        .map(
          (product) => `
          <a href="product.html?id=${product.id}" class="search-result-item">
            <div class="search-result-image">
              <img src="${
                product.images && product.images[0] ? product.images[0] : ""
              }" alt="${product.title}">
            </div>
            <div class="search-result-content">
              <h4 class="search-result-title">${product.title}</h4>
              <p class="search-result-price">$$${
                product.price ? product.price.toFixed(2) : ""
              }</p>
              <p class="search-result-category">${product.category || ""}</p>
            </div>
          </a>
        `
        )
        .join("");
    }
  }
}
