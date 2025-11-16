/**
 * Auto-trigger analytics recalculation on page load/reload
 * This file should be imported in your main App.js or index.js
 */

import axios from 'axios';

const ANALYTICS_API_ENDPOINT = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:6969'}/api/recalculate-analytics-monthly`;

/**
 * Call backend to recalculate monthly analytics
 * This should be triggered on page load
 */
export const triggerAnalyticsRecalculation = async () => {
    try {
        console.log('[Analytics Auto Refresh] Triggering analytics recalculation...');
        
        const response = await axios.post(ANALYTICS_API_ENDPOINT, {}, {
            timeout: 60000 // 60 second timeout
        });
        
        if (response.data.success) {
            console.log('[Analytics Auto Refresh] ✅ Analytics recalculated successfully', response.data.result);
            return response.data;
        } else {
            console.warn('[Analytics Auto Refresh] ⚠️ Analytics recalculation returned non-success response', response.data);
            return response.data;
        }
    } catch (error) {
        console.error('[Analytics Auto Refresh] ❌ Error recalculating analytics:', error.message);
        // Don't throw - we don't want page load to fail if analytics calculation fails
        return {
            success: false,
            message: 'Error recalculating analytics',
            error: error.message
        };
    }
};

/**
 * Setup auto-refresh on page mount
 * Should be called in useEffect with empty dependency array in your main component
 * 
 * Example usage in App.js:
 * useEffect(() => {
 *   setupAnalyticsAutoRefresh();
 * }, []);
 */
export const setupAnalyticsAutoRefresh = () => {
    // Trigger analytics recalculation on page load
    triggerAnalyticsRecalculation();
    
    // Optional: Also trigger on page visibility change (when user comes back to tab)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            console.log('[Analytics Auto Refresh] Page became visible, triggering recalculation...');
            triggerAnalyticsRecalculation();
        }
    });
};

export default setupAnalyticsAutoRefresh;
