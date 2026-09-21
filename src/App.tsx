/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerEntry, ExpenseEntry } from './types';
import { HomePage } from './components/HomePage';
import { getMarathiDay, getFormattedDate, getFormattedTime } from './utils/dateUtils';

// Initial realistic default customers seed (only used on first-ever load if localStorage is empty)
const DEFAULT_CUSTOMERS: CustomerEntry[] = [
  {
    id: 'cust_seed_1',
    name: 'राजेश तुकाराम पाटील',
    mobile: '9822012345',
    workDone: 'नवीन पॅन कार्ड (Pan Card)',
    paidAmount: 200,
    pendingAmount: 0,
    totalAmount: 200,
    profit: 120,
    address: 'मु. पो. वाघोली, पुणे',
    otherInfo: 'तातडीचे काम (Urgent e-KYC)',
    timestamp: Date.now() - 3600000 * 5,
    date: getFormattedDate(new Date()),
    time: '10:30 AM',
    day: getMarathiDay(new Date()),
    dueDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    isCompleted: true,
    isMarkedIncomplete: false,
    incompleteReason: ''
  },
  {
    id: 'cust_seed_2',
    name: 'सुनीता रमेश कांबळे',
    mobile: '9423098765',
    workDone: 'उत्पन्न दाखला & 7/12 उतारा',
    paidAmount: 150,
    pendingAmount: 100,
    totalAmount: 250,
    profit: 160,
    address: 'गणेश नगर, पुणे',
    otherInfo: 'तहसीलदार कार्यालयाकडून मंजुरी बाकी',
    timestamp: Date.now() - 3600000 * 2,
    date: getFormattedDate(new Date()),
    time: '12:15 PM',
    day: getMarathiDay(new Date()),
    dueDateTime: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
    isCompleted: false,
    isMarkedIncomplete: false,
    incompleteReason: ''
  },
  {
    id: 'cust_seed_3',
    name: 'अमोल विठ्ठल शिंदे',
    mobile: '9881234567',
    workDone: 'आधार कार्ड मोबाईल नंबर लिंक',
    paidAmount: 50,
    pendingAmount: 100,
    totalAmount: 150,
    profit: 80,
    address: 'शिवाजी चौक, पुणे',
    otherInfo: 'OTP पडताळणी बाकी आहे',
    timestamp: Date.now() - 3600000 * 24,
    date: getFormattedDate(new Date(Date.now() - 86400000)),
    time: '04:45 PM',
    day: getMarathiDay(new Date(Date.now() - 86400000)),
    dueDateTime: new Date(Date.now() - 3600000 * 2).toISOString().slice(0, 16),
    isCompleted: false,
    isMarkedIncomplete: true,
    incompleteReason: 'ग्राहकाचा आधार लिंक असलेला जुना फोन नंबर बंद आहे.'
  }
];

// Initial default expense seed
const DEFAULT_EXPENSES: ExpenseEntry[] = [
  {
    id: 'exp_seed_1',
    name: 'झेरॉक्स कागद रीम व लॅमिनेशन रोल',
    amount: 350,
    date: getFormattedDate(new Date()),
    time: '11:00 AM',
    otherInfo: 'दुकानासाठी A4 साईझ २ रीम',
    timestamp: Date.now() - 3600000 * 4
  }
];

