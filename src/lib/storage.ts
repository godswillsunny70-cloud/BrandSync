import { Brand, Post, DirectorAlert } from '../types.ts';

export const STORAGE_KEY = 'halyard_social_suite_v3';

// Clean initial state: No fake or demo clients pre-seeded
export const INITIAL_BRANDS: Brand[] = [];
export const INITIAL_POSTS: Post[] = [];

export interface AppState {
  brands: Brand[];
  posts: Post[];
  activeBrandId: string;
  alerts: DirectorAlert[];
}

export function loadStoredData(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.brands)) {
        return {
          brands: parsed.brands,
          posts: Array.isArray(parsed.posts) ? parsed.posts : [],
          activeBrandId: parsed.activeBrandId || (parsed.brands[0]?.id ?? ''),
          alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
        };
      }
    }
  } catch (err) {
    console.warn('Failed to load local storage', err);
  }

  return {
    brands: [],
    posts: [],
    activeBrandId: '',
    alerts: [],
  };
}

export function saveStoredData(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

export function getFlagStyle(flag: Brand['flag']): string {
  if (!flag) return 'linear-gradient(90deg, #14273A 50%, #E8B422 50%)';
  const { a = '#14273A', b = '#E8B422', p = 'split' } = flag;
  switch (p) {
    case 'stripe':
      return `linear-gradient(180deg, ${a} 33.3%, ${b} 33.3% 66.6%, ${a} 66.6%)`;
    case 'diag':
      return `linear-gradient(135deg, ${a} 50%, ${b} 50%)`;
    case 'cross':
      return `linear-gradient(${b}, ${b}) center/100% 26% no-repeat, linear-gradient(${b}, ${b}) 38% center/26% 100% no-repeat, ${a}`;
    case 'split':
    default:
      return `linear-gradient(90deg, ${a} 50%, ${b} 50%)`;
  }
}
