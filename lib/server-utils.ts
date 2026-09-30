import { revalidatePath } from 'next/cache';

export function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Gracefully handle calls outside Next.js request context
  }
}
