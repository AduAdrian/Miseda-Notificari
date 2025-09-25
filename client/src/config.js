const normalizeUrl = (url) => {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const rawApiBase = normalizeUrl(process.env.REACT_APP_API_URL) || 'http://localhost:5000';

export const API_BASE_URL = rawApiBase;
export const API_URL = `${API_BASE_URL}/api`;
export const FRONTEND_URL = normalizeUrl(process.env.REACT_APP_FRONTEND_URL) || 'http://localhost:3000';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
