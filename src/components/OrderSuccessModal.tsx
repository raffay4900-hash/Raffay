import React from 'react';
import { Order } from '../types';
import { CheckCircle2, PackageCheck, Printer, ArrowRight, Truck } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
  onViewOrders,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-300 dark:border-emerald-800 shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Order Successfully Placed
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 mb-2">
          Thank You, {order.customerName}!
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Your order has been recorded in our persistent cloud database. A confirmation dispatch notice has been prepared for {order.customerEmail}.
        </p>

        {/* Order Details Receipt Box */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 text-left text-xs space-y-3 mb-6">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-400 text-[11px] block">Order Tracking ID</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {order.id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[11px] block">Payment Method</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {order.paymentMethod}
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block mb-1">Delivering To:</span>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {order.shippingAddress}, {order.city} {order.postalCode}
            </p>
            <p className="text-slate-500">Phone: {order.customerPhone}</p>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[11px] block mb-2 font-semibold">Items Summary:</span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[280px]">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-900 dark:text-white">Total Amount Paid</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-base">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
