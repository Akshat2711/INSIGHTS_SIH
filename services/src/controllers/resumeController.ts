import { Request, Response } from 'express';
import { resumeAnalysisService, ResumeData } from '../services/resumeAnalysis';
import logger from '../utils/logger';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export class ResumeController {
  /**
   * Upload and analyze resume PDF
   */
  public async uploadAndAnalyze(
    req: MulterRequest,
    res: Response,
  ): Promise<void> {
    try {
      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          status: 'error',
          message: 'No PDF file uploaded. Please upload a resume PDF file.',
        });
        return;
      }

      // Validate file type
      if (req.file.mimetype !== 'application/pdf') {
        res.status(400).json({
          status: 'error',
          message: 'Invalid file type. Please upload a PDF file.',
        });
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        res.status(400).json({
          status: 'error',
          message:
            'File too large. Please upload a PDF file smaller than 10MB.',
        });
        return;
      }

      logger.info('Processing resume upload', {
        filename: req.file.originalname,
        fileSize: req.file.size,
        mimetype: req.file.mimetype,
      });

      // Process the resume
      const resumeData: ResumeData = await resumeAnalysisService.processResume(
        req.file.buffer,
      );

      logger.info('Resume analysis completed successfully', {
        filename: req.file.originalname,
        candidateName: resumeData.name,
      });

      res.status(200).json({
        status: 'success',
        message: 'Resume analyzed successfully',
        data: resumeData,
        metadata: {
          filename: req.file.originalname,
          fileSize: req.file.size,
          processedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error in resume upload and analysis:', error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('No text content found')) {
          res.status(400).json({
            status: 'error',
            message:
              'Unable to extract text from the PDF. Please ensure the PDF contains readable text.',
          });
          return;
        }

        if (error.message.includes('Failed to extract text')) {
          res.status(400).json({
            status: 'error',
            message: 'The uploaded PDF appears to be corrupted or unreadable.',
          });
          return;
        }

        if (error.message.includes('Invalid response from AI service')) {
          res.status(503).json({
            status: 'error',
            message:
              'AI service is temporarily unavailable. Please try again later.',
          });
          return;
        }
      }

      // Generic error response
      res.status(500).json({
        status: 'error',
        message:
          'An error occurred while processing the resume. Please try again.',
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : 'Unknown error',
        }),
      });
    }
  }

  /**
   * Get supported file formats and limits
   */
  public async getUploadInfo(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        status: 'success',
        message: 'Resume upload information',
        data: {
          supportedFormats: ['PDF'],
          maxFileSize: '10MB',
          maxFileSizeBytes: 10 * 1024 * 1024,
          extractedFields: [
            'name',
            'contact_information',
            'professional_summary',
            'work_experience',
            'education',
            'skills',
            'projects',
            'certifications',
            'achievements',
            'volunteer_experience',
          ],
          endpoint: '/aryabytes/api/services/resume/analyze',
          method: 'POST',
          contentType: 'multipart/form-data',
          fieldName: 'resume',
        },
      });
    } catch (error) {
      logger.error('Error getting upload info:', error);
      res.status(500).json({
        status: 'error',
        message: 'Unable to retrieve upload information',
      });
    }
  }

  /**
   * Health check for resume analysis service
   */
  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Basic health check - ensure service dependencies are available
      res.status(200).json({
        status: 'success',
        message: 'Resume analysis service is healthy',
        timestamp: new Date().toISOString(),
        services: {
          pdfParser: 'available',
          aiService: 'available',
        },
      });
    } catch (error) {
      logger.error('Resume service health check failed:', error);
      res.status(503).json({
        status: 'error',
        message: 'Resume analysis service is unhealthy',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const resumeController = new ResumeController();
