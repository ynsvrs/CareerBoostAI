import { useState } from 'react';
import { startInterview, evaluateAnswer } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import VoiceInput from './VoiceInput';
import Typewriter from './Typewriter';

function InterviewSimulator() {
  const [position, setPosition] = useState('');
  const [level, setLevel] = useState('junior');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const handleStart = async () => {
    if (!position.trim()) return;
    setLoading(true);
    try {
      const result = await startInterview(position, level);
      setQuestions(result.questions);
      setStarted(true);
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
      alert('Ошибка при генерации вопросов');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const result = await evaluateAnswer(
        questions[currentIndex].question,
        answer,
        position
      );
      setFeedback(result.evaluation);
    } catch (err) {
      console.error(err);
      alert('Ошибка при оценке ответа');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer('');
      setFeedback(null);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setPosition('');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswer('');
    setFeedback(null);
  };

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto p-4 transition-colors">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Симулятор собеседования</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
          Потренируйтесь отвечать на вопросы и получите профессиональный разбор от ИИ.
        </p>

        <div className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
              Позиция
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Например: Frontend Developer"
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
              Ваш уровень
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="junior">Junior</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || !position.trim()}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white px-6 py-4 rounded-xl font-black text-lg hover:bg-blue-700 dark:hover:bg-blue-400 disabled:bg-gray-400 dark:disabled:bg-gray-700 transition-all shadow-lg active:scale-95"
          >
            {loading ? 'Готовим вопросы...' : 'Начать собеседование 🚀'}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto p-4 transition-colors">
      {/* Прогресс */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Вопрос {currentIndex + 1} из {questions.length}</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">{position}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Карточка Вопроса */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-8 border-blue-600 dark:border-blue-500 p-8 rounded-2xl mb-8 shadow-md">
        <p className="text-xs text-blue-800 dark:text-blue-300 font-black mb-3 uppercase tracking-[0.2em]">
          {currentQuestion.type === 'general' && '💭 Общий вопрос'}
          {currentQuestion.type === 'technical' && '⚙️ Технический вопрос'}
          {currentQuestion.type === 'behavioral' && '🎯 Поведенческий вопрос'}
        </p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white leading-snug">
          {currentQuestion.question}
        </p>
      </div>

      {!feedback ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <VoiceInput
              value={answer}
              onChange={setAnswer}
              placeholder="Ваш ответ здесь..."
            />
          </div>

          <button
            onClick={handleSubmitAnswer}
            disabled={loading || !answer.trim()}
            className="w-full bg-green-600 dark:bg-green-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-green-700 dark:hover:bg-green-400 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-all shadow-lg shadow-green-200/20"
          >
            {loading ? 'ИИ анализирует...' : 'Отправить ответ ✅'}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Плашка с результатом */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Оценка ИИ</h3>
              <div className="relative flex items-center justify-center">
                 <span className="text-5xl font-black text-blue-600 dark:text-blue-400">{feedback.score}</span>
                 <span className="text-xl text-gray-400 dark:text-gray-500 ml-1">/10</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(feedback.score / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Секции обратной связи */}
          <FeedbackSection 
             title="Что хорошо" 
             emoji="✅" 
             bgColor="bg-green-50 dark:bg-green-900/20" 
             textColor="text-green-900 dark:text-green-100"
             accentColor="text-green-600"
             text={feedback.positive} 
          />

          <FeedbackSection 
             title="Что улучшить" 
             emoji="💡" 
             bgColor="bg-orange-50 dark:bg-orange-900/20" 
             textColor="text-orange-900 dark:text-orange-100"
             accentColor="text-orange-600"
             text={feedback.improvements} 
          />

          <FeedbackSection 
             title="Идеальный ответ" 
             emoji="🎓" 
             bgColor="bg-blue-50 dark:bg-blue-900/20" 
             textColor="text-blue-900 dark:text-blue-100"
             accentColor="text-blue-600"
             text={feedback.better_answer} 
             italic
          />

          {/* Кнопки */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleNext}
              className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-400 shadow-xl transition-all active:scale-95"
            >
              {currentIndex < questions.length - 1 ? 'Следующий вопрос →' : 'Завершить 🏁'}
            </button>
            <button
              onClick={handleRestart}
              className="px-6 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
            >
              Сброс
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <LoadingSpinner />
            <p className="mt-4 font-bold text-blue-600 animate-pulse">ИИ думает...</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* Вспомогательный компонент для секций фидбека */
function FeedbackSection({ title, emoji, bgColor, textColor, accentColor, text, italic = false }) {
  return (
    <div className={`${bgColor} border border-transparent dark:border-gray-800/50 rounded-2xl p-6 shadow-sm`}>
      <h4 className={`font-black uppercase tracking-tighter mb-3 flex items-center gap-2 ${accentColor}`}>
        <span>{emoji}</span> {title}:
      </h4>
      <div className={`${textColor} leading-relaxed ${italic ? 'italic font-serif' : ''}`}>
        <Typewriter text={text} speed={15} />
      </div>
    </div>
  );
}

export default InterviewSimulator;