import { useState } from 'react';
import { searchJobs, matchJobs } from '../utils/api';
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
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Подбор вакансий</h2>
      <p className="text-gray-600 mb-6">
        Вставьте текст вашего резюме и ключевые слова для поиска. AI подберёт подходящие вакансии и покажет процент совпадения.
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block mb-2 text-sm font-medium">
            Текст вашего резюме
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Вставьте текст резюме или краткое описание ваших навыков и опыта..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[120px]"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Ключевые слова (например: Python разработчик, Frontend developer)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Python разработчик"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Ищем и анализируем...' : 'Найти подходящие вакансии'}
        </button>
      </div>

      {loading && <LoadingSpinner />}

      {/* Результаты */}
      {jobs.length > 0 && !loading && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">
            Найдено вакансий: {jobs.length}
          </h3>

          {jobs.map((job, index) => (
            <div key={index} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Заголовок вакансии */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-blue-600 mb-1">
                    {job.name}
                  </h4>
                  <p className="text-gray-600">{job.company}</p>
                </div>
                
                {/* Процент совпадения */}
                {job.match && (
                  <div className="text-right">
                    <div className={`${getMatchColor(job.match.match_percentage)} text-white px-4 py-2 rounded-full font-bold`}>
                      {job.match.match_percentage}%
                    </div>
                  </div>
                )}
              </div>

              {/* Анализ совпадения */}
              {job.match && (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium text-blue-800 mb-1">Почему подходит:</p>
                    <p className="text-sm text-blue-700">{job.match.reason}</p>
                  </div>

                  {job.match.missing_skills && job.match.missing_skills.length > 0 && (
                    <div className="bg-orange-50 p-3 rounded">
                      <p className="text-sm font-medium text-orange-800 mb-1">Нужно подтянуть:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.match.missing_skills.map((skill, i) => (
                          <span key={i} className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ссылка на вакансию */}
             {job.url && (
  <a
    href={job.url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block mt-4 text-blue-600 hover:underline"
  >
    Посмотреть вакансию →
  </a>
)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobMatcher;