import { useState } from 'react';
import { matchJobs } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

function JobMatcher() {
  const [resumeText, setResumeText] = useState('');
  const [keywords, setKeywords] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!keywords.trim() || !resumeText.trim()) {
      alert('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      const result = await matchJobs(resumeText, keywords);
      setJobs(result.jobs);
    } catch (err) {
      console.error(err);
      alert('Ошибка при поиске вакансий');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500 shadow-green-200 dark:shadow-green-900/20';
    if (percentage >= 60) return 'bg-yellow-500 shadow-yellow-200 dark:shadow-yellow-900/20';
    return 'bg-red-500 shadow-red-200 dark:shadow-red-900/20';
  };

  return (
    <div className="max-w-5xl mx-auto p-4 transition-colors duration-300">
      {/* Заголовок */}
      <div className="mb-8">
        <h2 className="text-4xl font-black mb-3 text-gray-900 dark:text-white">
          Умный подбор вакансий
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          AI проанализирует ваше резюме и найдет идеальное совпадение по ключевым словам.
        </p>
      </div>

      {/* Форма ввода */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-10 transition-all">
        <div className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Текст вашего резюме
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Вставьте опыт работы и ключевые навыки..."
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[150px]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Ключевые слова
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Например: Frontend Developer, React, Node.js"
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-400 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-all shadow-lg active:scale-[0.98]"
          >
            {loading ? 'ИИ ищет лучшие варианты...' : 'Найти подходящие вакансии ✨'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {/* Результаты */}
      {jobs.length > 0 && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">🎯</span> Найдено вариантов: {jobs.length}
          </h3>

          <div className="grid gap-6">
            {jobs.map((job, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1 group-hover:text-blue-500 transition-colors">
                      {job.name}
                    </h4>
                    <p className="text-gray-800 dark:text-gray-200 font-medium mb-3">{job.company}</p>
                    
                    {/* Причина совпадения */}
                    {job.match && (
                      <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-2">Почему AI рекомендует:</p>
                        <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                          {job.match.reason}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Процент */}
                  {job.match && (
                    <div className="flex flex-col items-center min-w-[100px]">
                      <div className={`${getMatchColor(job.match.match_percentage)} text-white px-4 py-3 rounded-2xl font-black text-xl shadow-lg`}>
                        {job.match.match_percentage}%
                      </div>
                      <span className="text-[10px] mt-2 text-gray-400 uppercase font-bold tracking-tighter">Совпадение</span>
                    </div>
                  )}
                </div>

                {/* Недостающие навыки */}
                {job.match?.missing_skills?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase mb-2">Стоит изучить для этой вакансии:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.match.missing_skills.map((skill, i) => (
                        <span 
                          key={i} 
                          className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-semibold border border-orange-200 dark:border-orange-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ссылка */}
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-6 text-blue-600 dark:text-blue-400 font-bold hover:gap-2 transition-all"
                  >
                    Перейти к вакансии <span className="ml-1 transition-all">→</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default JobMatcher;