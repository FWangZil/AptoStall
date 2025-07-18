import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatApt(octas: number | string): string {
  const octasNum = typeof octas === 'string' ? parseInt(octas) : octas;
  return (octasNum / 100_000_000).toFixed(4);
}

export function aptToOctas(apt: number): number {
  return Math.floor(apt * 100_000_000);
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
