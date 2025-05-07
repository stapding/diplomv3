import React, { useState, useEffect } from 'react';
import { User, Calendar, Settings, LogOut, Package } from 'lucide-react';
import UserAppointments from '../components/UserAppointments';
import ManagerAppointments from '../components/ManagerAppointments';
import DoctorAppointments from '../components/DoctorAppointments';
import OrdersView from '../components/OrdersView';
import authService from '../services/authService';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.role) {
      setUserRole(currentUser.role);
    } else {
      setUserRole('user');
    }

    // Загружаем данные пользователя
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userRole === 'doctor' && activeTab === 'orders') {
      setActiveTab('appointments');
    }
  }, [userRole, activeTab]);

  // Функция для загрузки данных пользователя
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      const response = await fetch(`${authService.API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить данные пользователя');
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция для сохранения изменений профиля
  const handleSaveUserData = async () => {
    try {
      setSaveStatus('saving');
      const token = authService.getToken();
      const response = await fetch(`${authService.API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Не удалось сохранить данные пользователя');
      }

      setSaveStatus('success');

      // Сбрасываем статус через 3 секунды
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Ошибка при сохранении данных пользователя:', error);
      setSaveStatus('error');

      // Сбрасываем статус через 3 секунды
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }
  };

  // Обработчик выхода из системы
  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  const renderTabContent = () => {
    if (userRole === null || loading) {
      return <div>Загрузка профиля...</div>;
    }

    switch (activeTab) {
      case 'appointments':
        switch (userRole) {
          case 'user':
            return <UserAppointments />;
          case 'manager':
            return <ManagerAppointments />;
          case 'doctor':
            return <DoctorAppointments />;
          default:
            return <UserAppointments />;
        }
      case 'orders':
        return <OrdersView />;
      case 'settings':
        return <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Настройки аккаунта
          </h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-medium text-lg mb-4">Личная информация</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-gray-700 font-medium mb-2">
                  Имя
                </label>
                <input
                    type="text"
                    id="first_name"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={userData.first_name || ''}
                    onChange={e => setUserData({...userData, first_name: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-gray-700 font-medium mb-2">
                  Фамилия
                </label>
                <input
                    type="text"
                    id="last_name"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={userData.last_name || ''}
                    onChange={e => setUserData({...userData, last_name: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="middle_name" className="block text-gray-700 font-medium mb-2">
                  Отчество
                </label>
                <input
                    type="text"
                    id="middle_name"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={userData.middle_name || ''}
                    onChange={e => setUserData({...userData, middle_name: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Электронная почта
                </label>
                <input
                    type="email"
                    disabled={true}
                    id="email"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-50 cursor-not-allowed"
                    value={userData.email || ''}
                />
              </div>
            </div>
            <div className="mt-6 flex items-center">
              <button
                  className="bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={handleSaveUserData}
                  disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? 'Сохранение...' : 'Сохранить изменения'}
              </button>

              {saveStatus === 'success' && (
                  <span className="ml-4 text-green-600">Данные успешно сохранены</span>
              )}

              {saveStatus === 'error' && (
                  <span className="ml-4 text-red-600">Ошибка при сохранении</span>
              )}
            </div>
          </div>
          <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-medium text-lg mb-4">
              Настройки уведомлений
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Напоминания о записях</div>
                  <div className="text-sm text-gray-500">
                    Получать уведомления о предстоящих записях
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <button
                className="text-red-600 font-medium hover:text-red-800"
                onClick={handleLogout}
            >
              Выйти
            </button>
          </div>
        </div>;
      default:
        return null;
    }
  };

  return (
      <div className="w-full bg-gray-50">
        <section className="bg-green-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white p-3 rounded-full shadow-sm mr-4">
                  <User size={24} className="text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Мой профиль</h1>
                  <p className="text-gray-600">
                    {!loading && userData.first_name &&
                        `${userData.first_name} ${userData.middle_name || ''} ${userData.last_name || ''}`.trim()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4">
                <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                  <nav>
                    <ul className="space-y-2">
                      <li>
                        <button
                            className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab === 'appointments' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => setActiveTab('appointments')}
                        >
                          <Calendar size={20} className="mr-3" />
                          Записи
                        </button>
                      </li>
                      {userRole !== 'doctor' && (
                          <li>
                            <button
                                className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab === 'orders' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setActiveTab('orders')}
                            >
                              <Package size={20} className="mr-3" />
                              Заказы
                            </button>
                          </li>
                      )}
                      <li>
                        <button
                            className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab === 'settings' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => setActiveTab('settings')}
                        >
                          <Settings size={20} className="mr-3" />
                          Настройки
                        </button>
                      </li>
                    </ul>
                  </nav>
                  <div className="mt-8 pt-6 border-t">
                    <button
                        className="flex items-center text-gray-700 hover:text-red-600"
                        onClick={handleLogout}
                    >
                      <LogOut size={20} className="mr-3" />
                      Выйти
                    </button>
                  </div>
                </div>
              </div>
              <div className="md:w-3/4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

export default ProfilePage;