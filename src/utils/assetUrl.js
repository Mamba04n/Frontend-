const getApiOrigin = () => {
  const raw = import.meta.env.VITE_API_URL || 'https://vocescriticas-api-prod.onrender.com/api';
  return raw.replace(/\/api\/?$/, '').replace(/\/$/, '');
};

export const toAssetUrl = (pathOrUrl) => {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${getApiOrigin()}/storage/${String(pathOrUrl).replace(/^\/+/, '')}`;
};
