import React, {useState, useEffect, useMemo} from 'react';
import { Search } from 'lucide-react';
import authService from "../services/authService";
interface PriceListItem {
  price_list_id: number;
  service: string;
  price: number;
  specialty_name: string;
}
const PriceListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCategory, setSelectedCategory] = useState('Всё');
  const [priceLists, setPriceLists] = useState<PriceListItem[]>([]);

  useEffect(() => {
    const fetchPriceLists = async () => {
      try {
        const response = await fetch(`${authService.API_URL}/price-lists`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPriceLists(data);
      } catch (error) {
        console.error('Failed to fetch price lists:', error);
      }
    };

    fetchPriceLists();
  }, []);

  const filteredAndSortedServices = useMemo(() => {
    return priceLists.filter(service => {
      const matchesSearch = service.service.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Всё' || service.specialty_name === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.price - b.price;
      }
      return b.price - a.price;
    });
  }, [searchTerm, sortOrder, selectedCategory, priceLists]);

  const categories = ['Всё', ...new Set(priceLists.map(item => item.specialty_name))];

  return <div className="w-full bg-white">
    <section className="bg-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800">Цены на услуги</h1>
        <p className="mt-2 text-lg text-gray-600">
          Полный перечень наших ветеринарных услуг и расценок
        </p>
      </div>
    </section>
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Сортировка по цене
              </label>
              <select id="sort" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="asc">От низких до высоких</option>
                <option value="desc">От высоких до низких</option>
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Фильтрация по категориям
              </label>
              <select id="category" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                {categories.map(category => <option key={category} value={category}>
                  {category}
                </option>)}
              </select>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Поиск услуг..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Показано {filteredAndSortedServices.length} услуг
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Услуга
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedServices.map((service, index) => <tr key={index}>
              <td className="px-6 py-4 whitespace-normal">
                <div className="text-sm text-gray-900">
                  {service.service}
                </div>
                <div className="text-sm text-gray-500">
                  {service.specialty_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm font-medium text-gray-900">
                  {service.price} руб.
                </div>
              </td>
            </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>;
};
export default PriceListPage;