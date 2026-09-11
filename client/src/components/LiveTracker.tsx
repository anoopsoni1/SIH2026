import React from 'react';
import { CheckCircle, Clock, MapPin, PhoneCall, ShieldCheck, User } from 'lucide-react';
import { BookingStatus } from '@shared';

interface LiveTrackerProps {
  booking: any;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({ booking }) => {
  if (!booking) return null;

  const steps = [
    { status: BookingStatus.PAYMENT_VERIFIED, label: 'Payment Verified' },
    { status: BookingStatus.AWAITING_WORKER, label: 'Worker Assigned' },
    { status: BookingStatus.ACCEPTED, label: 'Job Accepted' },
    { status: BookingStatus.WORKER_ON_THE_WAY, label: 'En Route' },
    { status: BookingStatus.SERVICE_STARTED, label: 'In Progress' },
    { status: BookingStatus.CUSTOMER_CONFIRMED, label: 'Completed' },
  ];

  const getCurrentStepIndex = () => {
    const idx = steps.findIndex((s) => s.status === booking.status);
    return idx >= 0 ? idx : 1;
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="glass-card rounded-2xl p-6 shadow-md border border-slate-200/80 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="text-xs uppercase font-extrabold text-coop-600 tracking-wider">Live Worker Tracking</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">Booking #{booking.bookingNumber}</h3>
        </div>
        <span className="bg-gradient-to-r from-coop-600 to-coop-700 text-white text-xs px-3.5 py-1.5 rounded-full font-extrabold shadow-sm">
          {booking.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Status Timeline */}
      <div className="relative flex items-center justify-between px-2">
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full z-0" />
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-coop-500 to-coop-600 rounded-full transition-all duration-500 z-0"
          style={{ width: `${(currentStep / (steps.length - 1)) * 92}%` }}
        />

        {steps.map((s, idx) => {
          const isCompleted = idx <= currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-coop-600 text-white ring-4 ring-coop-100 shadow-glow-coop scale-110'
                    : isCompleted
                    ? 'bg-coop-600 text-white shadow-md'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold mt-2.5 text-center max-w-[70px] ${isCurrent ? 'text-coop-700 font-extrabold' : 'text-slate-600'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Assigned Worker Details Card */}
      {booking.workerId && (
        <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-coop-700 to-coop-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
              {booking.workerId.userId?.name?.[0] || 'W'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-slate-900">{booking.workerId.userId?.name || 'Assigned Worker'}</h4>
                <ShieldCheck className="w-4 h-4 text-coop-600" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Verified Cooperative Worker • ⭐ {booking.workerId.ratingAverage || 4.9} Rating</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <a
              href={`tel:${booking.workerId.userId?.mobile || '9876543210'}`}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-coop-600 to-coop-700 hover:from-coop-700 hover:to-coop-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Worker</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
