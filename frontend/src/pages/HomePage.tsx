import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Award, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import authService from "../services/authService";
import ImageSlider from '../components/ImageSlider';

interface Testimonial {
  context: string;
  mark: number;
  first_name: string;
  last_name: string;
}

const HomePage = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${authService.API_URL}/testimonials`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Testimonial[] = await response.json();
        setTestimonials(data);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      }
    };

    fetchTestimonials();
  }, []);

  return (
      <div className="w-full">
        {/* Hero Section */}
        <section className="bg-green-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                  Надёжный уход за вашими{' '}
                  <span className="text-green-600">пушистыми друзьями</span>
                </h1>
                <p className="mt-4 text-xl text-gray-600">
                  Профессиональные ветеринарные услуги с нежной заботой. Потому что
                  ваши питомцы заслуживают самого лучшего.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                      to="/appointments"
                      className="inline-block bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
                  >
                    Записаться на приём
                  </Link>
                  <Link
                      to="/pharmacy"
                      className="inline-block bg-white text-green-600 border border-green-600 px-6 py-3 rounded-md font-medium hover:bg-green-50 transition-colors"
                  >
                    Заказать лекарства
                  </Link>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <ImageSlider />
              </div>
            </div>
          </div>
        </section>
        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-800">Наши услуги</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Комплексное обслуживание всех потребностей вашего питомца
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Оздоровление и профилактика
                </h3>
                <p className="text-gray-600 mb-4">
                  Регулярные осмотры, вакцинации и профилактический уход для
                  поддержания здоровья вашего питомца.
                </p>
                <Link
                    to="/appointments"
                    className="text-green-600 font-medium flex items-center hover:text-green-700"
                >
                  Изучить больше <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Специализированное лечение
                </h3>
                <p className="text-gray-600 mb-4">
                  Передовая диагностика, хирургия, стоматология и
                  специализированные медицинские процедуры.
                </p>
                <Link
                    to="/appointments"
                    className="text-green-600 font-medium flex items-center hover:text-green-700"
                >
                  Изучить больше <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Фармацевтические услуги
                </h3>
                <p className="text-gray-600 mb-4">
                  Рецептурные лекарства, добавки и специальные диеты доставляются к
                  вашей двери.
                </p>
                <Link
                    to="/pharmacy"
                    className="text-green-600 font-medium flex items-center hover:text-green-700"
                >
                  Заказать сейчас <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* Appointment CTA Section */}
        <section className="py-16 bg-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold">
                  Необходимо обратиться к ветеринару?
                </h2>
                <p className="mt-4 text-lg text-green-50">
                  Запишитесь на прием онлайн за считанные секунды. Наша команда
                  ответственных ветеринаров готова помочь вашему питомцу почувствовать
                  себя лучше.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <CheckCircle size={20} className="mr-2 text-green-200" />
                    <span>Часто можно записаться на прием в тот же день</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle size={20} className="mr-2 text-green-200" />
                    <span>Удобная онлайн-запись</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle size={20} className="mr-2 text-green-200" />
                    <span>Просматривайте записи своего питомца в любое время</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link
                      to="/appointments"
                      className="inline-block bg-white text-green-600 px-6 py-3 rounded-md font-medium hover:bg-green-50 transition-colors"
                  >
                    Записаться на приём
                  </Link>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img
                    src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    alt="Veterinarian examining a cat"
                    className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>
        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-800">
                Что говорят владельцы домашних животных
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Не верьте нам на слово - узнайте от наших счастливых клиентов.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                  <div className="bg-green-50 p-6 rounded-lg" key={index}>
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                              key={star}
                              className="w-5 h-5 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4">{testimonial.context}</p>
                    <p className="font-semibold text-gray-900">
                      — {testimonial.first_name} {testimonial.last_name}.
                    </p>
                  </div>
              ))}
            </div>
          </div>
        </section>
      </div>
  );
};

export default HomePage;