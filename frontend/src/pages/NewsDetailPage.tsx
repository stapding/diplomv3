import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Pencil, Trash2 } from 'lucide-react';
import NewsModal from '../components/NewsModal';
import authService from '../services/authService';

interface NewsItem {
  news_id: number;
  title: string;
  subtitle: string;
  content: string;
  news_date: string;
  branch_name: string;
  branch_address: string;
  subheading: string;
  branch: string;
}

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        const response = await fetch(`${authService.API_URL}/news/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNewsItem(data);
      } catch (error) {
        console.error('Failed to fetch news item:', error);
        navigate('/news');
      }
    };

    fetchNewsItem();

    const user = authService.getCurrentUser();
    if (user && user.role === 'manager') {
      setIsManager(true);
    }
  }, [id, navigate]);

  if (!newsItem) {
    return (
        <div className="w-full min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">News not found</h2>
            <button onClick={() => navigate('/news')} className="mt-4 text-green-600 hover:text-green-700">
              Back to News
            </button>
          </div>
        </div>
    );
  }

  const handleEdit = async (updatedNews: any) => {
    try {
      const response = await fetch(`${authService.API_URL}/news/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNews),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedNewsItem = await response.json();
      setNewsItem(updatedNewsItem.news);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update news item:', error);
      alert('Failed to update news item.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      try {
        const response = await fetch(`${authService.API_URL}/news/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        navigate('/news'); // Redirect to news list after successful deletion
      } catch (error) {
        console.error('Failed to delete news item:', error);
        alert('Failed to delete the news item.');
      }
    }
  };

  return (
      <div className="w-full bg-white">
        <section className="bg-green-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{newsItem.title}</h1>
                <p className="mt-2 text-xl text-gray-600">{newsItem.subtitle}</p>
                <div className="flex items-center mt-4 text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    {new Date(newsItem.news_date).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    {newsItem.branch_address}
                  </div>
                </div>
              </div>
              {/* Условный рендеринг для отображения кнопок только для менеджеров */}
              {isManager && (
                  <div className="flex space-x-4">
                    <button onClick={() => setIsEditModalOpen(true)} className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                      <Pencil size={16} className="mr-2" />
                      Изменить
                    </button>
                    <button onClick={handleDelete} className="flex items-center px-4 py-2 border border-red-300 rounded-md text-red-600 hover:bg-red-50">
                      <Trash2 size={16} className="mr-2" />
                      Удалить
                    </button>
                  </div>
              )}
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {newsItem.content}
              </p>
            </div>
          </div>
        </section>
        <NewsModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleEdit}
            initialData={newsItem}
            isEditing
        />
      </div>
  );
};

export default NewsDetailPage;