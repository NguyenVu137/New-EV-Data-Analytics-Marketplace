import allcodeData from '../data/allcodeData.js';

// Get all codes by type
const getAllCode = (req, res) => {
    try {
        const { type } = req.query;

        if (!type) {
            return res.status(400).json({
                errCode: 1,
                message: 'Missing type parameter',
                data: []
            });
        }

        const upperType = type.toUpperCase();
        const data = allcodeData[upperType];

        if (!data || data.length === 0) {
            return res.status(404).json({
                errCode: 2,
                message: `No data found for type ${type}`,
                data: []
            });
        }

        return res.status(200).json({
            errCode: 0,
            message: 'OK',
            data: data
        });
    } catch (error) {
        console.error('❌ Error getting allcode:', error);
        return res.status(500).json({
            errCode: 3,
            message: 'Server error',
            data: []
        });
    }
};

// Get all types available
const getAllTypes = (req, res) => {
    try {
        const types = Object.keys(allcodeData);
        return res.status(200).json({
            errCode: 0,
            message: 'OK',
            data: types
        });
    } catch (error) {
        console.error('❌ Error getting types:', error);
        return res.status(500).json({
            errCode: 3,
            message: 'Server error',
            data: []
        });
    }
};

export default {
    getAllCode,
    getAllTypes
};
