import React, { useState, useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { MenuIcon, XIcon } from 'lucide-react';
import authService from '../services/authService';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pawLogo from '../../paw.svg';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());
  const isDoctor = user && user.role === 'doctor';

  // Обновление данных о пользователе при изменениях авторизации
  useEffect(() => {
    // Обработчик любых изменений авторизации
    const handleAuthChange = () => {
      setUser(authService.getCurrentUser());
    };

    // Подписываемся на кастомное событие auth-change для обновлений в текущей вкладке
    window.addEventListener('auth-change', handleAuthChange);

    // Оставляем storage для синхронизации между вкладками
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center text-xl font-bold text-green-600">
            <img src={pawLogo} alt="PetCare Logo" className="h-6 w-6 mr-2" />
            PetCare
          </Link>
          <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
            <Link to="/schedule" className="text-gray-700 hover:text-green-600 px-3 py-2">
              Расписание и врачи
            </Link>
            {!isDoctor && (
                <Link to="/appointments" className="text-gray-700 hover:text-green-600 px-3 py-2">
                  Записаться
                </Link>
            )}
            <Link to="/prices" className="text-gray-700 hover:text-green-600 px-3 py-2">
              Цены
            </Link>
            <Link to="/pharmacy" className="text-gray-700 hover:text-green-600 px-3 py-2">
              Фармацевтика
            </Link>
            <Link to="/news" className="text-gray-700 hover:text-green-600 px-3 py-2">
              Новости
            </Link>
          </div>
        </div>
        <div className="hidden sm:flex sm:items-center sm:space-x-4">
          {user ? <div className="flex items-center space-x-4">
            <Link to="/profile" className="flex items-center space-x-3 group p-2 hover:bg-gray-50 rounded-lg">
              <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" alt={`${user.firstName} ${user.lastName}`} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-green-500" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
                    {user.firstName} {user.lastName}
                  </span>
            </Link>
          </div> : <>
            <Link to="/login" className="text-gray-700 hover:text-green-600 px-3 py-2">
              Войти
            </Link>
            <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Зарегаца
            </Link>
          </>}
        </div>
        <div className="flex items-center sm:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
            {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </div>
    {isMenuOpen && <div className="sm:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1">
        <Link to="/" className="block text-gray-700 hover:text-green-600 px-3 py-2" onClick={() => setIsMenuOpen(false)}>
          Главная
        </Link>
        <Link to="/schedule" className="block text-gray-700 hover:text-green-600 px-3 py-2" onClick={() => setIsMenuOpen(false)}>
          Расписание и врачи
        </Link>
        {!isDoctor && (
            <Link to="/appointments" className="block text-gray-700 hover:text-green-600 px-3 py-2" onClick={() => setIsMenuOpen(false)}>
              Записаться
            </Link>
        )}
        <Link to="/prices" className="block text-gray-700 hover:text-green-600 px-3 py-2" onClick={() => setIsMenuOpen(false)}>
          Цены
        </Link>
        <Link to="/pharmacy" className="block text-gray-700 hover:text-green-600 px-3 py-2" onClick={() => setIsMenuOpen(false)}>
          Фармацевтика
        </Link>
        <Link to="/news" className="block text-gray-700 hover:text-green-600 px-3 py-2" onClick={() => setIsMenuOpen(false)}>
          Новости
        </Link>
        {user ? <>
          <Link to="/profile" className="block text-gray-700 hover:text-green-600 px-3 py-2" onClick={() => setIsMenuOpen(false)}>
            Профиль ({user.firstName} {user.lastName})
          </Link>
        </> : <>
          <Link to="/login" className="block text-gray-700 hover:text-green-600 px-3 py-2" onClick={() => setIsMenuOpen(false)}>
            Войти
          </Link>
          <Link to="/register" className="block text-gray-700 hover:text-green-600 px-3 py-2" onClick={() => setIsMenuOpen(false)}>
            Зарегаца
          </Link>
        </>}
      </div>
    </div>}
  </nav>;
};

export default Navbar;