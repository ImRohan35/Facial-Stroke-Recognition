import React, { useState, useEffect } from 'react';
import {
  ScrollText, Search, Shield, RefreshCw, Calendar, ArrowLeft, Clock
} from 'lucide-react';
import { getAdminAuditLogs } from '../services/api';

export const AdminAuditLogsPage = ({ setTab }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAdminAuditLogs();
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user_email.toLowerCase().includes(search.toLowerCase()) ||
    (l.resource_type && l.resource_type.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => setTab('admin')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Admin Dashboard</span>
      </button>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold">
          <ScrollText className="w-3.5 h-3.5 text-purple-600" />
          <span>Security & Compliance Trail</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          System Audit Logs (Section 32)
        </h1>
        <p className="text-xs text-slate-500">
          Chronological record of screening submissions, authentication events, and data access activities.
        </p>
      </div>

      <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit logs by action, user email, or resource..."
          className="w-full text-xs bg-transparent focus:outline-none text-slate-900 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Action Event</th>
                <th className="pb-3">User / Identity</th>
                <th className="pb-3">Resource</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 font-mono text-[11px] text-slate-400">
                    {l.formatted_time}
                  </td>
                  <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-600 dark:text-slate-300">
                    {l.user_email}
                  </td>
                  <td className="py-3.5 text-slate-500">
                    {l.resource_type ? `${l.resource_type} #${l.resource_id?.slice(0, 8) || ''}` : '—'}
                  </td>
                  <td className="py-3.5 font-mono text-[11px] text-slate-400">
                    {l.ip_address}
                  </td>
                  <td className="py-3.5 text-slate-400 text-[11px] max-w-xs truncate">
                    {l.details ? JSON.stringify(l.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
