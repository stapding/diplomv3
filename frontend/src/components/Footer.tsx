import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-4">
              Клиника PetCate
            </h3>
            <p className="text-gray-600 mb-4">
              Профессиональная ветеринарная помощь для ваших любимых питомцев. Мы относимся к вашим питомцам как к членам семьи.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-green-600 hover:text-green-800">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-green-600 hover:text-green-800">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-green-600 hover:text-green-800">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-4">
              Быстрые ссылки
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-green-600">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="text-gray-600 hover:text-green-600">
                  Записаться на приём
                </Link>
              </li>
              <li>
                <Link to="/pharmacy" className="text-gray-600 hover:text-green-600">
                  Заказать лекарства
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-gray-600 hover:text-green-600">
                  Расписание и врачи
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-green-600">
                  Мой профиль
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-4">
              Услуги
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-600">Вакцинация</li>
              <li className="text-gray-600">Ежедневный осмотр</li>
              <li className="text-gray-600">Хирургические операции</li>
              <li className="text-gray-600">Заказ лекарств</li>
              <li className="text-gray-600">Срочная помощь</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-4">
              Свяжитесь с нами
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-green-600 mr-2 mt-1" />
                <span className="text-gray-600">
                  Улица Пушкина, 19 - Главное отделение
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-green-600 mr-2" />
                <span className="text-gray-600">(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-green-600 mr-2" />
                <span className="text-gray-600">info@petcareclinic.com</span>
              </li>
              <li className="flex items-start">
                <Clock size={18} className="text-green-600 mr-2 mt-1" />
                <div className="text-gray-600">
                  <div>Пн-Пт: 8:00 - 20:00</div>
                  <div>Сб-Вс: Не работаем</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Клиника PetCare. Все права защищены (нет).
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;