import { logger } from './logger';

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
  context: string = 'Operation'
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      logger.warn(`${context} failed (Attempt ${attempt}/${retries}). Retrying in ${delay}ms...`, { error: error.message });
      
      if (attempt >= retries) {
        logger.error(`${context} failed after ${retries} attempts.`);
        throw error;
      }
      
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  throw new Error('Unreachable');
}
