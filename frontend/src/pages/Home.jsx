import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-5xl font-bold mb-6">
        Ваш AI-помощник в поиске работы
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Анализируйте резюме, тренируйтесь на собеседованиях, находите вакансии
      </p>
      <Link 
        to="/dashboard"
        className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700"
      >
        Начать работу
      </Link>
    </div>
  );
}

export default Home;