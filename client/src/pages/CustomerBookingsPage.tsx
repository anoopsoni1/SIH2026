import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { LiveTracker } from '../components/LiveTracker';
import { api } from '../services/api';
import { Calendar, Clock, MapPin, ShieldCheck, Loader2, Star, Download, AlertCircle } from 'lucide-react';
import { BookingStatus } from '@shared';

export const CustomerBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackingBooking, setActiveTrackingBooking] = useState<any>(null);
  const [ratingModalBooking, setRatingModalBooking] = useState<any>(null);
  
  const [overallRating, setOverallRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/bookings');
      setBookings(res.data || []);
      if (res.data?.length > 0) {
        setActiveTrackingBooking(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!ratingModalBooking) return;
    setSubmittingRating(true);
    try {
      await api.post('/ratings', {
        bookingId: ratingModalBooking._id,
        overallRating,
        punctualityRating: overallRating,
        qualityRating: overallRating,
        professionalismRating: overallRating,
        comment,
      });
      setRatingModalBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Rating submission failed');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">My Service Bookings</h1>
          <p className="text-xs text-slate-500 mt-1">Track active jobs, view OTP verification codes, and download invoices</p>
        </div>

        {activeTrackingBooking && (
          <div className="mb-8">
            <LiveTracker booking={activeTrackingBooking} />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-coop-600 animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-700">No Bookings Found</h3>
            <p className="text-xs text-slate-500">You haven't placed any service requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((bk) => (
              <div key={bk._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900 text-base">{bk.serviceId?.name || 'Cooperative Service'}</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded">
                      #{bk.bookingNumber}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {bk.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-coop-600" />
                      <span>{new Date(bk.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-coop-600" />
                      <span>{bk.scheduledTimeSlot}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-coop-600" />
                      <span>{bk.serviceLocation?.city || 'Noida'}</span>
                    </div>
                  </div>

                  {bk.startOtp && (
                    <div className="pt-2 flex items-center space-x-4 text-xs">
                      <span className="text-slate-500">Start OTP: <strong className="font-mono text-coop-700">{bk.startOtp}</strong></span>
                      <span className="text-slate-500">Completion OTP: <strong className="font-mono text-coop-700">{bk.completionOtp}</strong></span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-0 border-slate-100">
                  <div className="text-right mr-2 hidden md:block">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Paid Amount</span>
                    <span className="font-extrabold text-slate-900 text-lg">₹{bk.pricing?.grossAmount || 350}</span>
                  </div>

                  <button
                    onClick={() => setActiveTrackingBooking(bk)}
                    className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Track Status
                  </button>

                  {[BookingStatus.SERVICE_COMPLETED, BookingStatus.CUSTOMER_CONFIRMED].includes(bk.status) && (
                    <button
                      onClick={() => setRatingModalBooking(bk)}
                      className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>Rate Worker</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Rating Submission Modal */}
      {ratingModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Rate Service Quality</h3>
            <p className="text-xs text-slate-500">Rate your experience for booking #{ratingModalBooking.bookingNumber}</p>

            <div className="flex justify-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setOverallRating(star)} className="p-1">
                  <Star className={`w-8 h-8 ${star <= overallRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write feedback for the cooperative worker..."
              className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-coop-500 h-24"
            />

            <div className="flex space-x-3">
              <button
                onClick={() => setRatingModalBooking(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRatingSubmit}
                disabled={submittingRating}
                className="flex-1 bg-coop-600 hover:bg-coop-700 text-white py-2.5 rounded-xl font-semibold text-xs shadow"
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
