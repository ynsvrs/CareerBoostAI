import { useState } from 'react';
import { matchJobs } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

function JobMatcher() {
  const [resumeText, setResumeText] = useState('');
  const [keywords, setKeywords] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!keywords.trim() || !resumeText.trim()) {
      alert('Заполните все поля');
      return;
    }

    setLoading(true);
    setHasSearched(false);
    try {
      const result = await matchJobs(resumeText, keywords);
      if (result && Array.isArray(result.jobs)) {
        setJobs(result.jobs);
      } else {
        setJobs([]);
      }
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      alert('Ошибка при поиске');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-4xl mx-auto p-5 transition-colors duration-300">
      {/* Заголовок — теперь аккуратный text-2xl/3xl вместо 5xl */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Подбор вакансий <span className="text-blue-600">AI</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Найдите идеальное совпадение по вашему опыту и навыкам.
        </p>
      </div>

      {/* Форма ввода — уменьшил падинги и текст */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Текст резюме
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Опыт, навыки..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px] text-sm"
            />
          </div>

          <div>
            <label className="block mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Должность / Ключевые слова
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Например: Python Developer"
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-base transition-all active:scale-[0.98] disabled:bg-slate-300"
          >
            {loading ? '🔍 Поиск...' : 'Найти вакансии'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center py-6">
          <LoadingSpinner />
          <p className="mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Анализируем базу...</p>
        </div>
      )}

      {hasSearched && jobs.length === 0 && !loading && (
        <div className="text-center p-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 text-sm">Ничего не найдено. Попробуйте изменить запрос.</p>
        </div>
      )}

      {/* Результаты — Компактные карточки */}
      {jobs.length > 0 && !loading && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">
            Найдено вариантов: {jobs.length}
          </h3>

          <div className="grid gap-4">
            {jobs.map((job, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {job.name}
                    </h4>
                    <p className="text-blue-600 text-sm font-semibold">{job.company}</p>
                    
                    {job.match && (
                      <div className="mt-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed italic">
                          "{job.match.reason}"
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {job.match && (
                    <div className="flex flex-col items-center min-w-[70px]">
                      <div className={`${getMatchColor(job.match.match_percentage)} text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-sm`}>
                        {job.match.match_percentage}%
                      </div>
                      <span className="text-[8px] mt-2 text-slate-400 uppercase font-bold">Match</span>
                    </div>
                  )}
                </div>

                {job.match?.missing_skills?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2">
                      {job.match.missing_skills.map((skill, i) => (
                        <span key={i} className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-lg text-[10px] font-bold border border-orange-100 dark:border-orange-800/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 underline transition-colors"
                  >
                    Подробнее →
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