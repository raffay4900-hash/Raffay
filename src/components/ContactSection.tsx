import React, { useState } from 'react';
import { submitContactInquiry } from '../firebase';
import { ContactMessage } from '../types';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ChevronDown } from 'lucide-react';

interface ContactSectionProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does LOGI MARKETING handle worldwide shipping?',
      a: 'We offer express insured shipping worldwide. Orders over $100 automatically qualify for Free Standard Delivery (3-5 business days). You receive live real-time tracking from dispatch to delivery.'
    },
    {
      q: 'What is your returns and warranty policy?',
      a: 'Every LOGI product includes our 30-day money-back guarantee and 2-year official manufacturer warranty. If you are not completely satisfied, return the item in original condition for an instant refund.'
    },
    {
      q: 'Are all products in stock and authentic?',
      a: 'Yes, 100%. Our inventory is synchronized in real-time with our online cloud database. Every unit is brand new, authenticated, and tested prior to shipping.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major Credit/Debit cards (Visa, Mastercard, Amex), Cash on Delivery (COD) for eligible regions, and direct Bank/UPI transfer.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const messageDoc: ContactMessage = {
        id: inquiryId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        subject: formData.subject,
        message: formData.message.trim(),
        createdAt: new Date().toISOString(),
      };

      await submitContactInquiry(messageDoc);
      setSubmitted(true);
      showToast('Inquiry submitted! Our team will respond within 24 hours.', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
    } catch (err: any) {
      console.error('Contact submit error:', err);
      showToast(err.message || 'Failed to submit inquiry. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Get in Touch
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 mb-4">
            We’re Here to Help You
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
            Have questions about product availability, bulk marketing orders, or custom requests? Reach out to the LOGI MARKETING support team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information & FAQ */}
          <div className="space-y-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Email Us</h4>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    support@logimarketing.com
                  </p>
                  <p className="text-xs text-slate-500">24/7 dedicated ticketing</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Call Support</h4>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    +1 (800) 584-LOGI
                  </p>
                  <p className="text-xs text-slate-500">Mon - Fri, 9am - 6pm EST</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Headquarters</h4>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    540 Tech Boulevard
                  </p>
                  <p className="text-xs text-slate-500">San Francisco, CA 94107</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Fast Dispatch</h4>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    Within 24 Hours
                  </p>
                  <p className="text-xs text-slate-500">Priority packaging</p>
                </div>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="py-3">
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-900 dark:text-white py-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          activeFaq === idx ? 'rotate-180 text-indigo-600' : ''
                        }`}
                      />
                    </button>
                    {activeFaq === idx && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Send Us a Message
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Our direct customer success managers reply in under 24 business hours.
            </p>

            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                  Message Sent Successfully!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-4">
                  Thank you for reaching out to LOGI MARKETING. Your message has been saved in our cloud records.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jordan Miller"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jordan@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="General Inquiry">General Product Inquiry</option>
                    <option value="Order Tracking">Order Tracking & Shipping</option>
                    <option value="Bulk Corporate Order">Bulk Corporate / Marketing Orders</option>
                    <option value="Warranty Claim">Warranty & Return Claim</option>
                    <option value="Partnership">Partnership & Distribution</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Message Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you need help with..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
