import express from 'express';
const ServiceClient = require('../../shared/utils/serviceClient');
const { auth } = require('../../shared/middleware/auth');

const router = express.Router();
const authService = new ServiceClient(process.env.AUTH_SERVICE_URL || 'http://auth-service:8081', 'Auth');
const datasetService = new ServiceClient(process.env.DATASET_SERVICE_URL || 'http://dataset-service:8082', 'Dataset');

// Get all providers
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, keyword = '' } = req.query;

        // Get users with role R2 (Provider) from Auth Service
        const usersResponse = await authService.get('/api/users');

        if (usersResponse.errCode !== 0) {
            throw new Error('Failed to fetch users');
        }

        let providers = usersResponse.data.filter(user => user.roleId === 'R2');

        // Filter by keyword
        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            providers = providers.filter(p =>
                p.email?.toLowerCase().includes(lowerKeyword) ||
                p.firstName?.toLowerCase().includes(lowerKeyword) ||
                p.lastName?.toLowerCase().includes(lowerKeyword)
            );
        }

        // Pagination
        const total = providers.length;
        const offset = (page - 1) * limit;
        const paginatedProviders = providers.slice(offset, offset + parseInt(limit));

        // Enrich with dataset count
        const enrichedProviders = await Promise.all(
            paginatedProviders.map(async (provider) => {
                try {
                    const datasetsResponse = await datasetService.get(`/api/datasets?providerId=${provider.id}`);
                    const approvedDatasets = datasetsResponse.data?.datasets?.filter(d => d.status_code === 'S2').length || 0;
                    return {
                        ...provider,
                        totalDatasets: datasetsResponse.data?.pagination?.total || 0,
                        approvedDatasets
                    };
                } catch (error) {
                    return { ...provider, totalDatasets: 0, approvedDatasets: 0 };
                }
            })
        );

        res.json({
            errCode: 0,
            message: 'Get providers successfully',
            data: {
                providers: enrichedProviders,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get providers error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get providers',
            error: error.message
        });
    }
});

// Get provider by ID
router.get('/:id', async (req, res) => {
    try {
        const userResponse = await authService.get(`/api/users/${req.params.id}`);

        if (userResponse.errCode !== 0) {
            return res.status(404).json({
                errCode: 1,
                message: 'Provider not found'
            });
        }

        if (userResponse.data.roleId !== 'R2') {
            return res.status(400).json({
                errCode: 2,
                message: 'User is not a provider'
            });
        }

        res.json({
            errCode: 0,
            data: userResponse.data
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get provider'
        });
    }
});

export default router;
