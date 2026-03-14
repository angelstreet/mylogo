/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_AUTH_DISABLED?: string;
  // Add more env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
