import React, { useState, useEffect } from 'react';
import {
  Users, Search, Shield, CheckCircle2, XCircle, ArrowLeft, RefreshCw
} from 'lucide-react';
import { getAdminUsers, updateAdminUser } from '../services/api';

export const AdminUserManagementPage = ({ setTab }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await updateAdminUser(u.id, { is_active: !u.is_active });
      setStatusMsg(`Updated active status for ${u.full_name}.`);
      setUsers(prev => prev.map(item => item.id === u.id ? { ...item, is_active: !u.is_active } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
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
          <Users className="w-3.5 h-3.5 text-purple-600" />
          <span>Access Control</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          User Management (Section 29)
        </h1>
        <p className="text-xs text-slate-500">
          Manage platform accounts, roles (Patient, Doctor, Admin), and account activation states.
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter users by name, email, or role..."
          className="w-full text-xs bg-transparent focus:outline-none text-slate-900 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">User</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Created</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">
                    {u.full_name}
                  </td>
                  <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                    {u.email}
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : (u.role === 'DOCTOR' ? 'bg-teal-100 text-teal-700' : 'bg-sky-100 text-sky-700')
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {u.is_active ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                      <span>{u.is_active ? 'Active' : 'Disabled'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400 text-[11px]">
                    {new Date(u.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        u.is_active
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
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
