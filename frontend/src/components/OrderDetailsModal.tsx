import React from 'react';
import { X } from 'lucide-react';
interface OrderItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}
interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: number;
    items: OrderItem[];
    totalPrice: number;
    date: string;
    status: string;
  } | null;
}
const OrderDetailsModal = ({
  isOpen,
  onClose,
  order
}: OrderDetailsModalProps) => {
  if (!isOpen || !order) return null;
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Заказ #{order.id}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <div className="text-sm text-gray-500">
              Дата заказа: {new Date(order.date).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-500">
              Статус заказа:{' '}
              <span className="text-green-600 font-medium">{order.status}</span>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {order.items.map(item => <div key={item.id} className="flex gap-4 py-4 border-b">
                <div className="w-20 h-20 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.category}</p>
                  <div className="mt-1 text-sm text-gray-500">
                    Количество: {item.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {(item.price * item.quantity).toFixed(2)} руб.
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.price.toFixed(2)} руб. за шт
                  </div>
                </div>
              </div>)}
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Всего позиций:</span>
              <span>{totalItems} позиции</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Итоговая сумма:</span>
              <span>{order.totalPrice.toFixed(2)} руб.</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default OrderDetailsModal;