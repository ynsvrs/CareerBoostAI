import { useState, useRef, useEffect } from 'react';

function VoiceInput({ value, onChange, placeholder = "Говорите..." }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Проверка поддержки браузером
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    // Инициализация Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Настройки
    recognitionRef.current.continuous = true;  // Продолжать слушать
    recognitionRef.current.interimResults = true;  // Показывать промежуточные результаты
    recognitionRef.current.lang = 'ru-RU';  // Русский язык

    // Обработчик результатов
    recognitionRef.current.onresult = (event) => {
      let transcript = '';
      
      // Собрать все результаты
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      
      // Обновить значение
      onChange(value + ' ' + transcript);
    };

    // Обработчик ошибок
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      if (event.error === 'not-allowed') {
        alert('Разрешите доступ к микрофону в настройках браузера');
      }
    };

    // Когда распознавание заканчивается
    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Переключить запись
  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // Если браузер не поддерживает
  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 p-2 bg-yellow-50 border border-yellow-200 rounded">
        ⚠️ Ваш браузер не поддерживает голосовой ввод. Используйте Chrome, Edge или Safari.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px]"
      />

      {/* Кнопка микрофона */}
      <button
        type="button"
        onClick={toggleRecording}
        className={`p-4 rounded-full transition-all ${
          isRecording
            ? 'bg-red-500 text-white animate-pulse shadow-lg'
            : 'bg-blue-500 text-white hover:bg-blue-600 shadow'
        }`}
        title={isRecording ? 'Остановить запись' : 'Начать запись голосом'}
      >
        {isRecording ? (
          // Иконка "Стоп"
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <rect x="6" y="6" width="8" height="8" rx="1" />
          </svg>
        ) : (
          // Иконка микрофона
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Индикатор записи */}
      {isRecording && (
        <div className="absolute -mt-32 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Идёт запись...
        </div>
      )}
    </div>
  );
}

export default VoiceInput;