import express from 'express';
import * as marketAnalyticsController from '../controllers/marketAnalyticsController';
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

export default router;