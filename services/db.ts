
import { UserAccount, Transaction } from '../types';

const USERS_KEY = 'gemini_bank_users_db_v1';
const TX_KEY = 'gemini_bank_transactions_db_v1';

// Helper to get all users from storage
const getUsers = (): Record<string, UserAccount> => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Database Error (Users):", e);
    return {};
  }
};

// Helper to get all transactions from storage
const getAllTransactions = (): Record<string, Transaction[]> => {
  try {
    const data = localStorage.getItem(TX_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Database Error (Transactions):", e);
    return {};
  }
};

export const db = {
  // Find a user by their unique ID
  getUser: (userId: string): UserAccount | null => {
    const users = getUsers();
    return users[userId] || null;
  },

  // Create a new user in the database
  createUser: (user: UserAccount): void => {
    const users = getUsers();
    users[user.userId] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Update an existing user's balance
  updateUserBalance: (userId: string, balance: number): void => {
    const users = getUsers();
    if (users[userId]) {
      users[userId].balance = balance;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  // Retrieve transactions for a specific user
  getTransactions: (userId: string): Transaction[] => {
    const all = getAllTransactions();
    return all[userId] || [];
  },

  // Add a transaction record
  addTransaction: (userId: string, tx: Transaction): void => {
    const all = getAllTransactions();
    if (!all[userId]) all[userId] = [];
    all[userId].push(tx);
    localStorage.setItem(TX_KEY, JSON.stringify(all));
  }
};
