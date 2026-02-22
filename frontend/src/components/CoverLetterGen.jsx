import { useState } from 'react';
import { generateCoverLetter } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import Typewriter from './Typewriter';

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
    setLetter(''); 
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
    alert('Письмо скопировано!');
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
    <div className="max-w-4xl mx-auto p-4 transition-colors duration-300">
      <h2 className="text-3xl font-black mb-2 text-gray-900 dark:text-white">Генератор писем</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        AI создаст персонализированное письмо, которое выделит вас среди других кандидатов.
      </p>

      {/* Форма ввода */}
      <div className="space-y-6 mb-10 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all">
        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
            Ваше резюме <span className="text-red-500">*</span>
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Вставьте текст или ключевой опыт..."
            className="w-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
              Вакансия <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={vacancyName}
              onChange={(e) => setVacancyName(e.target.value)}
              placeholder="Python Developer"
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
              Компания <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Astana Hub"
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
            Ключевые требования (опционально)
          </label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Навыки, которые важно подчеркнуть..."
            className="w-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-black text-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transform active:scale-[0.98] transition-all shadow-xl"
        >
          {loading ? '📝 ИИ составляет текст...' : 'Сгенерировать письмо ✨'}
        </button>
      </div>

      {loading && <div className="my-8 scale-110"><LoadingSpinner /></div>}

      {/* Результат */}
      {letter && !loading && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              <span>✉️</span> Готовое письмо
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-gray-200 dark:border-gray-600 shadow-sm"
              >
                📋 Копировать
              </button>
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
              >
                💾 Скачать .txt
              </button>
            </div>
          </div>

          <div className="p-8 dark:bg-gray-900/50 min-h-[300px]">
            <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed font-serif text-lg italic">
              <Typewriter text={letter} speed={10} />
            </div>
          </div>

          <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-t dark:border-amber-900/30">
            <p className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                <strong>Совет:</strong> Проверьте письмо и добавьте в него что-то личное о проектах компании. Это повысит шансы на ответ в 2 раза!
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoverLetterGen;