import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/api/analyze-resume`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const startInterview = async (position, level = 'junior') => {
  const response = await api.post('/api/interview/start', { position, level });
  return response.data;
};

export const evaluateAnswer = async (question, answer, position) => {
  const response = await api.post('/api/interview/evaluate', {
    question,
    answer,
    position
  });
  return response.data;
};

export const searchJobs = async (keywords, area = '1') => {
  const response = await api.post('/api/jobs/search', { keywords, area });
  return response.data;
};

export const matchJobs = async (resumeText, keywords) => {
  const response = await api.post('/api/jobs/match', {
    resume_text: resumeText,
    keywords
  });
  return response.data;
};

export const generateCoverLetter = async (resumeText, vacancyName, companyName, requirements) => {
  const response = await api.post('/api/cover-letter/generate', {
    resume_text: resumeText,
    vacancy_name: vacancyName,
    company_name: companyName,
    requirements
  });
  return response.data;
};

export default api;