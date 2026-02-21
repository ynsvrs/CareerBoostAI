import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-blue-100 transition">
          CareerBoost AI
        </Link>
        <div className="space-x-6">
          <Link to="/" className="hover:text-blue-100 transition">
            Главная
          </Link>
          <Link to="/dashboard" className="hover:text-blue-100 transition">
            Инструменты
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;