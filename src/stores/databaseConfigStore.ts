import { create } from 'zustand';
import { supabase, supabaseAdmin } from '../config/supabase';
import type { DatabaseConfig } from '../types/admin';
import { DEFAULT_DB_CONFIG } from '../config/constants';

interface DatabaseConfigState {
  config: DatabaseConfig;
  status: {
    connected: boolean;
    poolSize: number;
    activeConnections: number;
    idleConnections: number;
  };
  updateConfig: (config: DatabaseConfig) => Promise<void>;
  testConnection: (config: DatabaseConfig) => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

export const useDatabaseConfigStore = create<DatabaseConfigState>((set, get) => ({
  config: DEFAULT_DB_CONFIG,
  status: {
    connected: false,
    poolSize: 0,
    activeConnections: 0,
    idleConnections: 0
  },
  
  updateConfig: async (config) => {
    try {
      set({ config });
      
      // Store config in localStorage
      localStorage.setItem('databaseConfig', JSON.stringify(config));
      
      // Test connection after update
      const { testConnection } = get();
      const isConnected = await testConnection(config);
      
      set(state => ({
        status: {
          ...state.status,
          connected: isConnected
        }
      }));
    } catch (error) {
      console.error('Error updating database config:', error);
      throw error;
    }
  },
  
  testConnection: async (config) => {
    try {
      const { data, error } = await supabase
        .rpc('get_connection_status');

      if (error) {
        console.error('Database connection test failed:', error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error testing database connection:', error);
      return false;
    }
  },
  
  refreshStatus: async () => {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_connection_status');

      if (error) {
        throw error;
      }
      
      set({
        status: {
          connected: true,
          poolSize: data.pool_size || 20,
          activeConnections: data.active_connections || 0,
          idleConnections: data.idle_connections || 0
        }
      });
    } catch (error) {
      console.error('Error refreshing database status:', error);
      // Set disconnected state on error
      set({
        status: {
          connected: false,
          poolSize: 0,
          activeConnections: 0,
          idleConnections: 0
        }
      });
    }
  }
}));