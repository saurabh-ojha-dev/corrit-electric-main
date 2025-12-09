const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Rider = require('../models/Rider');
const PhonePeAutopay = require('../models/PhonePeAutopay');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    // 1. Active Mandates - riders with mandateStatus = 'active'
    const activeMandates = await Rider.countDocuments({ mandateStatus: 'active' });
    const activeMandatesLastWeek = await Rider.countDocuments({
      mandateStatus: 'active',
      mandateCreatedAt: { $lt: startOfLastWeek }
    });
    const activeMandatesChange = activeMandatesLastWeek > 0 
      ? Math.round(((activeMandates - activeMandatesLastWeek) / activeMandatesLastWeek) * 100)
      : 0;

    // 2. Pending This Week - payments scheduled for this week
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    const pendingThisWeek = await PhonePeAutopay.countDocuments({
      status: 'pending',
      scheduledDate: { $gte: startOfWeek, $lt: endOfWeek }
    });
    
    const pendingLastWeek = await PhonePeAutopay.countDocuments({
      status: 'pending',
      scheduledDate: { 
        $gte: new Date(startOfLastWeek), 
        $lt: startOfWeek 
      }
    });
    const pendingChange = pendingLastWeek > 0 
      ? pendingThisWeek - pendingLastWeek
      : 0;

    // 3. Overdue Payments - payments past scheduledDate with status pending or failed
    const overduePayments = await PhonePeAutopay.countDocuments({
      scheduledDate: { $lt: startOfToday },
      status: { $in: ['pending', 'failed'] }
    });
    
    const overdueYesterday = await PhonePeAutopay.countDocuments({
      scheduledDate: { $lt: yesterday },
      status: { $in: ['pending', 'failed'] }
    });
    const overdueChange = overdueYesterday > 0
      ? Math.round(((overduePayments - overdueYesterday) / overdueYesterday) * 100)
      : 0;

    // 4. Monthly Collection - sum of successful payments this month
    const monthlyCollection = await PhonePeAutopay.aggregate([
      {
        $match: {
          status: 'success',
          processedDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const lastMonthCollection = await PhonePeAutopay.aggregate([
      {
        $match: {
          status: 'success',
          processedDate: { $gte: startOfLastMonth, $lt: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const collectionAmount = monthlyCollection[0]?.total || 0;
    const lastMonthAmount = lastMonthCollection[0]?.total || 0;
    const collectionChange = lastMonthAmount > 0
      ? Math.round(((collectionAmount - lastMonthAmount) / lastMonthAmount) * 100)
      : 0;

    // 5. Mandate Complete - successful mandates processed this month
    const mandateComplete = await PhonePeAutopay.countDocuments({
      status: 'success',
      processedDate: { $gte: startOfMonth }
    });
    
    const mandateCompleteLastMonth = await PhonePeAutopay.countDocuments({
      status: 'success',
      processedDate: { $gte: startOfLastMonth, $lt: startOfMonth }
    });
    const mandateCompleteChange = mandateCompleteLastMonth > 0
      ? Math.round(((mandateComplete - mandateCompleteLastMonth) / mandateCompleteLastMonth) * 100)
      : 0;

    // 6. Failed Mandate - failed mandates this week
    const failedMandate = await PhonePeAutopay.countDocuments({
      status: 'failed',
      processedDate: { $gte: startOfWeek }
    });
    
    const failedMandateLastWeek = await PhonePeAutopay.countDocuments({
      status: 'failed',
      processedDate: { 
        $gte: new Date(startOfLastWeek), 
        $lt: startOfWeek 
      }
    });
    const failedMandateChange = failedMandateLastWeek > 0
      ? Math.round(((failedMandate - failedMandateLastWeek) / failedMandateLastWeek) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        activeMandates: {
          count: activeMandates,
          change: activeMandatesChange,
          changeType: activeMandatesChange >= 0 ? 'positive' : 'negative',
          label: activeMandatesChange >= 0 ? `+${activeMandatesChange}% this week` : `${activeMandatesChange}% this week`
        },
        pendingThisWeek: {
          count: pendingThisWeek,
          change: pendingChange,
          changeType: pendingChange >= 0 ? 'negative' : 'positive',
          label: pendingChange >= 0 
            ? `+${pendingChange} compared to last week` 
            : `${pendingChange} compared to last week`
        },
        overduePayments: {
          count: overduePayments,
          change: overdueChange,
          changeType: overdueChange >= 0 ? 'negative' : 'positive',
          label: overdueChange >= 0 
            ? `+${overdueChange}% since yesterday` 
            : `${overdueChange}% since yesterday`
        },
        monthlyCollection: {
          amount: collectionAmount,
          change: collectionChange,
          changeType: collectionChange >= 0 ? 'positive' : 'negative',
          label: collectionChange >= 0 
            ? `+${collectionChange}% vs last month` 
            : `${collectionChange}% vs last month`
        },
        mandateComplete: {
          count: mandateComplete,
          change: mandateCompleteChange,
          changeType: mandateCompleteChange >= 0 ? 'positive' : 'negative',
          label: mandateCompleteChange >= 0 
            ? `+${mandateCompleteChange}% last month` 
            : `${mandateCompleteChange}% last month`
        },
        failedMandate: {
          count: failedMandate,
          change: failedMandateChange,
          changeType: failedMandateChange >= 0 ? 'negative' : 'positive',
          label: failedMandateChange >= 0 
            ? `+${failedMandateChange}% from last week` 
            : `${failedMandateChange}% from last week`
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/dashboard/forecast
// @desc    Get payment forecast data for next 30 days
// @access  Private
router.get('/forecast', auth, async (req, res) => {
  try {
    const now = new Date();
    const forecastData = [];
    
    // Generate forecast for next 30 days
    for (let day = 1; day <= 30; day++) {
      const forecastDate = new Date(now);
      forecastDate.setDate(now.getDate() + day);
      forecastDate.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(forecastDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Get scheduled payments for this day
      const scheduledPayments = await PhonePeAutopay.find({
        scheduledDate: { $gte: forecastDate, $lte: endOfDay },
        status: { $in: ['pending', 'processing'] }
      });
      
      // Calculate expected collections (base amount)
      const expectedCollection = scheduledPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      // Estimate success rate based on historical data (default 85%)
      const successRate = 0.85;
      const baseCollection = Math.round(expectedCollection * successRate);
      const topCollection = Math.round(expectedCollection * (1 - successRate));
      
      // Count active mandates on this day
      const activeMandatesCount = await Rider.countDocuments({
        mandateStatus: 'active',
        mandateExpiryDate: { $gte: forecastDate }
      });
      
      // Estimate failed payments based on historical failure rate (default 15%)
      const failureRate = 0.15;
      const estimatedFailed = Math.round(scheduledPayments.length * failureRate);
      
      forecastData.push({
        day: day,
        base: baseCollection,
        top: topCollection,
        mandates: activeMandatesCount,
        failed: estimatedFailed
      });
    }
    
    res.json({
      success: true,
      forecast: forecastData
    });
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

