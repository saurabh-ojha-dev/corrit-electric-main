const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const { auth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { body, validationResult } = require("express-validator");
const Rider = require("../models/Rider");
const Notification = require("../models/Notification");
const PhonePeAutopay = require("../models/PhonePeAutopay");

// Validation middleware - Updated to match frontend fields
const validateRider = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("phone")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Valid Indian phone number is required"),
  body("upiId").trim().isLength({ min: 3 }).withMessage("UPI ID is required"),
  body("weeklyRentAmount")
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage("Valid rent amount is required"),
  body("aadhaarCard").optional().trim(),
  body("panCard").optional().trim(),
  body("address")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Address is required"),
  body("bankAccountNumber").optional().trim(),
  body("batterySmartCard").optional().trim(),
  body("documents")
    .optional()
    .isObject()
    .withMessage("Documents must be an object"),
];

// @route   GET /api/riders
// @desc    Get all riders with filters
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      verificationStatus,
      mandateStatus,
      assignedAdmin,
      merchantOrderId, // New parameter for finding rider by payment ID
    } = req.query;

    const query = {};

    // If merchantOrderId is provided, find rider by payment ID
    if (merchantOrderId) {
      query.$or = [
        { merchantOrderId: merchantOrderId },
        { "mandateDetails.merchantOrderId": merchantOrderId },
      ];
    } else {
      // Search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { riderId: { $regex: search, $options: "i" } },
          { upiId: { $regex: search, $options: "i" } },
        ];
      }
    }

    // Status filters
    if (status) query.isActive = status === "active";
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (mandateStatus) query.mandateStatus = mandateStatus;
    if (assignedAdmin) query.assignedAdmin = assignedAdmin;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [{ path: "assignedAdmin", select: "name email" }],
      sort: { createdAt: -1 },
    };

    const riders = await Rider.paginate(query, options);

    // Get nextDebitDate from PhonePeAutopay for each rider
    const ridersWithNextDebitDate = await Promise.all(
      riders.docs.map(async (rider) => {
        try {
          // Find the most recent PhonePeAutopay record for this rider
          const autopayRecord = await PhonePeAutopay.findOne(
            { riderId: rider._id },
            { nextDebitDate: 1, lastDebitDate: 1 },
            { sort: { createdAt: -1 } }
          );

          // Convert rider to plain object and add nextDebitDate
          const riderObj = rider.toObject();
          riderObj.nextDebitDate = autopayRecord?.nextDebitDate || null;
          riderObj.lastDebitDate = autopayRecord?.lastDebitDate || null;

          return riderObj;
        } catch (error) {
          console.error(
            `Error fetching nextDebitDate for rider ${rider._id}:`,
            error
          );
          // Return rider without nextDebitDate if there's an error
          const riderObj = rider.toObject();
          riderObj.nextDebitDate = null;
          riderObj.lastDebitDate = null;
          return riderObj;
        }
      })
    );

    res.json({
      success: true,
      riders: ridersWithNextDebitDate,
      total: riders.totalDocs,
      pagination: {
        page: riders.page,
        totalPages: riders.totalPages,
        totalDocs: riders.totalDocs,
        hasNextPage: riders.hasNextPage,
        hasPrevPage: riders.hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching riders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/riders/weekly-payments
// @desc    Get active riders for weekly payments
// @access  Private
router.get("/weekly-payments", auth, async (req, res) => {
  try {
    const { search, mandateStatus = "active" } = req.query;

    // Build query for active riders with mandate
    const query = {
      isActive: true,
      mandateStatus: mandateStatus,
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { riderId: { $regex: search, $options: "i" } },
        { upiId: { $regex: search, $options: "i" } },
      ];
    }

    // Find riders with their mandate details
    const riders = await Rider.find(query)
      .select(
        "name email phone riderId upiId mandateDetails mandateStatus mandateExpiryDate weeklyRentAmount"
      )
      .sort({ createdAt: -1 });

    // Get next debit date from PhonePeAutopay for each rider
    const ridersWithPaymentInfo = await Promise.all(
      riders.map(async (rider) => {
        try {
          // Find the most recent PhonePeAutopay record for this rider
          const autopayRecord = await PhonePeAutopay.findOne(
            { riderId: rider._id },
            { nextDebitDate: 1, lastDebitDate: 1, amount: 1 },
            { sort: { createdAt: -1 } }
          );

          // Convert rider to plain object and add payment info
          const riderObj = rider.toObject();
          riderObj.id = rider._id.toString();
          riderObj.nextDebitDate = autopayRecord?.nextDebitDate || null;
          riderObj.lastDebitDate = autopayRecord?.lastDebitDate || null;
          riderObj.weeklyAmount = autopayRecord?.amount
            ? `₹${(autopayRecord.amount / 100).toFixed(0)}`
            : `₹${rider.weeklyRentAmount}`;

          // Format next payment date
          if (riderObj.nextDebitDate) {
            riderObj.nextPayment = new Date(
              riderObj.nextDebitDate
            ).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          } else {
            riderObj.nextPayment = "N/A";
          }

          return riderObj;
        } catch (error) {
          console.error(
            `Error fetching payment info for rider ${rider._id}:`,
            error
          );
          // Return rider without payment info if there's an error
          const riderObj = rider.toObject();
          riderObj.id = rider._id.toString();
          riderObj.nextDebitDate = null;
          riderObj.lastDebitDate = null;
          riderObj.weeklyAmount = `₹${rider.weeklyRentAmount}`;
          riderObj.nextPayment = "N/A";
          return riderObj;
        }
      })
    );

    res.json({
      success: true,
      riders: ridersWithPaymentInfo,
      total: ridersWithPaymentInfo.length,
    });
  } catch (error) {
    console.error("Error fetching riders for weekly payments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/riders
// @desc    Create new rider
// @access  Private
router.post(
  "/",
  [auth, roleCheck(["Superadmin", "admin"]), validateRider],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        name,
        email,
        phone,
        upiId,
        weeklyRentAmount,
        aadhaarCard,
        panCard,
        address,
        bankAccountNumber,
        batterySmartCard,
        documents,
        status,
      } = req.body;

      // Check for existing rider with specific field validation
      const existingPhone = await Rider.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "A rider with this phone number already exists",
        });
      }

      const existingUpiId = await Rider.findOne({ upiId });
      if (existingUpiId) {
        return res.status(409).json({
          success: false,
          message: "A rider with this UPI ID already exists",
        });
      }

      // Generate unique Rider ID
      const cityCode = "BLR"; // Default city code
      const riderId = await Rider.generateRiderId(cityCode);

      // Prepare documents object - prioritize uploaded URLs over text inputs
      const documentsObj = {
        aadhaar: documents?.aadhaar || aadhaarCard || undefined,
        pan: documents?.pan || panCard || undefined,
        addressProof: documents?.addressProof || undefined,
        bankProof: documents?.bankProof || bankAccountNumber || undefined,
        batteryCard: documents?.batteryCard || batterySmartCard || undefined,
        picture: documents?.picture || undefined,
      };

      // Create rider with updated field mapping
      const rider = new Rider({
        riderId,
        name,
        email,
        phone,
        upiId,
        address,
        weeklyRentAmount: parseFloat(weeklyRentAmount),
        assignedAdmin: req.admin._id,
        documents: documentsObj,
        mandateDetails: {
          merchantOrderId: req.body.merchantOrderId,
          merchantSubscriptionId: req.body.merchantSubscriptionId,
          amount: parseFloat(weeklyRentAmount) * 100,
          maxAmount: parseFloat(weeklyRentAmount) * 100,
          frequency: "weekly",
          authWorkflowType: "TRANSACTION",
          amountType: "FIXED",
        },
      });

      const savedRider = await rider.save();

      // Create notification for new rider registration
      try {
        await Notification.create({
          type: "new_rider_registered",
          title: `New Rider Registered – ${riderId}`,
          description: "Rider onboarding complete. All documents verified.",
          riderId: savedRider._id,
          priority: "medium",
          actionRequired: false,
        });
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't fail the rider creation if notification fails
      }

      res.status(201).json({
        success: true,
        message: "Rider created successfully",
        rider: savedRider,
      });
    } catch (error) {
      console.error("Error creating rider:", error);
      console.error("Error stack:", error.stack);

      // Handle specific MongoDB errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(409).json({
          success: false,
          message: `Rider with this ${field} already exists`,
        });
      }

      res
        .status(500)
        .json({ success: false, message: "Server error: " + error.message });
    }
  }
);

