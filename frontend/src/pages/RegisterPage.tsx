import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import axios from 'axios'; // Import axios
import authService from '../services/authService'; // Import your authService

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '', // Keep this field as it's in the backend requirement
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // For success messages
  const [loading, setLoading] = useState(false); // Optional: for loading state
  const navigate = useNavigate();
  // Remove useAuth import and usage if replacing with direct API calls

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true); // Optional: set loading true

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false); // Optional: set loading false
      return;
    }

    // Data to send to backend (exclude confirmPassword)
    const registrationData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName,
      email: formData.email,
      password: formData.password,
    };

    try {
      // Make API call to your backend registration endpoint
      const response = await axios.post(`${authService.API_URL}/register`, registrationData);

      setMessage(response.data.message || 'Регистрация прошла успешно! Теперь вы можете войти.');
      setLoading(false); // Optional: set loading false

      // Optionally clear form or redirect after a delay
      setFormData({ // Clear form on success
        firstName: '', lastName: '', middleName: '', email: '', password: '', confirmPassword: ''
      });
      // Example: Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) { // Use 'any' or a more specific error type if available
      console.error("Registration failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Регистрация не удалась. Проверьте введенные данные или попробуйте еще раз позже.');
      setLoading(false); // Optional: set loading false
    }
  };

  // Keep the JSX structure the same as you provided, it looks good.
  // Just ensure the input names match the state keys:
  // firstName, lastName, middleName, email, password, confirmPassword
  return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Создайте свой аккаунт
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              Войти
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Message Display */}
              {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
              )}
              {/* Success Message Display */}
              {message && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                    {message}
                  </div>
              )}

              {/* Input Fields (ensure names match formData keys) */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Имя</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User size={16} className="text-gray-400" /></div>
                    <input type="text" name="firstName" id="firstName" required className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" value={formData.firstName} onChange={handleChange} />
                  </div>
                </div>
                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Отчество</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User size={16} className="text-gray-400" /></div>
                    <input type="text" name="lastName" id="lastName" required className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" value={formData.lastName} onChange={handleChange} />
                  </div>
                </div>
              </div>
              {/* Middle Name */}
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">Фамилия</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User size={16} className="text-gray-400" /></div>
                  {/* Make required if necessary based on backend */}
                  <input type="text" name="middleName" id="middleName" required className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" value={formData.middleName} onChange={handleChange} />
                </div>
              </div>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Электронная почта</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={16} className="text-gray-400" /></div>
                  <input type="email" name="email" id="email" autoComplete="email" required className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" value={formData.email} onChange={handleChange} />
                </div>
              </div>
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Пароль</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={16} className="text-gray-400" /></div>
                  <input type="password" name="password" id="password" required className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" value={formData.password} onChange={handleChange} />
                </div>
              </div>
              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Повторите пароль</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={16} className="text-gray-400" /></div>
                  <input type="password" name="confirmPassword" id="confirmPassword" required className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" value={formData.confirmPassword} onChange={handleChange} />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                    type="submit"
                    disabled={loading} // Optional: disable button while loading
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default RegisterPage;