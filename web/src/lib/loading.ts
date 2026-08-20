/**
 * Standardized Loading Utilities & Helper Functions
 */

export interface LoadingStateOptions {
  message?: string
  timeoutMs?: number
}

export const DEFAULT_LOADING_OPTIONS: LoadingStateOptions = {
  message: 'Loading destination data...',
  timeoutMs: 10000,
}

/**
 * Delay execution helper for smooth minimum skeleton visibility
 */
export function minDelay<T>(promise: Promise<T>, delayMs = 300): Promise<T> {
  return Promise.all([
    promise,
    new Promise((resolve) => setTimeout(resolve, delayMs)),
  ]).then(([result]) => result)
}
