const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'), false);
    }
  }
});

// Helper function to upload file to S3
const uploadToS3 = async (file, folder) => {
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// @route   POST /api/upload/rider-document
// @desc    Upload rider document (aadhaar, pan, address proof, etc.)
// @access  Private
router.post('/rider-document', [
  auth, 
  roleCheck(['Superadmin', 'admin']), 
  upload.single('file')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { documentType } = req.body;
    
    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: 'Document type is required'
      });
    }

    // Validate document type
    const allowedTypes = ['aadhaar', 'pan', 'addressProof', 'bankProof', 'batteryCard', 'picture'];
    if (!allowedTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    // Upload to S3
    const folder = `riders/documents/${documentType}`;
    const fileUrl = await uploadToS3(req.file, folder);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        documentType: documentType
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

// @route   POST /api/upload/multiple-documents
// @desc    Upload multiple rider documents at once
// @access  Private
router.post('/multiple-documents', [
  auth, 
  roleCheck(['Superadmin', 'admin']), 
  upload.array('files', 6) // Max 6 files
], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { documentTypes } = req.body;
    
    if (!documentTypes || !Array.isArray(documentTypes)) {
      return res.status(400).json({
        success: false,
        message: 'Document types array is required'
      });
    }

    if (req.files.length !== documentTypes.length) {
      return res.status(400).json({
        success: false,
        message: 'Number of files must match number of document types'
      });
    }

    const uploadedFiles = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const documentType = documentTypes[i];

      // Validate document type
      const allowedTypes = ['aadhaar', 'pan', 'addressProof', 'bankProof', 'batteryCard', 'picture'];
      if (!allowedTypes.includes(documentType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid document type: ${documentType}`
        });
      }

      // Upload to S3
      const folder = `riders/documents/${documentType}`;
      const fileUrl = await uploadToS3(file, folder);

      uploadedFiles.push({
        url: fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        documentType: documentType
      });
    }

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error.message
    });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB'
      });
    }
  }
  
  if (error.message === 'Only images and PDF files are allowed') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

module.exports = router;