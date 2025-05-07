import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, CheckCircle } from 'lucide-react';
import axios from 'axios';
import authService from '../services/authService';

interface Appointment {
  request_id: number;
  user_id: number;
  user_phone: string;
  req_date: string;
  status: 'Активно' | 'Завершено';
  appointment_type: string;
  pet_name: string;
  pet_type: string;
  comment: string | null;
  come_date: string | null;
  user_first_name: string;
  user_middle_name: string | null;
  user_last_name: string;
  branch_name: string | null;
  branch_address: string | null;
}

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = authService.getToken();

      if (!token) {
        setError('Пользователь не авторизован');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${authService.API_URL}/doctor/requests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAppointments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при получении записей:', error);
      setError('Не удалось загрузить записи');
      setLoading(false);
    }
  };

  // Получить полное имя пользователя
  const getUserName = (appointment: Appointment) => {
    return `${appointment.user_first_name || ''} ${appointment.user_middle_name || ''} ${appointment.user_last_name || ''}`.trim();
  };

  // Форматирование даты и времени
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Не указано";

    try {
      return new Date(dateString).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Ошибка форматирования даты:', e);
      return dateString;
    }
  };

  const handleStatusChange = async (appointmentId: number, newStatus: 'Завершено' | 'Активно') => {
    try {
      const token = authService.getToken();

      if (!token) {
        setError('Пользователь не авторизован');
        return;
      }

      // Запрос на изменение статуса
      await axios.put(`${authService.API_URL}/doctor/requests/${appointmentId}`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
      );

      // Обновляем локальное состояние
      setAppointments(prevAppointments =>
          prevAppointments.map(app =>
              app.request_id === appointmentId
                  ? { ...app, status: newStatus }
                  : app
          )
      );

    } catch (error) {
      console.error('Ошибка при изменении статуса записи:', error);
      setError('Не удалось изменить статус записи');
    }
  };

  if (loading) return <div className="text-center py-6">Загрузка записей...</div>;

  if (error) return <div className="text-center py-6 text-red-600">{error}</div>;

  if (appointments.length === 0) {
    return <div className="text-center py-6">У вас нет назначенных записей</div>;
  }

  return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Мои пациенты ({appointments.length})
        </h2>
        <div className="space-y-4">
          {appointments.map(appointment => (
              <div key={appointment.request_id} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-lg">{getUserName(appointment)}</h3>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Phone size={16} className="mr-1" />
                        {appointment.user_phone}
                      </div>
                    </div>
                    {appointment.branch_address && (
                        <div className="flex items-center text-gray-500">
                          <MapPin size={16} className="mr-1" />
                          {appointment.branch_address}
                        </div>
                    )}
                    <div className="flex items-center space-x-4">
                      <Clock size={16} className="text-gray-500" />
                      <span>{formatDateTime(appointment.come_date)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Питомец</div>
                        <div>{appointment.pet_name} ({appointment.pet_type})</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Тип приёма</div>
                        <div>{appointment.appointment_type}</div>
                      </div>
                    </div>
                    {appointment.comment && (
                        <div>
                          <div className="text-sm text-gray-500">Комментарий</div>
                          <div className="text-sm">{appointment.comment}</div>
                        </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">Статус: </span>
                      <span className={`${
                          appointment.status === 'Активно' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                    {appointment.status}
                  </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {appointment.status === 'Активно' && (
                        <button
                            onClick={() => handleStatusChange(appointment.request_id, 'Завершено')}
                            className="flex items-center justify-center bg-green-100 text-green-600 px-4 py-2 rounded hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle size={18} className="mr-2" />
                          Завершить
                        </button>
                    )}
                    {appointment.status === 'Завершено' && (
                        <button
                            onClick={() => handleStatusChange(appointment.request_id, 'Активно')}
                            className="flex items-center justify-center bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                        >
                          Вернуть в активные
                        </button>
                    )}
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default DoctorAppointments;