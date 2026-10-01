import React from 'react';
import {
  Share2,
  LogOut,
  User,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { SocialAccount } from '../utils/socialAccounts';
import { UserProfile } from './LoginPage';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accounts: SocialAccount[];
  onOpenAccountsModal: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  accounts,
  onOpenAccountsModal,
  currentUser,
  onLogout,
}) => {
  const connectedCount = accounts.filter((a) => a.connected).length;

  return (
    <header className="border-b border-slate-800/90 bg-slate-950/85 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">AutoSocial AI</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
                  Auto-Pilot
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Autonomous Social Media & Story Copilot
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Download Project Folder (.ZIP) Link */}
            <a
              href="/api/download-project-zip"
              download="autosocial-ai-complete-project.zip"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Download the entire project folder as a ZIP archive"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Download Project (.ZIP)</span>
              <span className="sm:hidden">ZIP</span>
            </a>

            {/* Connected Accounts Manager Button */}
            <button
              onClick={onOpenAccountsModal}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              title="Manage your connected social networks"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{connectedCount} Accounts Active</span>
            </button>

            {/* User Profile Pill & Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                />
                <span className="text-xs font-semibold text-slate-300 hidden md:inline">
                  {currentUser.name}
                </span>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-900"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
