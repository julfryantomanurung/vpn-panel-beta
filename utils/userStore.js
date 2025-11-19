const bcrypt = require('bcryptjs');

// In-memory user store (for demonstration purposes)
// In production, this should be replaced with a proper database
class UserStore {
  constructor() {
    this.users = [];
    this.initializeDefaultUsers();
  }

  async initializeDefaultUsers() {
    // Create a default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    this.users.push({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@vpnpanel.com',
      role: 'admin',
      createdAt: new Date().toISOString()
    });
  }

  async createUser(userData) {
    // Check if user already exists
    if (this.users.find(u => u.username === userData.username)) {
      throw new Error('Username already exists');
    }
    
    if (this.users.find(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user object
    const user = {
      username: userData.username,
      password: hashedPassword,
      email: userData.email,
      role: userData.role || 'user',
      createdAt: new Date().toISOString()
    };

    // Add to store
    this.users.push(user);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserByUsername(username) {
    const user = this.users.find(u => u.username === username);
    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserByUsernameWithPassword(username) {
    return this.users.find(u => u.username === username) || null;
  }

  async getAllUsers(page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedUsers = this.users
      .slice(startIndex, endIndex)
      .map(({ password, ...user }) => user);

    return {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: this.users.length,
        totalPages: Math.ceil(this.users.length / limit)
      }
    };
  }

  async deleteUser(username) {
    const index = this.users.findIndex(u => u.username === username);
    
    if (index === -1) {
      return false;
    }

    this.users.splice(index, 1);
    return true;
  }

  async validateCredentials(username, password) {
    const user = await this.getUserByUsernameWithPassword(username);
    
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

// Export singleton instance
module.exports = new UserStore();