// @route   PATCH /api/riders/:id
// @desc    Update rider verification status
// @access  Private
router.patch(
  "/:id",
  [auth, roleCheck(["Superadmin", "admin"])],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { verificationStatus } = req.body;

      // Validate verification status
      if (
        !verificationStatus ||
        !["pending", "approved", "rejected"].includes(verificationStatus)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid verification status. Must be pending, approved, or rejected",
        });
      }

      // Find and update rider
      const rider = await Rider.findByIdAndUpdate(
        id,
        { verificationStatus },
        { new: true, runValidators: true }
      );

      if (!rider) {
        return res.status(404).json({
          success: false,
          message: "Rider not found",
        });
      }

      // Create notification for status change
      try {
        const notificationType =
          verificationStatus === "approved"
            ? "rider_approved"
            : "rider_rejected";
        const notificationTitle =
          verificationStatus === "approved"
            ? `Rider Approved – ${rider.riderId}`
            : `Rider Rejected – ${rider.riderId}`;
        const notificationDescription =
          verificationStatus === "approved"
            ? "Rider documents verified and approved. Ready for mandate setup."
            : "Rider documents rejected. Requires re-upload and review.";

        await Notification.create({
          type: notificationType,
          title: notificationTitle,
          description: notificationDescription,
          riderId: rider._id,
          priority: verificationStatus === "approved" ? "low" : "high",
          actionRequired: verificationStatus === "rejected",
        });
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't fail the update if notification fails
      }

      res.json({
        success: true,
        message: `Rider ${verificationStatus} successfully`,
        rider,
      });
    } catch (error) {
      console.error("Error updating rider:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// @route   GET /api/riders/:id/mandate-status
// @desc    Get mandate status for a specific rider
// @access  Private
router.get("/:id/mandate-status", auth, async (req, res) => {
  console.log(
    `[MANDATE-STATUS] Fetching mandate status for rider ID: ${req.params.id}`
  );
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[MANDATE-STATUS] Invalid rider ID format: ${id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID",
      });
    }

    console.log(`[MANDATE-STATUS] Fetching rider from database: ${id}`);
    const rider = await Rider.findById(id);

    if (!rider) {
      console.log(`[MANDATE-STATUS] Rider not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    console.log(
      `[MANDATE-STATUS] Rider found: ${rider.riderId}, Current mandate status: ${rider.mandateStatus}`
    );

    if (!rider.mandateDetails?.merchantSubscriptionId) {
      console.log(
        `[MANDATE-STATUS] No subscription ID found for rider: ${rider.riderId}`
      );
      // Return current status if no subscription ID
      return res.json({
        success: true,
        mandateStatus: rider.mandateStatus,
        mandateDetails: rider.mandateDetails,
        message:
          "No subscription ID found. Returning current status from database.",
      });
    }

    console.log(
      `[MANDATE-STATUS] Subscription ID: ${rider.mandateDetails.merchantSubscriptionId}`
    );

    // Step 1: Get PhonePe access token
    console.log(`[MANDATE-STATUS] Step 1: Getting PhonePe access token...`);
    let authToken;
    try {
      authToken = await generatePhonePeAuthToken();
      console.log(
        `[MANDATE-STATUS] Successfully obtained PhonePe access token`
      );
    } catch (authError) {
      console.error(
        `[MANDATE-STATUS] Auth token generation failed:`,
        authError.message
      );
      console.error(
        `[MANDATE-STATUS] Auth error details:`,
        authError.response?.data || authError
      );
      // Return current status from DB if auth fails
      return res.json({
        success: true,
        mandateStatus: rider.mandateStatus,
        mandateDetails: rider.mandateDetails,
        warning:
          "PhonePe authentication failed. Returning current status from database.",
      });
    }

    // Step 2: Check subscription status with PhonePe API
    const phonepeBaseUrl =
      process.env.NODE_ENV === "production"
        ? "https://api.phonepe.com/apis/pg"
        : "https://api-preprod.phonepe.com/apis/pg-sandbox";

    console.log(
      `[MANDATE-STATUS] Step 2: Checking subscription status with PhonePe API`
    );
    console.log(`[MANDATE-STATUS] Using base URL: ${phonepeBaseUrl}`);
    console.log(
      `[MANDATE-STATUS] Environment: ${process.env.NODE_ENV || "development"}`
    );

    let subscriptionStatus;
    try {
      const subscriptionStatusUrl = `${phonepeBaseUrl}/subscriptions/v2/${rider.mandateDetails.merchantSubscriptionId}/status`;
      console.log(
        `[MANDATE-STATUS] Calling PhonePe API: ${subscriptionStatusUrl}`
      );

      const statusResponse = await axios.get(subscriptionStatusUrl, {
        headers: {
          Authorization: `O-Bearer ${authToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      subscriptionStatus = statusResponse.data;
      console.log(
        `[MANDATE-STATUS] PhonePe API response received. State: ${subscriptionStatus.state}`
      );
      console.log(
        `[MANDATE-STATUS] Full PhonePe response:`,
        JSON.stringify(subscriptionStatus, null, 2)
      );
    } catch (phonepeError) {
      console.error(
        `[MANDATE-STATUS] PhonePe subscription status error:`,
        phonepeError.response?.data || phonepeError.message
      );
      console.error(
        `[MANDATE-STATUS] Error status:`,
        phonepeError.response?.status
      );
      // Return current status from DB if API call fails
      return res.json({
        success: true,
        mandateStatus: rider.mandateStatus,
        mandateDetails: rider.mandateDetails,
        warning:
          "Failed to fetch status from PhonePe. Returning current status from database.",
        error: phonepeError.response?.data || phonepeError.message,
      });
    }

    // Step 3: Map PhonePe status to our mandateStatus
    console.log(
      `[MANDATE-STATUS] Step 3: Mapping PhonePe status to internal status`
    );
    let newMandateStatus = rider.mandateStatus; // Default to current status
    console.log(
      `[MANDATE-STATUS] Current mandate status: ${rider.mandateStatus}`
    );

    if (subscriptionStatus.state) {
      const phonepeState = subscriptionStatus.state.toUpperCase();
      console.log(`[MANDATE-STATUS] PhonePe state: ${phonepeState}`);

      switch (phonepeState) {
        case "ACTIVE":
          newMandateStatus = "active";
          break;
        case "CANCELLED":
        case "EXPIRED":
          newMandateStatus = "suspended";
          break;
        case "PENDING":
          newMandateStatus = "pending";
          break;
        case "FAILED":
          newMandateStatus = "failed";
          break;
        default:
          console.warn(
            `[MANDATE-STATUS] Unknown PhonePe state: ${phonepeState}, keeping current status: ${rider.mandateStatus}`
          );
      }
    }

    console.log(`[MANDATE-STATUS] New mandate status: ${newMandateStatus}`);
    console.log(
      `[MANDATE-STATUS] Status changed: ${
        rider.mandateStatus !== newMandateStatus
      }`
    );

    // Step 4: Update rider in database
    console.log(`[MANDATE-STATUS] Step 4: Updating rider in database`);
    const updateData = {
      mandateStatus: newMandateStatus,
    };

    // Update mandate details with PhonePe response data
    if (subscriptionStatus.validUpto || subscriptionStatus.expireAt) {
      const expiryDate =
        subscriptionStatus.validUpto || subscriptionStatus.expireAt;
      updateData.mandateExpiryDate = new Date(expiryDate);
      console.log(
        `[MANDATE-STATUS] Setting mandate expiry date: ${expiryDate}`
      );
    }
    if (subscriptionStatus.state) {
      updateData["mandateDetails.phonepeStatus"] = subscriptionStatus.state;
      console.log(
        `[MANDATE-STATUS] Setting PhonePe status in mandate details: ${subscriptionStatus.state}`
      );
    }
    if (subscriptionStatus.errorCode) {
      updateData["mandateDetails.errorCode"] = subscriptionStatus.errorCode;
      console.log(
        `[MANDATE-STATUS] Setting error code: ${subscriptionStatus.errorCode}`
      );
    }
    if (subscriptionStatus.detailedErrorCode) {
      updateData["mandateDetails.detailedErrorCode"] =
        subscriptionStatus.detailedErrorCode;
      console.log(
        `[MANDATE-STATUS] Setting detailed error code: ${subscriptionStatus.detailedErrorCode}`
      );
    }

    console.log(
      `[MANDATE-STATUS] Update data:`,
      JSON.stringify(updateData, null, 2)
    );
    const updatedRider = await Rider.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    console.log(
      `[MANDATE-STATUS] Rider updated successfully. New status: ${updatedRider.mandateStatus}`
    );

    // Step 5: Update PhonePeAutopay records if they exist
    console.log(`[MANDATE-STATUS] Step 5: Updating PhonePeAutopay records`);
    try {
      const autopayRecords = await PhonePeAutopay.find({
        riderId: id,
        merchantSubscriptionId: rider.mandateDetails.merchantSubscriptionId,
      });

      console.log(
        `[MANDATE-STATUS] Found ${autopayRecords.length} autopay record(s)`
      );

      if (autopayRecords.length > 0) {
        // Map status for PhonePeAutopay model
        let autopayStatus = "pending";
        let phonepeStatus = subscriptionStatus.state || "PENDING";

        if (subscriptionStatus.state === "ACTIVE") {
          autopayStatus = "success";
        } else if (
          subscriptionStatus.state === "FAILED" ||
          subscriptionStatus.state === "CANCELLED"
        ) {
          autopayStatus =
            subscriptionStatus.state === "CANCELLED" ? "cancelled" : "failed";
        }

        console.log(
          `[MANDATE-STATUS] Updating autopay records with status: ${autopayStatus}, phonepeStatus: ${phonepeStatus}`
        );

        // Update all matching autopay records
        const updateResult = await PhonePeAutopay.updateMany(
          {
            riderId: id,
            merchantSubscriptionId: rider.mandateDetails.merchantSubscriptionId,
          },
          {
            $set: {
              phonepeStatus: phonepeStatus,
              status: autopayStatus,
              phonepeResponse: subscriptionStatus,
            },
          }
        );
        console.log(
          `[MANDATE-STATUS] Updated ${updateResult.modifiedCount} autopay record(s)`
        );
      }
    } catch (autopayError) {
      console.error(
        `[MANDATE-STATUS] Error updating PhonePeAutopay records:`,
        autopayError
      );
      console.error(
        `[MANDATE-STATUS] Autopay error stack:`,
        autopayError.stack
      );
      // Don't fail the request if autopay update fails
    }

    // Step 6: Return the updated status
    console.log(`[MANDATE-STATUS] Step 6: Sending response`);
    console.log(
      `[MANDATE-STATUS] Final status - Previous: ${rider.mandateStatus}, Current: ${newMandateStatus}, PhonePe: ${subscriptionStatus.state}`
    );

    res.json({
      success: true,
      mandateStatus: updatedRider.mandateStatus,
      mandateDetails: updatedRider.mandateDetails,
      previousStatus: rider.mandateStatus,
      currentStatus: newMandateStatus,
      phonepeStatus: subscriptionStatus.state,
      phonepeResponse: subscriptionStatus,
      updated: rider.mandateStatus !== newMandateStatus,
    });

    console.log(
      `[MANDATE-STATUS] ✅ Successfully fetched and updated mandate status for rider: ${rider.riderId}`
    );
  } catch (error) {
    console.error(`[MANDATE-STATUS] ❌ Error fetching mandate status:`, error);
    console.error(`[MANDATE-STATUS] Error message:`, error.message);
    console.error(`[MANDATE-STATUS] Error stack:`, error.stack);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// @route   POST /api/riders/:id/check-mandate
// @desc    Manually check and update mandate status with PhonePe API
// @access  Private
router.post("/:id/check-mandate", auth, async (req, res) => {
  console.log(
    `[CHECK-MANDATE] Starting mandate check for rider ID: ${req.params.id}`
  );
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[CHECK-MANDATE] Invalid rider ID format: ${id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID",
      });
    }

    console.log(`[CHECK-MANDATE] Fetching rider from database: ${id}`);
    const rider = await Rider.findById(id);

    if (!rider) {
      console.log(`[CHECK-MANDATE] Rider not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    console.log(
      `[CHECK-MANDATE] Rider found: ${rider.riderId}, Current mandate status: ${rider.mandateStatus}`
    );

    if (!rider.mandateDetails?.merchantSubscriptionId) {
      console.log(
        `[CHECK-MANDATE] No subscription ID found for rider: ${rider.riderId}`
      );
      return res.status(400).json({
        success: false,
        message:
          "No subscription ID found for this rider. Mandate may not be set up yet.",
      });
    }

    console.log(
      `[CHECK-MANDATE] Subscription ID: ${rider.mandateDetails.merchantSubscriptionId}`
    );

    // Step 1: Get PhonePe access token using the same logic as phonepeAutopay.js
    console.log(`[CHECK-MANDATE] Step 1: Getting PhonePe access token...`);
    let authToken;
    try {
      authToken = await generatePhonePeAuthToken();
      console.log(`[CHECK-MANDATE] Successfully obtained PhonePe access token`);
    } catch (authError) {
      console.error(
        `[CHECK-MANDATE] Auth token generation failed:`,
        authError.message
      );
      console.error(
        `[CHECK-MANDATE] Auth error details:`,
        authError.response?.data || authError
      );
      return res.status(500).json({
        success: false,
        message: authError.message,
      });
    }

    // Step 2: Check subscription status with PhonePe API
    const phonepeBaseUrl =
      process.env.NODE_ENV === "production"
        ? "https://api.phonepe.com/apis/pg"
        : "https://api-preprod.phonepe.com/apis/pg-sandbox";

    console.log(
      `[CHECK-MANDATE] Step 2: Checking subscription status with PhonePe API`
    );
    console.log(`[CHECK-MANDATE] Using base URL: ${phonepeBaseUrl}`);
    console.log(
      `[CHECK-MANDATE] Environment: ${process.env.NODE_ENV || "development"}`
    );

    let subscriptionStatus;
    try {
      const subscriptionStatusUrl = `${phonepeBaseUrl}/subscriptions/v2/${rider.mandateDetails.merchantSubscriptionId}/status`;
      console.log(
        `[CHECK-MANDATE] Calling PhonePe API: ${subscriptionStatusUrl}`
      );

      const statusResponse = await axios.get(subscriptionStatusUrl, {
        headers: {
          Authorization: `O-Bearer ${authToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      subscriptionStatus = statusResponse.data;
      console.log(
        `[CHECK-MANDATE] PhonePe API response received. State: ${subscriptionStatus.state}`
      );
      console.log(
        `[CHECK-MANDATE] Full PhonePe response:`,
        JSON.stringify(subscriptionStatus, null, 2)
      );
    } catch (phonepeError) {
      console.error(
        `[CHECK-MANDATE] PhonePe subscription status error:`,
        phonepeError.response?.data || phonepeError.message
      );
      console.error(
        `[CHECK-MANDATE] Error status:`,
        phonepeError.response?.status
      );
      console.error(
        `[CHECK-MANDATE] Error headers:`,
        phonepeError.response?.headers
      );

      // If API call fails, return error but don't update database
      return res.status(phonepeError.response?.status || 500).json({
        success: false,
        message: "Failed to fetch mandate status from PhonePe",
        error: phonepeError.response?.data || phonepeError.message,
      });
    }

    // Step 3: Map PhonePe status to our mandateStatus
    // PhonePe statuses: ACTIVE, CANCELLED, EXPIRED, PENDING, etc.
    console.log(
      `[CHECK-MANDATE] Step 3: Mapping PhonePe status to internal status`
    );
    let newMandateStatus = rider.mandateStatus; // Default to current status
    console.log(
      `[CHECK-MANDATE] Current mandate status: ${rider.mandateStatus}`
    );

    if (subscriptionStatus.state) {
      const phonepeState = subscriptionStatus.state.toUpperCase();
      console.log(`[CHECK-MANDATE] PhonePe state: ${phonepeState}`);

      switch (phonepeState) {
        case "ACTIVE":
          newMandateStatus = "active";
          break;
        case "CANCELLED":
        case "EXPIRED":
          newMandateStatus = "suspended";
          break;
        case "PENDING":
          newMandateStatus = "pending";
          break;
        case "FAILED":
          newMandateStatus = "failed";
          break;
        default:
          // Keep current status if we don't recognize the state
          console.warn(
            `[CHECK-MANDATE] Unknown PhonePe state: ${phonepeState}, keeping current status: ${rider.mandateStatus}`
          );
      }
    }

    console.log(`[CHECK-MANDATE] New mandate status: ${newMandateStatus}`);
    console.log(
      `[CHECK-MANDATE] Status changed: ${
        rider.mandateStatus !== newMandateStatus
      }`
    );

    // Step 4: Update rider in database
    console.log(`[CHECK-MANDATE] Step 4: Updating rider in database`);
    const updateData = {
      mandateStatus: newMandateStatus,
    };

    // Update mandate details with PhonePe response data
    if (subscriptionStatus.validUpto) {
      updateData.mandateExpiryDate = new Date(subscriptionStatus.validUpto);
      console.log(
        `[CHECK-MANDATE] Setting mandate expiry date: ${subscriptionStatus.validUpto}`
      );
    }
    if (subscriptionStatus.state) {
      updateData["mandateDetails.phonepeStatus"] = subscriptionStatus.state;
      console.log(
        `[CHECK-MANDATE] Setting PhonePe status in mandate details: ${subscriptionStatus.state}`
      );
    }
    if (subscriptionStatus.errorCode) {
      updateData["mandateDetails.errorCode"] = subscriptionStatus.errorCode;
      console.log(
        `[CHECK-MANDATE] Setting error code: ${subscriptionStatus.errorCode}`
      );
    }
    if (subscriptionStatus.detailedErrorCode) {
      updateData["mandateDetails.detailedErrorCode"] =
        subscriptionStatus.detailedErrorCode;
      console.log(
        `[CHECK-MANDATE] Setting detailed error code: ${subscriptionStatus.detailedErrorCode}`
      );
    }

    console.log(
      `[CHECK-MANDATE] Update data:`,
      JSON.stringify(updateData, null, 2)
    );
    const updatedRider = await Rider.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    console.log(
      `[CHECK-MANDATE] Rider updated successfully. New status: ${updatedRider.mandateStatus}`
    );

    // Step 5: Update PhonePeAutopay records if they exist
    console.log(`[CHECK-MANDATE] Step 5: Updating PhonePeAutopay records`);
    try {
      const autopayRecords = await PhonePeAutopay.find({
        riderId: id,
        merchantSubscriptionId: rider.mandateDetails.merchantSubscriptionId,
      });

      console.log(
        `[CHECK-MANDATE] Found ${autopayRecords.length} autopay record(s)`
      );

      if (autopayRecords.length > 0) {
        // Map status for PhonePeAutopay model
        let autopayStatus = "pending";
        let phonepeStatus = subscriptionStatus.state || "PENDING";

        if (subscriptionStatus.state === "ACTIVE") {
          autopayStatus = "success";
        } else if (
          subscriptionStatus.state === "FAILED" ||
          subscriptionStatus.state === "CANCELLED"
        ) {
          autopayStatus =
            subscriptionStatus.state === "CANCELLED" ? "cancelled" : "failed";
        }

        console.log(
          `[CHECK-MANDATE] Updating autopay records with status: ${autopayStatus}, phonepeStatus: ${phonepeStatus}`
        );

        // Update all matching autopay records
        const updateResult = await PhonePeAutopay.updateMany(
          {
            riderId: id,
            merchantSubscriptionId: rider.mandateDetails.merchantSubscriptionId,
          },
          {
            $set: {
              phonepeStatus: phonepeStatus,
              status: autopayStatus,
              phonepeResponse: subscriptionStatus,
            },
          }
        );
        console.log(
          `[CHECK-MANDATE] Updated ${updateResult.modifiedCount} autopay record(s)`
        );
      }
    } catch (autopayError) {
      console.error(
        `[CHECK-MANDATE] Error updating PhonePeAutopay records:`,
        autopayError
      );
      console.error(`[CHECK-MANDATE] Autopay error stack:`, autopayError.stack);
      // Don't fail the request if autopay update fails
    }

    // Step 6: Create notification if status changed
    if (rider.mandateStatus !== newMandateStatus) {
      console.log(
        `[CHECK-MANDATE] Step 6: Creating notification for status change`
      );
      console.log(
        `[CHECK-MANDATE] Status changed from ${rider.mandateStatus} to ${newMandateStatus}`
      );

      try {
        // Determine notification type based on status change
        let notificationType = "system_alert"; // Default fallback
        if (newMandateStatus === "active") {
          notificationType = "mandate_activated";
        } else if (newMandateStatus === "failed") {
          notificationType = "mandate_failed";
        } else if (newMandateStatus === "suspended") {
          notificationType = "mandate_cancelled"; // Using cancelled for suspended status
        }

        console.log(
          `[CHECK-MANDATE] Creating notification with type: ${notificationType}`
        );

        await Notification.create({
          type: notificationType,
          title: `Mandate Status Updated – ${rider.riderId}`,
          description: `Mandate status changed from ${rider.mandateStatus} to ${newMandateStatus} after PhonePe API check.`,
          riderId: rider._id,
          priority: newMandateStatus === "active" ? "low" : "medium",
          actionRequired:
            newMandateStatus === "failed" || newMandateStatus === "suspended",
          metadata: {
            previousStatus: rider.mandateStatus,
            newStatus: newMandateStatus,
            phonepeState: subscriptionStatus.state,
            checkedAt: new Date(),
            checkedBy: req.admin._id,
          },
        });
        console.log(`[CHECK-MANDATE] Notification created successfully`);
      } catch (notificationError) {
        console.error(
          `[CHECK-MANDATE] Error creating notification:`,
          notificationError
        );
        console.error(
          `[CHECK-MANDATE] Notification error details:`,
          notificationError.errors || notificationError.message
        );
        console.error(
          `[CHECK-MANDATE] Notification error stack:`,
          notificationError.stack
        );
        // Don't fail the request if notification fails
      }
    } else {
      console.log(
        `[CHECK-MANDATE] No status change detected, skipping notification`
      );
    }

    console.log(`[CHECK-MANDATE] Step 7: Sending success response`);
    console.log(
      `[CHECK-MANDATE] Final status - Previous: ${rider.mandateStatus}, Current: ${newMandateStatus}, PhonePe: ${subscriptionStatus.state}`
    );

    res.json({
      success: true,
      message: "Mandate status checked and updated successfully",
      previousStatus: rider.mandateStatus,
      currentStatus: newMandateStatus,
      phonepeStatus: subscriptionStatus.state,
      phonepeResponse: subscriptionStatus,
      rider: {
        id: updatedRider._id,
        riderId: updatedRider.riderId,
        mandateStatus: updatedRider.mandateStatus,
        mandateExpiryDate: updatedRider.mandateExpiryDate,
      },
    });

    console.log(
      `[CHECK-MANDATE] ✅ Successfully completed mandate check for rider: ${rider.riderId}`
    );
  } catch (error) {
    console.error(`[CHECK-MANDATE] ❌ Error checking mandate status:`, error);
    console.error(`[CHECK-MANDATE] Error message:`, error.message);
    console.error(`[CHECK-MANDATE] Error stack:`, error.stack);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// @route   POST /api/riders/:id/cancel-mandate
// @desc    Cancel PhonePe mandate for a rider
// @access  Private
router.post("/:id/cancel-mandate", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID",
      });
    }

    // Find the rider
    const rider = await Rider.findById(id);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    // Check if rider has active mandate
    if (rider.mandateStatus !== "active" && rider.mandateStatus !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Rider does not have an active mandate to cancel",
      });
    }

    if (!rider.mandateDetails?.merchantSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: "No subscription ID found for this rider",
      });
    }

    // Check if PhonePe credentials are configured (try both naming conventions)
    const clientId =
      process.env.PHONEPE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_PHONEPE_CLIENT_ID;
    const clientSecret =
      process.env.PHONEPE_CLIENT_SECRET ||
      process.env.NEXT_PUBLIC_PHONEPE_CLIENT_SECRET;
    const clientVersion =
      process.env.PHONEPE_CLIENT_VERSION ||
      process.env.NEXT_PUBLIC_PHONEPE_CLIENT_VERSION ||
      "1.0";
    const grantType =
      process.env.PHONEPE_GRANT_TYPE ||
      process.env.NEXT_PUBLIC_PHONEPE_GRANT_TYPE ||
      "client_credentials";

    if (!clientId || !clientSecret) {
      // Update rider mandate status to cancelled locally
      await Rider.findByIdAndUpdate(id, {
        mandateStatus: "cancelled",
        "mandateDetails.cancelledAt": new Date(),
        "mandateDetails.cancellationReason":
          "Admin cancelled via dashboard (PhonePe not configured)",
      });

      // Create notification for mandate cancellation
      await Notification.create({
        type: "mandate_cancelled",
        title: `Mandate Cancelled – ${rider.riderId}`,
        description:
          "Rider mandate has been cancelled by admin. No further automatic payments will be processed.",
        riderId: rider._id,
        priority: "medium",
        actionRequired: false,
        metadata: {
          riderName: rider.name,
          riderId: rider.riderId,
          cancelledAt: new Date(),
          cancelledBy: req.admin._id,
        },
      });

      return res.json({
        success: true,
        message: "Mandate cancelled locally (PhonePe not configured)",
        warning:
          "PhonePe credentials not configured, mandate cancelled in local system only",
      });
    }

    // Call PhonePe API to cancel subscription
    const axios = require("axios");

    let authResponse;
    try {
      // Get PhonePe access token first
      const authData = new URLSearchParams();
      authData.append("client_id", clientId);
      authData.append("client_version", clientVersion);
      authData.append("client_secret", clientSecret);
      authData.append("grant_type", grantType);

      authResponse = await axios.post(
        process.env.PHONEPE_AUTH_URL ||
          "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token",
        authData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!authResponse.data.access_token) {
        console.error(
          "PhonePe auth failed - no access token:",
          authResponse.data
        );
        return res.status(500).json({
          success: false,
          message: "Failed to get PhonePe access token",
          authResponse: authResponse.data,
        });
      }
    } catch (authError) {
      console.error(
        "PhonePe authentication error:",
        authError.response?.data || authError.message
      );

      // Fallback: cancel locally even if PhonePe auth fails
      await Rider.findByIdAndUpdate(id, {
        mandateStatus: "cancelled",
        "mandateDetails.cancelledAt": new Date(),
        "mandateDetails.cancellationReason":
          "Admin cancelled via dashboard (PhonePe auth failed)",
        "mandateDetails.phonepeError":
          authError.response?.data?.message || authError.message,
      });

      return res.json({
        success: true,
        message: "Mandate cancelled locally (PhonePe authentication failed)",
        warning:
          "PhonePe authentication failed, but mandate has been cancelled in our system",
      });
    }

    // Cancel subscription using PhonePe API
    const phonepeBaseUrl =
      process.env.NODE_ENV === "development"
        ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
        : "https://api.phonepe.com/apis/pg";

    try {
      const cancelResponse = await axios.post(
        `${phonepeBaseUrl}/subscriptions/v2/${rider.mandateDetails.merchantSubscriptionId}/cancel`,
        {},
        {
          headers: {
            Authorization: `O-Bearer ${authResponse.data.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // PhonePe returns 204 No Content for successful cancellation
      if (cancelResponse.status === 204) {
        // Update rider mandate status to cancelled
        await Rider.findByIdAndUpdate(id, {
          mandateStatus: "cancelled",
          "mandateDetails.cancelledAt": new Date(),
          "mandateDetails.cancellationReason": "Admin cancelled via dashboard",
        });

        // Create notification for mandate cancellation
        await Notification.create({
          type: "mandate_cancelled",
          title: `Mandate Cancelled – ${rider.riderId}`,
          description:
            "Rider mandate has been cancelled by admin. No further automatic payments will be processed.",
          riderId: rider._id,
          priority: "medium",
          actionRequired: false,
          metadata: {
            riderName: rider.name,
            riderId: rider.riderId,
            cancelledAt: new Date(),
            cancelledBy: req.admin._id,
          },
        });

        res.json({
          success: true,
          message: "Mandate cancelled successfully with PhonePe",
          phonepeStatus: cancelResponse.status,
          phonepeResponse:
            cancelResponse.status === 204
              ? "Subscription cancelled (204 No Content)"
              : cancelResponse.data,
        });
      }
    } catch (phonepeError) {
      console.error(
        "PhonePe cancel error:",
        phonepeError.response?.data || phonepeError.message
      );

      // If PhonePe API fails, still update our database
      await Rider.findByIdAndUpdate(id, {
        mandateStatus: "cancelled",
        "mandateDetails.cancelledAt": new Date(),
        "mandateDetails.cancellationReason":
          "Admin cancelled via dashboard (PhonePe API failed)",
        "mandateDetails.phonepeError":
          phonepeError.response?.data?.message || phonepeError.message,
      });

      // Create notification even if PhonePe fails
      await Notification.create({
        type: "mandate_cancelled",
        title: `Mandate Cancelled – ${rider.riderId}`,
        description:
          "Rider mandate has been cancelled by admin (PhonePe API failed, but cancelled locally).",
        riderId: rider._id,
        priority: "medium",
        actionRequired: false,
        metadata: {
          riderName: rider.name,
          riderId: rider.riderId,
          cancelledAt: new Date(),
          cancelledBy: req.admin._id,
          phonepeError:
            phonepeError.response?.data?.message || phonepeError.message,
        },
      });

      res.json({
        success: true,
        message:
          "Mandate cancelled locally (PhonePe API error, but mandate marked as cancelled)",
        warning:
          "PhonePe API call failed, but mandate has been cancelled in our system",
      });
    }
  } catch (error) {
    console.error("Error cancelling mandate:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// @route   DELETE /api/riders/:id
// @desc    Delete a rider
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID",
      });
    }

    // Find the rider
    const rider = await Rider.findById(id);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    // Check if rider has active mandate
    if (rider.mandateStatus === "active" || rider.mandateStatus === "ACTIVE") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete rider with active mandate. Please cancel the mandate first.",
      });
    }

    // Delete associated data first
    try {
      // Delete associated PhonePe autopay records
      await PhonePeAutopay.deleteMany({ riderId: id });

      // Delete associated notifications
      await Notification.deleteMany({ riderId: id });

      // Delete associated vehicles (if any)
      const Vehicle = require("../models/Vehicle");
      await Vehicle.updateMany({ riderId: id }, { $unset: { riderId: 1 } });
    } catch (cleanupError) {
      console.error("Error cleaning up associated data:", cleanupError);
      // Continue with deletion even if cleanup fails
    }

    // Delete the rider
    await Rider.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Rider deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting rider:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// @route   POST /api/riders/phonepe-auth
// @desc    Get PhonePe access token (proxy endpoint for frontend)
// @access  Private
router.post("/phonepe-auth", auth, async (req, res) => {
  try {
    // const clientId = process.env.PHONEPE_CLIENT_ID || process.env.NEXT_PUBLIC_PHONEPE_CLIENT_ID;
    const clientId = "SU2509161700329296269400";
    // const clientSecret = process.env.PHONEPE_CLIENT_SECRET || process.env.NEXT_PUBLIC_PHONEPE_CLIENT_SECRET;
    const clientSecret = "6f68520b-d32f-4ef3-bbf7-b9fab1790970";
    const clientVersion = 1;
    const grantType = "client_credentials";

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        success: false,
        message: "PhonePe credentials not configured",
      });
    }

    const axios = require("axios");
    const authData = new URLSearchParams();
    authData.append("client_id", clientId);
    authData.append("client_version", clientVersion);
    authData.append("client_secret", clientSecret);
    authData.append("grant_type", grantType);

    // Use consistent environment detection
    const authUrl =
      "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";

    const authResponse = await axios.post(authUrl, authData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    res.json({
      success: true,
      access_token: authResponse.data.access_token,
      token_type: authResponse.data.token_type,
      expires_in: authResponse.data.expires_in,
      issued_at: authResponse.data.issued_at,
      expires_at: authResponse.data.expires_at,
      session_expires_at: authResponse.data.session_expires_at,
      encrypted_access_token: authResponse.data.encrypted_access_token,
      refresh_token: authResponse.data.refresh_token,
    });
  } catch (error) {
    console.error("PhonePe auth error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "PhonePe authentication failed",
      error: error.response?.data || error.message,
    });
  }
});

// @route   POST /api/riders/phonepe-subscription-setup
// @desc    Setup PhonePe subscription (proxy endpoint for frontend)
// @access  Private
router.post("/phonepe-subscription-setup", auth, async (req, res) => {
  try {
    const { access_token, subscriptionData } = req.body;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: "Access token is required",
      });
    }

    if (!subscriptionData) {
      return res.status(400).json({
        success: false,
        message: "Subscription data is required",
      });
    }

    const axios = require("axios");
    // Use the same base URL pattern as auth endpoint for consistency
    // Check if we're in development/sandbox mode
    // const authUrl = process.env.PHONEPE_AUTH_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';
    const authUrl =
      "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";
    // const isProduction = process.env.NODE_ENV === 'production' && !authUrl.includes('preprod');

    // const phonepeBaseUrl = isProduction
    //   ? 'https://api.phonepe.com/apis/pg'
    //   : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

    const subscriptionUrl =
      "https://api.phonepe.com/apis/pg/subscriptions/v2/setup";

    const headers = {
      Authorization: `O-Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    // Send the subscriptionData directly to PhonePe (not wrapped in subscriptionData)
    const subscriptionResponse = await axios.post(
      subscriptionUrl,
      subscriptionData,
      {
        headers,
      }
    );

    res.json({
      success: true,
      orderId: subscriptionResponse.data.orderId,
      state: subscriptionResponse.data.state,
      response: subscriptionResponse.data,
    });
  } catch (error) {
    console.error(
      "PhonePe subscription setup error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "PhonePe subscription setup failed",
      error: error.response?.data || error.message,
    });
  }
});

// Helper function to get PhonePe auth token using the same method as phonepeAutopay.js
async function generatePhonePeAuthToken() {
  try {
    // Use the same credentials as in phonepeAutopay.js
    const clientId = "SU2509161700329296269400";
    const clientSecret = "6f68520b-d32f-4ef3-bbf7-b9fab1790970";
    const clientVersion = 1;
    const grantType = "client_credentials";

    const authData = new URLSearchParams();
    authData.append("client_id", clientId);
    authData.append("client_version", clientVersion);
    authData.append("client_secret", clientSecret);
    authData.append("grant_type", grantType);

    // Use the same auth URL as in phonepeAutopay.js
    const authUrl =
      "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";

    const authResponse = await axios.post(authUrl, authData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (authResponse.data && authResponse.data.access_token) {
      return authResponse.data.access_token;
    } else {
      throw new Error("Invalid response from PhonePe authorization API");
    }
  } catch (error) {
    console.error("Error generating PhonePe auth token:", error);
    if (error.response) {
      console.error("PhonePe auth API error response:", error.response.data);
    }
    throw new Error(`Failed to generate PhonePe auth token: ${error.message}`);
  }
}

module.exports = router;
