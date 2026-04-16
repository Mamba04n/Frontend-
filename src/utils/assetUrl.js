const getApiBase = () => {
  const raw = import.meta.env.VITE_API_URL || 'https://vocescriticas-api-prod.onrender.com/api';
  return raw.replace(/\/$/, '');
};

export const toAssetUrl = (pathOrUrl) => {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const normalized = String(pathOrUrl).replace(/^\/+/, '');
  return `${getApiBase()}/files/open?path=${encodeURIComponent(normalized)}`;
};

export const toDownloadUrl = (pathOrUrl) => {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const normalized = String(pathOrUrl).replace(/^\/+/, '');
  return `${getApiBase()}/files/download?path=${encodeURIComponent(normalized)}`;
};
