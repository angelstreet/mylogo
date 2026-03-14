const basePath = (import.meta.env.VITE_BASE_PATH || '/').replace(/\/$/, '');
export const API = `${basePath}/api`;
export const BASE_PATH = basePath;
