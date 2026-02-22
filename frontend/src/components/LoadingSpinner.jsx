function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center p-12 space-y-4">
      <div className="relative">
        {/* Внешнее пульсирующее кольцо */}
        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-100 animate-pulse"></div>
        
        {/* Основной крутящийся спиннер */}
        <div className="relative rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 animate-spin"></div>
        
        {/* Иконка робота или ИИ внутри (опционально) */}
        <div className="absolute inset-0 flex justify-center items-center">
           <span className="text-xl">✨</span>
        </div>
      </div>
      
      {/* Текст состояния */}
      <div className="flex flex-col items-center">
        <p className="text-blue-700 font-bold animate-pulse tracking-wide">
          ИИ обрабатывает запрос
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Это может занять несколько секунд...
        </p>
      </div>
    </div>
  );
}

export default LoadingSpinner;