import React from 'react';
import {
  Users, UserCheck, Activity, FileText, ChevronRight, Download,
  TrendingUp, AlertTriangle, ShieldCheck, Stethoscope, ArrowRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

export const DoctorDashboard = ({ setTab, setSelectedAssessmentId }) => {
  const stats = [
    { title: "Total Patients", count: "128", icon: <Users className="w-5 h-5 text-sky-600" />, bg: "bg-sky-50" },
    { title: "Active Follow-ups", count: "23", icon: <UserCheck className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50" },
    { title: "Recent Assessments", count: "41", icon: <Activity className="w-5 h-5 text-amber-600" />, bg: "bg-amber-50" },
    { title: "Reports Generated", count: "96", icon: <FileText className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50" },
  ];

  const recentPatients = [
    { name: "Rahul Sharma", date: "24 Sept 2024", id: "P-1024", status: "Normal", color: "bg-emerald-100 text-emerald-800" },
    { name: "Anita Patel", date: "22 Sept 2024", id: "P-1025", status: "Changes Detected", color: "bg-amber-100 text-amber-800" },
    { name: "Vikram Singh", date: "20 Sept 2024", id: "P-1026", status: "Follow-up", color: "bg-sky-100 text-sky-800" },
    { name: "Meera Joshi", date: "18 Sept 2024", id: "P-1027", status: "Recovery", color: "bg-emerald-100 text-emerald-800" },
    { name: "Suresh Kumar", date: "15 Sept 2024", id: "P-1028", status: "High Risk", color: "bg-rose-100 text-rose-800" },
  ];

  const progressData = [
    { month: 'Jan', facial: 78, speech: 65, activity: 70 },
    { month: 'Feb', facial: 82, speech: 70, activity: 72 },
    { month: 'Mar', facial: 84, speech: 74, activity: 76 },
    { month: 'Apr', facial: 86, speech: 78, activity: 80 },
    { month: 'May', facial: 88, speech: 82, activity: 84 },
    { month: 'Jun', facial: 91, speech: 85, activity: 88 },
  ];

  const pieData = [
    { name: 'High Blood Pressure', value: 35, color: '#f59e0b' },
    { name: 'Diabetes', value: 20, color: '#06b6d4' },
    { name: 'Smoking', value: 25, color: '#ef4444' },
    { name: 'High Cholesterol', value: 15, color: '#3b82f6' },
    { name: 'Others', value: 5, color: '#94a3b8' },
  ];

  const barData = [
    { category: 'Normal', count: 68, fill: '#10b981' },
    { category: 'Changes Detected', count: 24, fill: '#f59e0b' },
    { category: 'Follow-up Required', count: 18, fill: '#ef4444' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Doctor Dashboard</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage your patients and view their assessments.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-500">{st.title}</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{st.count}</div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${st.bg}`}>
              {st.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row (Recent Patients & Patient Progress Overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Patients */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Patients</h3>
            <button className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer">View All</button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPatients.map((p, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                    {p.name[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{p.name}</div>
                    <div className="text-[10px] text-slate-400">ID: {p.id} • {p.date}</div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.color}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Patient Progress Overview Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Patient Progress Overview</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
              Last 6 Months
            </span>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[50, 100]} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="facial" name="Facial Symmetry" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="speech" name="Speech" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="activity" name="Activity Level" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row (Risk Factor Distribution & Assessment Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Risk Factor Distribution */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Risk Factor Distribution</h3>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="sm:col-span-6 space-y-1.5 text-xs">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-600 text-[11px]">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-[11px]">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Assessment Results Bar Chart */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Assessment Results</h3>
          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
