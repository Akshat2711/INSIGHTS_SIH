# Resume Analysis API Documentation

## Overview

The Resume Analysis API provides intelligent parsing and extraction of structured data from PDF resume files using AI-powered analysis. It accepts PDF uploads and returns comprehensive, structured JSON data containing all relevant information from the resume.

## Features

- **PDF Text Extraction**: Converts PDF resume files to text
- **AI-Powered Analysis**: Uses Gemini AI to intelligently parse and structure resume data
- **Comprehensive Data Extraction**: Extracts personal information, work experience, education, skills, projects, certifications, and more
- **Robust Error Handling**: Provides detailed error messages and validation
- **File Upload Validation**: Ensures only valid PDF files are processed
- **Rate Limiting**: Built-in protection against abuse

## API Endpoints

### 1. Analyze Resume

**Endpoint**: `POST /aryabytes/api/services/resume/analyze`

**Description**: Upload and analyze a resume PDF file

**Content-Type**: `multipart/form-data`

**Parameters**:

- `resume` (File, required): PDF file to analyze (max 10MB)

**Response**:

```json
{
  "status": "success",
  "message": "Resume analyzed successfully",
  "data": {
    "name": "John Doe",
    "contact_information": {
      "email": "john.doe@example.com",
      "phone": "+1-555-0123",
      "address": "123 Main St, City, State 12345",
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe",
      "portfolio": "https://johndoe.dev"
    },
    "professional_summary": "Experienced software developer with 5+ years...",
    "work_experience": [
      {
        "company": "Tech Corp",
        "position": "Senior Software Engineer",
        "duration": "2020-Present",
        "location": "San Francisco, CA",
        "responsibilities": [
          "Led development of microservices architecture",
          "Mentored junior developers"
        ]
      }
    ],
    "education": [
      {
        "institution": "University of Technology",
        "degree": "Bachelor of Science",
        "field_of_study": "Computer Science",
        "graduation_date": "2018",
        "gpa": "3.8"
      }
    ],
    "skills": {
      "technical_skills": ["JavaScript", "Python", "React", "Node.js"],
      "soft_skills": ["Leadership", "Communication", "Problem Solving"],
      "languages": ["English", "Spanish"]
    },
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Built a full-stack e-commerce solution",
        "technologies": ["React", "Node.js", "MongoDB"],
        "duration": "6 months",
        "url": "https://github.com/johndoe/ecommerce"
      }
    ],
    "certifications": [
      {
        "name": "AWS Solutions Architect",
        "issuer": "Amazon Web Services",
        "date": "2023-01-15",
        "expiry_date": "2026-01-15"
      }
    ],
    "achievements": [
      "Employee of the Year 2022",
      "Published 3 technical articles"
    ],
    "volunteer_experience": [
      {
        "organization": "Code for Good",
        "role": "Technical Mentor",
        "duration": "2021-Present",
        "description": "Mentoring underprivileged youth in programming"
      }
    ]
  },
  "metadata": {
    "filename": "john_doe_resume.pdf",
    "fileSize": 245760,
    "processedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Upload Information

**Endpoint**: `GET /aryabytes/api/services/resume/info`

**Description**: Get information about upload requirements and supported formats

**Response**:

```json
{
  "status": "success",
  "message": "Resume upload information",
  "data": {
    "supportedFormats": ["PDF"],
    "maxFileSize": "10MB",
    "maxFileSizeBytes": 10485760,
    "extractedFields": [
      "name",
      "contact_information",
      "professional_summary",
      "work_experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "achievements",
      "volunteer_experience"
    ],
    "endpoint": "/aryabytes/api/services/resume/analyze",
    "method": "POST",
    "contentType": "multipart/form-data",
    "fieldName": "resume"
  }
}
```

### 3. Health Check

**Endpoint**: `GET /aryabytes/api/services/resume/health`

**Description**: Check the health status of the resume analysis service

**Response**:

```json
{
  "status": "success",
  "message": "Resume analysis service is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "pdfParser": "available",
    "aiService": "available"
  }
}
```

## Error Responses

### File Upload Errors

**Invalid File Type**:

```json
{
  "status": "error",
  "message": "Invalid file type. Only PDF files are allowed."
}
```

**File Too Large**:

```json
{
  "status": "error",
  "message": "File too large. Maximum size allowed is 10MB."
}
```

**No File Uploaded**:

```json
{
  "status": "error",
  "message": "No PDF file uploaded. Please upload a resume PDF file."
}
```

### Processing Errors

**PDF Text Extraction Failed**:

```json
{
  "status": "error",
  "message": "Unable to extract text from the PDF. Please ensure the PDF contains readable text."
}
```

**AI Service Unavailable**:

```json
{
  "status": "error",
  "message": "AI service is temporarily unavailable. Please try again later."
}
```

## Usage Examples

### cURL Example

```bash
curl -X POST \
  http://localhost:3000/aryabytes/api/services/resume/analyze \
  -H "Content-Type: multipart/form-data" \
  -F "resume=@/path/to/resume.pdf"
```

### JavaScript (Fetch API) Example

```javascript
const formData = new FormData();
formData.append('resume', fileInput.files[0]);

fetch('/aryabytes/api/services/resume/analyze', {
  method: 'POST',
  body: formData,
})
  .then((response) => response.json())
  .then((data) => {
    console.log('Resume analysis result:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
```

### Python Example

```python
import requests

url = 'http://localhost:3000/aryabytes/api/services/resume/analyze'
files = {'resume': ('resume.pdf', open('resume.pdf', 'rb'), 'application/pdf')}

response = requests.post(url, files=files)
result = response.json()
print(result)
```

## Data Schema

### ResumeData Interface

```typescript
interface ResumeData {
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
```

## Configuration

### Environment Variables

Ensure the following environment variables are set:

```env
# Gemini AI Configuration
LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
LLM_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Rate Limiting

The API includes rate limiting:

- **Window**: 15 minutes
- **Max Requests**: 100 per IP address per window
- **Response**: 429 Too Many Requests when limit exceeded

## Security Features

- **File Type Validation**: Only PDF files accepted
- **File Size Limits**: Maximum 10MB file size
- **Helmet Security Headers**: Protection against common vulnerabilities
- **Rate Limiting**: Protection against abuse
- **Input Sanitization**: All inputs are validated and sanitized

## Dependencies

- **pdf-parse**: PDF text extraction
- **multer**: File upload handling
- **@types/multer**: TypeScript types for multer
- **@types/pdf-parse**: TypeScript types for pdf-parse

## Best Practices

1. **File Validation**: Always validate file type and size before upload
2. **Error Handling**: Implement proper error handling for all scenarios
3. **Rate Limiting**: Respect rate limits to avoid being blocked
4. **File Cleanup**: Files are processed in memory and automatically cleaned up
5. **Security**: Never upload executable files or malicious content

## Support

For issues, questions, or feature requests, please check the main project documentation or contact the development team.
