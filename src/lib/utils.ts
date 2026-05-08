export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller',
] as const;

export type Genre = typeof GENRES[number];

export const ART_STYLES = [
  'geometric-lego',
  'chibi',
  'realistic',
  'pixel-art',
  'watercolor',
] as const;
