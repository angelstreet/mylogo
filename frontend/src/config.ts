const slug = '/mylogo';
export const BASE_PATH = window.location.pathname.startsWith(slug) ? slug : '';
export const API = `${BASE_PATH}/api`;