export default function App() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Authentication status with localStorage persistence
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sai_seva_kendra_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Customer entries loaded from localStorage
  const [customers, setCustomers] = useState<CustomerEntry[]>(() => {
    try {
      const saved = localStorage.getItem('sai_seva_kendra_customers');
      if (saved !== null) {
        const parsed: CustomerEntry[] = JSON.parse(saved);
        // Normalize any missing time, day, or profit properties
        return parsed.map((c) => {
          const fallbackDate = c.timestamp ? new Date(c.timestamp) : new Date();
          return {
            ...c,
            time: c.time || getFormattedTime(fallbackDate),
            day: c.day || getMarathiDay(fallbackDate),
            profit: typeof c.profit === 'number' ? c.profit : (Number(c.profit) || 0),
            isCompleted: typeof c.isCompleted === 'boolean' ? c.isCompleted : false,
            isMarkedIncomplete: typeof c.isMarkedIncomplete === 'boolean' ? c.isMarkedIncomplete : false,
            incompleteReason: c.incompleteReason || '',
          };
        });
      } else {
        // Initial setup: save default seed to localStorage
        localStorage.setItem('sai_seva_kendra_customers', JSON.stringify(DEFAULT_CUSTOMERS));
        return DEFAULT_CUSTOMERS;
      }
    } catch (err) {
      console.error('Error loading customers from localStorage:', err);
    }
    return DEFAULT_CUSTOMERS;
  });

  // Expense entries loaded from localStorage
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(() => {
    try {
      const saved = localStorage.getItem('sai_seva_kendra_expenses');
      if (saved !== null) {
        return JSON.parse(saved);
      } else {
        localStorage.setItem('sai_seva_kendra_expenses', JSON.stringify(DEFAULT_EXPENSES));
        return DEFAULT_EXPENSES;
      }
    } catch (err) {
      console.error('Error loading expenses from localStorage:', err);
    }
    return DEFAULT_EXPENSES;
  });

  // Automatically sync customer data to browser localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('sai_seva_kendra_customers', JSON.stringify(customers));
    } catch (err) {
      console.error('Error saving customers to localStorage:', err);
    }
  }, [customers]);

  // Automatically sync expense data to browser localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('sai_seva_kendra_expenses', JSON.stringify(expenses));
    } catch (err) {
      console.error('Error saving expenses to localStorage:', err);
    }
  }, [expenses]);

  // Automatically sync login session to browser localStorage
  useEffect(() => {
    try {
      if (isLoggedIn) {
        localStorage.setItem('sai_seva_kendra_auth', 'true');
      } else {
        localStorage.removeItem('sai_seva_kendra_auth');
      }
    } catch (err) {
      console.error('Error saving auth state to localStorage:', err);
    }
  }, [isLoggedIn]);

  // Cross-tab synchronization via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sai_seva_kendra_customers' && e.newValue) {
        try {
          setCustomers(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error syncing customers from storage event:', err);
        }
      }
      if (e.key === 'sai_seva_kendra_expenses' && e.newValue) {
        try {
          setExpenses(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error syncing expenses from storage event:', err);
        }
      }
      if (e.key === 'sai_seva_kendra_auth') {
        setIsLoggedIn(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedId = userId.trim();

    if (!trimmedId) {
      setErrorMessage('कृपया युझर आयडी प्रविष्ट करा.');
      return;
    }

    if (!password) {
      setErrorMessage('कृपया पासवर्ड प्रविष्ट करा.');
      return;
    }

    setIsLoading(true);

    // Simulate clean brief authentication delay for polished user feedback
    setTimeout(() => {
      // Required credentials: ID = Sai, Password = 983414
      if (trimmedId === 'Sai' && password === '983414') {
        setIsLoggedIn(true);
        setErrorMessage('');
      } else {
        setErrorMessage('चुकीचा आयडी किंवा पासवर्ड! कृपया योग्य माहिती भरा.');
      }
      setIsLoading(false);
    }, 450);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem('sai_seva_kendra_auth');
    } catch (err) {
      console.error(err);
    }
    setUserId('');
    setPassword('');
    setErrorMessage('');
  };

  const handleAddCustomer = (
    data: Omit<CustomerEntry, 'id' | 'timestamp' | 'date' | 'time' | 'day'> & {
      id?: string;
      date?: string;
      time?: string;
      day?: string;
    }
  ) => {
    const now = new Date();

    const newEntry: CustomerEntry = {
      ...data,
      id: 'cust_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      date: data.date || getFormattedDate(now),
      time: data.time || getFormattedTime(now),
      day: data.day || getMarathiDay(now),
      isCompleted: !!data.isCompleted,
    };

    setCustomers((prev) => [newEntry, ...prev]);
  };

  const handleEditCustomer = (updatedEntry: CustomerEntry) => {
    setCustomers((prev) =>
      prev.map((item) => (item.id === updatedEntry.id ? updatedEntry : item))
    );
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setCustomers((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const handleAddExpense = (
    data: Omit<ExpenseEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }
  ) => {
    const newEntry: ExpenseEntry = {
      ...data,
      id: data.id || 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: data.timestamp || Date.now(),
    };

    setExpenses((prev) => [newEntry, ...prev]);
  };

  const handleEditExpense = (updatedEntry: ExpenseEntry) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === updatedEntry.id ? updatedEntry : item))
    );
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // If logged in, show the Home Page
  if (isLoggedIn) {
    return (
      <HomePage
        onLogout={handleLogout}
        customers={customers}
        onAddCustomer={handleAddCustomer}
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onToggleComplete={handleToggleComplete}
        expenses={expenses}
        onAddExpense={handleAddExpense}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpense}
      />
    );
  }

  // Otherwise, render the exact untouched login page
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 py-6 px-4 shadow-xs">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-2.5 bg-blue-50 text-blue-700 rounded-full mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            साई ऑनलाईन सेवा केंद्र
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1 font-medium">
            अधिकृत डिजिटल सेवा पोर्टल
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key="login-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8"
            >
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  पोर्टल लॉगिन
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  कृपया सेवेमध्ये प्रवेश करण्यासाठी आपली माहिती भरा
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMessage}</span>
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                {/* User ID Input */}
                <div>
                  <label
                    htmlFor="user-id"
                    className="block text-sm font-semibold text-slate-800 mb-1.5"
                  >
                    युझर आयडी (User ID)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      id="user-id"
                      type="text"
                      value={userId}
                      onChange={(e) => {
                        setUserId(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      autoComplete="username"
                      placeholder="युझर आयडी टाका"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-800 mb-1.5"
                  >
                    पासवर्ड (Password)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      autoComplete="current-password"
                      placeholder="पासवर्ड टाका"
                      className="w-full pl-11 pr-11 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      aria-label={showPassword ? 'पासवर्ड लपवा' : 'पासवर्ड दाखवा'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Royal Blue Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>लॉगिन करा</span>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>सुरक्षित आणि गोपनीय प्रवेश पोर्टल</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        © {new Date().getFullYear()} साई ऑनलाईन सेवा केंद्र. सर्व हक्क राखीव.
      </footer>
    </div>
  );
}
