import React, { useEffect, useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import axios from 'axios';
import authService from '../services/authService';

interface Appointment {
  request_id: number;
  doctor_id: number | null;
  branch_id: number | null;
  user_phone: string;
  req_date: string;
  status: string;
  appointment_type: string;
  pet_name: string;
  pet_type: string;
  comment: string;
  come_date: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  branch_name: string | null;
  branch_address: string | null;
}

const UserAppointments = () => {
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

      const response = await axios.get(`${authService.API_URL}/user/requests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Логируем формат дат для проверки
      console.log("Данные запросов:", response.data);

      setAppointments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при получении записей:', error);
      setError('Не удалось загрузить записи');
      setLoading(false);
    }
  };

  // Форматирование даты и времени
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Дата не указана";
    try {
      const iso = dateString.includes('T')
          ? (dateString.endsWith('Z') ? dateString : `${dateString}Z`)
          : `${dateString.replace(' ', 'T')}Z`;
      return new Date(iso).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Получить полное имя врача
  const getDoctorName = (appointment: Appointment) => {
    if (!appointment.first_name) return 'Врач не назначен';

    return `Др. ${appointment.last_name || ''} ${appointment.first_name || ''} ${appointment.middle_name || ''}`.trim();
  };

  if (loading) return <div className="text-center py-6">Загрузка записей...</div>;

  if (error) return <div className="text-center py-6 text-red-600">{error}</div>;

  if (appointments.length === 0) {
    return <div className="text-center py-6">У вас пока нет записей на прием</div>;
  }

  return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Мои записи
        </h2>
        <div className="space-y-4">
          {appointments.map(appointment => (
              <div
                  key={appointment.request_id}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-lg">{getDoctorName(appointment)}</h3>
                      <div className="flex items-center text-gray-500 mt-1">
                        <MapPin size={16} className="mr-1"/>
                        {appointment.branch_address || 'Адрес клиники не указан'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Clock size={16} className="text-gray-500"/>
                      <span>
                    {formatDateTime(appointment.come_date || appointment.req_date)}
                  </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Питомец</div>
                        <div>
                          {appointment.pet_name} ({appointment.pet_type})
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Тип</div>
                        <div>{appointment.appointment_type}</div>
                      </div>
                    </div>
                    {appointment.comment && (
                        <div>
                          <div className="text-sm text-gray-500">Комментарий</div>
                          <div className="text-sm">{appointment.comment}</div>
                        </div>
                    )}
                  </div>
                  <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === 'Активно' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                {appointment.status}
              </span>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default UserAppointments;