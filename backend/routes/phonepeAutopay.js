const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const PhonePeAutopay = require('../models/PhonePeAutopay');
const axios = require('axios');
const crypto = require('crypto');

// @route   GET /api/payments
// @desc    Get all autopay transactions with payment history format
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      riderId, 
      status, 
      search,
      startDate,
      endDate,
      merchantOrderId // New parameter for finding payments by merchant order ID
    } = req.query;

    // Build query
    const query = {};
    
    // If merchantOrderId is provided, find payments by merchant order ID
    if (merchantOrderId) {
      query.merchantOrderId = merchantOrderId;
    } else {
      if (riderId) query.riderId = riderId;
      if (status) {
        if (status === 'success') query.status = 'success';
        else if (status === 'failed') query.status = 'failed';
      }
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Build aggregation pipeline for search and population
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'riders',
          localField: 'riderId',
          foreignField: '_id',
          as: 'rider'
        }
      },
      { $unwind: '$rider' }
    ];

    // Add search functionality
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'rider.name': { $regex: search, $options: 'i' } },
            { 'rider.email': { $regex: search, $options: 'i' } },
            { 'rider.phone': { $regex: search, $options: 'i' } },
            { 'merchantOrderId': { $regex: search, $options: 'i' } },
            { 'utr': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add sorting
    pipeline.push({ $sort: { createdAt: -1 } });

    // Execute aggregation
    const autopays = await PhonePeAutopay.aggregate(pipeline);

    // Format response for frontend
    const formattedPayments = autopays.map(payment => ({
      id: payment.merchantOrderId,
      riderName: payment.rider.name,
      riderEmail: payment.rider.email,
      riderPhone: payment.rider.phone,
      riderId: payment.rider.riderId,
      riderIntial: payment.rider.name.charAt(0).toUpperCase(),
      amount: `₹${(payment.amount / 100).toFixed(0)}`, // Convert from paise to rupees
      status: payment.status === 'success' ? 'Success' :
        payment.status === 'failed' ? 'Failed' :
          payment.status === 'pending' ? 'Pending' : 'Unknown',
      type: 'AUTOMATED_WEEKLY_DEBIT',
      date: payment.createdAt.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      time: payment.createdAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      // PhonePe specific data
      phonepeOrderId: payment.orderId,
      phonepeStatus: payment.phonepeStatus,
      utr: payment.utr,
      transactionId: payment.transactionId,
      failureReason: payment.failureReason,
      webhookData: payment.webhookData,
      phonepeResponse: payment.phonepeResponse,
      // Auto-debit window
      autoDebitWindow: {
        from: payment.mandateDetails?.startDate,
        to: payment.mandateDetails?.endDate
      }
    }));

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPayments = formattedPayments.slice(startIndex, endIndex);

    res.json({
      success: true,
      payments: paginatedPayments,
      total: formattedPayments.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(formattedPayments.length / parseInt(limit)),
        hasNextPage: endIndex < formattedPayments.length,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching autopay transactions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/payments/stats
// @desc    Get autopay statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const { riderId } = req.query;
    const stats = await PhonePeAutopay.getAutopayStats(riderId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching autopay stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/payments/check-order-status
// @desc    Check PhonePe order status for a specific payment
// @access  Private
router.post('/check-order-status', auth, async (req, res) => {
  try {
    const { merchantOrderId } = req.body;

    if (!merchantOrderId) {
      return res.status(400).json({
        success: false,
        message: 'merchantOrderId is required'
      });
    }

    // Get PhonePe auth token
    let authToken;
    try {
      authToken = await generatePhonePeAuthToken();
    } catch (authError) {
      console.error('Auth token generation failed:', authError.message);
      return res.status(500).json({ 
        success: false, 
        message: authError.message 
      });
    }

    // Determine environment URL based on NODE_ENV
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
      ? 'https://api.phonepe.com/apis/pg'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

    const url = `${baseUrl}/subscriptions/v2/order/${merchantOrderId}/status?details=true`;

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${authToken}`,
        'Accept': 'application/json'
      }
    });

    const orderStatus = response.data;

    // Update the autopay record with latest status
    const autopayRecord = await PhonePeAutopay.findOne({ merchantOrderId });
    if (autopayRecord) {
      await autopayRecord.updateStatus(
        orderStatus.state === 'COMPLETED' ? 'success' :
          orderStatus.state === 'FAILED' ? 'failed' : 'pending',
        {
          phonepeStatus: orderStatus.state,
          transactionId: orderStatus.paymentDetails?.[0]?.transactionId,
          utr: orderStatus.paymentDetails?.[0]?.rail?.utr,
          webhookData: orderStatus,
          failureReason: orderStatus.errorCode || orderStatus.detailedErrorCode
        }
      );
    }

    res.json({
      success: true,
      orderStatus,
      updated: !!autopayRecord
    });

  } catch (error) {
    console.error('Error checking PhonePe order status:', error);

    if (error.response) {
      console.error('PhonePe API error response:', error.response.data);
      return res.status(error.response.status).json({
        success: false,
        message: 'PhonePe API error',
        error: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while checking order status'
    });
  }
});

// Helper function to get PhonePe auth token using the same method as riders
async function generatePhonePeAuthToken() {
  try {
    // Use the same credentials as in riders.js
    const clientId = 'SU2509161700329296269400';
    const clientSecret = '6f68520b-d32f-4ef3-bbf7-b9fab1790970';
    const clientVersion = 1;
    const grantType = 'client_credentials';


    const authData = new URLSearchParams();
    authData.append('client_id', clientId);
    authData.append('client_version', clientVersion);
    authData.append('client_secret', clientSecret);
    authData.append('grant_type', grantType);

    // Use the same auth URL as in riders.js
    const authUrl = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';

    const authResponse = await axios.post(authUrl, authData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });


    if (authResponse.data && authResponse.data.access_token) {
      return authResponse.data.access_token;
    } else {
      throw new Error('Invalid response from PhonePe authorization API');
    }

  } catch (error) {
    console.error('Error generating PhonePe auth token:', error);
    if (error.response) {
      console.error('PhonePe auth API error response:', error.response.data);
    }
    throw new Error(`Failed to generate PhonePe auth token: ${error.message}`);
  }
}

module.exports = router;
