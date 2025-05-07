import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: {
    title: string;
    text: string;
    rating: number;
  }) => void;
}
const ReviewModal = ({
  isOpen,
  onClose,
  onSubmit
}: ReviewModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    rating: 5
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      text: '',
      rating: 5
    });
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Написать отзыв
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                Оценка
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => setFormData({
                ...formData,
                rating: star
              })} className="focus:outline-none">
                    <Star size={24} className={`${star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  </button>)}
              </div>
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок
              </label>
              <input type="text" id="title" value={formData.title} onChange={e => setFormData({
              ...formData,
              title: e.target.value
            })} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
            </div>
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                Отзыв
              </label>
              <textarea id="text" value={formData.text} onChange={e => setFormData({
              ...formData,
              text: e.target.value
            })} rows={4} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
            </div>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Отмена
              </button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Отправить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>;
};
export default ReviewModal;