/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, Phone, Briefcase, IndianRupee, MapPin, FileText, Clock, AlertTriangle, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { CustomerEntry } from '../types';
import { getMarathiDay, getFormattedDate, getFormattedTime } from '../utils/dateUtils';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<CustomerEntry, 'id' | 'timestamp' | 'date' | 'time' | 'day'> & { id?: string; date?: string; time?: string; day?: string }) => void;
  initialData?: CustomerEntry | null;
}

export function CustomerFormModal({ isOpen, onClose, onSave, initialData }: CustomerFormModalProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [workDone, setWorkDone] = useState('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [pendingAmount, setPendingAmount] = useState<string>('');
  const [profit, setProfit] = useState<string>('');
  const [address, setAddress] = useState('');
  const [otherInfo, setOtherInfo] = useState('');
  const [dueDateTime, setDueDateTime] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMarkedIncomplete, setIsMarkedIncomplete] = useState(false);
  const [incompleteReason, setIncompleteReason] = useState('');
  const [error, setError] = useState('');

  // Automatically calculate total amount: जमा + बाकी
  const totalAmount = (Number(paidAmount) || 0) + (Number(pendingAmount) || 0);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setMobile(initialData.mobile || '');
      setWorkDone(initialData.workDone || '');
      setPaidAmount(initialData.paidAmount ? String(initialData.paidAmount) : '');
      setPendingAmount(initialData.pendingAmount ? String(initialData.pendingAmount) : '');
      setProfit(initialData.profit !== undefined ? String(initialData.profit) : '');
      setAddress(initialData.address || '');
      setOtherInfo(initialData.otherInfo || '');
      setDueDateTime(initialData.dueDateTime || '');
      setIsCompleted(!!initialData.isCompleted);
      setIsMarkedIncomplete(!!initialData.isMarkedIncomplete);
      setIncompleteReason(initialData.incompleteReason || '');
    } else {
      setName('');
      setMobile('');
      setWorkDone('');
      setPaidAmount('');
      setPendingAmount('');
      setProfit('');
      setAddress('');
      setOtherInfo('');
      setDueDateTime('');
      setIsCompleted(false);
      setIsMarkedIncomplete(false);
      setIncompleteReason('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('कृपया ग्राहकाचे नाव प्रविष्ट करा.');
      return;
    }

    if (isMarkedIncomplete && !incompleteReason.trim()) {
      setError('कृपया अपूर्ण असण्याचे कारण प्रविष्ट करा.');
      return;
    }

    const now = new Date();
    onSave({
      id: initialData ? initialData.id : undefined,
      date: initialData ? initialData.date : getFormattedDate(now),
      time: initialData ? initialData.time : getFormattedTime(now),
      day: initialData ? initialData.day : getMarathiDay(now),
      name: name.trim(),
      mobile: mobile.trim(),
      workDone: workDone.trim(),
      paidAmount: Number(paidAmount) || 0,
      pendingAmount: Number(pendingAmount) || 0,
      totalAmount: totalAmount,
      profit: profit ? Number(profit) : 0,
      address: address.trim(),
      otherInfo: otherInfo.trim(),
      dueDateTime: dueDateTime || undefined,
      isCompleted: isCompleted,
      isMarkedIncomplete: isMarkedIncomplete,
      incompleteReason: isMarkedIncomplete ? incompleteReason.trim() : undefined,
    });

    onClose();
  };

  const now = new Date();
  const todayDate = getFormattedDate(now);
  const currentTime = getFormattedTime(now);
  const currentDay = getMarathiDay(now);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-['Poppins','Mukta',sans-serif]">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {initialData ? 'ग्राहकाची माहिती संपादित करा' : 'नवीन ग्राहक जोडा'}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                {initialData?.date || todayDate}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5 text-blue-700" />
                {initialData?.time || currentTime}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
                वार: {initialData?.day || currentDay}
              </span>
            </div>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* ग्राहकाचे नाव */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              ग्राहकाचे नाव <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा. राहुल पांडुरंग पाटील"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent font-medium"
                required
              />
            </div>
          </div>

          {/* मोबाईल नंबर */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              मोबाईल नंबर
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="उदा. 9876543210"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent font-medium"
              />
            </div>
          </div>

          {/* केलेले काम */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              केलेले काम
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={workDone}
                onChange={(e) => setWorkDone(e.target.value)}
                placeholder="उदा. आधार कार्ड अपडेट, पॅन कार्ड, उत्पन्न दाखला"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent font-medium"
              />
            </div>
          </div>

          {/* काम किती वेळेपर्यंत व्हायला पाहिजे (मुदत तारीख आणि वेळ) */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>हे काम किती वेळ पर्यंत व्हायला पाहिजे? (कामाची मुदत)</span>
              </label>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                अपेक्षित वेळ
              </span>
            </div>
            <p className="text-xs text-slate-500">
              जर या वेळेपर्यंत काम पूर्ण केले नाही, तर स्क्रीनवर लाल बॉक्स व अलर्ट नोटिफिकेशन दिसेल.
            </p>
            <input
              type="datetime-local"
              value={dueDateTime}
              onChange={(e) => setDueDateTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium text-sm"
            />
          </div>

          {/* कामाची स्थिती (Status) */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              id="is-completed"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="w-4 h-4 text-blue-700 rounded border-slate-300 focus:ring-blue-600 cursor-pointer"
            />
            <label htmlFor="is-completed" className="text-sm font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5">
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">काम पूर्ण झाले आहे (हिरवा बॉक्स)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-slate-700">काम अजून चालू आहे (निळा बॉक्स)</span>
                </>
              )}
            </label>
          </div>

          {/* रक्कम विभाग (Amount section): जमा, बाकी, एकूण (Auto calculate) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* जमा रक्कम */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                जमा रक्कम (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent font-medium"
                />
              </div>
            </div>

            {/* बाकी रक्कम */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                बाकी रक्कम (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={pendingAmount}
                  onChange={(e) => setPendingAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent font-medium"
                />
              </div>
            </div>

            {/* एकूण रक्कम (आपोआप गणना) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-slate-800">
                  एकूण रक्कम (₹)
                </label>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  आपोआप
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <IndianRupee className="w-4 h-4 text-blue-700 font-bold" />
                </div>
                <input
                  type="text"
                  readOnly
                  value={totalAmount}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-blue-900 font-bold cursor-not-allowed select-none"
                  title="जमा आणि बाकी टाकल्यावर एकूण रक्कम आपोआप येते"
                />
              </div>
            </div>
          </div>

          {/* प्रॉफिट (Profit) ऑप्शन */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>आपला प्रॉफिट / नफा (Profit) (₹)</span>
              </label>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                प्रॉफिट नोंद
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              या कामातून आपल्याला झालेला निव्वळ नफा (Profit) येथे टाका
            </p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                <IndianRupee className="w-4 h-4 font-bold" />
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={profit}
                onChange={(e) => setProfit(e.target.value)}
                placeholder="उदा. 50 किंवा 100"
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-emerald-300 rounded-xl text-emerald-950 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          {/* अपूर्ण मध्ये टाका (ON आणि OFF) */}
          <div className={`p-4 rounded-xl border transition-all ${isMarkedIncomplete ? 'bg-orange-50/80 border-orange-300 ring-1 ring-orange-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isMarkedIncomplete ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-sm font-bold text-slate-800">
                    अपूर्ण मधे टाका
                  </span>
                  {isMarkedIncomplete && (
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-orange-500 text-white shadow-xs">
                      (अपूर्ण मध्ये सक्रिय)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  कागदपत्रे अपूर्ण असल्यास किंवा काम अडकले असल्यास हे काम 'अपूर्ण' विभागात जाईल.
                </p>
              </div>

              {/* ON / OFF Switch Buttons */}
              <div className="flex items-center bg-slate-200 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMarkedIncomplete(false)}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    !isMarkedIncomplete
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  OFF
                </button>
                <button
                  type="button"
                  onClick={() => setIsMarkedIncomplete(true)}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    isMarkedIncomplete
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ON
                </button>
              </div>
            </div>

            {/* जर ON केले तर: अपूर्णा मध्ये का जात आहे? (कारण) */}
            {isMarkedIncomplete && (
              <div className="mt-3.5 pt-3.5 border-t border-orange-200 space-y-1.5">
                <label className="block text-xs font-bold text-orange-950 flex items-center justify-between">
                  <span>अपूर्ण मध्ये का जात आहे? (कारण सांगा)</span>
                  <span className="text-red-600 font-semibold">* आवश्यक</span>
                </label>
                <textarea
                  rows={2}
                  value={incompleteReason}
                  onChange={(e) => setIncompleteReason(e.target.value)}
                  placeholder="उदा. ग्राहकाचा आधार ओटीपी येत नाही, रहिवासी दाखला बाकी आहे, सरकारी सर्व्हर बंद आहे..."
                  className="w-full px-3.5 py-2.5 bg-white border border-orange-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium resize-none"
                  required={isMarkedIncomplete}
                />
              </div>
            )}
          </div>

          {/* पत्ता */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              पत्ता
            </label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="उदा. मु. पो. गाव, ता. जिल्हा"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent font-medium resize-none"
              />
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
                placeholder="उदा. कागदपत्रे जमा केली आहेत, अर्जाचा टोकन क्रमांक, इत्यादी"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent font-medium resize-none"
              />
            </div>
          </div>

          {/* Actions: Save Button (मुख्य बटन्स: रॉयल ब्लू) */}
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
              <span>सेव्ह करा</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
