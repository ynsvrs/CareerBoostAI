import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function Navbar() {
  return (
    // Добавляем темные классы для всего навбара
    <nav className="bg-blue-600 dark:bg-gray-800 text-white p-4 shadow-lg transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        {/* Логотип */}
        <Link to="/" className="text-2xl font-bold hover:text-blue-100 transition flex items-center gap-2">
          <span className="text-3xl">🚀</span> CareerBoost AI
        </Link>
        <div className="flex items-center space-x-6">
          {/* Ссылки */}
          <Link to="/" className="hover:text-blue-200 transition font-medium">
            Главная
          </Link>
          <Link to="/dashboard" className="hover:text-blue-200 transition font-medium">
            Инструменты
          </Link>
          
          {/* Вертикальный разделитель */}
          <div className="h-6 w-[1px] bg-blue-400 dark:bg-gray-600 mx-2"></div>
          
          {/* Переключатель темы */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;