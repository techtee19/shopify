// UI Service - Handles UI functionality

// Show notification
function showNotification(message, type = "info", duration = 3000) {
  // Create notification container if it doesn't exist
  let container = document.getElementById("notifications-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "notifications-container";
    container.className = "notifications-container";
    document.body.appendChild(container);
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;

  // Create notification content
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-message">${message}</div>
      <button class="notification-close">&times;</button>
    </div>
  `;

  // Add notification to container
  container.appendChild(notification);

  // Add event listener to close button
  const closeButton = notification.querySelector(".notification-close");
  closeButton.addEventListener("click", () => {
    hideNotification(notification);
  });

  // Auto-hide notification after duration
  setTimeout(() => {
    hideNotification(notification);
  }, duration);

  return notification;
}

// Hide notification
function hideNotification(notification) {
  notification.classList.add("notification-hiding");

  // Remove notification after animation
  notification.addEventListener("animationend", () => {
    notification.remove();
  });
}

// Toggle theme
function toggleTheme() {
  const currentTheme = localStorage.getItem("theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  // Update theme in local storage
  localStorage.setItem("theme", newTheme);

  // Update data-theme attribute on document
  document.documentElement.setAttribute("data-theme", newTheme);

  // Update theme toggle button
  updateThemeToggleButton(newTheme);

  return newTheme;
}

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";

  // Set theme on document
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Update theme toggle button
  updateThemeToggleButton(savedTheme);

  return savedTheme;
}

// Update theme toggle button
function updateThemeToggleButton(theme) {
  const themeToggle = document.getElementById("theme-toggle");

  if (themeToggle) {
    const themeIcon = themeToggle.querySelector(".icon-theme");

    if (themeIcon) {
      if (theme === "dark") {
        themeIcon.classList.remove("icon-moon");
        themeIcon.classList.add("icon-sun");
      } else {
        themeIcon.classList.remove("icon-sun");
        themeIcon.classList.add("icon-moon");
      }
    }
  }
}

// Toggle mobile menu
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenu) {
    mobileMenu.classList.toggle("active");
  }
}

// Toggle user menu
function toggleUserMenu() {
  const userMenu = document.getElementById("user-menu");

  if (userMenu) {
    userMenu.classList.toggle("active");
  }
}

// Toggle search form
function toggleSearchForm() {
  const searchForm = document.getElementById("search-form");

  if (searchForm) {
    searchForm.classList.toggle("active");
  }
}

// Format price
function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

// Format date
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

// Export all functions
export const UIService = {
  showNotification,
  hideNotification,
  toggleTheme,
  initTheme,
  toggleMobileMenu,
  toggleUserMenu,
  toggleSearchForm,
  formatPrice,
  formatDate,
};
