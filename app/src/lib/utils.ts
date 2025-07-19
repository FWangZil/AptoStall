import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as sha3 from "js-sha3"

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

export function truncateAddress(address: string | undefined | null, start = 6, end = 4): string {
  if (!address || typeof address !== 'string') return 'N/A';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Derives a resource account address from a source address and seed
 * This matches the behavior of account::create_resource_account in Move
 */
export function deriveResourceAccountAddress(sourceAddress: string, seed: string): string {
  try {
    // Remove 0x prefix if present
    const cleanAddress = sourceAddress.startsWith('0x') ? sourceAddress.slice(2) : sourceAddress;

    // Ensure address is 32 bytes (64 hex characters)
    const paddedAddress = cleanAddress.padStart(64, '0');

    // Convert address to bytes
    const addressBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      addressBytes[i] = parseInt(paddedAddress.slice(i * 2, i * 2 + 2), 16);
    }

    // Convert seed to bytes
    const seedBytes = new TextEncoder().encode(seed);

    // Combine address + seed + scheme (0xFF for resource account)
    const combined = new Uint8Array(addressBytes.length + seedBytes.length + 1);
    combined.set(addressBytes, 0);
    combined.set(seedBytes, addressBytes.length);
    combined[combined.length - 1] = 0xFF; // Resource account scheme

    // Calculate SHA3-256 hash
    const hash = sha3.sha3_256(combined);

    // Return as 0x-prefixed hex string
    return '0x' + hash;
  } catch (error) {
    console.error("Error deriving resource account address:", error);
    throw new Error(`Failed to derive resource account address: ${error}`);
  }
}
