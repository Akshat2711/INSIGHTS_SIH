import pdf from 'pdf-parse';
import { llmRequest } from './llm';
import logger from '../utils/logger';

// Define the resume data structure
export interface ResumeData {
  name: string;
  contact_information: {
    email?: string;
    phone?: string;
    address?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  professional_summary?: string;
  work_experience: Array<{
    company: string;
    position: string;
    duration: string;
    location?: string;
    responsibilities: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field_of_study?: string;
    graduation_date?: string;
    gpa?: string;
  }>;
  skills: {
    technical_skills: string[];
    soft_skills: string[];
    languages?: string[];
  };
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    duration?: string;
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
    expiry_date?: string;
  }>;
  achievements?: string[];
  volunteer_experience?: Array<{
    organization: string;
    role: string;
    duration?: string;
    description: string;
  }>;
}

// Response schema for Gemini AI
const resumeResponseSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Full name of the candidate',
    },
    contact_information: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        phone: { type: 'string' },
        address: { type: 'string' },
        linkedin: { type: 'string' },
        github: { type: 'string' },
        portfolio: { type: 'string' },
      },
    },
    professional_summary: {
      type: 'string',
      description: 'Professional summary or objective',
    },
    work_experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          position: { type: 'string' },
          duration: { type: 'string' },
          location: { type: 'string' },
          responsibilities: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['company', 'position', 'duration'],
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          institution: { type: 'string' },
          degree: { type: 'string' },
          field_of_study: { type: 'string' },
          graduation_date: { type: 'string' },
          gpa: { type: 'string' },
        },
        required: ['institution', 'degree'],
      },
    },
    skills: {
      type: 'object',
      properties: {
        technical_skills: {
          type: 'array',
          items: { type: 'string' },
        },
        soft_skills: {
          type: 'array',
          items: { type: 'string' },
        },
        languages: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['technical_skills', 'soft_skills'],
    },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          technologies: {
            type: 'array',
            items: { type: 'string' },
          },
          duration: { type: 'string' },
          url: { type: 'string' },
        },
        required: ['name', 'description', 'technologies'],
      },
    },
    certifications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          issuer: { type: 'string' },
          date: { type: 'string' },
          expiry_date: { type: 'string' },
        },
        required: ['name', 'issuer'],
      },
    },
    achievements: {
      type: 'array',
      items: { type: 'string' },
    },
    volunteer_experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          organization: { type: 'string' },
          role: { type: 'string' },
          duration: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['organization', 'role', 'description'],
      },
    },
  },
  required: [
    'name',
    'contact_information',
    'work_experience',
    'education',
    'skills',
  ],
};

export class ResumeAnalysisService {
  /**
   * Extract text from PDF buffer
   */
  private async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await pdf(pdfBuffer);
      return data.text;
    } catch (error) {
      logger.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  /**
   * Analyze resume text using Gemini AI
   */
  private async analyzeResumeWithAI(resumeText: string): Promise<ResumeData> {
    try {
      const systemPrompt = `You are an expert resume parser and analyzer. Your task is to extract structured information from resume text and return it in a well-organized JSON format.

Instructions:
1. Extract all relevant information from the resume text
2. Organize the information according to the provided schema
3. If certain information is not available, omit those fields or use empty arrays/objects as appropriate
4. For work experience, extract key responsibilities and achievements
5. Categorize skills into technical and soft skills appropriately
6. Extract education details including degrees, institutions, and dates
7. Identify projects, certifications, and achievements mentioned
8. Parse contact information carefully, extracting emails, phone numbers, and social media links
9. Ensure all extracted information is accurate and properly formatted
10. Return only valid JSON that matches the schema

Please be thorough and accurate in your extraction.`;

      const userQuery = `Please analyze and extract structured information from this resume:\n\n${resumeText}`;

      const response = await llmRequest({
        system_prompt: systemPrompt,
        user_query: userQuery,
        responseSchema: resumeResponseSchema,
      });

      if (!response || !response.candidates || !response.candidates[0]) {
        throw new Error('Invalid response from AI service');
      }

      const extractedData = response.candidates[0].content.parts[0].text;

      try {
        // Parse the JSON response
        const clean_raw_response = extractedData
          .replace(/```[a-z]*\n?/gi, '')
          .replace(/```/g, '')
          .trim();
        const resumeData = JSON.parse(clean_raw_response);
        return resumeData as ResumeData;
      } catch (parseError) {
        logger.error('Error parsing AI response as JSON:', parseError);
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      logger.error('Error analyzing resume with AI:', error);
      throw error;
    }
  }

  /**
   * Process resume PDF and extract structured data
   */
  public async processResume(pdfBuffer: Buffer): Promise<ResumeData> {
    try {
      // Step 1: Extract text from PDF
      logger.info('Extracting text from PDF...');
      const resumeText = await this.extractTextFromPDF(pdfBuffer);

      if (!resumeText || resumeText.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      logger.info('Successfully extracted text from PDF', {
        textLength: resumeText.length,
      });

      // Step 2: Analyze with AI
      logger.info('Analyzing resume with AI...');
      const structuredData = await this.analyzeResumeWithAI(resumeText);

      logger.info('Successfully analyzed resume', {
        hasName: !!structuredData.name,
        hasContact: !!structuredData.contact_information,
        workExperienceCount: structuredData.work_experience?.length || 0,
        educationCount: structuredData.education?.length || 0,
        skillsCount:
          (structuredData.skills?.technical_skills?.length || 0) +
          (structuredData.skills?.soft_skills?.length || 0),
      });

      return structuredData;
    } catch (error) {
      logger.error('Error processing resume:', error);
      throw error;
    }
  }
}

export const resumeAnalysisService = new ResumeAnalysisService();
