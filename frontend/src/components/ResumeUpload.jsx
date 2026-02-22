import { useState } from 'react';
import { analyzeResume } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import Typewriter from './Typewriter'; // Не забываем импорт!

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
    setAnalysis(null); // Очищаем старый анализ перед новым
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
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Анализ резюме по 100-балльной шкале</h2>
      
      {/* Загрузка файла */}
      <div className="mb-6 bg-white p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
        <label className="block mb-4 text-sm font-medium text-gray-700 text-center">
          Загрузите ваше резюме (PDF или DOCX)
        </label>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
        {file && (
          <p className="mt-3 text-sm text-center text-blue-600 font-medium italic">
            📎 Выбран файл: {file.name}
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-center text-red-600">{error}</p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
      >
        {loading ? 'ИИ читает ваше резюме...' : 'Проанализировать резюме '}
      </button>

      {loading && (
        <div className="flex flex-col items-center my-10">
          <LoadingSpinner />
          <p className="mt-4 text-gray-500 animate-pulse font-medium">Это может занять до 15 секунд...</p>
        </div>
      )}

      {/* Результаты */}
      {analysis && !loading && (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Общая оценка */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-2xl font-bold">Общий рейтинг профиля</h3>
              <span className="text-5xl font-black">{analysis.overall_score}<span className="text-xl opacity-60">/100</span></span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 backdrop-blur-sm">
              <div
                className="bg-white h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${analysis.overall_score}%` }}
              ></div>
            </div>
          </div>

          {/* Детальные оценки */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCard label="Структура" score={analysis.structure_score} />
            <ScoreCard label="Опыт" score={analysis.experience_score} />
            <ScoreCard label="Навыки" score={analysis.skills_score} />
            <ScoreCard label="Грамматика" score={analysis.grammar_score} />
          </div>

          {/* Рекомендации (Анимированные) */}
          <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xl font-bold mb-4 flex items-center text-gray-800">
              <span className="mr-2">💡</span> Рекомендации по улучшению
            </h4>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start bg-gray-50 p-3 rounded-lg">
                  <span className="text-blue-600 font-bold mr-3">{i + 1}.</span>
                  <div className="text-gray-700 leading-relaxed">
                    {/* Печатаем каждую рекомендацию */}
                    <Typewriter text={rec} speed={10} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             {/* Сильные стороны */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 shadow-sm">
              <h4 className="text-lg font-bold mb-4 flex items-center text-green-800">
                <span className="mr-2">✅</span> Сильные стороны
              </h4>
              <ul className="space-y-3">
                {analysis.strengths.map((strength, i) => (
                  <li key={i} className="text-green-700 flex items-start gap-2">
                    <span>•</span>
                    <Typewriter text={strength} speed={15} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Слабые стороны */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 shadow-sm">
              <h4 className="text-lg font-bold mb-4 flex items-center text-orange-800">
                <span className="mr-2">⚠️</span> Что нужно улучшить
              </h4>
              <ul className="space-y-3">
                {analysis.weaknesses.map((weakness, i) => (
                  <li key={i} className="text-orange-700 flex items-start gap-2">
                    <span>•</span>
                    <Typewriter text={weakness} speed={15} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, score }) {
  const getColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
      <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">{label}</p>
      <p className={`text-2xl font-black ${getColor(score)}`}>
        {score}
      </p>
    </div>
  );
}

export default ResumeUpload;