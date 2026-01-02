// Dev Mode Utilities
// Only enabled on localhost, allows testing features like hint generation

/**
 * Check if the app is running on localhost
 */
export const isLocalhost = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local')
  );
};

/**
 * Check if dev mode is available (only on localhost)
 */
export const isDevModeAvailable = (): boolean => {
  return isLocalhost();
};

/**
 * Get dev mode state from localStorage
 */
export const isDevModeEnabled = (): boolean => {
  if (!isDevModeAvailable()) return false;
  return localStorage.getItem('dev_mode_enabled') === 'true';
};

/**
 * Toggle dev mode on/off
 */
export const setDevModeEnabled = (enabled: boolean): void => {
  if (!isDevModeAvailable()) return;
  localStorage.setItem('dev_mode_enabled', enabled ? 'true' : 'false');
};

/**
 * Format seconds to mm:ss for slider display
 */
export const formatSecondsToTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
