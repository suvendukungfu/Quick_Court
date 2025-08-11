import { users, type User, type InsertUser } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = `user_${this.currentId++}`;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      status: 'active',
      avatar_url: null,
      address: insertUser.address || null,
      phone: insertUser.phone || null,
      business_name: insertUser.business_name || null,
      business_address: insertUser.business_address || null,
      created_at: now,
      updated_at: now
    };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
