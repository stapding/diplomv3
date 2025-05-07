import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import authService from '../services/authService';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; subtitle: string; content: string; branch: string; }) => void;
  initialData?: { title: string; subtitle: string; content: string; branch: string; };
  isEditing?: boolean;
}

interface Branch {
  branch_id: number;
  name: string;
  address: string;
  description: string;
}

const NewsModal = ({
                     isOpen,
                     onClose,
                     onSubmit,
                     initialData,
                     isEditing = false
                   }: NewsModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    branch: '',
  });
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${authService.API_URL}/branches`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBranches(data);
        if (data.length > 0) {
          setFormData(prevFormData => ({ ...prevFormData, branch: data[0].address }));
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      subtitle: '',
      content: '',
      branch: branches.length > 0 ? branches[0].address : '',
    });
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Редактировать новости' : 'Написать новость'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Заголовок
                </label>
                <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                />
              </div>
              <div>
                <label htmlFor="subheading" className="block text-sm font-medium text-gray-700 mb-1">
                  Подзаголовок
                </label>
                <input
                    type="text"
                    id="subheading"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                />
              </div>
              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                  Отделение клиники
                </label>
                <select
                    id="branch"
                    value={formData.branch}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                >
                  {branches.map(branch => (
                      <option key={branch.branch_id} value={branch.address}>
                        {branch.address}
                      </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Основной контент
                </label>
                <textarea
                    id="content"
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Отмена
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  {isEditing ? 'Сохранить изменения' : 'Добавить новость'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
  );
};

export default NewsModal;