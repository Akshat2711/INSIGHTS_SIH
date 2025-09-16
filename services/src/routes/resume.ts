import { Router } from 'express';
import multer from 'multer';
import { resumeController } from '../controllers/resumeController';
import logger from '../utils/logger';

const router = Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1, // Only allow one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      logger.warn('File upload rejected - invalid type', {
        filename: file.originalname,
        mimetype: file.mimetype,
      });
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Handle multer errors
const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum size allowed is 10MB.',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files. Please upload only one file at a time.',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        message:
          'Unexpected field name. Please use "resume" as the field name.',
      });
    }
  }

  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid file type. Only PDF files are allowed.',
    });
  }

  logger.error('Upload error:', error);
  return res.status(500).json({
    status: 'error',
    message: 'File upload failed. Please try again.',
  });
};

/**
 * @route POST /aryabytes/api/services/resume/analyze
 * @desc Upload and analyze resume PDF
 * @access Public
 * @param {File} resume - PDF file to analyze (multipart/form-data)
 * @returns {Object} Structured resume data in JSON format
 */
router.post(
  '/analyze',
  upload.single('resume'),
  handleUploadError,
  resumeController.uploadAndAnalyze,
);

/**
 * @route GET /aryabytes/api/services/resume/info
 * @desc Get information about resume upload requirements and supported formats
 * @access Public
 * @returns {Object} Upload requirements and API documentation
 */
router.get('/info', resumeController.getUploadInfo);

/**
 * @route GET /aryabytes/api/services/resume/health
 * @desc Health check for resume analysis service
 * @access Public
 * @returns {Object} Service health status
 */
router.get('/health', resumeController.healthCheck);

export default router;
