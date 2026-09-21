/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Phone,
  Briefcase,
  MapPin,
  FileText,
  ShieldCheck,
  LogOut,
  IndianRupee,
  Users,
  Bell,
  AlertTriangle,
  CheckCircle2,
  X,
  AlertCircle,
  TrendingUp,
  Filter,
  ArrowUpDown,
  CalendarDays,
  Sparkles,
  Search,
  Receipt,
  ArrowLeft
} from 'lucide-react';
import { CustomerEntry, ExpenseEntry } from '../types';
import { CustomerFormModal } from './CustomerFormModal';
import { ExpenseModal } from './ExpenseModal';
import { ExpensePage } from './ExpensePage';
import { IncompleteTasksPage } from './IncompleteTasksPage';
import {
  isTaskOverdue,
  formatDueDateTime,
  getFormattedDate,
  getInputDateFormat,
  convertInputDateToDisplay
} from '../utils/dateUtils';

interface HomePageProps {
  onLogout: () => void;
  customers: CustomerEntry[];
  onAddCustomer: (customer: Omit<CustomerEntry, 'id' | 'timestamp' | 'date' | 'time' | 'day'> & { id?: string; date?: string; time?: string; day?: string }) => void;
  onEditCustomer: (customer: CustomerEntry) => void;
  onDeleteCustomer: (id: string) => void;
  onToggleComplete?: (id: string) => void;
  expenses: ExpenseEntry[];
  onAddExpense: (expense: Omit<ExpenseEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => void;
  onEditExpense: (expense: ExpenseEntry) => void;
  onDeleteExpense: (id: string) => void;
}

type FilterType = 'all' | 'in_progress' | 'completed' | 'overdue' | 'incomplete';
type SortType = 'newest' | 'oldest' | 'profit_high' | 'pending_high';

export function HomePage({
  onLogout,
  customers,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onToggleComplete,
  expenses = [],
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}: HomePageProps) {
  const [currentView, setCurrentView] = useState<'home' | 'expenses' | 'incomplete'>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerEntry | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Filter and Sort states (एका रेषेत येण्यासाठी sort by व फिल्टर पर्याय)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Special Date-Wise Profit Box state (या या दिवशी इतका प्रॉफिट झाला असं समजेल)
  const [selectedProfitDate, setSelectedProfitDate] = useState<string>(() => getInputDateFormat(new Date()));

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: CustomerEntry) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<CustomerEntry, 'id' | 'timestamp' | 'date' | 'time' | 'day'> & { id?: string; date?: string; time?: string; day?: string }) => {
    if (data.id) {
      onEditCustomer(data as CustomerEntry);
    } else {
      onAddCustomer(data);
    }
  };

  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (expense: ExpenseEntry) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (data: Omit<ExpenseEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => {
    if (data.id) {
      onEditExpense(data as ExpenseEntry);
    } else {
      onAddExpense(data);
    }
  };

  const confirmDelete = () => {
    if (deletingId) {
      onDeleteCustomer(deletingId);
      setDeletingId(null);
    }
  };

  // Overall Financial Totals (सर्व एकूण रक्कम जमा आणि एकूण रक्कम बाकी)
  const totalAllPaid = useMemo(
    () => customers.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0),
    [customers]
  );
  const totalAllPending = useMemo(
    () => customers.reduce((sum, c) => sum + (Number(c.pendingAmount) || 0), 0),
    [customers]
  );
  const totalAllTurnover = useMemo(
    () => customers.reduce((sum, c) => sum + (Number(c.totalAmount) || 0), 0),
    [customers]
  );
  const totalAllProfit = useMemo(
    () => customers.reduce((sum, c) => sum + (Number(c.profit) || 0), 0),
    [customers]
  );

  // Overdue tasks list (वेळ संपली तरी काम झाले नाही)
  const overdueTasks = useMemo(
    () => customers.filter((c) => c.dueDateTime && !c.isCompleted && isTaskOverdue(c.dueDateTime, c.isCompleted)),
    [customers]
  );

  const completedTasks = useMemo(
    () => customers.filter((c) => c.isCompleted),
    [customers]
  );

  const inProgressTasks = useMemo(
    () => customers.filter((c) => !c.isCompleted && !isTaskOverdue(c.dueDateTime, c.isCompleted)),
    [customers]
  );

  // Incomplete marked tasks (अपूर्ण कामे)
  const incompleteTasks = useMemo(
    () => customers.filter((c) => !!c.isMarkedIncomplete),
    [customers]
  );

  // Filtered and Sorted entries
  const displayedCustomers = useMemo(() => {
    let result = [...customers];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          c.workDone.toLowerCase().includes(q) ||
          (c.incompleteReason && c.incompleteReason.toLowerCase().includes(q))
      );
    }

    // Filter
    if (activeFilter === 'completed') {
      result = result.filter((c) => c.isCompleted);
    } else if (activeFilter === 'overdue') {
      result = result.filter((c) => !c.isCompleted && isTaskOverdue(c.dueDateTime, c.isCompleted));
    } else if (activeFilter === 'in_progress') {
      result = result.filter((c) => !c.isCompleted && !isTaskOverdue(c.dueDateTime, c.isCompleted));
    } else if (activeFilter === 'incomplete') {
      result = result.filter((c) => !!c.isMarkedIncomplete);
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    } else if (sortBy === 'profit_high') {
      result.sort((a, b) => (b.profit || 0) - (a.profit || 0));
    } else if (sortBy === 'pending_high') {
      result.sort((a, b) => (b.pendingAmount || 0) - (a.pendingAmount || 0));
    }

    return result;
  }, [customers, activeFilter, sortBy, searchQuery]);

  // Calculations for Special Date-Wise Profit Box (या या दिवशी इतकी इतका प्रॉफिट झाला)
  const selectedDisplayDate = convertInputDateToDisplay(selectedProfitDate);
  const selectedDateCustomers = useMemo(() => {
    return customers.filter((c) => c.date === selectedDisplayDate);
  }, [customers, selectedDisplayDate]);

  const selectedDateProfit = useMemo(() => {
    return selectedDateCustomers.reduce((sum, c) => sum + (Number(c.profit) || 0), 0);
  }, [selectedDateCustomers]);

  const selectedDatePaid = useMemo(() => {
    return selectedDateCustomers.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0);
  }, [selectedDateCustomers]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 py-4 sm:py-5 px-4 shadow-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  साई ऑनलाईन सेवा केंद्र
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">
                  होम पेज (मुख्य नियंत्रण कक्ष)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-2.5">
            {/* मुख्य पेज Button (shows when on expenses or incomplete page) */}
            {currentView !== 'home' && (
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
                title="मुख्य ग्राहक यादीवर परत जा"
              >
                <Users className="w-4 h-4 text-blue-700" />
                <span>मुख्य पेज</span>
              </button>
            )}

            {/* खर्च Button */}
            <button
              type="button"
              onClick={() => setCurrentView(currentView === 'expenses' ? 'home' : 'expenses')}
              className={`px-3 sm:px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                currentView === 'expenses'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
              }`}
              title="खर्च व्यवस्थापन पेज उघडा"
            >
              <Receipt className={`w-4 h-4 ${currentView === 'expenses' ? 'text-white' : 'text-red-500'}`} />
              <span>खर्च</span>
              {expenses.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  currentView === 'expenses' ? 'bg-white text-blue-900' : 'bg-slate-100 text-slate-700'
                }`}>
                  {expenses.length}
                </span>
              )}
            </button>

            {/* ( अपूर्ण ) Button - केशरी कलर आणि मॅचिंग फॉन्ट कलर */}
            <button
              type="button"
              onClick={() => setCurrentView(currentView === 'incomplete' ? 'home' : 'incomplete')}
              className={`px-3 sm:px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                currentView === 'incomplete'
                  ? 'bg-orange-500 text-white border-orange-600 shadow-sm ring-2 ring-orange-300'
                  : 'bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100'
              }`}
              title="अपूर्ण अडकलेली कामे तपासा"
            >
              <AlertCircle className={`w-4 h-4 ${currentView === 'incomplete' ? 'text-white' : 'text-orange-600'}`} />
              <span>( अपूर्ण )</span>
              {incompleteTasks.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  currentView === 'incomplete'
                    ? 'bg-white text-orange-600 shadow-2xs'
                    : 'bg-orange-500 text-white animate-pulse'
                }`}>
                  {incompleteTasks.length}
                </span>
              )}
            </button>

            {/* Notification Bell Button with badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                  overdueTasks.length > 0
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
                title="सूचना व अलर्ट्स"
                aria-label="सूचना व अलर्ट्स"
              >
                <Bell className="w-5 h-5" />
                {overdueTasks.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                    {overdueTasks.length}
                  </span>
                )}
              </button>

              {/* Overdue Notification Dropdown */}
              {showNotificationPanel && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-bold text-slate-900 text-sm">
                        वेळ संपलेली कामे ({overdueTasks.length})
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotificationPanel(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5">
                    {overdueTasks.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                        सर्व कामे वेळेत पूर्ण आहेत! कोणतीही मुदत ओलांडलेली नाही.
                      </div>
                    ) : (
                      overdueTasks.map((t) => (
                        <div
                          key={t.id}
                          className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">
                              {t.name}
                            </span>
                            <span className="text-[10px] font-extrabold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                              वेळ संपली!
                            </span>
                          </div>
                          {t.workDone && (
                            <div className="text-slate-600 font-medium">
                              काम: {t.workDone}
                            </div>
                          )}
                          <div className="text-red-600 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>अपेक्षित मुदत: {formatDueDateTime(t.dueDateTime)}</span>
                          </div>
                          {onToggleComplete && (
                            <button
                              type="button"
                              onClick={() => {
                                onToggleComplete(t.id);
                              }}
                              className="w-full mt-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>काम पूर्ण झाले म्हणून नोंदवा</span>
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>ऑपरेटर: Sai</span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {currentView === 'expenses' ? (
          <ExpensePage
            expenses={expenses}
            onOpenAddExpense={handleOpenAddExpense}
            onEditExpense={handleOpenEditExpense}
            onDeleteExpense={onDeleteExpense}
            onBackToHome={() => setCurrentView('home')}
          />
        ) : currentView === 'incomplete' ? (
          <IncompleteTasksPage
            customers={customers}
            onBackToHome={() => setCurrentView('home')}
            onEditCustomer={handleOpenEdit}
            onDeleteCustomer={onDeleteCustomer}
            onUpdateCustomer={onEditCustomer}
          />
        ) : (
          <>
            {/* Overdue Notification Banner */}
        {overdueTasks.length > 0 && (
          <div className="p-4 sm:p-5 bg-red-50 border-2 border-red-300 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 text-red-700 rounded-xl shrink-0 mt-0.5 sm:mt-0 animate-bounce">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-red-900 leading-tight">
                  अलर्ट नोटिफिकेशन: {overdueTasks.length} कामे दिलेल्या वेळेत पूर्ण झालेली नाहीत!
                </h3>
                <p className="text-red-700 text-xs sm:text-sm mt-0.5">
                  खालील लाल बॉक्स असलेली कामे तपासा आणि काम संपल्यावर 'झालेले काम' म्हणून मार्क करा.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('overdue');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>वेळ संपलेली कामे पहा</span>
            </button>
          </div>
        )}

        {/* १. सर्व एकूण रक्कम जमा, बाकी, व एकूण नफा बॉक्सेस (Financial Summary Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* सर्व एकूण रक्कम जमा */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                सर्व एकूण रक्कम जमा
              </span>
              <span className="text-2xl font-extrabold text-emerald-700 flex items-center">
                ₹{totalAllPaid.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">रोख प्राप्त रक्कम</span>
            </div>
          </div>

          {/* सर्व एकूण रक्कम बाकी */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                सर्व एकूण रक्कम बाकी
              </span>
              <span className="text-2xl font-extrabold text-amber-700 flex items-center">
                ₹{totalAllPending.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-amber-600 font-medium">ग्राहकांकडे बाकी रक्कम</span>
            </div>
          </div>

          {/* सर्व एकूण व्यवसाय / बिलिंग */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                सर्व एकूण बिलिंग रक्कम
              </span>
              <span className="text-2xl font-extrabold text-blue-900 flex items-center">
                ₹{totalAllTurnover.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-blue-600 font-medium">जमा + बाकी मिळून</span>
            </div>
          </div>

          {/* सर्व एकूण प्रॉफिट (Total Profit) */}
          <div className="bg-white rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                सर्व एकूण निव्वळ प्रॉफिट
              </span>
              <span className="text-2xl font-black text-emerald-800 flex items-center">
                ₹{totalAllProfit.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">सर्व कामांतील निव्वळ नफा</span>
            </div>
          </div>
        </div>

        {/* २. स्पेशल बॉक्स: तारीखनिहाय प्रॉफिट तपासणे (या या दिवशी इतका इतका प्रॉफिट झाला असं समजेल) */}
        <div className="bg-white rounded-2xl border-2 border-emerald-300 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    स्पेशल प्रॉफिट बॉक्स (तारीखनिहाय नफा)
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                    तारीख निवडा
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  कोणतीही तारीख निवडा व त्या दिवशी केंद्रामध्ये एकूण किती प्रॉफिट झाला ते लगेच तपासा.
                </p>
              </div>
            </div>

            {/* Date selector and quick buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>तारीख:</span>
              </label>
              <input
                type="date"
                value={selectedProfitDate}
                onChange={(e) => setSelectedProfitDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setSelectedProfitDate(getInputDateFormat(new Date()))}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors cursor-pointer"
              >
                आजची तारीख
              </button>
            </div>
          </div>

          {/* Daily Profit Display Card */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-50/40 rounded-xl p-4 border border-emerald-200/80">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-600">निवडलेली तारीख:</span>
              <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{selectedDisplayDate}</span>
              </div>
              <span className="text-xs text-slate-500">
                त्या दिवशी एकूण {selectedDateCustomers.length} कामे नोंदवली
              </span>
            </div>

            <div className="space-y-1 sm:border-l sm:border-emerald-200 sm:pl-4">
              <span className="text-xs font-semibold text-slate-600">त्या दिवसाचा एकूण प्रॉफिट:</span>
              <div className="text-2xl font-black text-emerald-700 flex items-center">
                ₹{selectedDateProfit.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded inline-block">
                दिवसाचा निव्वळ नफा
              </span>
            </div>

            <div className="space-y-1 sm:border-l sm:border-emerald-200 sm:pl-4">
              <span className="text-xs font-semibold text-slate-600">त्या दिवशी जमा रक्कम:</span>
              <div className="text-xl font-bold text-slate-900 flex items-center">
                ₹{selectedDatePaid.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-slate-500">
                {selectedDateCustomers.length > 0 ? 'नोंदी खालील यादीत पाहू शकता' : 'या तारखेला नोंद नाही'}
              </span>
            </div>
          </div>
        </div>

        {/* ३. Top Control Bar: 'नवीन ग्राहक जोडा' Button */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              ग्राहक व्यवस्थापन
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              नवीन ग्राहकाची नोंद करण्यासाठी खालील बटनावर क्लिक करा
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-3 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-base shrink-0"
          >
            <UserPlus className="w-5 h-5" />
            <span>नवीन ग्राहक जोडा</span>
          </button>
        </div>

        {/* ४. Sort By आणि फिल्टर बार (एका रेषेत येतील) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Filter Tabs in one neat row (बाकी काम, झालेले काम, सुरू असलेली कामे) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>फिल्टर:</span>
              </span>

              {/* सर्व कामे */}
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>सर्व कामे</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {customers.length}
                </span>
              </button>

              {/* सुरू असलेली कामे (निळा) */}
              <button
                type="button"
                onClick={() => setActiveFilter('in_progress')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'in_progress'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>सुरू असलेली कामे</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'in_progress' ? 'bg-blue-800 text-white' : 'bg-blue-200 text-blue-900'}`}>
                  {inProgressTasks.length}
                </span>
              </button>

              {/* झालेले काम (हिरवा) */}
              <button
                type="button"
                onClick={() => setActiveFilter('completed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>झालेले काम</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'completed' ? 'bg-emerald-800 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
                  {completedTasks.length}
                </span>
              </button>

              {/* वेळ निघून गेलेली / बाकी कामे (लाल) */}
              <button
                type="button"
                onClick={() => setActiveFilter('overdue')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'overdue'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>वेळ संपलेली / बाकी कामे</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'overdue' ? 'bg-red-800 text-white' : 'bg-red-200 text-red-900'}`}>
                  {overdueTasks.length}
                </span>
              </button>

              {/* अपूर्ण कामे (केशरी) */}
              <button
                type="button"
                onClick={() => setActiveFilter('incomplete')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'incomplete'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span>(अपूर्ण कामे)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'incomplete' ? 'bg-orange-700 text-white' : 'bg-orange-200 text-orange-900'}`}>
                  {incompleteTasks.length}
                </span>
              </button>
            </div>

            {/* Sort By controls */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Sort By:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="newest">नवीन नोंदी आधी (Newest)</option>
                <option value="oldest">जुन्या नोंदी आधी (Oldest)</option>
                <option value="profit_high">जास्त प्रॉफिट आधी (High Profit)</option>
                <option value="pending_high">जास्त बाकी रक्कम आधी (High Pending)</option>
              </select>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ग्राहकाचे नाव, मोबाईल नंबर किंवा केलेल्या कामावरून शोधा..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* ५. Customer Entries Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>नोंदींची यादी</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                दर्शवलेली कामे: {displayedCustomers.length}
              </span>
            </h3>
          </div>

          {displayedCustomers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">
                {searchQuery ? 'शोध परिणामात कोणतीही नोंद आढळली नाही' : 'या फिल्टरमध्ये सध्या कोणतीही नोंद नाही'}
              </h4>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-5">
                {activeFilter !== 'all' ? (
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className="text-blue-600 font-bold underline cursor-pointer"
                  >
                    सर्व कामे पाहण्यासाठी येथे क्लिक करा
                  </button>
                ) : (
                  'नवीन नोंद करण्यासाठी वर दिलेल्या "नवीन ग्राहक जोडा" बटनावर क्लिक करा.'
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedCustomers.map((cust) => {
                const isOverdue = isTaskOverdue(cust.dueDateTime, cust.isCompleted);
                const isCompleted = !!cust.isCompleted;

                return (
                  <div
                    key={cust.id}
                    className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 shadow-xs hover:shadow-sm ${
                      isOverdue
                        ? 'border-red-300 ring-1 ring-red-200 bg-gradient-to-r from-red-50/20 via-white to-white'
                        : isCompleted
                        ? 'border-emerald-200'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Top Bar of Entry: Date, Time, and Day of the Week + Status Boxes + Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      {/* तारीख, वेळ आणि वार एकत्रितपणे */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* तारीख */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200/70 rounded-xl text-blue-900 text-xs sm:text-sm font-bold">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>तारीख: {cust.date}</span>
                        </div>

                        {/* वेळ */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span>वेळ: {cust.time || '१०:३० AM'}</span>
                        </div>

                        {/* वार */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-bold">
                          <span>वार: {cust.day || 'सोमवार'}</span>
                        </div>
                      </div>

                      {/* आवश्यक बदल: जिथे एडिटचा ऑप्शन आहे त्याच्या बाजूला स्थिती बॉक्स (हिरवा, निळा किंवा लाल) आणि बटन्स */}
                      <div className="flex items-center flex-wrap gap-2 ml-auto">
                        {/* Status Box directly beside Edit button:
                            - झालेल्या काम: हिरवा बॉक्स (Green Box)
                            - जे काम सुरू आहे: निळा बॉक्स (Blue Box)
                            - वेळ निघून गेली आहे, काम झाले नाही: लाल बॉक्स (Red Box)
                        */}
                        {isCompleted ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs border border-emerald-700"
                            title="काम पूर्ण झाले आहे"
                          >
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            <span>झालेले काम</span>
                          </span>
                        ) : isOverdue ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-xs border border-red-700 animate-pulse"
                            title="वेळ संपली! काम अपूर्ण आहे"
                          >
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                            <span>वेळ निघून गेली!</span>
                          </span>
                        ) : cust.isMarkedIncomplete ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white font-black text-xs rounded-xl shadow-xs border border-orange-600"
                            title="काम अपूर्ण म्हणून नोंदवले आहे"
                          >
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                            <span>(अपूर्ण काम)</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xs border border-blue-700"
                            title="काम प्रगतीपथावर आहे"
                          >
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                            <span>काम सुरू आहे</span>
                          </span>
                        )}

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cust)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm border border-slate-200 hover:border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="माहिती संपादित करा"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>एडिट</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingId(cust.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm border border-slate-200 hover:border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="नोंद हटवा"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>डिलीट</span>
                        </button>
                      </div>
                    </div>

                    {/* Work Deadline and Completion Status Bar */}
                    <div
                      className={`py-2.5 px-3.5 my-3 rounded-xl flex flex-wrap items-center justify-between gap-3 border text-xs sm:text-sm font-medium ${
                        isOverdue
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : isCompleted
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : cust.dueDateTime
                          ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isOverdue ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                            <span className="font-extrabold text-red-700">
                              ⚠️ मुदत संपली तरी काम झाले नाही! (मुदत: {formatDueDateTime(cust.dueDateTime)})
                            </span>
                          </>
                        ) : isCompleted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-bold text-emerald-800">
                              काम पूर्ण झाले आहे ✅
                            </span>
                          </>
                        ) : cust.dueDateTime ? (
                          <>
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                              <strong>कामाची मुदत:</strong> {formatDueDateTime(cust.dueDateTime)} (काम चालू आहे)
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-slate-500">कामाची मुदत निश्चित केलेली नाही</span>
                          </>
                        )}
                      </div>

                      {/* Quick Completion Toggle Button */}
                      {onToggleComplete && (
                        <button
                          type="button"
                          onClick={() => onToggleComplete(cust.id)}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                            isCompleted
                              ? 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                              : isOverdue
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {isCompleted ? 'पुन्हा चालू (अपूर्ण) करा' : 'काम पूर्ण झाले म्हणून नोंदवा'}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Incomplete Warning Box if marked incomplete */}
                    {cust.isMarkedIncomplete && (
                      <div className="mb-3 p-3 bg-orange-50 border border-orange-300 rounded-xl text-xs text-orange-950 flex items-start gap-2 shadow-2xs">
                        <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold block text-orange-900">
                            हे काम अपूर्ण मध्ये ठेवले आहे:
                          </span>
                          <span className="font-bold text-orange-800">
                            {cust.incompleteReason ? `कारण: ${cust.incompleteReason}` : 'कोणतेही कारण नमूद केलेले नाही.'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Customer Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      {/* Primary Info */}
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-slate-400 font-medium">ग्राहकाचे नाव</span>
                          <h4 className="text-lg font-bold text-slate-900 leading-tight">
                            {cust.name}
                          </h4>
                        </div>

                        {cust.mobile && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-semibold">{cust.mobile}</span>
                          </div>
                        )}

                        {cust.workDone && (
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-medium bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                              {cust.workDone}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Financial Figures: जमा, बाकी, एकूण, व प्रॉफिट */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-slate-500 font-medium">जमा रक्कम:</span>
                          <span className="font-bold text-emerald-700 flex items-center">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {cust.paidAmount.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-slate-500 font-medium">बाकी रक्कम:</span>
                          <span className={`font-bold flex items-center ${cust.pendingAmount > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
                            <IndianRupee className="w-3.5 h-3.5" />
                            {cust.pendingAmount.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-extrabold">
                          <span className="text-slate-800">एकूण बिल:</span>
                          <span className="text-blue-900 flex items-center text-base">
                            <IndianRupee className="w-4 h-4" />
                            {cust.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* आपला प्रॉफिट / नफा */}
                        <div className="pt-1.5 border-t border-emerald-200 flex items-center justify-between text-xs sm:text-sm font-bold bg-emerald-50/60 -mx-3.5 -mb-3.5 p-2 rounded-b-xl">
                          <span className="text-emerald-900 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span>आपला प्रॉफिट:</span>
                          </span>
                          <span className="text-emerald-700 flex items-center text-sm font-black">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {(cust.profit || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Address & Other Info */}
                      <div className="space-y-2 text-sm">
                        {cust.address ? (
                          <div className="flex items-start gap-2 text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-xs text-slate-400 block font-medium">पत्ता</span>
                              <span className="font-medium">{cust.address}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic">पत्ता नमूद नाही</div>
                        )}

                        {cust.otherInfo && (
                          <div className="flex items-start gap-2 text-slate-600 pt-1">
                            <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-xs text-slate-400 block font-medium">इतर माहिती</span>
                              <span className="font-medium">{cust.otherInfo}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    )}
  </main>

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSave}
        initialData={editingCustomer}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              नोंद डिलीट करायची आहे का?
            </h3>
            <p className="text-slate-500 text-sm mb-5">
              ही ग्राहक नोंद कायमस्वरूपी डिलीट केली जाईल.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                डिलीट करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © {new Date().getFullYear()} साई ऑनलाईन सेवा केंद्र. सर्व हक्क राखीव.
      </footer>
    </div>
  );
}
