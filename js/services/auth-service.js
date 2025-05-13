// Auth Service - Handles authentication functionality

import { UIService } from "./ui-services.js";
import { dataService } from "./data-service.js";

// Authentication Service
export class AuthService {
  static currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

  // Initialize auth state from localStorage
  static init() {
    const user = localStorage.getItem("currentUser");
    if (user) {
      try {
        this.currentUser = JSON.parse(user);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("currentUser");
      }
    }
  }

  // Login user
  static async login(email, password) {
    try {
      await dataService.init();

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users")) || [];

      // Find user by email
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Set as current user
      this.currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  }

  // Register new user
  static async register(userData) {
    try {
      await dataService.init();

      // Get existing users or initialize empty array
      let users = JSON.parse(localStorage.getItem("users")) || [];

      // Check if email already exists
      if (users.some((user) => user.email === userData.email)) {
        throw new Error("Email already registered");
      }

      // Create new user
      const user = {
        id: Math.floor(Math.random() * 1000000),
        ...userData,
      };

      // Add to users array and save
      users.push(user);
      localStorage.setItem("users", JSON.stringify(users));

      // Set as current user
      this.currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  }

  // Logout user
  static logout() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get current user
  static getCurrentUser() {
    return this.currentUser;
  }

  // Update user profile
  static updateProfile(userData) {
    try {
      if (!this.currentUser) {
        throw new Error("No user logged in");
      }

      // Update user data
      const updatedUser = { ...this.currentUser, ...userData };

      // Save updated user to local storage
      this.currentUser = updatedUser;
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }
}
