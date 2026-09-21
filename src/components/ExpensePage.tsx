/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, IndianRupee, Calendar, Clock, Tag, FileText, Trash2, Edit3, ArrowLeft, Search, Receipt } from 'lucide-react';
import { ExpenseEntry } from '../types';
import { getFormattedDate } from '../utils/dateUtils';

interface ExpensePageProps {
  expenses: ExpenseEntry[];
  onOpenAddExpense: () => void;
  onEditExpense: (expense: ExpenseEntry) => void;
  onDeleteExpense: (id: string) => void;
  onBackToHome: () => void;
}

export function ExpensePage({
  expenses,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
  onBackToHome,
}: ExpensePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  const todayStr = useMemo(() => getFormattedDate(new Date()), []);

  const totalExpense = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [expenses]);

  const todayExpense = useMemo(() => {
    return expenses
      .filter((e) => e.date === todayStr)
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [expenses, todayStr]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.otherInfo && e.otherInfo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDate = selectedDateFilter ? e.date === selectedDateFilter : true;
      return matchesSearch && matchesDate;
    });
  }, [expenses, searchTerm, selectedDateFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-sm"
            title="मुख्य पेजवर परत जा"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">मुख्य पेज</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-700" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                खर्च व्यवस्थापन (Expenses)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              केंद्राचा सर्व दैनंदिन व इतर खर्च येथे नोंदवा आणि तपासा
            </p>
          </div>
        </div>

        {/* नवीन खर्च जोडा Button (रॉयल ब्लू) */}
        <button
          type="button"
          onClick={onOpenAddExpense}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>नवीन खर्च जोडा</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* सर्व एकूण खर्च */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              सर्व एकूण खर्च
            </span>
            <div className="text-2xl sm:text-3xl font-black text-red-600 mt-1 flex items-center">
              <IndianRupee className="w-6 h-6 inline stroke-[2.5]" />
              <span>{totalExpense.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* आजचा खर्च */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              आजचा खर्च ({todayStr})
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 flex items-center">
              <IndianRupee className="w-6 h-6 inline stroke-[2.5]" />
              <span>{todayExpense.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* एकूण खर्च नोंदी */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              एकूण खर्च नोंदी
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {expenses.length} नोंदी
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="खर्चाचे नाव किंवा माहिती शोधा..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 text-sm font-medium"
          />
        </div>

        {/* Date Filter */}
        {selectedDateFilter && (
          <button
            type="button"
            onClick={() => setSelectedDateFilter('')}
            className="text-xs font-bold text-blue-700 hover:underline cursor-pointer self-center"
          >
            फिल्टर काढा ({selectedDateFilter})
          </button>
        )}
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">कोणतीही खर्च नोंद आढळली नाही</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedDateFilter
              ? 'आपण शोधत असलेल्या निकषानुसार कोणताही खर्च सापडला नाही.'
              : 'केंद्राचा खर्च नोंदवण्यासाठी वर दिलेल्या "नवीन खर्च जोडा" बटनावर क्लिक करा.'}
          </p>
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="mt-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-sm inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>पहिला खर्च जोडा</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExpenses.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-blue-700" />
                        {item.date}
                      </span>
                      {item.time && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-blue-700" />
                          {item.time}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expense Amount */}
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-slate-500 block">खर्च रक्कम</span>
                    <span className="text-xl font-black text-red-600 flex items-center justify-end">
                      <IndianRupee className="w-4 h-4 inline stroke-[2.5]" />
                      {Number(item.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Other Info */}
                {item.otherInfo && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl font-medium">
                    <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span>{item.otherInfo}</span>
                  </div>
                )}
              </div>

              {/* Actions: Edit / Delete */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onEditExpense(item)}
                  className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                  title="खर्च संपादित करा"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>संपादित करा</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`'${item.name}' ही खर्च नोंद डिलीट करायची आहे का?`)) {
                      onDeleteExpense(item.id);
                    }
                  }}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                  title="खर्च हटवा"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>डिलीट</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
