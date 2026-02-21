import { useState } from 'react';
import { startInterview, evaluateAnswer } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import VoiceInput from './VoiceInput';

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

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Позиция (например: Frontend Developer)
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Frontend Developer"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Уровень
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="junior">Junior</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || !position.trim()}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Генерируем вопросы...' : 'Начать собеседование'}
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
          <span>{position} • {level}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Вопрос */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-6">
        <p className="text-sm text-blue-800 font-medium mb-2">
          {currentQuestion.type === 'general' && '💭 Общий вопрос'}
          {currentQuestion.type === 'technical' && '⚙️ Технический вопрос'}
          {currentQuestion.type === 'behavioral' && '🎯 Поведенческий вопрос'}
        </p>
        <p className="text-lg font-medium">{currentQuestion.question}</p>
      </div>

      {!feedback ? (
        <>
          <VoiceInput
  value={answer}
  onChange={setAnswer}
  placeholder="Введите ваш ответ или нажмите на микрофон..."
/>

          <button
            onClick={handleSubmitAnswer}
            disabled={loading || !answer.trim()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Оцениваем ответ...' : 'Отправить ответ'}
          </button>
        </>
      ) : (
        <div className="space-y-6">
          {/* Оценка */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Оценка</h3>
              <span className="text-3xl font-bold text-blue-600">
                {feedback.score}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${(feedback.score / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Что хорошо */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-800 mb-2">✅ Что хорошо:</h4>
            <p className="text-green-700">{feedback.positive}</p>
          </div>

          {/* Что улучшить */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h4 className="font-semibold text-orange-800 mb-2">💡 Что можно улучшить:</h4>
            <p className="text-orange-700">{feedback.improvements}</p>
          </div>

          {/* Пример ответа */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-800 mb-2">🎓 Пример сильного ответа:</h4>
            <p className="text-blue-700">{feedback.better_answer}</p>
          </div>

          {/* Кнопки */}
          <div className="flex gap-4">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Следующий вопрос →
              </button>
            ) : (
              <button
                onClick={handleRestart}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
              >
                🎉 Завершить и начать новое
              </button>
            )}
          </div>
        </div>
      )}

      {loading && <LoadingSpinner />}
    </div>
  );
}

export default InterviewSimulator;