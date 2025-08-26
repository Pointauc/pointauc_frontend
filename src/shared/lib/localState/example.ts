/**
 * Example usage of LocalState classes
 * This file demonstrates how to use the LocalState ORM-like abstraction
 * with both IndexedDB and localStorage implementations.
 */

import { IndexedDBLocalState } from './indexedDB';
import { LocalStorageLocalState } from './localStorage';

// Example data interface
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

// Example usage with IndexedDB
export async function indexedDBExample() {
  // Initialize IndexedDB storage
  const userStore = new IndexedDBLocalState<User>({
    tableName: 'users',
    primaryKey: 'id',
    indexes: ['email', 'name'], // Create indexes for efficient querying
    dbName: 'MyAppDB',
    dbVersion: 1,
  });

  // Initialize the storage
  await userStore.init();

  // Create a new user
  const newUser = await userStore.save({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    createdAt: new Date(),
  });
  console.log('Created user:', newUser);

  // Find user by ID
  const foundUser = await userStore.findById(newUser.id);
  console.log('Found user:', foundUser);

  // Find users with conditions
  const adults = await userStore.find({
    where: { age: { $gte: 18 } },
    orderBy: { field: 'name', direction: 'asc' },
  });
  console.log('Adult users:', adults);

  // Update user
  await userStore.updateById(newUser.id, { age: 31 });

  // Count users
  const userCount = await userStore.count();
  console.log('Total users:', userCount);

  // Delete user
  await userStore.deleteById(newUser.id);

  // Close connection when done
  userStore.close();
}

// Example usage with localStorage
export async function localStorageExample() {
  // Initialize localStorage storage
  const userStore = new LocalStorageLocalState<User>({
    tableName: 'users',
    primaryKey: 'id',
    storagePrefix: 'MyApp', // Will create key: MyApp_users
  });

  // Initialize the storage
  await userStore.init();

  // Create multiple users
  const users = await userStore.saveMany([
    {
      name: 'Alice Smith',
      email: 'alice@example.com',
      age: 25,
      createdAt: new Date(),
    },
    {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      age: 35,
      createdAt: new Date(),
    },
  ]);
  console.log('Created users:', users);

  // Find all users
  const allUsers = await userStore.findAll();
  console.log('All users:', allUsers);

  // Find users with complex query
  const youngUsers = await userStore.find({
    where: {
      age: { $lt: 30 },
      name: { $nin: ['Alice Smith'] }, // Not in array
    },
    limit: 10,
    offset: 0,
  });
  console.log('Young users (excluding Alice):', youngUsers);

  // Update multiple users
  const updatedCount = await userStore.update({ age: 26 }, { where: { name: 'Alice Smith' } });
  console.log('Updated users count:', updatedCount);

  // Get storage information
  const storageInfo = userStore.getStorageInfo();
  console.log('Storage info:', storageInfo);

  // Export/Import data
  const exportedData = userStore.exportData();
  console.log('Exported data:', exportedData);

  // Clear all data
  await userStore.clear();
}

// Example of switching between storage types
export class UserRepository {
  private storage: IndexedDBLocalState<User> | LocalStorageLocalState<User>;

  constructor(useIndexedDB: boolean = true) {
    if (useIndexedDB && 'indexedDB' in window) {
      this.storage = new IndexedDBLocalState<User>({
        tableName: 'users',
        primaryKey: 'id',
        indexes: ['email', 'name'],
        dbName: 'UserDB',
        dbVersion: 1,
      });
    } else {
      // Fallback to localStorage
      this.storage = new LocalStorageLocalState<User>({
        tableName: 'users',
        primaryKey: 'id',
        storagePrefix: 'UserApp',
      });
    }
  }

  async init() {
    await this.storage.init();
  }

  async createUser(userData: Omit<User, 'id'>) {
    return this.storage.save(userData);
  }

  async getUser(id: string) {
    return this.storage.findById(id);
  }

  async getAllUsers() {
    return this.storage.findAll();
  }

  async updateUser(id: string, updates: Partial<User>) {
    return this.storage.updateById(id, updates);
  }

  async deleteUser(id: string) {
    return this.storage.deleteById(id);
  }

  async searchUsers(query: string) {
    // Since we can't do full-text search directly, we'll filter by name and email
    return this.storage.find({
      where: {
        // This would work with the custom matching logic
        name: query, // Exact match
      },
    });
  }

  async getUsersByAge(minAge: number, maxAge?: number) {
    const where: any = { age: { $gte: minAge } };
    if (maxAge) {
      where.age.$lte = maxAge;
    }

    return this.storage.find({
      where,
      orderBy: { field: 'age', direction: 'asc' },
    });
  }
}

// Example usage of the repository pattern
export async function repositoryExample() {
  const userRepo = new UserRepository(true); // Use IndexedDB if available
  await userRepo.init();

  // Create a user
  const user = await userRepo.createUser({
    name: 'Jane Doe',
    email: 'jane@example.com',
    age: 28,
    createdAt: new Date(),
  });

  // Get users by age range
  const usersInTwenties = await userRepo.getUsersByAge(20, 29);
  console.log('Users in their twenties:', usersInTwenties);

  // Update user
  await userRepo.updateUser(user.id, { age: 29 });

  // Get all users
  const allUsers = await userRepo.getAllUsers();
  console.log('All users:', allUsers);
}
