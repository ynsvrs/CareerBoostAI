import { useState } from 'react';
import { startInterview, evaluateAnswer } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import VoiceInput from './VoiceInput';
import Typewriter from './Typewriter'; // Не забудь про импорт!

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
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Симулятор собеседования</h2>
        <p className="text-gray-600 mb-6">
          Потренируйтесь отвечать на вопросы собеседования и получите обратную связь от AI
        </p>

        <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Позиция (например: Frontend Developer)
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Frontend Developer"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Уровень
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="junior">Junior</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || !position.trim()}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition-all transform active:scale-95"
          >
            {loading ? 'Генерируем вопросы...' : 'Начать собеседование 🚀'}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Прогресс */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Вопрос {currentIndex + 1} из {questions.length}</span>
          <span className="font-medium">{position} • {level}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Вопрос */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-6 shadow-sm">
        <p className="text-sm text-blue-800 font-bold mb-2 uppercase tracking-wider">
          {currentQuestion.type === 'general' && '💭 Общий вопрос'}
          {currentQuestion.type === 'technical' && '⚙️ Технический вопрос'}
          {currentQuestion.type === 'behavioral' && '🎯 Поведенческий вопрос'}
        </p>
        <p className="text-xl font-medium text-gray-800">{currentQuestion.question}</p>
      </div>

      {!feedback ? (
        <div className="space-y-4">
          <VoiceInput
            value={answer}
            onChange={setAnswer}
            placeholder="Введите ваш ответ или используйте микрофон для записи..."
          />

          <button
            onClick={handleSubmitAnswer}
            disabled={loading || !answer.trim()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-md"
          >
            {loading ? 'ИИ анализирует ваш ответ...' : 'Отправить ответ ✅'}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Оценка */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Ваш результат</h3>
              <span className="text-4xl font-black text-blue-600">
                {feedback.score}<span className="text-lg text-gray-400">/10</span>
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(feedback.score / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Что хорошо */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
              <span>✅</span> Что хорошо:
            </h4>
            <div className="text-green-900 leading-relaxed">
               <Typewriter text={feedback.positive} speed={20} />
            </div>
          </div>

          {/* Что улучшить */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
              <span>💡</span> Что можно улучшить:
            </h4>
            <div className="text-orange-900 leading-relaxed">
               <Typewriter text={feedback.improvements} speed={20} />
            </div>
          </div>

          {/* Пример ответа */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <span>🎓</span> Пример идеального ответа:
            </h4>
            <div className="text-blue-900 italic leading-relaxed">
               <Typewriter text={feedback.better_answer} speed={15} />
            </div>
          </div>

          {/* Кнопки навигации */}
          <div className="flex gap-4 pt-4">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-transform active:scale-95"
              >
                Следующий вопрос →
              </button>
            ) : (
              <button
                onClick={handleRestart}
                className="flex-1 bg-green-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-green-700 shadow-lg transition-transform active:scale-95"
              >
                🎉 Завершить тренировку
              </button>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-8">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}

export default InterviewSimulator;