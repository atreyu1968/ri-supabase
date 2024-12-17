import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schema for Supabase configuration validation with default values
const supabaseConfigSchema = z.object({
  url: z.string().url().default('http://localhost:54321'),
  anonKey: z.string().min(1),
  serviceRole: z.string().optional(),
});

// Environment-specific configurations
const configs = {
  development: {
    url: 'https://supabase.iesmmg.es',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzM0MzA3MjAwLAogICJleHAiOiAxODkyMDczNjAwCn0.vgp7HrhqHqQGeRovZxpae7JSfwgnTnsAQyT8YOWFiU4',
    serviceRole: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MzQzMDcyMDAsCiAgImV4cCI6IDE4OTIwNzM2MDAKfQ.GnkopJDU3o62vRNSIzwl5JayYl_4zDMiv23Le7It_XA',
  },
  production: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    serviceRole: import.meta.env.VITE_SUPABASE_SERVICE_ROLE,
  },
};

// Get current environment
const env = import.meta.env.MODE || 'development';

// Parse configuration with defaults
const config = supabaseConfigSchema.parse({
  url: configs[env as keyof typeof configs].url,
  anonKey: configs[env as keyof typeof configs].anonKey,
  serviceRole: configs[env as keyof typeof configs].serviceRole,
});

// Create Supabase client with service role for admin operations
export const supabaseAdmin = createClient(config.url, config.serviceRole || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'supabase.admin.auth.token'
  },
  db: {
    schema: 'public'
  }
});

// Create regular Supabase client for user operations
export const supabase = createClient(config.url, config.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'supabase.auth.token'
  },
  db: {
    schema: 'public'
  }
});

// Helper function to check database connection
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Only create function in production with service role
    if (env === 'production' && config.serviceRole) {
      await supabaseAdmin.rpc('create_connection_function', {
        sql: `
          CREATE OR REPLACE FUNCTION get_connection_status()
          RETURNS json
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            result json;
          BEGIN
            SELECT json_build_object(
              'pool_size', current_setting('max_connections')::int,
              'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
              'idle_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle')
            ) INTO result;
            RETURN result;
          END;
          $$;
        `
      });
    }

    // Luego probar la conexión
    const { data, error } = await supabase.from('_health').select('*').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Database connection not available in development mode');
      return true;
    }
    console.error('Database connection error:', error); 
    return false;
  }
};
// Export typed helpers for database operations
export const db = {
  // Generic query helper with type inference
  query: async <T>(
    table: string,
    columns: string = '*'
  ): Promise<{ data: T | null; error: any }> => {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select(columns);
    return { data: data as T, error };
  },

  // Insert helper
  insert: async <T>(
    table: string,
    data: Partial<T>
  ): Promise<{ data: T | null; error: any }> => {
    const { data: result, error } = await supabaseAdmin
      .from(table)
      .insert([data])
      .select()
      .single();
    return { data: result as T, error };
  },

  // Update helper
  update: async <T>(
    table: string,
    id: string,
    data: Partial<T>
  ): Promise<{ data: T | null; error: any }> => {
    const { data: result, error } = await supabaseAdmin
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    return { data: result as T, error };
  },

  // Delete helper
  delete: async (
    table: string,
    id: string
  ): Promise<{ error: any }> => {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id);
    return { error };
  },
};
