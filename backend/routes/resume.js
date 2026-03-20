const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const UserProfile = require('../models/UserProfile');

const router = express.Router();

// Store files in memory, delete after parsing
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// POST /api/resume/upload
router.post('/upload', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { targetRole } = req.body;
    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Target role is required',
      });
    }

    // Send PDF to Python parser microservice
    const formData = new FormData();
    formData.append('file', new Blob([req.file.buffer], { type: 'application/pdf' }), req.file.originalname);

    let parsedText;
    try {
      const parserResponse = await axios.post(
        `${process.env.PARSER_SERVICE_URL}/parse`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 8000,
        }
      );
      parsedText = parserResponse.data.text;
    } catch (parserError) {
      // If parser service is down, do basic extraction fallback
      console.error('Parser service error:', parserError.message);
      parsedText = req.file.buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, '');
    }

    const sessionId = crypto.randomUUID();

    // Store in MongoDB (file buffer NOT stored - data privacy)
    const userProfile = await UserProfile.create({
      sessionId,
      targetRole: targetRole.trim(),
      rawText: parsedText,
      matchedSkills: [],
      missingSkills: [],
      gapAnalysisStatus: 'pending',
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: userProfile.sessionId,
        targetRole: userProfile.targetRole,
        rawText: userProfile.rawText,
        parsedAt: userProfile.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/resume/:sessionId
router.get('/:sessionId', async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({
      sessionId: req.params.sessionId,
    }).select('-__v');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
