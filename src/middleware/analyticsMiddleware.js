import { calculateAnalyticsMetrics } from "../services/analyticsService";

/**
 * Middleware để trigger recalculate analytics sau khi thay đổi datasets
 */
const triggerAnalyticsRecalculation = async (req, res, next) => {
    // Lưu original send function
    const originalSend = res.send;
    
    res.send = function(data) {
        // Parse response to check if it's a successful dataset change
        try {
            let jsonData = data;
            if (typeof data === 'string') {
                jsonData = JSON.parse(data);
            }
            
            // Nếu là successful response từ dataset endpoints
            if (jsonData.errCode === 0 && req.method !== 'GET') {
                console.log(`[Middleware] Dataset changed, triggering analytics recalculation...`);
                
                // Async recalculate - không block response
                calculateAnalyticsMetrics()
                    .then(() => console.log(`[Middleware] Analytics recalculated successfully`))
                    .catch(err => console.error(`[Middleware] Error recalculating analytics:`, err));
            }
        } catch (err) {
            console.error('[Middleware] Error in trigger analytics:', err);
        }
        
        // Call original send
        originalSend.call(this, data);
    };
    
    next();
};

export default triggerAnalyticsRecalculation;
