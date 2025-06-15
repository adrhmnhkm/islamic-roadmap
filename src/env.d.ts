/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string
  readonly PUBLIC_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace Astro {
  interface Props {
    title?: string;
  }
}

interface Window {
  useAuthStore: any;
}

declare namespace App {
  interface Locals {
    user?: {
      id: string;
      email: string;
      full_name?: string;
      avatar_url?: string;
    };
    role?: 'user' | 'admin' | 'super_admin';
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    isAdminRoute?: boolean;
  }
}