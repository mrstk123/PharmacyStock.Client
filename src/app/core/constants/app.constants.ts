/**
 * Application-wide constants for the PharmacyStock application
 */

/**
 * Timeout and delay constants (in milliseconds)
 */
export const TIMEOUTS = {
    /** Delay before navigating after successful save operation */
    NAVIGATION_DELAY: 1000,

    /** Delay before updating form values after async operation */
    FORM_UPDATE_DELAY: 500,

    /** Delay before retrying WebSocket connection after failure */
    WEBSOCKET_RECONNECT_DELAY: 5000,

    /** Debounce delay for search input to reduce API calls */
    SEARCH_DEBOUNCE: 500,
} as const;

/**
 * Toast notification durations (in milliseconds)
 */
export const TOAST_DURATIONS = {
    /** Duration for success messages */
    SUCCESS: 3000,

    /** Duration for error messages (longer to ensure user sees important errors) */
    ERROR: 5000,

    /** Duration for info messages */
    INFO: 3000,

    /** Duration for warning messages */
    WARNING: 4000,
} as const;
