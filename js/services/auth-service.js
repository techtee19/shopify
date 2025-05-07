// Auth Service
export class AuthService {
  constructor() {
    this.user = null;
    this.API_URL = "https://fakestoreapi.com";
    this.loadUser();
  }

  loadUser() {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        this.user = null;
      }
    }
  }

  saveUser(user) {
    this.user = user;
    localStorage.setItem("user", JSON.stringify(user));
  }

  getUser() {
    return this.user;
  }

  isLoggedIn() {
    return !!this.user;
  }

  async login(username, password) {
    try {
      // Try to use the API first
      try {
        const response = await fetch(`${this.API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        });

        if (!response.ok) {
          throw new Error("Login failed");
        }

        const data = await response.json();

        // In a real app, we would use the token to fetch user details
        // For demo purposes, we'll create a mock user
        const user = {
          id: 1,
          username,
          email: `${username}@example.com`,
          name: {
            firstname: "John",
            lastname: "Doe",
          },
          token: data.token,
        };

        this.saveUser(user);
        return user;
      } catch (apiError) {
        console.log("API login failed, using mock login");

        // For demo purposes, allow any login
        const user = {
          id: 1,
          username,
          email: `${username}@example.com`,
          name: {
            firstname: "John",
            lastname: "Doe",
          },
          token: "mock-token-123456",
        };

        this.saveUser(user);
        return user;
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(username, email, password, name) {
    try {
      // In a real app, we would call the API to register the user
      // For demo purposes, we'll create a mock user

      const [firstname, ...lastnameArray] = name.split(" ");
      const lastname = lastnameArray.join(" ");

      const user = {
        id: 1,
        username,
        email,
        name: {
          firstname,
          lastname,
        },
        token: "mock-token-123456",
      };

      this.saveUser(user);
      return user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  logout() {
    this.user = null;
    localStorage.removeItem("user");
  }
}
