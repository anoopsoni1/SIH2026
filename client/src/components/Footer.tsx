import React from 'react';
import { ShieldCheck, HeartHandshake, Lock, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div>
            <div className="flex items-center space-x-2 text-white font-extrabold text-lg mb-3">
              <ShieldCheck className="w-6 h-6 text-coop-500" />
              <span>CoopLabour Service</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Cooperative-owned digital service marketplace connecting verified, insured worker cooperatives with households, businesses, and communities with fair transparent pricing.
            </p>
            <div className="flex items-center space-x-2 text-xs text-coop-400 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
              <HeartHandshake className="w-4 h-4 text-coop-400 flex-shrink-0" />
              <span>82% Direct Worker Earnings + Active Health Welfare</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/services" className="hover:text-coop-400 transition-colors">Electrical Services</a></li>
              <li><a href="/services" className="hover:text-coop-400 transition-colors">Plumbing & Drainage</a></li>
              <li><a href="/services" className="hover:text-coop-400 transition-colors">Carpentry & Repairs</a></li>
              <li><a href="/services" className="hover:text-coop-400 transition-colors">Home Deep Cleaning</a></li>
              <li><a href="/emergency" className="hover:text-red-400 transition-colors font-medium">Emergency 24/7 Hotline</a></li>
            </ul>
          </div>

          {/* Governance & Worker Welfare */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Worker Welfare</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><span className="hover:text-coop-400">Cooperative Society Registration</span></li>
              <li><span className="hover:text-coop-400">Insurance & Medical Cover Policy</span></li>
              <li><span className="hover:text-coop-400">Skill Development Training</span></li>
              <li><span className="hover:text-coop-400">Transparent Fee Structure</span></li>
              <li><span className="hover:text-coop-400">Worker Safety Standards</span></li>
            </ul>
          </div>

          {/* Security & Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Security & Trust</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>HMAC SHA256 Payment Signature Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Aadhaar & Skill Certification</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Toll-Free Helpline: 1800-419-COOP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 Cooperative Labour Service Marketplace. All Rights Reserved.</p>
          <div className="flex space-x-4 mt-3 sm:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Cooperative Bylaws</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
