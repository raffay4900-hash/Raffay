import React, { useState } from 'react';
import { CartItem, Order, OrderItem } from '../types';
import { createOrderInDb } from '../firebase';
import { X, ShieldCheck, CreditCard, Banknote, Building2, Truck, CheckCircle2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedDiscount: number;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedDiscount,
  onOrderCompleted,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'bank'>('card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = (subtotal * appliedDiscount) / 100;
  const standardShipping = subtotal >= 100 ? 0 : 9.99;
  const shippingCost = deliveryMethod === 'express' ? 19.99 : standardShipping;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage('Please complete all required shipping & contact fields.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 12) {
        setErrorMessage('Please enter a valid card number.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderItems: OrderItem[] = items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.discountPrice || i.product.price,
        quantity: i.quantity,
        image: i.selectedImage || (i.product.images && i.product.images[0]) || '/placeholder-fallback.svg',
      }));

      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const newOrder: Order = {
        id: orderId,
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        shippingAddress: formData.address.trim(),
        city: formData.city.trim() || 'General City',
        postalCode: formData.postalCode.trim() || '00000',
        items: orderItems,
        subtotal: Number(subtotal.toFixed(2)),
        shipping: Number(shippingCost.toFixed(2)),
        discount: Number(discountAmount.toFixed(2)),
        total: Number(finalTotal.toFixed(2)),
        paymentMethod:
          paymentMethod === 'card'
            ? 'Credit / Debit Card'
            : paymentMethod === 'cod'
            ? 'Cash on Delivery (COD)'
            : 'Direct Bank Transfer / UPI',
        status: 'pending',
        createdAt: new Date().toISOString(),
        notes: formData.notes.trim() || undefined,
      };

      // Real write to online Firestore database
      await createOrderInDb(newOrder);

      onOrderCompleted(newOrder);
      onClose();
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMessage(err.message || 'Failed to submit order to database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Secure Checkout
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              LOGI MARKETING Real-Time Order Dispatch & Protection
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-6 md:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Contact & Shipping Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Contact & Delivery Info
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Alex Henderson"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="alex@domain.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Street Shipping Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Apartment, suite, street name"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Postal / Zip Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Delivery Speed Options */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Shipping Option
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    onClick={() => setDeliveryMethod('standard')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'standard'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Truck className="w-4 h-4 text-indigo-500" />
                      <span>Standard (3-5 Days)</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">
                      {subtotal >= 100 ? 'Free Delivery' : '$9.99'}
                    </span>
                  </div>

                  <div
                    onClick={() => setDeliveryMethod('express')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'express'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Truck className="w-4 h-4 text-amber-500" />
                      <span>Express Priority (1-2 Days)</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">$19.99</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment Method & Order Summary */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  2. Payment Method
                </h3>

                <div className="space-y-2">
                  {/* Card */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Credit / Debit Card
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Visa, Mastercard, Amex, Apple Pay
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  {/* COD */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Banknote className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Cash on Delivery (COD)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Pay upon parcel arrival at your doorstep
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  {/* Bank Transfer / UPI */}
                  <label
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-sky-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Bank Wire / UPI Transfer
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Direct online payment verification
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>

                {/* Card Fields Simulation */}
                {paymentMethod === 'card' && (
                  <div className="p-3.5 mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <div>
                      <input
                        type="text"
                        placeholder="Card Number (e.g. 4532 •••• •••• 8892)"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="CVC"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Order Summary Snapshot */}
                <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white mb-1">
                    Items ({items.reduce((s, i) => s + i.quantity, 0)}):
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-slate-600 dark:text-slate-300">
                    {items.map((i) => (
                      <div key={i.product.id} className="flex justify-between">
                        <span className="truncate max-w-[200px]">
                          {i.quantity}x {i.product.name}
                        </span>
                        <span className="font-medium">
                          ${((i.product.discountPrice || i.product.price) * i.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount ({appliedDiscount}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
                    <span>Order Total</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {isSubmitting
                      ? 'Processing Order in Database...'
                      : `Confirm & Pay $${finalTotal.toFixed(2)}`}
                  </span>
                </button>
                <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Encrypted 256-Bit SSL Checkout • Saved to Firestore DB</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
