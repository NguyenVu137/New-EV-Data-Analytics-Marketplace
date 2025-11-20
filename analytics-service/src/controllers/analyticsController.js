const db = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const axios = require('axios');
const { 
  groupDatasetsByDay, 
  getAvailableMonths, 
  calculateTrendArrow,
  calculateTrendPercentage,
  calculateMonthlyAnalytics
} = require('../services/analyticsService');

exports.getAnalytics = async (req, res) => {
  try {
    console.log('[getAnalytics] db type:', typeof db, 'keys:', Object.keys(db || {}));
    let monthString = req.query.month;
    
    if (!monthString) {
      const latestMonth = await db.AnalyticsMonth.findOne({
        order: [['month_string', 'DESC']]
      });
      
      if (latestMonth) {
        monthString = latestMonth.month_string;
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        monthString = year + '-' + m;
      }
    }

    // Validate month string format (YYYY-MM)
    if (!monthString || !/^\d{4}-\d{2}$/.test(monthString)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format. Expected YYYY-MM'
      });
    }

    const currentMonthAnalytics = await db.Analytics.findOne({
      where: { month_string: monthString },
      include: [{
        model: db.AnalyticsMonth,
        as: 'month_data',
        attributes: ['id', 'month', 'year', 'month_string'],
        required: false
      }]
    });

    // Lấy tháng gần nhất với tháng hiện tại 
    const allAnalyticsMonths = await db.Analytics.findAll({
      attributes: ['month_string'],
      where: { month_string: { [Op.lt]: monthString } }, 
      order: [['month_string', 'DESC']],
      limit: 1,
      raw: true
    });

    let previousMonthAnalytics = null;
    if (allAnalyticsMonths && allAnalyticsMonths.length > 0) {
      const nearestMonthString = allAnalyticsMonths[0].month_string;
      console.log(`[getAnalytics] Found nearest previous month: ${nearestMonthString} for current: ${monthString}`);
      
      previousMonthAnalytics = await db.Analytics.findOne({
        where: { month_string: nearestMonthString }
      });
    } else {
      console.log(`[getAnalytics] No previous month data found for ${monthString}`);
    }

    let trends = {
      socTrend: { value: 0, arrow: 'flat', display: '0%' },
      sohTrend: { value: 0, arrow: 'flat', display: '0%' },
      co2Trend: { value: 0, arrow: 'flat', display: '0%' },
      chargesTrend: { value: 0, arrow: 'flat', display: '0%' }
    };

    if (previousMonthAnalytics && currentMonthAnalytics) {
      const socTrendValue = calculateTrendPercentage(
        previousMonthAnalytics.average_soc,
        currentMonthAnalytics.average_soc
      );
      trends.socTrend = {
        value: socTrendValue,
        arrow: calculateTrendArrow(socTrendValue),
        display: Math.abs(Math.round(socTrendValue)) + '%'
      };

      const sohTrendValue = calculateTrendPercentage(
        previousMonthAnalytics.average_soh,
        currentMonthAnalytics.average_soh
      );
      trends.sohTrend = {
        value: sohTrendValue,
        arrow: calculateTrendArrow(sohTrendValue),
        display: Math.abs(Math.round(sohTrendValue)) + '%'
      };

      const co2TrendValue = calculateTrendPercentage(
        previousMonthAnalytics.co2_saved_percent,
        currentMonthAnalytics.co2_saved_percent
      );
      trends.co2Trend = {
        value: co2TrendValue,
        arrow: calculateTrendArrow(co2TrendValue),
        display: Math.abs(Math.round(co2TrendValue)) + '%'
      };

      const chargesTrendValue = calculateTrendPercentage(
        previousMonthAnalytics.total_charges,
        currentMonthAnalytics.total_charges
      );
      trends.chargesTrend = {
        value: chargesTrendValue,
        arrow: calculateTrendArrow(chargesTrendValue),
        display: Math.abs(Math.round(chargesTrendValue)) + '%'
      };

      // distanceTrend removed - no longer tracked in analytics
    }

    // Lấy tất cả datasets từ dataset-service API để phân tích dữ liệu hàng ngày
    let allDatasets = [];
    try {
      console.log('[getAnalytics] Fetching datasets from dataset-service for daily analysis...');
      const response = await axios.get('http://dataset-service:7002/api/datasets?perPage=1000');
      
      if (response.data && response.data.items) {
        allDatasets = response.data.items;
        console.log(`[getAnalytics] Received ${allDatasets.length} datasets from dataset-service`);
      }
    } catch (error) {
      console.error('[getAnalytics] Error fetching from dataset-service:', error.message);
      allDatasets = [];
    }

    // Filter datasets for the requested month
    const monthDatasets = allDatasets.filter(dataset => {
      const date = new Date(dataset.createdAt);
      const datasetMonth = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      return datasetMonth === monthString;
    });

    // Gọi hàm để nhóm dữ liệu theo ngày
    const dailyData = groupDatasetsByDay(monthDatasets);
    const availableMonths = await getAvailableMonths();

    // Đảm bảo giá trị số hợp lệ
    const validateNumber = (val, defaultVal = 0) => {
      const num = parseFloat(val);
      return isFinite(num) ? num : defaultVal;
    };

    // Lấy co2_saved_percent từ database (tính toán sẵn)
    // Nếu không có, fallback tính từ datasets
    let co2SavedPercent = validateNumber(currentMonthAnalytics?.co2_saved_percent);
    if (co2SavedPercent === 0 && monthDatasets && monthDatasets.length > 0) {
      const sumCo2Saved = monthDatasets.reduce((sum, d) => sum + (parseFloat(d.co2_saved) || 0), 0);
      co2SavedPercent = sumCo2Saved / monthDatasets.length;
    }

    const response = {
      success: true,
      data: {
        month: monthString,
        overview: {
          average_soc: validateNumber(currentMonthAnalytics?.average_soc),
          average_soh: validateNumber(currentMonthAnalytics?.average_soh),
          co2_saved_percent: validateNumber(co2SavedPercent),
          total_charges: parseInt(currentMonthAnalytics?.total_charges) || 0,
          dataset_count: parseInt(currentMonthAnalytics?.data_count) || 0
        },
        trends: trends,
        dailyData: dailyData,
        availableMonths: availableMonths
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// Cung cấp danh sách các tháng có dữ liệu phân tích cho client
exports.getAvailableMonths = async (req, res) => {
  try {
    const months = await getAvailableMonths();
    res.status(200).json({
      success: true,
      data: months
    });
  } catch (error) {
    console.error('Get available months error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available months',
      error: error.message
    });
  }
};

// Lấy danh sách datasets phân theo ngày trong tháng được chỉ định
exports.getDatasetsByDay = async (req, res) => {
  try {
    const month = req.query.month;
    
    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Month parameter is required (format: YYYY-MM)'
      });
    }

    // Validate month string format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format. Expected YYYY-MM'
      });
    }

    // Fetch datasets from dataset-service API
    let allDatasets = [];
    try {
      console.log('[getDatasetsByDay] Fetching datasets from dataset-service...');
      const response = await axios.get('http://dataset-service:7002/api/datasets');
      
      if (response.data && response.data.items) {
        allDatasets = response.data.items;
        console.log(`[getDatasetsByDay] Received ${allDatasets.length} datasets`);
      }
    } catch (error) {
      console.error('[getDatasetsByDay] Error fetching from dataset-service:', error.message);
      allDatasets = [];
    }

    // Filter for requested month
    const monthDatasets = allDatasets.filter(dataset => {
      const date = new Date(dataset.createdAt);
      const datasetMonth = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      return datasetMonth === month;
    });

    const dailyData = groupDatasetsByDay(monthDatasets);

    res.status(200).json({
      success: true,
      data: dailyData
    });
  } catch (error) {
    console.error('Get datasets by day error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching datasets',
      error: error.message
    });
  }
};

/**
 * POST /api/analytics/calculate-monthly - Tính analytics theo tháng
 * Group datasets by month, tính metrics, so sánh trend vs tháng trước
 */
exports.calculateMonthlyAnalyticsAPI = async (req, res) => {
  try {
    console.log('[API] Calculating monthly analytics...');
    const result = await calculateMonthlyAnalytics();
    
    res.json({
      success: true,
      message: 'Monthly analytics calculated successfully',
      data: result
    });
  } catch (error) {
    console.error('[API] Error calculating monthly analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate monthly analytics',
      message: error.message
    });
  }
};
