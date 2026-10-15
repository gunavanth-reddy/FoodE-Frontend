import API_BASE_URL from '../../config/api';

const API_ORIGIN = new URL(API_BASE_URL).origin;

export const resolveImageUri = (uri: string): string => {
  const trimmed = uri.trim();

  if (!trimmed || /^[a-z][a-z\d+.-]*:/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  return new URL(trimmed.replace(/^\/+/, ''), `${API_ORIGIN}/`).toString();
};
