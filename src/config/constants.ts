export const DEFAULT_LOGO_URL = 'https://i.postimg.cc/wvFrT0KH/Logotipo-del-Gobierno-de-Canarias-svg.png';
export const DEFAULT_FAVICON_URL = 'https://i.postimg.cc/BXFxt40G/favicon.png';

export interface DatabaseConfig {
  enabled: boolean;
  settings: {
    url: string;
    anonKey: string;
    serviceRole?: string;
    schema?: string;
    ssl?: boolean;
  };
}

export const DEFAULT_DB_CONFIG: DatabaseConfig = {
  enabled: true,
  settings: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    serviceRole: import.meta.env.VITE_SUPABASE_SERVICE_ROLE || '',
    schema: 'public',
    ssl: true
  }
};

export const ADMIN_CREDENTIALS = {
  email: 'admin@redinnovacionfp.es',
  password: 'Admin2024Secure!',
  name: 'Administrador',
  lastName: 'Sistema',
  role: 'admin' as const,
};

export const GITHUB_REPO = {
  owner: 'atreyu1968',
  repo: 'ir-final-7',
  branch: 'main'
};