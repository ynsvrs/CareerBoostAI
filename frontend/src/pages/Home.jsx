import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold mb-6 text-gray-800">
          Ваш AI-помощник в поиске работы
        </h1>
        <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Анализируйте резюме, тренируйтесь на собеседованиях, находите вакансии и генерируйте сопроводительные письма с помощью искусственного интеллекта
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link 
            to="/dashboard"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105 shadow-lg"
          >
            🚀 Начать работу
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">Анализ резюме</h3>
            <p className="text-gray-600">Получите профессиональную оценку вашего резюме</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-semibold mb-2">Собеседование</h3>
            <p className="text-gray-600">Тренируйтесь отвечать на вопросы с AI</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Поиск вакансий</h3>
            <p className="text-gray-600">Найдите подходящие вакансии с умным подбором</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">✉️</div>
            <h3 className="text-xl font-semibold mb-2">Сопроводительное письмо</h3>
            <p className="text-gray-600">Сгенерируйте персонализированное письмо</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;