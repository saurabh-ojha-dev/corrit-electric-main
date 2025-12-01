const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const Rider = require("../models/Rider");
const PhonePeAutopay = require("../models/PhonePeAutopay");
const Notification = require("../models/Notification");

// Webhook validation middleware
const validateWebhook = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("SHA256 ")) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid authorization header" });
    }

    const receivedHash = authHeader.replace("SHA256 ", "");

    // Get webhook credentials from environment
    const webhookUsername = process.env.PHONEPE_WEBHOOK_USERNAME;
    const webhookPassword = process.env.PHONEPE_WEBHOOK_PASSWORD;

    if (!webhookUsername || !webhookPassword) {
      console.error("Webhook credentials not configured");
      return res
        .status(500)
        .json({ success: false, message: "Webhook configuration error" });
    }

    // Generate expected hash
    const expectedHash = crypto
      .createHash("sha256")
      .update(`${webhookUsername}:${webhookPassword}`)
      .digest("hex");

    if (receivedHash !== expectedHash) {
      console.error("Webhook authorization failed");
      return res
        .status(401)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    next();
  } catch (error) {
    console.error("Webhook validation error:", error);
    res
      .status(500)
      .json({ success: false, message: "Webhook validation error" });
  }
};

// @route   POST /api/webhooks/phonepe
// @desc    Handle PhonePe subscription webhooks
// @access  Public (but validated)
router.post("/phonepe", async (req, res) => {
  try {
    const { event, payload } = req.body;

    // Handle different webhook events
    switch (event) {
      case "subscription.setup.order.completed":
        await handleSubscriptionSetupCompleted(payload);
        break;

      case "subscription.setup.order.failed":
        await handleSubscriptionSetupFailed(payload);
        break;

      case "subscription.paused":
        await handleSubscriptionPaused(payload);
        break;

      case "subscription.unpaused":
        await handleSubscriptionUnpaused(payload);
        break;

      case "subscription.revoked":
        await handleSubscriptionRevoked(payload);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCancelled(payload);
        break;

      case "subscription.notification.completed":
        await handleSubscriptionNotificationCompleted(payload);
        break;

      case "subscription.notification.failed":
        await handleSubscriptionNotificationFailed(payload);
        break;

      case "subscription.redemption.order.completed":
        await handleRedemptionOrderCompleted(payload);
        break;

      case "subscription.redemption.order.failed":
        await handleRedemptionOrderFailed(payload);
        break;

      case "subscription.redemption.transaction.completed":
        await handleRedemptionTransactionCompleted(payload);
        break;

      case "subscription.redemption.transaction.failed":
        await handleRedemptionTransactionFailed(payload);
        break;

      case "pg.refund.accepted":
      case "pg.refund.completed":
      case "pg.refund.failed":
        await handleRefundEvent(event, payload);
        break;

      default:
    }

    res.json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res
      .status(500)
      .json({ success: false, message: "Webhook processing error" });
  }
});

