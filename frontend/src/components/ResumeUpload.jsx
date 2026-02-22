import { useState } from 'react';
import { analyzeResume } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import Typewriter from './Typewriter';

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Только PDF или DOCX файлы');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setAnalysis(null);
    setError(null);

    try {
      const result = await analyzeResume(file);
      setAnalysis(result.analysis);
    } catch (err) {
      setError('Ошибка при анализе. Попробуйте снова.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 transition-colors duration-300">
      <h2 className="text-4xl font-black mb-6 text-gray-900 dark:text-white tracking-tight">
        Анализ резюме <span className="text-blue-600 dark:text-blue-500">AI</span>
      </h2>
      
      {/* Загрузка файла */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-10 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all group relative overflow-hidden">
        <label className="block mb-4 text-sm font-bold text-gray-700 dark:text-gray-300 text-center uppercase tracking-widest">
          Перетащите файл или выберите на диске
        </label>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 dark:file:bg-blue-500 dark:hover:file:bg-blue-400 cursor-pointer"
        />
        {file && (
          <div className="mt-4 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 animate-bounce">
            <span className="text-xl">📎</span>
            <span className="font-bold">{file.name}</span>
          </div>
        )}
        {error && (
          <p className="mt-4 text-sm text-center text-red-600 dark:text-red-400 font-bold">{error}</p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-blue-600 dark:bg-blue-500 text-white px-6 py-5 rounded-2xl font-black text-xl hover:bg-blue-700 dark:hover:bg-blue-400 disabled:bg-gray-300 dark:disabled:bg-gray-800 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
      >
        {loading ? '🚀 ИИ читает ваше резюме...' : 'Проанализировать профиль'}
      </button>

      {loading && (
        <div className="flex flex-col items-center my-12 animate-pulse">
          <LoadingSpinner />
          <p className="mt-6 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tighter text-xs text-center">
            Алгоритмы оценивают вашу конкурентоспособность...
          </p>
        </div>
      )}

      {/* Результаты */}
      {analysis && !loading && (
        <div className="mt-12 space-y-8 animate-in fade-in zoom-in-95 duration-700">
          
          {/* Общая оценка */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-10 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-black tracking-tight">Ваш Score</h3>
                  <div className="flex flex-col items-end">
                    <span className="text-7xl font-black leading-none">{analysis.overall_score}</span>
                    <span className="text-lg opacity-80 font-bold">из 100</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 dark:bg-black/20 rounded-full h-5 backdrop-blur-md p-1 border border-white/10">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                    style={{ width: `${analysis.overall_score}%` }}
                  ></div>
                </div>
            </div>
            {/* Декоративный круг */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Сетка мини-карт */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCard label="Структура" score={analysis.structure_score} />
            <ScoreCard label="Опыт" score={analysis.experience_score} />
            <ScoreCard label="Навыки" score={analysis.skills_score} />
            <ScoreCard label="Грамматика" score={analysis.grammar_score} />
          </div>

          {/* Рекомендации */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-sm">
            <h4 className="text-2xl font-black mb-6 flex items-center text-gray-900 dark:text-white">
              <span className="mr-3 bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-lg">💡</span> 
              Путь к улучшению
            </h4>
            <div className="space-y-4">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-transparent dark:border-gray-700/50 transition-all hover:border-blue-200 dark:hover:border-blue-900/50">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-4 flex-shrink-0 mt-1">
                    {i + 1}
                  </span>
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    <Typewriter text={rec} speed={10} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FeedbackBox 
               type="strengths" 
               title="Сильные стороны" 
               emoji="✅" 
               data={analysis.strengths} 
               baseColor="green" 
            />
            <FeedbackBox 
               type="weaknesses" 
               title="Слабые стороны" 
               emoji="⚠️" 
               data={analysis.weaknesses} 
               baseColor="orange" 
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* Вспомогательный компонент для карточек баллов */
function ScoreCard({ label, score }) {
  const getColor = (s) => {
    if (s >= 80) return 'text-green-600 dark:text-green-400';
    if (s >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm text-center transition-all hover:scale-105">
      <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black mb-2 tracking-widest">{label}</p>
      <p className={`text-3xl font-black ${getColor(score)}`}>
        {score}
      </p>
    </div>
  );
}

/* Компонент для списков Сильных/Слабых сторон */
function FeedbackBox({ title, emoji, data, baseColor }) {
  const styles = {
    green: "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30 text-green-800 dark:text-green-300",
    orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30 text-orange-800 dark:text-orange-300"
  };

  return (
    <div className={`${styles[baseColor]} border rounded-3xl p-8 shadow-sm transition-all`}>
      <h4 className="text-xl font-black mb-5 flex items-center uppercase tracking-tight">
        <span className="mr-2">{emoji}</span> {title}
      </h4>
      <ul className="space-y-4">
        {data.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm font-semibold leading-relaxed">
            <span className="opacity-40 mt-1">•</span>
            <Typewriter text={item} speed={15} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ResumeUpload;