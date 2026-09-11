import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BookingModal } from '../components/BookingModal';
import { useTranslation } from 'react-i18next';
import { Search, ShieldCheck, Zap, Droplet, Hammer, Sparkles, HeartHandshake, PhoneCall, ArrowRight, CheckCircle2, Award, Users, Wrench, Paintbrush, Flower2, Car } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isEmergency, setIsEmergency] = useState(false);

  const sampleServices = [
    {
      _id: '66d8e01b106b7a422f82da01',
      name: 'Ceiling Fan Repair & Mounting',
      category: 'Electrical',
      basePrice: 350,
      unitType: 'fixed',
      description: 'Certified inspection, capacitor replacement, and ceiling fan installation.',
      icon: Zap,
    },
    {
      _id: '66d8e01b106b7a422f82da02',
      name: 'Pipe Leakage Repair & Seal',
      category: 'Plumbing',
      basePrice: 490,
      unitType: 'fixed',
      description: 'Diagnostic inspection and sealing of leaking pipes or valves.',
      icon: Droplet,
    },
    {
      _id: '66d8e01b106b7a422f82da03',
      name: 'Furniture Repair & Hinge Fix',
      category: 'Carpentry',
      basePrice: 600,
      unitType: 'fixed',
      description: 'Door alignment, hinge replacement, cabinet and drawer fixing.',
      icon: Hammer,
    },
    {
      _id: '66d8e01b106b7a422f82da04',
      name: 'Full Apartment Deep Cleaning',
      category: 'Cleaning',
      basePrice: 1499,
      unitType: 'fixed',
      description: 'Comprehensive sanitization of kitchen, bathroom, living area and floors.',
      icon: Sparkles,
    },
    {
      _id: '66d8e01b106b7a422f82da05',
      name: 'Split AC Deep Foam Service',
      category: 'Appliance Repair',
      basePrice: 599,
      unitType: 'fixed',
      description: 'Jet pump foam wash, filter sanitization, and cooling check.',
      icon: Wrench,
    },
    {
      _id: '66d8e01b106b7a422f82da06',
      name: 'Wall Touchup & Room Painting',
      category: 'Painting',
      basePrice: 1999,
      unitType: 'fixed',
      description: 'Wall putty, primer application, and dual coat Asian Paints finish.',
      icon: Paintbrush,
    },
    {
      _id: '66d8e01b106b7a422f82da07',
      name: 'Balcony Garden Maintenance',
      category: 'Gardening',
      basePrice: 450,
      unitType: 'fixed',
      description: 'Soil aerating, organic fertilizer mixing, and pot trimming.',
      icon: Flower2,
    },
    {
      _id: '66d8e01b106b7a422f82da08',
      name: 'Personal City Driver (4 Hours)',
      category: 'Driver',
      basePrice: 799,
      unitType: 'fixed',
      description: 'Verified hatchback/SUV driver for local city travel and errands.',
      icon: Car,
    },
  ];

  const openBooking = (service: any, emergency = false) => {
    setSelectedService(service);
    setIsEmergency(emergency);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-coop-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 hero-gradient">
        {/* Glow ambient background elements */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-coop-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 bg-coop-50/90 backdrop-blur-md border border-coop-200 text-coop-800 text-xs sm:text-sm px-4 py-2 rounded-full font-semibold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-coop-600 animate-pulse" />
              <span>100% Cooperative Owned & Verified Labour Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Direct Labour Services with <span className="gradient-text-coop">Fair Worker Payouts</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Connect directly with government-verified cooperative electricians, plumbers, carpenters, and domestic skilled workers. Zero aggregator commissions.
            </p>

            {/* Search Bar Container */}
            <div className="pt-4 max-w-2xl mx-auto">
              <div className="glass-card p-2 rounded-2xl shadow-xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2">
                <div className="flex-1 flex items-center px-4 space-x-3 w-full">
                  <Search className="w-5 h-5 text-coop-600" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('hero.searchPlaceholder')}
                    className="w-full bg-transparent text-sm sm:text-base outline-none text-slate-800 placeholder-slate-400 py-2.5 font-medium"
                  />
                </div>
                <Link
                  to={`/services?search=${searchQuery}`}
                  className="w-full sm:w-auto bg-gradient-to-r from-coop-600 to-coop-700 hover:from-coop-700 hover:to-coop-800 text-white font-bold px-7 py-3.5 rounded-xl shadow-md hover:shadow-glow-coop transition-all flex items-center justify-center space-x-2"
                >
                  <span>{t('hero.findService')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Emergency Service Banner CTA */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => openBooking(sampleServices[1], true)}
                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs sm:text-sm font-bold px-6 py-3 rounded-full flex items-center space-x-2.5 shadow-sm transition-all animate-bounce"
              >
                <PhoneCall className="w-4 h-4 text-red-600" />
                <span>Need Urgent Repair? Request Emergency Worker 24/7</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-card p-4 rounded-2xl text-center border border-slate-200/60 shadow-sm">
              <div className="text-2xl font-extrabold text-slate-900">50,000+</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Verified Workers</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center border border-slate-200/60 shadow-sm">
              <div className="text-2xl font-extrabold text-coop-600">82% Payout</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Direct Wage Split</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center border border-slate-200/60 shadow-sm">
              <div className="text-2xl font-extrabold text-slate-900">&lt; 20 Mins</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Emergency Dispatch</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center border border-slate-200/60 shadow-sm">
              <div className="text-2xl font-extrabold text-amber-500">4.92 ★</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Grid */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-xs uppercase font-extrabold text-coop-600 tracking-wider">Top Verified Services</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{t('services.popular')}</h2>
            </div>
            <Link to="/services" className="text-coop-600 hover:text-coop-700 font-bold text-sm flex items-center gap-1.5 hover:gap-2 transition-all">
              <span>{t('services.viewAll')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleServices.map((svc) => {
              const IconComp = svc.icon;
              return (
                <div key={svc._id} className="glass-card-hover rounded-2xl p-6 flex flex-col justify-between group cursor-pointer" onClick={() => openBooking(svc)}>
                  <div>
                    <div className="w-13 h-13 rounded-2xl bg-coop-50 text-coop-600 flex items-center justify-center mb-5 group-hover:bg-coop-600 group-hover:text-white transition-all shadow-sm">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-extrabold text-coop-700 uppercase tracking-wider bg-coop-50 px-2.5 py-1 rounded-md">{svc.category}</span>
                    <h3 className="font-bold text-slate-900 text-lg mt-3 mb-2 group-hover:text-coop-700 transition-colors">{svc.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{svc.description}</p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Standard Fee</span>
                      <span className="font-extrabold text-slate-900 text-xl">₹{svc.basePrice}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBooking(svc);
                      }}
                      className="bg-coop-600 hover:bg-coop-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      {t('services.bookNow')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cooperative Worker Welfare Section & Wage Split Visualizer */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-coop-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="bg-coop-900 text-coop-300 border border-coop-700 text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
                {t('welfare.badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug">
                Worker Welfare First: <span className="text-coop-400">82% Direct Payout</span> Architecture
              </h2>
              <p className="text-slate-400 leading-relaxed text-sm">
                Unlike corporate gig aggregators taking 30%+ cuts, our cooperative model distributes 100% of service revenues transparently across worker wages, social security funds, and platform operations.
              </p>

              {/* Wage Distribution Breakdown Bar */}
              <div className="space-y-3 pt-2">
                <div className="flex text-xs font-bold justify-between text-slate-300">
                  <span>Transparent Wage Formula</span>
                  <span className="text-emerald-400">100% Accounted</span>
                </div>
                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700">
                  <div className="bg-emerald-500 h-full rounded-l-full" style={{ width: '82%' }} title="82% Direct Worker Wage" />
                  <div className="bg-blue-500 h-full" style={{ width: '10%' }} title="10% Cooperative Fund" />
                  <div className="bg-amber-500 h-full" style={{ width: '5%' }} title="5% Insurance" />
                  <div className="bg-purple-500 h-full rounded-r-full" style={{ width: '3%' }} title="3% Platform Maintenance" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>82% Worker Wage</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    <span>10% Coop Fund</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span>5% Insurance</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-purple-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                    <span>3% Platform</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass-dark p-7 rounded-3xl border border-slate-700/80 shadow-2xl space-y-5">
                <div className="flex items-center space-x-4 border-b border-slate-800 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-coop-700 to-coop-500 text-white font-extrabold text-xl flex items-center justify-center shadow-lg">
                    SV
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-lg">Suresh Verma</h4>
                    <span className="text-xs text-coop-400 font-medium">Verified Electrician • ITI Level 2 Certified</span>
                  </div>
                </div>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Cooperative Society:</span>
                    <span className="font-semibold text-white">Delhi NCR Labour Welfare Co-op</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Insurance Cover:</span>
                    <span className="font-mono text-emerald-400 font-bold">INS-COOP-2026-9921 (Active ₹5 Lakh)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Rating & Reviews:</span>
                    <span className="text-amber-400 font-extrabold">⭐ 4.92 / 5.0 (148 Jobs)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        isEmergency={isEmergency}
      />
    </div>
  );
};