// Handle subscription setup completed
async function handleSubscriptionSetupCompleted(payload) {
  try {
    const {
      merchantOrderId,
      orderId,
      state,
      amount,
      paymentFlow,
      paymentDetails,
    } = payload;

    // Find rider by merchantOrderId
    const rider = await Rider.findOne({
      $or: [
        { merchantOrderId },
        { "mandateDetails.merchantOrderId": merchantOrderId },
      ],
    });

    if (!rider) {
      console.error("Rider not found for merchantOrderId:", merchantOrderId);
      return;
    }

    // Update rider mandate status
    await Rider.findByIdAndUpdate(rider._id, {
      mandateStatus: "active",
      mandateCreatedAt: new Date(),
      mandateExpiryDate: new Date(paymentFlow.expireAt * 1000), // Convert from epoch
      "mandateDetails.phonepeOrderId": orderId,
      "mandateDetails.phonepeSubscriptionId": paymentFlow.subscriptionId,
      "mandateDetails.amount": amount,
      "mandateDetails.maxAmount": paymentFlow.maxAmount,
      "mandateDetails.frequency": paymentFlow.frequency.toLowerCase(),
      "mandateDetails.authWorkflowType": paymentFlow.authWorkflowType,
      "mandateDetails.amountType": paymentFlow.amountType,
    });

    // Create PhonePeAutopay record for successful mandate
    const autopayRecord = new PhonePeAutopay({
      riderId: rider._id,
      mandateId: orderId,
      merchantOrderId,
      merchantSubscriptionId: paymentFlow.merchantSubscriptionId,
      amount: amount,
      status: "success",
      phonepeStatus: "COMPLETED",
      transactionId: paymentDetails?.[0]?.transactionId,
      orderId: orderId,
      utr: paymentDetails?.[0]?.rail?.utr,
      scheduledDate: new Date(),
      processedDate: new Date(),
      mandateDetails: {
        startDate: new Date(),
        endDate: new Date(paymentFlow.expireAt * 1000),
        frequency: paymentFlow.frequency.toLowerCase(),
        maxAmount: paymentFlow.maxAmount,
      },
      phonepeResponse: payload,
      isRecurring: true,
      nextDebitDate: calculateNextDebitDate(paymentFlow.frequency),
      lastDebitDate: new Date(),
      totalDebits: 1,
      totalAmount: amount,
    });

    await autopayRecord.save();

    // Create notification
    await Notification.create({
      type: "mandate_activated",
      title: `Mandate Activated – ${rider.riderId}`,
      description:
        "Rider has successfully set up autopay mandate. Weekly payments will be automatically deducted.",
      riderId: rider._id,
      priority: "low",
      actionRequired: false,
    });

  } catch (error) {
    console.error("Error handling subscription setup completed:", error);
  }
}

// Handle subscription setup failed
async function handleSubscriptionSetupFailed(payload) {
  try {
    const { merchantOrderId, errorCode, detailedErrorCode } = payload;

    // Find rider by merchantOrderId
    const rider = await Rider.findOne({
      $or: [
        { merchantOrderId },
        { "mandateDetails.merchantOrderId": merchantOrderId },
      ],
    });

    if (!rider) {
      console.error("Rider not found for merchantOrderId:", merchantOrderId);
      return;
    }

    // Update rider mandate status
    await Rider.findByIdAndUpdate(rider._id, {
      mandateStatus: "failed",
      "mandateDetails.errorCode": errorCode,
      "mandateDetails.detailedErrorCode": detailedErrorCode,
      "mandateDetails.failureReason": getErrorMessage(
        errorCode,
        detailedErrorCode
      ),
    });

    // Create notification
    await Notification.create({
      type: "mandate_failed",
      title: `Mandate Setup Failed – ${rider.riderId}`,
      description: `Rider mandate setup failed. Reason: ${getErrorMessage(
        errorCode,
        detailedErrorCode
      )}`,
      riderId: rider._id,
      priority: "high",
      actionRequired: true,
    });

  } catch (error) {
    console.error("Error handling subscription setup failed:", error);
  }
}

// Handle subscription paused
async function handleSubscriptionPaused(payload) {
  try {
    const { merchantSubscriptionId } = payload.paymentFlow;

    const rider = await Rider.findOne({
      "mandateDetails.merchantSubscriptionId": merchantSubscriptionId,
    });

    if (rider) {
      await Rider.findByIdAndUpdate(rider._id, {
        mandateStatus: "suspended",
      });

      await Notification.create({
        type: "mandate_paused",
        title: `Mandate Paused – ${rider.riderId}`,
        description:
          "Rider mandate has been paused. No automatic payments will be processed.",
        riderId: rider._id,
        priority: "medium",
        actionRequired: false,
      });
    }
  } catch (error) {
    console.error("Error handling subscription paused:", error);
  }
}

// Handle subscription unpaused
async function handleSubscriptionUnpaused(payload) {
  try {
    const { merchantSubscriptionId } = payload.paymentFlow;

    const rider = await Rider.findOne({
      "mandateDetails.merchantSubscriptionId": merchantSubscriptionId,
    });

    if (rider) {
      await Rider.findByIdAndUpdate(rider._id, {
        mandateStatus: "active",
      });

      await Notification.create({
        type: "mandate_resumed",
        title: `Mandate Resumed – ${rider.riderId}`,
        description:
          "Rider mandate has been resumed. Automatic payments will continue.",
        riderId: rider._id,
        priority: "low",
        actionRequired: false,
      });
    }
  } catch (error) {
    console.error("Error handling subscription unpaused:", error);
  }
}

