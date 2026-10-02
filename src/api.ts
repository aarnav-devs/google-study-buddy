import { Capacitor } from '@capacitor/core';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');

export function apiUrl(path: string): string {
  const route = path.startsWith('/') ? path : `/${path}`;
  const useLocalDevelopmentApi = import.meta.env.DEV && !Capacitor.isNativePlatform();

  if (useLocalDevelopmentApi) return route;

  if (API_BASE_URL) {
    if (Capacitor.isNativePlatform() && import.meta.env.PROD) {
      let apiOrigin: URL;
      try {
        apiOrigin = new URL(API_BASE_URL);
      } catch {
        throw new Error('VITE_API_BASE_URL must be a valid HTTPS URL in a production Android build.');
      }
      if (apiOrigin.protocol !== 'https:') {
        throw new Error('VITE_API_BASE_URL must use HTTPS in a production Android build.');
      }
    }
    return `${API_BASE_URL}${route}`;
  }

  if (Capacitor.isNativePlatform() && import.meta.env.PROD) {
    throw new Error('Set VITE_API_BASE_URL to your deployed HTTPS API before building the Android app.');
  }

  return route;
}