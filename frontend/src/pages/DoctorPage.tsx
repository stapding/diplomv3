import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Clock, Award, Trash2 } from 'lucide-react';
import ReviewModal from '../components/ReviewModal';

interface Doctor {
  doctor_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  experience_age: number;
  description: string;
  image_path: string;
  reviews: Review[];
  specialties: string[];
  branches: Branch[];
}

interface Review {
  review_id: number;
  title: string;
  context: string;
  mark: number;
  rev_date: string;
  user_id: number;
  first_name: string;
  last_name: string;
}

interface Branch {
  branch_id: number;
  name: string;
  address: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={16}
                className={`${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ))}
      </div>
  );
};

const DoctorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}'); // Получаем данные пользователя из localStorage

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/doctors/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch doctor data');
        }
        const data: Doctor = await response.json();
        setDoctor(data);
        setReviews(data.reviews);
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      }
    };

    fetchDoctorData();
  }, [id]);

  if (!doctor) {
    return <div>Доктор не найден</div>;
  }

  const handleAppointmentClick = () => {
    navigate('/appointments');
  };

  const handleAddReview = async (reviewData: { title: string; text: string; rating: number }) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: reviewData.title,
          context: reviewData.text,
          mark: reviewData.rating,
          doctor_id: doctor.doctor_id,
          first_name: user.first_name, // Добавляем имя пользователя
          last_name: user.last_name,   // Добавляем фамилию пользователя
        }),
      });

      if (!response.ok) {
        console.error('Failed to create review');
        return;
      }

      const newReview = await response.json();

      // Обновляем список отзывов после успешного добавления
      setReviews([...reviews, newReview.review]);
      setIsReviewModalOpen(false);
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const token = localStorage.getItem('token'); // Получаем токен из localStorage

      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // Добавляем токен в заголовок
        },
      });

      if (!response.ok) {
        console.error('Failed to delete review');
        return;
      }

      // Обновляем список отзывов после успешного удаления
      setReviews(reviews.filter((review) => review.review_id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  // Проверяем, оставлял ли текущий пользователь отзыв этому врачу
  const hasUserReviewed = reviews.some((review) => review.user_id === user.userId);

  return (
      <div className="w-full bg-white">
        <section className="bg-green-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <img
                  src={doctor.image_path || 'https://via.placeholder.com/150'}
                  alt={doctor.first_name + ' ' + doctor.last_name}
                  className="w-48 h-48 rounded-full object-cover shadow-lg"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {doctor.first_name} {doctor.middle_name} {doctor.last_name}
                </h1>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center text-gray-600">
                    <Award size={18} className="text-green-600 mr-2" />
                    {doctor.experience_age} лет опыта
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">О ветеринаре</h2>
                <p className="text-gray-600 mb-8">{doctor.description}</p>
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Специальности
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties && doctor.specialties.map((specialty) => (
                        <span
                            key={specialty}
                            className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                      {specialty}
                    </span>
                    ))}
                  </div>
                </div>
                <div className="mt-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Отзывы клиентов
                    </h2>
                    <div className="space-x-4">
                      {/* Отображаем кнопку "Написать отзыв" только если пользователь не оставлял отзыв */}
                      {!hasUserReviewed && user.role === 'client' && (
                          <button
                              onClick={() => setIsReviewModalOpen(true)}
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                          >
                            Написать отзыв
                          </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.review_id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {review.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(review.rev_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <StarRating rating={review.mark} />
                              {/* Отображаем кнопку "Удалить" если отзыв принадлежит текущему пользователю или если пользователь - менеджер */}
                              {(user.userId === review.user_id && user.role === 'client' || user.role === 'manager') && (
                                  <button
                                      onClick={() => handleDeleteReview(review.review_id)}
                                      className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                              )}
                            </div>
                          </div>
                          <p className="mt-4 text-gray-600">{review.context}</p>
                          <div className="mt-4 text-sm font-medium text-gray-500">
                            - {review.first_name} {review.last_name}
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Контактная информация
                  </h3>
                  <div className="space-y-4">
                    <div className="font-medium text-gray-800">Клиники</div>
                    {doctor.branches && doctor.branches.map((branch) => (
                        <div key={branch.branch_id} className="flex items-start">
                          <MapPin className="text-green-600 mt-1 mr-3" size={20} />
                          <div>
                            <div className="text-gray-600 mt-1">
                              {branch.address}
                            </div>
                          </div>
                        </div>
                    ))}
                    <div className="flex items-center">
                      <Phone className="text-green-600 mr-3" size={20} />
                      <div>
                        <div className="font-medium text-gray-800">Номер телефона</div>
                        <div className="text-gray-600">(123) 456-7890</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="text-green-600 mr-3" size={20} />
                      <div>
                        <div className="font-medium text-gray-800">Эмейл</div>
                        <div className="text-gray-600">
                          {doctor.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Отображаем кнопку "Записаться на приём" только если пользователь не доктор */}
                  {user.role !== 'doctor' && (
                      <button
                          onClick={handleAppointmentClick}
                          className="w-full mt-6 bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors">
                        Записаться на приём
                      </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onSubmit={handleAddReview}
        />
      </div>
  );
};

export default DoctorPage;