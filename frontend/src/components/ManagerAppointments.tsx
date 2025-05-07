import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, Trash2, Edit2 } from 'lucide-react';
import EnrollmentModal from './EnrollmentModal';
import EditAppointmentModal from './EditAppointmentModal';
import axios from 'axios';
import authService from '../services/authService';

interface Appointment {
  request_id: number;
  user_id: number;
  doctor_id: number | null;
  branch_id: number | null;
  user_phone: string;
  req_date: string;
  status: string;
  appointment_type: string;
  pet_name: string;
  pet_type: string;
  comment: string | null;
  come_date: string | null;
  doctor_first_name: string | null;
  doctor_middle_name: string | null;
  doctor_last_name: string | null;
  user_first_name: string;
  user_middle_name: string | null;
  user_last_name: string;
  branch_name: string | null;
  branch_address: string | null;
}

const ManagerAppointments = () => {
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Группировка заявок по статусу
  const pendingAppointments = appointments.filter(app => app.status === 'Ожидание');
  const activeAppointments = appointments.filter(app => app.status === 'Активно');
  const completedAppointments = appointments.filter(app => app.status === 'Завершено');

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

      const response = await axios.get(`${authService.API_URL}/manager/requests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAppointments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при получении заявок:', error);
      setError('Не удалось загрузить заявки');
      setLoading(false);
    }
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

  // Получить полное имя пользователя
  const getUserName = (appointment: Appointment) => {
    return `${appointment.user_first_name || ''} ${appointment.user_middle_name || ''} ${appointment.user_last_name || ''}`.trim();
  };

  // Получить полное имя врача
  const getDoctorName = (appointment: Appointment) => {
    if (!appointment.doctor_first_name) return 'Врач не назначен';

    return `Др. ${appointment.doctor_last_name || ''} ${appointment.doctor_first_name || ''} ${appointment.doctor_middle_name || ''}`.trim();
  };

  const handleEnroll = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEnrollModalOpen(true);
  };

  // Добавленная функция для обработки редактирования записи
  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleEnrollSubmit = async (data: any) => {
    try {
      const token = authService.getToken();
      if (!selectedAppointment) return;

      // Форматируем дату и время и компенсируем разницу часовых поясов
      const localDate = new Date(`${data.date}T${data.time}`);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
      const dateTime = utcDate.toISOString();

      const requestData = {
        doctorId: data.doctorId,
        branchAddress: data.address,
        comeDate: dateTime,
        status: 'Активно'
      };

      // Отправляем запрос на обновление заявки
      const response = await axios.put(
          `${authService.API_URL}/manager/requests/${selectedAppointment.request_id}`,
          requestData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
      );

      // Обновляем список заявок
      fetchAppointments();

      // Закрываем модальное окно
      setIsEnrollModalOpen(false);
      alert('Запись успешно создана');
    } catch (error) {
      console.error('Ошибка при назначении врача:', error);
      alert('Не удалось создать запись. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleEditSubmit = async (data: any) => {
    try {
      const token = authService.getToken();
      if (!selectedAppointment) return;

      // Форматируем дату и время и компенсируем разницу часовых поясов
      const localDate = new Date(`${data.date}T${data.time}`);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
      const dateTime = utcDate.toISOString();

      const requestData = {
        doctorId: data.doctorId,
        branchAddress: data.address,
        appointmentType: data.appointmentType,
        comeDate: dateTime,
        status: data.status || 'Активно'
      };

      // Отправляем запрос на обновление заявки
      const response = await axios.put(
          `${authService.API_URL}/manager/requests/${selectedAppointment.request_id}`,
          requestData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
      );

      // Обновляем список заявок
      fetchAppointments();

      // Закрываем модальное окно
      setIsEditModalOpen(false);
      alert('Запись успешно обновлена');
    } catch (error) {
      console.error('Ошибка при обновлении записи:', error);
      alert('Не удалось обновить запись. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleDelete = async (appointmentId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        const token = authService.getToken();

        // Отправляем запрос на удаление заявки
        const response = await axios.delete(
            `${authService.API_URL}/manager/requests/${appointmentId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
        );

        // Обновляем список заявок
        fetchAppointments();
        alert('Запись успешно удалена');
      } catch (error) {
        console.error('Ошибка при удалении записи:', error);
        alert('Не удалось удалить запись. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  if (loading) return <div className="text-center py-6">Загрузка заявок...</div>;

  if (error) return <div className="text-center py-6 text-red-600">{error}</div>;

  return (
      <div className="space-y-8">
        {/* Ожидающие заявки */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Ожидающие назначения записи ({pendingAppointments.length})
          </h2>
          <div className="space-y-4">
            {pendingAppointments.length === 0 ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 text-center text-gray-500">
                  Нет ожидающих заявок
                </div>
            ) : (
                pendingAppointments.map(appointment => (
                    <div key={appointment.request_id} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex justify-between">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium text-lg">{getUserName(appointment)}</h3>
                            <div className="flex items-center text-gray-500 mt-1">
                              <Phone size={16} className="mr-1"/>
                              {appointment.user_phone}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Clock size={16} className="text-gray-500"/>
                            <span>Создано: {formatDateTime(appointment.req_date)}</span>
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
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                              onClick={() => handleEnroll(appointment)}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                          >
                            Назначить
                          </button>
                          <button
                              onClick={() => handleDelete(appointment.request_id)}
                              className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition-colors"
                          >
                            Отклонить
                          </button>
                        </div>
                      </div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Активные записи */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Активные записи ({activeAppointments.length})
          </h2>
          <div className="space-y-4">
            {activeAppointments.length === 0 ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 text-center text-gray-500">
                  Нет активных записей
                </div>
            ) : (
                activeAppointments.map(appointment => (
                    <div key={appointment.request_id} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex justify-between">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium text-lg">{getUserName(appointment)}</h3>
                            <div className="flex items-center text-gray-500 mt-1">
                              <Phone size={16} className="mr-1"/>
                              {appointment.user_phone}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{getDoctorName(appointment)}</div>
                            {appointment.branch_address && (
                                <div className="flex items-center text-gray-500 mt-1">
                                  <MapPin size={16} className="mr-1"/>
                                  {appointment.branch_address}
                                </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <Clock size={16} className="text-gray-500"/>
                            <span>Назначено на: {formatDateTime(appointment.come_date)}</span>
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
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                              onClick={() => handleEdit(appointment)}
                              className="flex items-center justify-center p-2 text-green-600 hover:text-green-900"
                          >
                            <Edit2 size={18}/>
                          </button>
                          <button
                              onClick={() => handleDelete(appointment.request_id)}
                              className="p-2 text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Завершенные записи */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Завершенные записи ({completedAppointments.length})
          </h2>
          <div className="space-y-4">
            {completedAppointments.length === 0 ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 text-center text-gray-500">
                  Нет завершенных записей
                </div>
            ) : (
                completedAppointments.map(appointment => (
                    <div key={appointment.request_id} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex justify-between">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium text-lg">{getUserName(appointment)}</h3>
                            <div className="flex items-center text-gray-500 mt-1">
                              <Phone size={16} className="mr-1"/>
                              {appointment.user_phone}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{getDoctorName(appointment)}</div>
                            {appointment.branch_address && (
                                <div className="flex items-center text-gray-500 mt-1">
                                  <MapPin size={16} className="mr-1"/>
                                  {appointment.branch_address}
                                </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <Clock size={16} className="text-gray-500"/>
                            <span>Состоялось: {formatDateTime(appointment.come_date)}</span>
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
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                              onClick={() => handleDelete(appointment.request_id)}
                              className="p-2 text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Модальные окна */}
        {selectedAppointment && (
            <>
              <EnrollmentModal
                  isOpen={isEnrollModalOpen}
                  onClose={() => setIsEnrollModalOpen(false)}
                  onSubmit={handleEnrollSubmit}
                  appointment={selectedAppointment}
              />
              <EditAppointmentModal
                  isOpen={isEditModalOpen}
                  onClose={() => setIsEditModalOpen(false)}
                  onSubmit={handleEditSubmit}
                  appointment={selectedAppointment}
              />
            </>
        )}
      </div>
  );
};

export default ManagerAppointments;