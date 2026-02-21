import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">CareerBoost AI</h1>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Главная</Link>
          <Link to="/dashboard" className="hover:underline">Инструменты</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;