import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Общий экземпляр axios с json (используем для большинства запросов)
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Анализ резюме — multipart, всё правильно
export const analyzeResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    // formData.append('target_role', ''); // можно добавить если нужно

    const response = await axios.post(`${API_URL}/api/analyze-resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log('[analyzeResume] success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[analyzeResume] error:', error.response?.data || error.message);
    throw error;
  }
};

// Запуск собеседования — role вместо position
export const startInterview = async (position, level = 'junior') => {
  try {
    const payload = {
      role: position.trim(),
      level: level.trim().toLowerCase(),
    };

    console.log('[startInterview] sending:', payload);

    const response = await api.post('/api/interview/start', payload);

    console.log('[startInterview] received:', response.data);
    return response.data;
  } catch (error) {
    console.error('[startInterview] error:', error.response?.data || error.message);
    throw error;
  }
};

// ОЦЕНКА ОТВЕТА — ИСПРАВЛЕНО: используем FormData !!!
export const evaluateAnswer = async (question, answer, position) => {
  try {
    const formData = new FormData();
    formData.append('question', question.trim());
    formData.append('answer', answer.trim());
    formData.append('position', position.trim());

    console.log('[evaluateAnswer] sending FormData:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${String(value).substring(0, 80)}${String(value).length > 80 ? '...' : ''}`);
    }

    // Важно: НЕ используем api-инстанс, т.к. он форсирует json
    const response = await axios.post(`${API_URL}/api/interview/evaluate`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log('[evaluateAnswer] success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[evaluateAnswer] error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

// Поиск вакансий (если используется)
export const searchJobs = async (keywords, area = '1') => {
  try {
    const response = await api.post('/api/jobs/search', { keywords, area });
    return response.data;
  } catch (error) {
    console.error('[searchJobs] error:', error);
    throw error;
  }
};

// Подбор вакансий — target_role вместо keywords
export const matchJobs = async (resumeText, keywords) => {
  try {
    const payload = {
      target_role: keywords.trim(),
      resume_text: resumeText.trim(),
      user_skills: [],
      top_k: 10,
    };

    console.log('[matchJobs] sending:', payload);

    const response = await api.post('/api/jobs/match', payload);

    console.log('[matchJobs] received:', response.data);
    return response.data;
  } catch (error) {
    console.error('[matchJobs] error:', error.response?.data || error.message);
    throw error;
  }
};

// Сопроводительное письмо — job_description вместо requirements
export const generateCoverLetter = async (
  resumeText,
  vacancyName,
  companyName,
  requirements
) => {
  try {
    const payload = {
      resume_text: resumeText.trim(),
      job_title: vacancyName.trim(),
      company: companyName.trim(),
      job_description: requirements.trim(),
      tone: 'professional',
    };

    console.log('[generateCoverLetter] sending:', payload);

    const response = await api.post('/api/cover-letter/generate', payload);

    console.log('[generateCoverLetter] received:', response.data);
    return response.data;
  } catch (error) {
    console.error('[generateCoverLetter] error:', error.response?.data || error.message);
    throw error;
  }
};

export default api;