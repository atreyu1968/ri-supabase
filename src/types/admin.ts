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
// Rest of admin types...