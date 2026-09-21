/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, AlertCircle, Phone, Briefcase, Calendar, Clock, IndianRupee, Edit3, Trash2, CheckCircle2, RotateCcw, Search, AlertTriangle } from 'lucide-react';
import { CustomerEntry } from '../types';

interface IncompleteTasksPageProps {
  customers: CustomerEntry[];
  onBackToHome: () => void;
  onEditCustomer: (customer: CustomerEntry) => void;
  onDeleteCustomer: (id: string) => void;
  onUpdateCustomer: (updated: CustomerEntry) => void;
}

export function IncompleteTasksPage({
  customers,
  onBackToHome,
  onEditCustomer,
  onDeleteCustomer,
  onUpdateCustomer,
}: IncompleteTasksPageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only items where isMarkedIncomplete is true
  const incompleteCustomers = useMemo(() => {
    return customers.filter((c) => !!c.isMarkedIncomplete);
  }, [customers]);

  const filteredItems = useMemo(() => {
    return incompleteCustomers.filter((c) => {
      const matchName = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMobile = c.mobile.includes(searchTerm);
      const matchWork = c.workDone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchReason = (c.incompleteReason || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchMobile || matchWork || matchReason;
    });
  }, [incompleteCustomers, searchTerm]);

  const handleMarkComplete = (customer: CustomerEntry) => {
    onUpdateCustomer({
      ...customer,
      isCompleted: true,
      isMarkedIncomplete: false,
    });
  };

  const handleRestoreNormal = (customer: CustomerEntry) => {
    onUpdateCustomer({
      ...customer,
      isMarkedIncomplete: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (केशरी / Orange Theme) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-orange-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
              <span className="px-3 py-1 bg-orange-500 text-white font-black text-sm rounded-xl shadow-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                ( अपूर्ण कामे )
              </span>
              <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-lg">
                एकूण {incompleteCustomers.length} कामे
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              येथे काय अपूर्ण आले आहे आणि का अपूर्ण आले आहे याची सर्व सविस्तर माहिती दिसेल
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="नाव, काम किंवा कारण शोधा..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-orange-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
          />
        </div>
      </div>

      {/* List of Incomplete Tasks */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-orange-500 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {searchTerm ? 'कोणतेही अपूर्ण काम सापडले नाही' : 'सध्या कोणतेही काम अपूर्ण नाही!'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {searchTerm
              ? 'आपण शोधत असलेल्या नावाशी किंवा कारणाशी संबंधित कोणतीही नोंद नाही.'
              : 'नवीन ग्राहक जोडताना किंवा संपादन करताना "अपूर्ण मध्ये टाका: ON" केले की ती कामे येथे दिसतील.'}
          </p>
          <button
            type="button"
            onClick={onBackToHome}
            className="mt-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-sm inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>मुख्य ग्राहक यादीवर जा</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border-2 border-orange-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: काय अपूर्ण मध्ये आलेला आहे */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3 h-3" />
                      अपूर्ण नोंद
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-medium">
                      {c.mobile && (
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <Phone className="w-3 h-3 text-blue-700" />
                          {c.mobile}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {c.date} ({c.day})
                      </span>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-slate-500 block">एकूण रक्कम</span>
                    <span className="text-base font-black text-slate-900 flex items-center justify-end">
                      <IndianRupee className="w-3.5 h-3.5 inline" />
                      {c.totalAmount.toLocaleString('en-IN')}
                    </span>
                    {c.pendingAmount > 0 && (
                      <span className="text-xs font-bold text-red-600 block mt-0.5">
                        बाकी: ₹{c.pendingAmount}
                      </span>
                    )}
                  </div>
                </div>

                {/* केलेले काम */}
                <div className="mt-3 text-sm text-slate-800 flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl">
                  <Briefcase className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">काम:</span>
                    <span className="font-bold text-slate-900">{c.workDone || 'काम नमूद नाही'}</span>
                  </div>
                </div>

                {/* का अपूर्ण मध्ये आलेला आहे? (स्पेशल ठळक केशरी बॉक्स) */}
                <div className="mt-3.5 bg-orange-50 border border-orange-300 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-orange-950 uppercase tracking-wide mb-1">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span>का अपूर्ण मध्ये आलेला आहे? (कारण):</span>
                  </div>
                  <p className="text-sm font-bold text-orange-900 whitespace-pre-wrap leading-relaxed">
                    {c.incompleteReason || 'कोणतेही कारण नमूद केलेले नाही.'}
                  </p>
                </div>

                {/* इतर माहिती */}
                {c.otherInfo && (
                  <p className="text-xs text-slate-500 mt-2 italic px-1">
                    टीप: {c.otherInfo}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                {/* Left quick resolution buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkComplete(c)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    title="काम पूर्ण झाले म्हणून नोंदवा"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>काम पूर्ण झाले</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRestoreNormal(c)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="अपूर्ण मधून काढून सामान्य चालू कामात टाका"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>पूर्ववत करा</span>
                  </button>
                </div>

                {/* Right edit / delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEditCustomer(c)}
                    className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                    title="माहिती संपादित करा"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>संपादित</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`'${c.name}' यांची नोंद डिलीट करायची आहे का?`)) {
                        onDeleteCustomer(c.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                    title="नोंद हटवा"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>डिलीट</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
