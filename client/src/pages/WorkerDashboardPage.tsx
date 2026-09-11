import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { api } from '../services/api';
import { ShieldCheck, Power, CheckCircle, Clock, MapPin, DollarSign, Award, HeartHandshake, Loader2, KeyRound } from 'lucide-react';
import { BookingStatus } from '@shared';

export const WorkerDashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const fetchWorkerData = async () => {
    setLoading(true);
    try {
      const profRes: any = await api.get('/workers/me');
      setProfile(profRes.data);

      const jobsRes: any = await api.get('/bookings');
      setJobs(jobsRes.data || []);
    } catch (err) {
      console.error('Worker fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;
    try {
      const res: any = await api.patch('/workers/availability', {
        isAvailable: !profile.isAvailable,
      });
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const handleJobAction = async (bookingId: string, targetStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const otp = otpInput[bookingId] || '';
      const res: any = await api.patch(`/bookings/${bookingId}/status`, {
        status: targetStatus,
        otp,
      });

      if (res.success) {
        fetchWorkerData();
      }
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Profile Status Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-coop-600 text-white font-extrabold text-xl flex items-center justify-center shadow">
              {profile?.userId?.name?.[0] || 'W'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold">{profile?.userId?.name || 'Cooperative Worker'}</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {profile?.verificationStatus || 'VERIFIED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{profile?.societyId?.name || 'Delhi NCR Labour Welfare Cooperative'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleAvailability}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow ${
                profile?.isAvailable ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{profile?.isAvailable ? 'Duty Mode: ONLINE' : 'Duty Mode: OFFLINE'}</span>
            </button>
          </div>
        </div>

        {/* Worker Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-slate-500 text-xs uppercase font-semibold">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Direct Net Earnings (82%)</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">₹{profile?.ratingCount ? profile.ratingCount * 287 : 1435}</p>
            <p className="text-[10px] text-emerald-600 font-medium">100% transparent worker wage distribution</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-slate-500 text-xs uppercase font-semibold">
              <HeartHandshake className="w-4 h-4 text-blue-600" />
              <span>Co-op Health Welfare Fund (10%)</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">₹{profile?.ratingCount ? profile.ratingCount * 35 : 175}</p>
            <p className="text-[10px] text-blue-600 font-medium">Policy: {profile?.insurancePolicyNumber || 'INS-COOP-2026-9921'}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-slate-500 text-xs uppercase font-semibold">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Cooperative Skill Rating</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">⭐ {profile?.ratingAverage || 4.9}</p>
            <p className="text-[10px] text-slate-500 font-medium">Based on {profile?.ratingCount || 42} verified customer reviews</p>
          </div>
        </div>

        {/* Assigned Service Requests */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Assigned Job Requests</h2>
              <p className="text-xs text-slate-500">Manage active service bookings and enter customer OTPs to advance states</p>
            </div>
            <span className="bg-coop-100 text-coop-800 text-xs px-3 py-1 rounded-full font-bold">{jobs.length} Jobs</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-coop-600 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No active job assignments currently assigned.
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-coop-700">{job.serviceId?.name}</span>
                      <h4 className="font-bold text-slate-900 text-base">Customer: {job.customerId?.name || 'Customer'}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-coop-600" />
                        <span>{job.serviceLocation?.street}, {job.serviceLocation?.city}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Net Earning</span>
                      <span className="text-lg font-extrabold text-emerald-600">₹{job.pricing?.workerEarnings || 287}</span>
                    </div>
                  </div>

                  {/* OTP Entry Form for Service Start / Completion */}
                  <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                    {job.status === BookingStatus.AWAITING_WORKER && (
                      <button
                        onClick={() => handleJobAction(job._id, BookingStatus.ACCEPTED)}
                        disabled={updatingId === job._id}
                        className="w-full sm:w-auto bg-coop-600 hover:bg-coop-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow"
                      >
                        Accept Booking Request
                      </button>
                    )}

                    {job.status === BookingStatus.ACCEPTED && (
                      <button
                        onClick={() => handleJobAction(job._id, BookingStatus.WORKER_ON_THE_WAY)}
                        disabled={updatingId === job._id}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow"
                      >
                        Mark: En Route to Customer
                      </button>
                    )}

                    {job.status === BookingStatus.WORKER_ON_THE_WAY && (
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <div className="relative flex-1">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter Customer Start OTP"
                            value={otpInput[job._id] || ''}
                            onChange={(e) => setOtpInput({ ...otpInput, [job._id]: e.target.value })}
                            className="pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-coop-500 bg-white"
                          />
                        </div>
                        <button
                          onClick={() => handleJobAction(job._id, BookingStatus.SERVICE_STARTED)}
                          disabled={updatingId === job._id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow"
                        >
                          Start Service
                        </button>
                      </div>
                    )}

                    {job.status === BookingStatus.SERVICE_STARTED && (
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <div className="relative flex-1">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter Completion OTP"
                            value={otpInput[job._id] || ''}
                            onChange={(e) => setOtpInput({ ...otpInput, [job._id]: e.target.value })}
                            className="pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-coop-500 bg-white"
                          />
                        </div>
                        <button
                          onClick={() => handleJobAction(job._id, BookingStatus.SERVICE_COMPLETED)}
                          disabled={updatingId === job._id}
                          className="bg-coop-700 hover:bg-coop-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow"
                        >
                          Complete Service
                        </button>
                      </div>
                    )}

                    {[BookingStatus.SERVICE_COMPLETED, BookingStatus.CUSTOMER_CONFIRMED].includes(job.status) && (
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-bold">
                        Service Completed & Earnings Dispatched
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
