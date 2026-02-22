import { useState } from 'react';
import { generateCoverLetter } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import Typewriter from './Typewriter'; // Импорт нашего нового компонента

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
    setLetter(''); // Очищаем старое письмо перед новой генерацией
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
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Генератор сопроводительных писем</h2>
      <p className="text-gray-600 mb-6">
        AI создаст персонализированное сопроводительное письмо на основе вашего резюме и описания вакансии.
      </p>

      <div className="space-y-4 mb-6 bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Текст вашего резюме <span className="text-red-500">*</span>
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Вставьте текст резюме или краткое описание ваших навыков..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px] outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Название вакансии <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={vacancyName}
              onChange={(e) => setVacancyName(e.target.value)}
              placeholder="Например: Python разработчик"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Название компании <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Например: Astana Hub"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Требования к кандидату (опционально)
          </label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="React, Python, опыт работы с API..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px] outline-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transform active:scale-95 transition-all shadow-lg"
        >
          {loading ? 'ИИ думает и пишет...' : 'Сгенерировать письмо ✨'}
        </button>
      </div>

      {loading && <div className="my-8"><LoadingSpinner /></div>}

      {/* Результат с анимацией */}
      {letter && !loading && (
        <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-xl animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800">Ваше письмо готово</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg text-sm flex items-center gap-1 transition-colors"
                title="Копировать"
              >
                📋 Копировать
              </button>
              <button
                onClick={handleDownload}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg text-sm flex items-center gap-1 transition-colors"
                title="Скачать"
              >
                💾 Скачать
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg text-gray-800 leading-relaxed font-sans shadow-inner border border-gray-100 min-h-[200px]">
            {/* Вот она, наша анимация! */}
            <Typewriter text={letter} speed={15} />
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
            <p className="text-sm text-yellow-800 italic">
              💡 <strong>Совет:</strong> Это письмо — отличная база. Добавьте в него пару личных деталей, чтобы сделать его еще более искренним.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoverLetterGen;