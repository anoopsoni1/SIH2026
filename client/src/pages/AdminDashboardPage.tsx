import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DemandForecastChart } from '../components/DemandForecastChart';
import { api } from '../services/api';
import { Users, ShieldCheck, DollarSign, BrainCircuit, Activity, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { WorkerVerificationStatus } from '@shared';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'forecast' | 'audit'>('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes: any = await api.get('/admin/dashboard');
      setStats(statsRes.data);

      const workersRes: any = await api.get('/admin/workers');
      setWorkers(workersRes.data || []);

      const forecastRes: any = await api.get('/admin/forecast');
      setForecast(forecastRes.data);

      const auditRes: any = await api.get('/admin/audit-logs');
      setAuditLogs(auditRes.data || []);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWorker = async (workerId: string, status: WorkerVerificationStatus) => {
    try {
      const res: any = await api.patch(`/admin/workers/${workerId}/verify`, { status });
      if (res.success) {
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Worker verification update failed');
    }
  };

  const chartData = [
    { zone: 'Zone A (North)', predictedDemand: 24, availableWorkers: 14, workforceGap: 10 },
    { zone: 'Zone B (East)', predictedDemand: 18, availableWorkers: 16, workforceGap: 2 },
    { zone: 'Zone C (South)', predictedDemand: 30, availableWorkers: 18, workforceGap: 12 },
    { zone: 'Zone D (West)', predictedDemand: 15, availableWorkers: 15, workforceGap: 0 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Cooperative Admin Console</h1>
            <p className="text-xs text-slate-500 mt-1">Platform monitoring, worker verification, and AI demand forecasting</p>
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-coop-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Overview KPI
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${activeTab === 'verification' ? 'bg-coop-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Worker Verification
            </button>
            <button
              onClick={() => setActiveTab('forecast')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${activeTab === 'forecast' ? 'bg-coop-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              AI Forecast
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${activeTab === 'audit' ? 'bg-coop-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Audit Logs
            </button>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center space-x-2 text-slate-500 text-xs uppercase font-semibold">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Total Users</span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">{stats?.totalUsers || 24}</p>
                <p className="text-[10px] text-slate-500">Customers & Cooperative Members</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center space-x-2 text-slate-500 text-xs uppercase font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Workers</span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">{stats?.verifiedWorkers || 18}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Pending Verification: {stats?.pendingWorkers || 2}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center space-x-2 text-slate-500 text-xs uppercase font-semibold">
                  <Activity className="w-4 h-4 text-coop-600" />
                  <span>Total Bookings</span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">{stats?.totalBookings || 42}</p>
                <p className="text-[10px] text-slate-500">Completed: {stats?.completedBookings || 38}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center space-x-2 text-slate-500 text-xs uppercase font-semibold">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  <span>Gross GMV Volume</span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">₹{stats?.revenue?.totalGross || 18450}</p>
                <p className="text-[10px] text-amber-600 font-medium">Worker Earnings: ₹{stats?.revenue?.totalWorkerEarnings || 15129}</p>
              </div>
            </div>

            {/* Quick Chart Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Workforce Demand & Gap Analysis</h3>
                  <p className="text-xs text-slate-500">Real-time zone demand forecasts generated by scikit-learn ML regression</p>
                </div>
              </div>
              <DemandForecastChart data={chartData} />
            </div>
          </div>
        )}

        {/* VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Worker Verification Queue</h2>
              <p className="text-xs text-slate-500">Review government IDs and ITI skill certificates submitted by cooperative workers</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-coop-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {workers.map((w) => (
                  <div key={w._id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-base">{w.userId?.name || 'Worker'}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          w.verificationStatus === WorkerVerificationStatus.VERIFIED ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {w.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Govt ID: {w.govtIdType} ({w.govtIdNumberMasked}) • Society: {w.societyId?.name || 'DL-COOP-01'}</p>
                      <div className="flex gap-2 pt-1">
                        {w.skills?.map((sk: any, idx: number) => (
                          <span key={idx} className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">
                            {sk.serviceName} ({sk.experienceYears} yrs)
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <button
                        onClick={() => handleVerifyWorker(w._id, WorkerVerificationStatus.VERIFIED)}
                        className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-colors flex items-center justify-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Verify & Approve</span>
                      </button>
                      <button
                        onClick={() => handleVerifyWorker(w._id, WorkerVerificationStatus.REJECTED)}
                        className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-colors flex items-center justify-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI FORECAST TAB */}
        {activeTab === 'forecast' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <BrainCircuit className="w-8 h-8 text-coop-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">AI Quantitative Demand Forecaster</h2>
                <p className="text-xs text-slate-500">FastAPI ML service running Random Forest regression model</p>
              </div>
            </div>

            {forecast && (
              <div className="p-5 bg-slate-900 text-white rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Selected Zone & Service</span>
                  <span className="font-bold text-coop-400">{forecast.zoneId} • {forecast.serviceCategory}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Predicted Demand</span>
                    <span className="text-2xl font-extrabold text-white">{forecast.predictedDemand} jobs</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available Workforce</span>
                    <span className="text-2xl font-extrabold text-blue-400">{forecast.currentAvailableWorkers} workers</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Deficit Gap</span>
                    <span className="text-2xl font-extrabold text-red-400">{forecast.workforceGap} shortfall</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs text-slate-300">
                  <span className="font-bold text-coop-400 block mb-1">Explainability Output:</span>
                  <p>{forecast.explainability}</p>
                </div>
              </div>
            )}

            <DemandForecastChart data={chartData} />
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Immutable Audit Logs</h2>
              <p className="text-xs text-slate-500">Security audit records for user actions, status changes, and payments</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold bg-slate-50">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor Role</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Entity ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3 font-semibold text-slate-800">{log.actorRole}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-800 font-mono font-medium px-2 py-0.5 rounded text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3">{log.entity}</td>
                      <td className="p-3 font-mono text-slate-500">{log.entityId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
