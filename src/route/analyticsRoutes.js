import express from 'express';
import * as marketAnalyticsController from '../controllers/marketAnalyticsController';
import * as aiInsightsController from '../controllers/aiInsightsController';
import { auth } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';

const router = express.Router();


router.get(
    '/market',
    auth,
    checkRole(['R1', 'R2']),
    marketAnalyticsController.getMarketAnalytics
);

router.get(
    '/top-datasets',
    auth,
    checkRole(['R1', 'R2', 'R3']),
    marketAnalyticsController.getTopDatasets
);

router.get(
    '/categories',
    auth,
    checkRole(['R1', 'R2', 'R3']),
    marketAnalyticsController.getCategoryStats
);

router.get(
    '/packages',
    auth,
    checkRole(['R1', 'R2']),
    marketAnalyticsController.getPackageStats
);

router.get(
    '/overview',
    auth,
    checkRole(['R1', 'R2', 'R3']),
    marketAnalyticsController.getMarketOverview
);

router.get(
    '/trending',
    auth,
    checkRole(['R1', 'R2']),
    marketAnalyticsController.getTrendingStats
);

router.get(
    '/ai-insights',
    auth,
    checkRole(['R1', 'R2', 'R3']),
    aiInsightsController.getAIInsights
);

router.post(
    '/ai-insights/regenerate',
    auth,
    checkRole(['R1']),
    aiInsightsController.regenerateInsights
);

router.delete(
    '/ai-insights/cache',
    auth,
    checkRole(['R1']),
    aiInsightsController.clearCache
);

export default router;