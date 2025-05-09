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
  async function performSearch(query) {
    try {
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

      // Fetch search results
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      // Display results
      if (data.length === 0) {
        searchResultsList.innerHTML = `
          <div class="no-results">
            <i class="icon-search"></i>
            <p>No products found for "${query}"</p>
          </div>
        `;
      } else {
        searchResultsList.innerHTML = data
          .map(
            (product) => `
          <a href="/product/${product.id}" class="search-result-item">
            <div class="search-result-image">
              <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="search-result-content">
              <h4 class="search-result-title">${product.name}</h4>
              <p class="search-result-price">$${product.price.toFixed(2)}</p>
              <p class="search-result-category">${product.category}</p>
            </div>
          </a>
        `
          )
          .join("");
      }
    } catch (error) {
      console.error("Search error:", error);
      searchResultsList.innerHTML = `
        <div class="no-results">
          <i class="icon-error"></i>
          <p>An error occurred while searching. Please try again.</p>
        </div>
      `;
    }
  }
}
