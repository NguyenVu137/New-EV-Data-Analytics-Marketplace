const db = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const { 
  groupDatasetsByDay, 
  getAvailableMonths, 
  calculateTrendArrow,
  calculateTrendPercentage 
} = require('../services/analyticsService');

exports.getAnalytics = async (req, res) => {
  try {
    console.log('[getAnalytics] db type:', typeof db, 'keys:', Object.keys(db || {}));
    let monthString = req.query.month;
    
    if (!monthString) {
      const latestMonth = await db.AnalyticsMonth.findOne({
        order: [['createdAt', 'DESC']]
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

    const parts = monthString.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    let prevMonth = month - 1;
    let prevYear = year;
    
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    
    const prevMonthStr = String(prevMonth).padStart(2, '0');
    const previousMonthString = prevYear + '-' + prevMonthStr;

    const previousMonthAnalytics = await db.Analytics.findOne({
      where: { month_string: previousMonthString }
    });

    let trends = {
      socTrend: { value: 0, arrow: '→', display: '0%' },
      sohTrend: { value: 0, arrow: '→', display: '0%' },
      co2Trend: { value: 0, arrow: '→', display: '0%' },
      chargesTrend: { value: 0, arrow: '→', display: '0%' },
      distanceTrend: { value: 0, arrow: '→', display: '0%' }
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
        previousMonthAnalytics.total_co2_saved,
        currentMonthAnalytics.total_co2_saved
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

      const distanceTrendValue = calculateTrendPercentage(
        previousMonthAnalytics.total_distance_saved,
        currentMonthAnalytics.total_distance_saved
      );
      trends.distanceTrend = {
        value: distanceTrendValue,
        arrow: calculateTrendArrow(distanceTrendValue),
        display: Math.abs(Math.round(distanceTrendValue)) + '%'
      };
    }

    const { sequelize: seqInstance } = db;
    const allDatasets = await db.Dataset.findAll({
      where: seqInstance.where(
        seqInstance.fn('DATE_FORMAT', seqInstance.col('upload_date'), '%Y-%m'),
        Op.eq,
        monthString
      ),
      order: [['upload_date', 'ASC']]
    });

    const dailyData = groupDatasetsByDay(allDatasets);
    const availableMonths = await getAvailableMonths();

    // Validate numeric values before sending response
    const validateNumber = (val, defaultVal = 0) => {
      const num = parseFloat(val);
      return isFinite(num) ? num : defaultVal;
    };

    const response = {
      success: true,
      data: {
        month: monthString,
        overview: {
          average_soc: validateNumber(currentMonthAnalytics?.average_soc),
          average_soh: validateNumber(currentMonthAnalytics?.average_soh),
          total_co2_saved: validateNumber(currentMonthAnalytics?.total_co2_saved),
          total_charges: parseInt(currentMonthAnalytics?.total_charges) || 0,
          total_distance_saved: validateNumber(currentMonthAnalytics?.total_distance_saved),
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

    const { sequelize: seqInstance } = db;
    const allDatasets = await db.Dataset.findAll({
      where: seqInstance.where(
        seqInstance.fn('DATE_FORMAT', seqInstance.col('upload_date'), '%Y-%m'),
        Op.eq,
        month
      ),
      order: [['upload_date', 'ASC']],
      raw: true
    });

    const dailyData = groupDatasetsByDay(allDatasets);

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
