import { db } from '../../config/supabase';
import type { User } from '../../types/user';

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await db.query<User>(
    'users',
    '*'
  ).eq('email', email).single();

  if (error) {
    console.error('Error finding user by email:', error);
    return null;
  }

  return data;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await db.query<User>(
    'users',
    '*'
  ).eq('id', id).single();

  if (error) {
    console.error('Error finding user by id:', error);
    return null;
  }

  return data;
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const { data, error } = await db.insert<User>('users', user);

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return data!;
};

export const updateUser = async (id: string, user: Partial<User>): Promise<boolean> => {
  const { error } = await db.update<User>('users', id, user);
  return !error;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const { error } = await db.delete('users', id);
  return !error;
};