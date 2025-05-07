import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import authService from '../services/authService';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  appointment: any;
}

interface Doctor {
  doctor_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
}

interface Branch {
  branch_id: number;
  name: string;
  address: string;
}

const appointmentTypes = ['Осмотр', 'Вакцинация', 'Посещение больного', 'Хирургические операции'];
const appointmentStatuses = ['Ожидание', 'Активно', 'Завершено'];

const EditAppointmentModal = ({
                                isOpen,
                                onClose,
                                onSubmit,
                                appointment
                              }: EditAppointmentModalProps) => {
  const [formData, setFormData] = useState({
    doctorId: '',
    address: '',
    date: '',
    time: '',
    appointmentType: '',
    status: ''
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузка списка врачей и филиалов при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
      fetchBranches();
    }
  }, [isOpen]);

  // Заполнение формы данными выбранной записи
  useEffect(() => {
    if (appointment) {
      const comeDate = appointment.come_date ? new Date(appointment.come_date) : new Date();

      setFormData({
        doctorId: appointment.doctor_id || '',
        address: appointment.branch_address || '',
        date: comeDate.toISOString().split('T')[0],
        time: comeDate.toTimeString().slice(0, 5),
        appointmentType: appointment.appointment_type || '',
        status: appointment.status || 'Активно'
      });
    }
  }, [appointment]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      const response = await axios.get(`${authService.API_URL}/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке списка врачей:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      const response = await axios.get(`${authService.API_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBranches(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке списка филиалов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const getDoctorFullName = (doctor: Doctor) => {
    return `Др. ${doctor.last_name} ${doctor.first_name} ${doctor.middle_name || ''}`.trim();
  };

  return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-lg bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Редактировать запись
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={24} />
            </button>
          </div>

          {loading ? (
              <div className="flex justify-center py-4">Загрузка данных...</div>
          ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
                      Доктор
                    </label>
                    <select
                        id="doctor"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={formData.doctorId}
                        onChange={e => setFormData({...formData, doctorId: e.target.value})}
                        required
                    >
                      <option value="">Выбрать доктора</option>
                      {doctors.map(doctor => (
                          <option key={doctor.doctor_id} value={doctor.doctor_id}>
                            {getDoctorFullName(doctor)}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Адрес клиники
                    </label>
                    <select
                        id="address"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        required
                    >
                      <option value="">Выбрать адрес</option>
                      {branches.map(branch => (
                          <option key={branch.branch_id} value={branch.address}>
                            {branch.address}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-1">
                      Тип записи
                    </label>
                    <select
                        id="appointmentType"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={formData.appointmentType}
                        onChange={e => setFormData({...formData, appointmentType: e.target.value})}
                        required
                    >
                      <option value="">Выберите тип</option>
                      {appointmentTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Статус
                    </label>
                    <select
                        id="status"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        required
                    >
                      {appointmentStatuses.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                        Дата
                      </label>
                      <input
                          type="date"
                          id="date"
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          required
                      />
                    </div>
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                        Время
                      </label>
                      <input
                          type="time"
                          id="time"
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={formData.time}
                          onChange={e => setFormData({...formData, time: e.target.value})}
                          required
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Отмена
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Сохранить изменения
                    </button>
                  </div>
                </div>
              </form>
          )}
        </div>
      </div>
  );
};

export default EditAppointmentModal;