// Handle subscription revoked
async function handleSubscriptionRevoked(payload) {
  try {
    const { merchantSubscriptionId } = payload.paymentFlow;

    const rider = await Rider.findOne({
      "mandateDetails.merchantSubscriptionId": merchantSubscriptionId,
    });

    if (rider) {
      await Rider.findByIdAndUpdate(rider._id, {
        mandateStatus: "failed",
      });

      await Notification.create({
        type: "mandate_revoked",
        title: `Mandate Revoked – ${rider.riderId}`,
        description:
          "Rider mandate has been revoked. Manual payment setup required.",
        riderId: rider._id,
        priority: "high",
        actionRequired: true,
      });
    }
  } catch (error) {
    console.error("Error handling subscription revoked:", error);
  }
}

// Handle subscription cancelled
async function handleSubscriptionCancelled(payload) {
  try {
    // Handle both old and new payload structures
    const merchantSubscriptionId = payload.merchantSubscriptionId || payload.paymentFlow?.merchantSubscriptionId;
    
    if (!merchantSubscriptionId) {
      console.error('No merchantSubscriptionId found in payload:', payload);
      return;
    }

    const rider = await Rider.findOne({
      "mandateDetails.merchantSubscriptionId": merchantSubscriptionId,
    });

    if (rider) {
      await Rider.findByIdAndUpdate(rider._id, {
        mandateStatus: "cancelled",
        "mandateDetails.cancelledAt": new Date(),
        "mandateDetails.cancellationReason": "Cancelled via PhonePe webhook"
      });

      await Notification.create({
        type: "mandate_cancelled",
        title: `Mandate Cancelled – ${rider.riderId}`,
        description:
          "Rider mandate has been cancelled via PhonePe webhook. No further automatic payments will be processed.",
        riderId: rider._id,
        priority: "high",
        actionRequired: true,
      });
    }
  } catch (error) {
    console.error("Error handling subscription cancelled:", error);
  }
}

// Handle redemption events
async function handleRedemptionOrderCompleted(payload) {
  try {
    const { merchantOrderId, orderId, amount, paymentFlow, paymentDetails } = payload;

    // Find existing autopay record or create new one
    let autopay = await PhonePeAutopay.findOne({ merchantOrderId });
    
    if (!autopay) {
      // Create new autopay record for redemption
      const rider = await Rider.findOne({
        "mandateDetails.merchantSubscriptionId": paymentFlow.merchantSubscriptionId
      });

      if (rider) {
        autopay = new PhonePeAutopay({
          riderId: rider._id,
          mandateId: orderId,
          merchantOrderId,
          merchantSubscriptionId: paymentFlow.merchantSubscriptionId,
          amount: amount,
          status: "success",
          phonepeStatus: "COMPLETED",
          transactionId: paymentDetails?.[0]?.transactionId,
          orderId: orderId,
          utr: paymentDetails?.[0]?.rail?.utr,
          scheduledDate: new Date(),
          processedDate: new Date(),
          mandateDetails: {
            startDate: new Date(),
            endDate: new Date(paymentFlow.validUpto),
            frequency: 'weekly',
            maxAmount: amount
          },
          phonepeResponse: payload,
          isRecurring: true,
          nextDebitDate: calculateNextDebitDate('weekly'),
          lastDebitDate: new Date(),
          totalDebits: 1,
          totalAmount: amount,
        });

        await autopay.save();

        // Create notification for successful payment
        await Notification.create({
          type: "payment_success",
          title: `Payment Successful – ${rider.riderId}`,
          description: `Weekly payment of ₹${amount/100} processed successfully. UTR: ${paymentDetails?.[0]?.rail?.utr}`,
          riderId: rider._id,
          priority: "low",
          actionRequired: false,
        });
      }
    } else {
      // Update existing record
      await autopay.updateStatus("success", {
        phonepeStatus: "COMPLETED",
        transactionId: paymentDetails?.[0]?.transactionId,
        utr: paymentDetails?.[0]?.rail?.utr,
        webhookData: payload,
      });
    }
  } catch (error) {
    console.error("Error handling redemption order completed:", error);
  }
}

