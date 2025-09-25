const normalizeUrl = (url) => {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const productionApiBase = 'https://misedainspectsrl.ro';
const rawApiBase = normalizeUrl(process.env.REACT_APP_API_URL) || productionApiBase;

export const API_BASE_URL = rawApiBase;
export const API_URL = `${API_BASE_URL}/api`;
const productionFrontend = 'https://misedainspectsrl.ro';
export const FRONTEND_URL = normalizeUrl(process.env.REACT_APP_FRONTEND_URL) || productionFrontend;
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
