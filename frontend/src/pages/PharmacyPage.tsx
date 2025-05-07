// PharmacyPage.tsx
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, ChevronRight } from 'lucide-react';
import authService from '../services/authService';

interface Product {
  product_id: number;
  category_id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category_name?: string;
}

interface Category {
  category_id: number;
  name: string;
  description: string;
}

const PharmacyPage = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всё');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      const data = await response.json();
      setCategories([{ category_id: 0, name: 'Всё', description: 'Всё' }, ...data]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchProducts();
    fetchCategories();
  }, []);


  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
        selectedCategory === 'Всё' || product.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
      (currentPage - 1) * productsPerPage,
      currentPage * productsPerPage
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product_id === product.product_id);
    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        setCart(
            cart.map((item) =>
                item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    const existingItem = cart.find((item) => item.product_id === productId);
    if (existingItem && existingItem.quantity === 1) {
      setCart(cart.filter((item) => item.product_id !== productId));
    } else {
      setCart(
          cart.map((item) =>
              item.product_id === productId ? { ...item, quantity: item.quantity - 1 } : item
          )
      );
    }
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const ProductCard = ({
                         product,
                         onAddToCart
                       }: {
    product: Product;
    onAddToCart: (product: Product) => void;
  }) => {
    const isOutOfStock = product.quantity === 0;
    const isDoctor = currentUser && currentUser.role === 'doctor';
    const isAddToCartDisabled = isDoctor ||
        cart.find((item) => item.product_id === product.product_id)?.quantity === product.quantity;

    return (
        <div className="w-[220px] h-[320px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="h-[180px] overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
            <div className="mt-auto flex items-center justify-between">
              <div className="text-gray-600">Кол-во: {product.quantity}</div>
              <div className="font-bold text-gray-900">{product.price.toFixed(2)} руб.</div>
            </div>
            {isOutOfStock ? (
                <button
                    disabled
                    className="mt-4 w-full bg-gray-300 text-gray-500 rounded-md py-2 cursor-not-allowed"
                >
                  Нет в наличии
                </button>
            ) : (
                <button
                    onClick={() => onAddToCart(product)}
                    disabled={isAddToCartDisabled}
                    className={`mt-4 w-full text-white rounded-md py-2 ${
                        isAddToCartDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  {isDoctor ? 'Недоступно' : isAddToCartDisabled ? 'Лимит корзины' : 'Добавить'}
                </button>
            )}
          </div>
        </div>
    );
  };

  const Pagination = ({
                        currentPage,
                        totalPages,
                        onPageChange
                      }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    return (
        <div className="flex justify-center space-x-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-4 py-2 rounded-md ${
                      currentPage === page ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
          ))}
        </div>
    );
  };

  const isPlusDisabled = (item: Product) => {
    // Находим оригинальный товар из общего списка товаров
    const originalProduct = products.find(p => p.product_id === item.product_id);
    // Если товара нет в списке, кнопка должна быть недоступна
    if (!originalProduct) return true;

    // Сравниваем количество в корзине с доступным количеством на складе
    return item.quantity >= originalProduct.quantity;
  };

  const createOrder = async () => {
    const token = authService.getToken();

    if (!token) {
      alert('Пожалуйста, войдите, чтобы оформить заказ.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cart: cart }),
      });

      if (response.ok) {
        setCart([]);
        setIsCartOpen(false);
        // Обновляем список продуктов после успешного заказа
        await fetchProducts();
        alert('Заказ успешно создан!');
      } else {
        const errorData = await response.json();
        alert(`Ошибка при создании заказа: ${errorData.message || 'Не удалось создать заказ'}`);
      }
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      alert('Не удалось создать заказ. Пожалуйста, попробуйте позже.');
    }
  };

  return (
      <div className="w-full bg-white">
        <section className="bg-green-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-800">Лекарства для животных</h1>
            <p className="mt-2 text-lg text-gray-600">Заказ лекарств и расходных материалов для вашего питомца</p>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Поиск продуктов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative ml-4">
                <button
                    className="flex items-center space-x-2 bg-green-600 text-white rounded-md py-2 px-4 focus:outline-none hover:bg-green-700"
                    onClick={() => setIsCartOpen(!isCartOpen)}
                >
                  <ShoppingCart size={18} />
                  <span>Корзина ({cartItemCount})</span>
                </button>
                {isCartOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200">
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-3">Ваша корзина</h3>
                        {cart.length === 0 ? (
                            <p className="text-gray-500">Ваша корзина пуста</p>
                        ) : (
                            <>
                              <div className="max-h-64 overflow-y-auto">
                                {cart.map((item) => (
                                    <div key={item.product_id} className="flex items-center justify-between py-2 border-b">
                                      <div className="flex items-center">
                                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover mr-3" />
                                        <div>
                                          <div className="font-medium">{item.name}</div>
                                          <div className="text-sm text-gray-500">
                                            {item.price.toFixed(2)} руб.
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center">
                                        <button
                                            className="text-gray-500 hover:text-gray-700"
                                            onClick={() => removeFromCart(item.product_id)}
                                        >
                                          <Minus size={14} />
                                        </button>
                                        <span className="mx-2">{item.quantity}</span>
                                        <button
                                            className={`${isPlusDisabled(item) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                                            onClick={() => {
                                              if (!isPlusDisabled(item)) {
                                                // Находим оригинальный товар из списка товаров
                                                const originalProduct = products.find(p => p.product_id === item.product_id);
                                                if (originalProduct) {
                                                  addToCart(originalProduct);
                                                }
                                              }
                                            }}
                                        >
                                          <Plus size={14}/>
                                        </button>
                                      </div>
                                    </div>
                                ))}
                              </div>
                              <div className="mt-4 pt-2 border-t">
                                <div className="flex justify-between font-semibold">
                                  <span>Итого:</span>
                                  <span>{cartTotal.toFixed(2)} руб.</span>
                                </div>
                                <button
                                    onClick={createOrder}
                                    className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
                                >
                                  Оформить заказ
                                </button>
                              </div>
                            </>
                        )}
                      </div>
                    </div>
                )}
              </div>
            </div>
            <div className="flex gap-8">
              <div className="w-64 flex-shrink-0">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-800">Категории</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {categories.map((category) => (
                        <button
                            key={category.category_id}
                            onClick={() => {
                              setSelectedCategory(category.name);
                              setCurrentPage(1);
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 ${
                                selectedCategory === category.name ? 'bg-green-50 text-green-600' : 'text-gray-700'
                            }`}
                        >
                          <span>{category.name}</span>
                          <ChevronRight
                              size={16}
                              className={selectedCategory === category.name ? 'text-green-600' : 'text-gray-400'}
                          />
                        </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                  {currentProducts.map((product) => (
                      <ProductCard key={product.product_id} product={product} onAddToCart={addToCart} />
                  ))}
                </div>
                {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

export default PharmacyPage;