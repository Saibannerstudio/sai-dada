/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, IndianRupee, Tag, FileText } from 'lucide-react';
import { ExpenseEntry } from '../types';
import { getFormattedDate, getFormattedTime } from '../utils/dateUtils';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<ExpenseEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => void;
  initialData?: ExpenseEntry | null;
}

export function ExpenseModal({ isOpen, onClose, onSave, initialData }: ExpenseModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [otherInfo, setOtherInfo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setDate(initialData.date || '');
      setTime(initialData.time || '');
      setOtherInfo(initialData.otherInfo || '');
    } else {
      const now = new Date();
      setName('');
      setAmount('');
      setDate(getFormattedDate(now));
      setTime(getFormattedTime(now));
      setOtherInfo('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('कृपया खर्चाचे नाव प्रविष्ट करा.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('कृपया वैध खर्च रक्कम प्रविष्ट करा.');
      return;
    }

    const now = new Date();
    onSave({
      id: initialData?.id,
      name: name.trim(),
      amount: Number(amount),
      date: date.trim() || getFormattedDate(now),
      time: time.trim() || getFormattedTime(now),
      otherInfo: otherInfo.trim(),
      timestamp: initialData?.timestamp || Date.now(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-['Poppins','Mukta',sans-serif]">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {initialData ? 'खर्चाची माहिती संपादित करा' : 'नवीन खर्च जोडा'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              केंद्राचा दैनिक किंवा इतर खर्च नोंदवा
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="बंद करा"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* नाव */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              नाव (कशावर खर्च केला / कोणाला दिले) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा. स्टेशनरी व झेरॉक्स पेपर, वीज बिल, इंटरनेट, चहा-नाश्ता"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 font-medium text-sm"
                required
              />
            </div>
          </div>

          {/* खर्च रक्कम */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              खर्च (रक्कम ₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <IndianRupee className="w-4 h-4 font-bold text-red-600" />
              </div>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="उदा. 250"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 font-bold text-base"
                required
              />
            </div>
          </div>

          {/* दिनांक व वेळ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                दिनांक
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                वेळ
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="उदा. 04:30 PM"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* इतर माहिती */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              इतर माहिती
            </label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={2}
                value={otherInfo}
                onChange={(e) => setOtherInfo(e.target.value)}
                placeholder="उदा. पावती क्रमांक, बिल तपशील किंवा इतर नोंद..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 text-sm font-medium resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer text-sm"
            >
              रद्द करा
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer text-sm"
            >
              <Save className="w-4 h-4" />
              <span>खर्च सेव्ह करा</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
