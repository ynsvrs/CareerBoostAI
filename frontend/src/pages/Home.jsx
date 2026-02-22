import { Link } from 'react-router-dom';

function Home() {
  return (
    /* Настраиваем общий фон: в светлой теме — градиент, в темной — глубокий темно-синий/черный */
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-950 transition-colors duration-500">
      <div className="container mx-auto px-4 py-16 text-center">
        
        {/* Заголовок: text-gray-800 -> dark:text-white */}
        <h1 className="text-6xl font-bold mb-6 text-gray-800 dark:text-white leading-tight">
          Ваш AI-помощник в поиске работы
        </h1>
        
        {/* Описание: text-gray-600 -> dark:text-gray-300 */}
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          Анализируйте резюме, тренируйтесь на собеседованиях, находите вакансии и генерируйте сопроводительные письма с помощью искусственного интеллекта
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link 
            to="/dashboard"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition transform hover:scale-105 shadow-lg"
          >
            🚀 Начать работу
          </Link>
        </div>

        {/* Сетка карточек */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-16">
          
          {/* Карточка 1 */}
          <FeatureCard 
            emoji="📄" 
            title="Анализ резюме" 
            desc="Получите профессиональную оценку вашего резюме" 
          />
          
          {/* Карточка 2 */}
          <FeatureCard 
            emoji="💼" 
            title="Собеседование" 
            desc="Тренируйтесь отвечать на вопросы с AI" 
          />
          
          {/* Карточка 3 */}
          <FeatureCard 
            emoji="🔍" 
            title="Поиск вакансий" 
            desc="Найдите подходящие вакансии с умным подбором" 
          />
          
          {/* Карточка 4 */}
          <FeatureCard 
            emoji="✉️" 
            title="Письмо" 
            desc="Сгенерируйте персонализированное письмо" 
          />
          
        </div>
      </div>
    </div>
  );
}

/* Выносим карточку в отдельный мини-компонент, чтобы не дублировать классы dark: */
function FeatureCard({ emoji, title, desc }) {
  return (
    <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm border border-transparent dark:border-gray-700 p-6 rounded-2xl shadow-md hover:shadow-xl dark:hover:bg-gray-700/50 transition duration-300">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {desc}
      </p>
    </div>
  );
}

export default Home;