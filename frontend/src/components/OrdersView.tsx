// frontend/src/components/OrdersView.tsx
import React, { useState, ChangeEvent, MouseEvent, useEffect } from 'react';
import { Package, ChevronRight, User } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';
import authService from '../services/authService';

// Добавляем недостающие определения типов
interface OrderItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

type OrderStatus = 'Сборка' | 'Доставляется' | 'Завершено';

// Интерфейс Order
interface Order {
  order_id: number;
  user_id: number;
  ord_date: string;
  status: string;
  customerName: string;
  totalPrice: number;
  items: OrderItem[];
}

// statusOptions остается без изменений
const statusSortOrder: string[] = ['Сборка', 'Доставляется', 'Завершено'];
const statusOptions: string[] = ['Сборка', 'Доставляется', 'Завершено'];

const pluralizeItems = (count: number): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  const titles = ['товар', 'товара', 'товаров'];
  return titles[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[(count % 10 < 5) ? count % 10 : 5]];
};

const OrdersView = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = authService.getToken();
        const response = await fetch(`${authService.API_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Сборка':
        return 'bg-yellow-100 text-yellow-800';
      case 'Доставляется':
        return 'bg-blue-100 text-blue-800';
      case 'Завершено':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${authService.API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.status}`);
      }

      // Update the order in the local state
      setOrders((prevOrders) =>
          prevOrders.map((order) =>
              order.order_id === orderId ? { ...order, status: newStatus } : order
          )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleSelectClick = (e: MouseEvent<HTMLSelectElement>) => {
    e.stopPropagation();
  };

  const handleOrderClick = (order: Order) => {
    // Вычисляем общую стоимость как сумму всех товаров,
    // это гарантирует, что totalPrice всегда будет числом
    const calculatedTotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const adaptedOrder = {
      id: order.order_id,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      // Используем вычисленную сумму или берем totalPrice из заказа (если есть)
      totalPrice: calculatedTotal,
      date: order.ord_date,
      status: order.status
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setSelectedOrder(adaptedOrder);
  };

  const isManager = currentUser && currentUser.role === 'manager';

  const sortedOrders = [...orders].sort((a, b) => {
    const statusAIndex = statusSortOrder.indexOf(a.status as OrderStatus);
    const statusBIndex = statusSortOrder.indexOf(b.status as OrderStatus);
    return statusAIndex - statusBIndex;
  });

  return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {isManager ? 'Заказы пользователей' : 'Мои заказы'}
        </h2>
        <div className="space-y-4">
          {sortedOrders.map((order) => {
            // Вычисляем общее количество товаров
            const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
            // Получаем правильную форму слова
            const itemWord = pluralizeItems(totalQuantity);

            return (
                <div
                    key={order.order_id}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOrderClick(order)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-lg">Заказ #{order.order_id}</h3>
                        <div className="text-sm text-gray-500">
                          {new Date(order.ord_date).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      {isManager && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User size={16} className="text-gray-500" />
                            <span>{order.customerName}</span>
                          </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-500" />
                        {/* Используем вычисленное количество и правильное слово */}
                        <span className="text-gray-600">
                      {totalQuantity} {itemWord}
                    </span>
                      </div>
                      <div className="font-medium text-gray-900">
                        Всего: {order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} руб.
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                          value={order.status}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              handleStatusChange(order.order_id, e.target.value as OrderStatus)
                          }
                          onClick={handleSelectClick}
                          disabled={!isManager}
                          className={`appearance-none px-3 py-1 rounded-full text-sm font-medium border-none focus:outline-none focus:ring-0 ${getStatusColor(
                              order.status as OrderStatus
                          )} ${!isManager ? 'cursor-default' : ''}`}
                          style={{ backgroundImage: 'none' }}
                      >
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                        ))}
                      </select>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  </div>
                </div>
            );
          })}
        </div>
        <OrderDetailsModal
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            order={selectedOrder}
        />
      </div>
  );
};

export default OrdersView;