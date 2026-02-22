function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center p-12 space-y-4 transition-colors">
      <div className="relative">
        {/* Внешнее пульсирующее кольцо — в темной теме делаем его едва заметным */}
        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-100 dark:border-blue-900/30 animate-pulse"></div>
        
        {/* Основной крутящийся спиннер — добавляем свечение (glow effect) */}
        <div className="relative rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 dark:border-blue-400 animate-spin shadow-[0_0_15px_rgba(37,99,235,0.3)] dark:shadow-[0_0_20px_rgba(96,165,250,0.5)]"></div>
        
        {/* Иконка внутри */}
        <div className="absolute inset-0 flex justify-center items-center">
           <span className="text-xl animate-bounce">✨</span>
        </div>
      </div>
      
      {/* Текст состояния */}
      <div className="flex flex-col items-center">
        <p className="text-blue-700 dark:text-blue-400 font-black animate-pulse tracking-widest uppercase text-sm">
          ИИ обрабатывает запрос
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] font-medium mt-2 uppercase tracking-tighter">
          Пожалуйста, подождите...
        </p>
      </div>
    </div>
  );
}

export default LoadingSpinner;