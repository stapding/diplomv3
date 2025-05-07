import React, { useState } from 'react';
import axios from 'axios';
import authService from "../services/authService";

const AppointmentsPage = () => {
  const [appointmentType, setAppointmentType] = useState('Осмотр');
  const [phone, setPhone] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      // Получаем токен напрямую из localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Вы не авторизованы. Пожалуйста, войдите в систему.');
        return;
      }

      // Отправка данных на сервер
      const response = await axios.post(
          `${authService.API_URL}/requests`,
          {
            appointment_type: appointmentType,
            pet_name: petName,
            pet_type: petType,
            comment: notes,
            user_phone: phone,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      // Обработка успешного ответа
      alert(response.data.message);
      // Очистка полей формы
      setPhone('');
      setPetName('');
      setPetType('');
      setNotes('');
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);

      // Детальная обработка ошибок
      if (error.response) {
        if (error.response.status === 403 || error.response.status === 401) {
          alert('Ваша сессия истекла. Пожалуйста, войдите в систему снова.');
        } else {
          alert(`Ошибка: ${error.response.data.message || 'Что-то пошло не так'}`);
        }
      } else {
        alert('Произошла ошибка при отправке запроса.');
      }
    }
  };

  return (
      <div className="w-full bg-white">
        <section className="bg-green-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-800">Записаться на прием</h1>
            <p className="mt-2 text-lg text-gray-600">Запланируйте визит к нашим заботливым ветеринарам</p>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Запланируйте визит</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Тип назначения</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                          className={`border rounded-lg p-4 cursor-pointer ${
                              appointmentType === 'Осмотр' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                          }`}
                          onClick={() => setAppointmentType('Осмотр')}
                      >
                        <div className="font-medium">Осмотр</div>
                        <div className="text-sm text-gray-500 mt-1">Регулярное медицинское обследование, определение диагноза</div>
                      </div>
                      <div
                          className={`border rounded-lg p-4 cursor-pointer ${
                              appointmentType === 'Хирургическая операция' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                          }`}
                          onClick={() => setAppointmentType('Хирургическая операция')}
                      >
                        <div className="font-medium">Хирургические операции</div>
                        <div className="text-sm text-gray-500 mt-1">Проведение операции над питомцами</div>
                      </div>
                      <div
                          className={`border rounded-lg p-4 cursor-pointer ${
                              appointmentType === 'Посещение больного' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                          }`}
                          onClick={() => setAppointmentType('Посещение больного')}
                      >
                        <div className="font-medium">Посещение больного</div>
                        <div className="text-sm text-gray-500 mt-1">По вопросам здоровья питомца</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Номер телефона</label>
                    <input
                        type="tel"
                        id="phone"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="(123) 456-7890"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="petName" className="block text-gray-700 font-medium mb-2">Имя питомца</label>
                      <input
                          type="text"
                          id="petName"
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Имя питомца..."
                          required
                          value={petName}
                          onChange={e => setPetName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="petType" className="block text-gray-700 font-medium mb-2">Тип питомца</label>
                      <select
                          id="petType"
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                          value={petType}
                          onChange={e => setPetType(e.target.value)}
                      >
                        <option value="Собака">Собака</option>
                        <option value="Кот">Кот</option>
                        <option value="Другое">Другое</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">Дополнительные заметки</label>
                    <textarea
                        id="notes"
                        rows={4}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Пожалуйста, поделитесь любыми конкретными проблемами или вопросами..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 transition-colors">
                    Записаться на прием
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
  );
};

export default AppointmentsPage;