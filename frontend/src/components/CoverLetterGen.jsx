import { useState } from 'react';
import { generateCoverLetter } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

function CoverLetterGen() {
  const [resumeText, setResumeText] = useState('');
  const [vacancyName, setVacancyName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!resumeText.trim() || !vacancyName.trim() || !companyName.trim()) {
      alert('Заполните обязательные поля');
      return;
    }

    setLoading(true);
    try {
      const result = await generateCoverLetter(
        resumeText,
        vacancyName,
        companyName,
        requirements
      );
      setLetter(result.letter);
    } catch (err) {
      console.error(err);
      alert('Ошибка при генерации письма');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letter);
    alert('Письмо скопировано в буфер обмена!');
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([letter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover_letter_${companyName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Генератор сопроводительных писем</h2>
      <p className="text-gray-600 mb-6">
        AI создаст персонализированное сопроводительное письмо на основе вашего резюме и описания вакансии.
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block mb-2 text-sm font-medium">
            Текст вашего резюме <span className="text-red-500">*</span>
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Вставьте текст резюме..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Название вакансии <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={vacancyName}
              onChange={(e) => setVacancyName(e.target.value)}
              placeholder="Frontend Developer"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Название компании <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Yandex"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Требования к кандидату (опционально)
          </label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="React, TypeScript, опыт 2+ года..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Генерируем письмо...' : 'Сгенерировать письмо'}
        </button>
      </div>

      {loading && <LoadingSpinner />}

      {/* Результат */}
      {letter && !loading && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Ваше сопроводительное письмо</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm font-medium"
              >
                📋 Копировать
              </button>
              <button
                onClick={handleDownload}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded text-sm font-medium"
              >
                💾 Скачать
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm">
            {letter}
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              💡 <strong>Совет:</strong> Обязательно прочитайте письмо и отредактируйте под себя. 
              Добавьте личные детали и убедитесь, что стиль вам подходит.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoverLetterGen;