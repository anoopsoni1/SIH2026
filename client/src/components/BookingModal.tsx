import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { X, MapPin, CheckCircle, ShieldCheck, CreditCard, ArrowRight, Loader2, Award, Clock } from 'lucide-react';
import { BookingType } from '@shared';

interface ServiceItem {
  _id: string;
  name: string;
  basePrice: number;
  unitType: string;
  description: string;
}

interface BookingModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  isEmergency?: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({ service, isOpen, onClose, isEmergency = false }) => {
  const { user } = useAuthStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const [street, setStreet] = useState('Flat 402, Green Park Apartments');
  const [city, setCity] = useState('Noida');
  const [pincode, setPincode] = useState('201301');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('10:00 AM - 11:00 AM');
  
  const [nearbyWorkers, setNearbyWorkers] = useState<any[]>([]);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !service) return null;

  const basePrice = service.basePrice;
  const emergencyMultiplier = isEmergency ? 1.25 : 1.0;
  const grossAmount = Math.round(basePrice * emergencyMultiplier);
  const workerEarnings = Math.round(grossAmount * 0.82 * 100) / 100;
  const coopContribution = Math.round(grossAmount * 0.10 * 100) / 100;
  const platformFee = Math.round(grossAmount * 0.05 * 100) / 100;
  const taxes = Math.round(grossAmount * 0.03 * 100) / 100;

  const handleFetchWorkers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Geo search nearby workers at Noida coordinates [77.391, 28.5355]
      const res: any = await api.get(`/workers/nearby?serviceId=${service._id}&longitude=77.391&latitude=28.5355&isEmergency=${isEmergency}`);
      setNearbyWorkers(res.data || []);
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to search nearby workers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        serviceId: service._id,
        bookingType: isEmergency ? BookingType.EMERGENCY : BookingType.STANDARD,
        scheduledDate,
        scheduledTimeSlot,
        problemDescription,
        serviceLocation: {
          label: 'Home',
          street,
          city,
          state: 'Uttar Pradesh',
          pincode,
          location: {
            type: 'Point',
            coordinates: [77.391, 28.5355],
          },
        },
      };

      const res: any = await api.post('/bookings', payload);
      if (res.success) {
        setCreatedBooking(res.data);
        setStep(4);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Booking creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Create Razorpay order
      const orderRes: any = await api.post('/payments/create-order', { bookingId: createdBooking._id });
      if (!orderRes.success) throw new Error('Failed to create Razorpay Order');

      const { razorpayOrderId } = orderRes.data;

      // 2. Verify Razorpay Payment Signature
      const verifyRes: any = await api.post('/payments/verify', {
        bookingId: createdBooking._id,
        razorpayOrderId,
        razorpayPaymentId: `pay_${Date.now()}`,
        razorpaySignature: 'sig_simulated_valid_token_2026',
      });

      if (verifyRes.success) {
        setPaymentSuccess(true);
        setStep(5);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-coop-900 text-white flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-coop-400">
                {isEmergency ? '🚨 Emergency Dispatch' : 'Guided Booking Flow'}
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">Step {step} of 5</span>
            </div>
            <h3 className="font-bold text-lg">{service.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div className="bg-coop-500 h-1.5 transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Problem Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Problem Description</label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe the issue (e.g. Ceiling fan clicking noise, pipe water leak under sink...)"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-coop-500 outline-none h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-coop-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Time Slot</label>
                  <select
                    value={scheduledTimeSlot}
                    onChange={(e) => setScheduledTimeSlot(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-coop-500"
                  >
                    <option>10:00 AM - 11:00 AM</option>
                    <option>02:00 PM - 03:00 PM</option>
                    <option>05:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-4 bg-coop-600 hover:bg-coop-700 text-white font-semibold py-3 rounded-xl shadow transition-all flex items-center justify-center space-x-2"
              >
                <span>Continue to Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Address & Geo Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center space-x-3 text-xs text-emerald-800">
                <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Geospatial 2dsphere indexing will match available verified workers within your radius.</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-coop-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-coop-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-coop-500"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleFetchWorkers}
                disabled={loading}
                className="w-full mt-4 bg-coop-600 hover:bg-coop-700 text-white font-semibold py-3 rounded-xl shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Search Nearby Workers</span>}
              </button>
            </div>
          )}

          {/* STEP 3: Nearby Worker Recommendations */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Matched Cooperative Workers</h4>

              {nearbyWorkers.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-sm text-slate-600">
                  Worker auto-dispatch will broadcast your job request upon booking confirmation.
                </div>
              ) : (
                <div className="space-y-3">
                  {nearbyWorkers.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-coop-100 text-coop-700 font-bold flex items-center justify-center">
                          {item.worker.userId?.name?.[0] || 'W'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-sm text-slate-900">{item.worker.userId?.name}</span>
                            <ShieldCheck className="w-4 h-4 text-coop-600" />
                          </div>
                          <span className="text-xs text-slate-500 block">{item.distanceKm} km away • Rating ⭐ {item.worker.ratingAverage} ({item.worker.ratingCount})</span>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">
                        Match Score: {item.score}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleCreateBooking}
                disabled={loading}
                className="w-full bg-coop-600 hover:bg-coop-700 text-white font-semibold py-3 rounded-xl shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Confirm & View Price Breakdown</span>}
              </button>
            </div>
          )}

          {/* STEP 4: Transparent Cooperative Fee Breakdown & Razorpay Payment */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400">Total Service Amount</span>
                  <span className="font-bold text-xl text-coop-400">₹{grossAmount}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-emerald-400 font-medium">👷 Worker Direct Earnings (82%)</span>
                    <span>₹{workerEarnings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400 font-medium">🏥 Cooperative Welfare & Insurance (10%)</span>
                    <span>₹{coopContribution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⚙️ Platform Maintenance (5%)</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🏛️ Taxes (3%)</span>
                    <span>₹{taxes}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Secured by Razorpay. Funds released upon valid OTP service completion.</span>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={loading}
                className="w-full bg-coop-600 hover:bg-coop-700 text-white font-semibold py-3 rounded-xl shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay ₹{grossAmount} & Confirm Booking</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 5: Payment Verified & OTP Display */}
          {step === 5 && createdBooking && (
            <div className="text-center space-y-4 py-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900">Booking Confirmed!</h3>
                <p className="text-xs text-slate-500 mt-1">Booking Ref: <span className="font-mono font-bold text-slate-800">{createdBooking.bookingNumber}</span></p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-left">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Service Start OTP (Share with Worker):</span>
                  <span className="font-mono font-bold text-coop-700 text-base">{createdBooking.startOtp}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Completion OTP:</span>
                  <span className="font-mono font-bold text-coop-700 text-base">{createdBooking.completionOtp}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Close & Track Live Progress
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