async function handleRedemptionOrderFailed(payload) {
  try {
    const { merchantOrderId, orderId, amount, paymentFlow, errorCode, detailedErrorCode } = payload;

    // Find existing autopay record or create new one for failed payment
    let autopay = await PhonePeAutopay.findOne({ merchantOrderId });
    
    if (!autopay) {
      // Create new autopay record for failed redemption
      const rider = await Rider.findOne({
        "mandateDetails.merchantSubscriptionId": paymentFlow.merchantSubscriptionId
      });

      if (rider) {
        autopay = new PhonePeAutopay({
          riderId: rider._id,
          mandateId: orderId,
          merchantOrderId,
          merchantSubscriptionId: paymentFlow.merchantSubscriptionId,
          amount: amount,
          status: "failed",
          phonepeStatus: "FAILED",
          transactionId: null,
          orderId: orderId,
          utr: null,
          scheduledDate: new Date(),
          processedDate: new Date(),
          failureReason: getErrorMessage(errorCode, detailedErrorCode),
          mandateDetails: {
            startDate: new Date(),
            endDate: new Date(paymentFlow.validUpto),
            frequency: 'weekly',
            maxAmount: amount
          },
          phonepeResponse: payload,
          isRecurring: true,
          totalDebits: 0,
          totalAmount: 0,
        });

        await autopay.save();

        // Create notification for failed payment
        await Notification.create({
          type: "payment_failed",
          title: `Payment Failed – ${rider.riderId}`,
          description: `Weekly payment of ₹${amount/100} failed. Reason: ${getErrorMessage(errorCode, detailedErrorCode)}`,
          riderId: rider._id,
          priority: "high",
          actionRequired: true,
        });
      }
    } else {
      // Update existing record
      await autopay.updateStatus("failed", {
        phonepeStatus: "FAILED",
        failureReason: getErrorMessage(errorCode, detailedErrorCode),
        webhookData: payload,
      });
    }
  } catch (error) {
    console.error("Error handling redemption order failed:", error);
  }
}

// Handle notification events
async function handleSubscriptionNotificationCompleted(payload) {
}

async function handleSubscriptionNotificationFailed(payload) {
}

async function handleRedemptionTransactionCompleted(payload) {
}

async function handleRedemptionTransactionFailed(payload) {
}

async function handleRefundEvent(event, payload) {
}

// Helper functions
function calculateNextDebitDate(frequency) {
  const now = new Date();
  switch (frequency.toLowerCase()) {
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case "on_demand":
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days for on_demand
    default:
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Default to 3 days
  }
}

function getErrorMessage(errorCode, detailedErrorCode) {
  const errorMessages = {
    INVALID_MPIN: "Invalid MPIN provided",
    INSUFFICIENT_BALANCE: "Insufficient balance in account",
    USER_CANCELLED: "User cancelled the transaction",
    TIMEOUT: "Transaction timed out",
    NETWORK_ERROR: "Network error occurred",
    INVALID_UPI_ID: "Invalid UPI ID provided",
    BANK_ERROR: "Bank server error",
  };

  return (
    errorMessages[errorCode] ||
    `Payment failed: ${errorCode} - ${detailedErrorCode}`
  );
}

// @route   GET /api/webhooks/test
// @desc    Test webhook endpoint
// @access  Public
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Webhook endpoint is working",
    timestamp: new Date().toISOString(),
    endpoints: {
      phonepe: "/api/webhooks/phonepe",
      general: "/api/webhooks",
    },
  });
});

// @route   POST /api/webhooks
// @desc    Handle general web  hooks (legacy)
// @access  Public
router.post("/", async (req, res) => {
  try {
    res.json({
      success: true,
      message:
        "Webhooks route - use /api/webhooks/phonepe for PhonePe webhooks",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
