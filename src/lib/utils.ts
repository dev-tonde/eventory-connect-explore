import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to combine Tailwind and conditional classes.
 * @param inputs - Any number of class values (strings, arrays, objects)
 * @returns A merged className string with deduplication.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
