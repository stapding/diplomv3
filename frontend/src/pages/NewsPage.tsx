import React, { useState, useEffect } from 'react';
import {MapPin, Calendar, PlusCircle} from 'lucide-react';
import authService from '../services/authService';
import { Link, useNavigate } from 'react-router-dom';
import NewsModal from '../components/NewsModal';

interface NewsItem {
  news_id: number;
  title: string;
  subtitle: string;
  news_date: string;
  branch_name: string;
  branch_address: string;
}

const NewsPage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isManager, setIsManager] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${authService.API_URL}/news`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }
    };

    fetchNews();

    const user = authService.getCurrentUser();
    if (user && user.role === 'manager') {
      setIsManager(true);
    }
  }, []);

  const handleCreateNews = async (newsData: any) => {
    try {
      const response = await fetch(`${authService.API_URL}/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // После успешного создания новости, обновите список новостей
      const newNewsItem = await response.json();
      setNews([...news, newNewsItem.news]);

      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create news item:', error);
      alert('Failed to create news item.');
    }
  };

  return (
      <div className="w-full bg-white">
        <section className="bg-green-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Новости</h1>
                <p className="mt-2 text-lg text-gray-600">
                  Последние новости из наших клиник
                </p>
              </div>
              {isManager && (
                  <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    <PlusCircle size={20} className="mr-2"/>
                    Написать новость
                  </button>
              )}
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {news.map((item, index) => (
                  <Link to={`/news/${item.news_id}`} key={item.news_id}>
                    <div className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${
                        index !== news.length - 1 ? 'mb-8' : ''
                    }`}>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {item.title}
                      </h2>
                      <p className="text-gray-600 mb-4">{item.subtitle}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2" />
                          {new Date(item.news_date).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2" />
                          {item.branch_address}
                        </div>
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          </div>
        </section>
        <NewsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateNews}
        />
      </div>
  );
};

export default NewsPage;