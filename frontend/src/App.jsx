import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:bg-gradient-to-b dark:from-slate-900 dark:to-gray-950 transition-colors duration-500"></div>
    </BrowserRouter>
  );
}


export default App;