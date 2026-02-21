import { useState } from 'react';
import { analyzeResume } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

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
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Анализ резюме</h2>
      
      {/* Загрузка файла */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Загрузите ваше резюме (PDF или DOCX)
        </label>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Выбран файл: {file.name}
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Анализируем...' : 'Проанализировать резюме'}
      </button>

      {/* Загрузка */}
      {loading && <LoadingSpinner />}

      {/* Результаты */}
      {analysis && !loading && (
        <div className="mt-8 space-y-6">
          {/* Общая оценка */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">
              Общая оценка: {analysis.overall_score}/100
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${analysis.overall_score}%` }}
              ></div>
            </div>
          </div>

          {/* Детальные оценки */}
          <div className="grid grid-cols-2 gap-4">
            <ScoreCard label="Структура" score={analysis.structure_score} />
            <ScoreCard label="Опыт" score={analysis.experience_score} />
            <ScoreCard label="Навыки" score={analysis.skills_score} />
            <ScoreCard label="Грамматика" score={analysis.grammar_score} />
          </div>

          {/* Рекомендации */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="text-xl font-semibold mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Рекомендации по улучшению
            </h4>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-600 mr-2">{i + 1}.</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Сильные стороны */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-xl font-semibold mb-4 flex items-center text-green-800">
              <span className="mr-2">✅</span>
              Сильные стороны
            </h4>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, i) => (
                <li key={i} className="text-green-700">• {strength}</li>
              ))}
            </ul>
          </div>

          {/* Слабые стороны */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h4 className="text-xl font-semibold mb-4 flex items-center text-orange-800">
              <span className="mr-2">⚠️</span>
              Что нужно улучшить
            </h4>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, i) => (
                <li key={i} className="text-orange-700">• {weakness}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент для отображения оценки
function ScoreCard({ label, score }) {
  const getColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${getColor(score)}`}>
        {score}/100
      </p>
    </div>
  );
}

export default ResumeUpload;