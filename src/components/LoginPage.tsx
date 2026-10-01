import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, User, CheckCircle2, Building2 } from 'lucide-react';
import { StoredUserProfile, saveStoredUserProfile, getStoredUserProfile } from '../utils/userDataStorage';

export interface UserProfile extends StoredUserProfile {}

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

const CREATOR_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const existingProfile = getStoredUserProfile();

  const [name, setName] = useState(existingProfile?.name || '');
  const [email, setEmail] = useState(existingProfile?.email || '');
  const [brandName, setBrandName] = useState(existingProfile?.brandName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(existingProfile?.avatar || CREATOR_AVATARS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      const profile: StoredUserProfile = {
        name: name.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@brand.com`,
        brandName: brandName.trim() || `${name.trim()} Studio`,
        avatar: selectedAvatar,
      };

      saveStoredUserProfile(profile);
      onLogin(profile);
    }, 350);
  };

  const handleQuickDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      const demoProfile: StoredUserProfile = {
        name: 'Jordan Miller',
        email: 'jordan@creatives.com',
        brandName: 'Miller Creative Studio',
        avatar: CREATOR_AVATARS[0],
      };
      saveStoredUserProfile(demoProfile);
      onLogin(demoProfile);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-8 relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambience */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="relative z-10 w-full max-w-md space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-cyan-500/20 mb-1">
            ⚡
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Set Up Your Creator Workspace
          </h2>
          <p className="text-xs text-slate-400">
            Enter your custom profile details to personalize your social automation suite.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Choose Profile Avatar */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Choose Profile Photo
              </label>
              <div className="flex items-center gap-2.5">
                {CREATOR_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`rounded-full p-0.5 border-2 transition-all cursor-pointer ${
                      selectedAvatar === av
                        ? 'border-cyan-400 scale-110 shadow-md shadow-cyan-500/30'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Your Full Name / Creator Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Brand / Organization Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins Media"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah@creatives.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-98 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Saving Workspace...' : 'Launch My Workspace'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
