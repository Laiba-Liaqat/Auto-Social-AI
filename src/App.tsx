import React, { useState, useEffect } from 'react';
import {
  Camera,
  FileText,
  MessageSquare,
  Calendar as CalendarIcon,
  BarChart3,
  CheckCircle2,
  Share2,
  Download,
} from 'lucide-react';
import { Header } from './components/Header';
import { SplashScreen } from './components/SplashScreen';
import { LoginPage, UserProfile } from './components/LoginPage';
import { TabPostStudio } from './components/TabPostStudio';
import { TabEventDrafter } from './components/TabEventDrafter';
import { TabCommentResponder } from './components/TabCommentResponder';
import { TabCalendarScheduler } from './components/TabCalendarScheduler';
import { TabOfflineAnalytics } from './components/TabOfflineAnalytics';
import { ConnectedAccountsModal } from './components/ConnectedAccountsModal';
import { PublishingModal } from './components/PublishingModal';
import { LivePostViewerModal } from './components/LivePostViewerModal';
import { CalendarItem } from './utils/calendarExport';
import { SocialAccount, PublishResult } from './utils/socialAccounts';
import {
  StoredUserPost,
  getStoredUserProfile,
  saveStoredUserProfile,
  getStoredAccounts,
  saveStoredAccounts,
  getStoredPosts,
  saveStoredPosts,
  addStoredPost,
} from './utils/userDataStorage';

export default function App() {
  // Splash State
  const [showSplash, setShowSplash] = useState(true);

  // Persistent User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUserProfile());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!getStoredUserProfile());

  // Persistent Real Social Accounts State (Filter out any legacy dummy accounts)
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => {
    const stored = getStoredAccounts();
    const cleaned = (stored || []).filter(
      (a) =>
        a.handle !== '@my_creator_brand' &&
        a.handle !== '@mybrand.clips' &&
        a.handle !== 'in/mybrand' &&
        a.handle !== '@MyBrandHQ' &&
        a.name !== 'My Brand Studio' &&
        a.name !== 'My Brand TikTok' &&
        a.name !== 'My Brand Official' &&
        a.name !== 'My Brand X'
    );
    if (stored && stored.length !== cleaned.length) {
      saveStoredAccounts(cleaned as any);
    }
    return cleaned as any;
  });

  // Persistent User-Created Posts (Filter out any legacy dummy seed posts)
  const [userPosts, setUserPosts] = useState<StoredUserPost[]>(() => {
    const stored = getStoredPosts();
    const cleaned = (stored || []).filter((p) => p.id !== 'seed-post-1');
    if (stored && stored.length !== cleaned.length) {
      saveStoredPosts(cleaned);
    }
    return cleaned;
  });

  // Real Calendar events queue (Starts empty until user schedules or publishes)
  const [calendarEvents, setCalendarEvents] = useState<CalendarItem[]>(() => []);

  // UI state
  const [activeTab, setActiveTab] = useState<string>('studio');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);

  // Auto-Publishing Dispatch Modal State
  const [publishingState, setPublishingState] = useState<{
    isOpen: boolean;
    platform: string;
    account: SocialAccount;
    content: string;
    mediaType: 'image' | 'video' | 'none';
    mediaUrl: string;
  } | null>(null);

  // Live Post In-App Viewer Modal State
  const [liveViewerState, setLiveViewerState] = useState<{
    isOpen: boolean;
    platform: string;
    account: SocialAccount;
    content: string;
    mediaType: 'image' | 'video' | 'none';
    mediaUrl: string;
    postRefId?: string;
  } | null>(null);

  // Sync accounts to local storage whenever they change
  const handleUpdateAccounts: React.Dispatch<React.SetStateAction<SocialAccount[]>> = (action) => {
    setAccounts((prev) => {
      const updated = typeof action === 'function' ? action(prev) : action;
      saveStoredAccounts(updated as any);
      return updated;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddToCalendar = (newItem: Omit<CalendarItem, 'id'>) => {
    const itemWithId: CalendarItem = {
      ...newItem,
      id: `evt-${Date.now()}`,
    };
    setCalendarEvents((prev) => [itemWithId, ...prev]);
    showToast(`Scheduled post for ${itemWithId.platform}!`);
  };

  const handleTriggerAutoPublish = (
    platform: string,
    account: SocialAccount,
    content: string,
    mediaType: 'image' | 'video' | 'none',
    mediaUrl: string
  ) => {
    setPublishingState({
      isOpen: true,
      platform,
      account,
      content,
      mediaType,
      mediaUrl,
    });
  };

  // Called when publishing finishes
  const handlePublishSuccess = (result: PublishResult) => {
    if (!publishingState) return;

    // 1. Create real Stored User Post
    const newPost: StoredUserPost = {
      id: `post-${Date.now()}`,
      title: publishingState.content.slice(0, 35) || 'New Creator Update',
      caption: publishingState.content,
      platform: publishingState.platform,
      accountHandle: publishingState.account.handle,
      mediaType: publishingState.mediaType,
      mediaUrl: publishingState.mediaUrl,
      publishedAt: result.publishedAt,
      postReferenceId: result.postReferenceId,
      status: 'Published',
      comments: [],
    };

    const updatedPosts = addStoredPost(newPost);
    setUserPosts(updatedPosts);

    // 2. Add published post to calendar
    const newPublishedEvent: CalendarItem = {
      id: `pub-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: result.publishedAt,
      platform: publishingState.platform as any,
      title: publishingState.content.slice(0, 30) || 'Live Published Post',
      caption: publishingState.content,
      status: 'Published',
    };

    setCalendarEvents((prev) => [newPublishedEvent, ...prev]);
    showToast(`Published Live to ${publishingState.platform} (${publishingState.account.handle})! 🎉`);
  };

  const handleOpenLiveViewer = (
    platform: string,
    account: SocialAccount,
    content: string,
    mediaType: 'image' | 'video' | 'none',
    mediaUrl: string,
    postRefId?: string
  ) => {
    setLiveViewerState({
      isOpen: true,
      platform,
      account,
      content,
      mediaType,
      mediaUrl,
      postRefId,
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('autosocial_user_profile');
    showToast('Signed out successfully.');
  };

  // 1. Splash Screen
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 2. Login Page
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          showToast(`Welcome to your workspace, ${user.name}!`);
        }}
      />
    );
  }

  // 3. Main Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        accounts={accounts}
        onOpenAccountsModal={() => setIsAccountsModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Workspace Overview Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/20 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {currentUser?.brandName || 'Creator Studio'}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-300 font-medium font-mono">
                  {accounts.filter((a) => a.connected).length} Channels Authorized
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentUser?.name ? `${currentUser.name}'s Automation Workspace` : 'AI Social Media Copilot'}
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Upload your photos and videos, generate platform-tailored copy, and automatically publish posts and comment replies across your connected channels.
              </p>
            </div>

            {/* Quick Access Actions */}
            <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap">
              <a
                href="/api/download-project-zip"
                download="autosocial-ai-complete-project.zip"
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                title="Download full project source code as a ZIP bundle"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Project (.ZIP)</span>
              </a>

              <button
                onClick={() => setIsAccountsModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Manage Accounts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="border-b border-slate-800/80 pb-px">
          <nav className="flex space-x-2 overflow-x-auto scrollbar-none py-1">
            {[
              { id: 'studio', label: 'Post & Story Studio', icon: Camera },
              { id: 'comments', label: 'Comment Auto-Responder', icon: MessageSquare },
              {
                id: 'calendar',
                label: `Publishing Queue (${calendarEvents.length})`,
                icon: CalendarIcon,
              },
              { id: 'events', label: 'Event-to-Blog & Newsletter', icon: FileText },
              { id: 'analytics', label: 'Hashtag & Reach Analyzer', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Panels */}
        <div className="pt-2">
          {activeTab === 'studio' && (
            <TabPostStudio
              accounts={accounts}
              onTriggerAutoPublish={handleTriggerAutoPublish}
              onAddToCalendar={handleAddToCalendar}
              onOpenLiveViewer={handleOpenLiveViewer}
              onOpenAccountsModal={() => setIsAccountsModalOpen(true)}
            />
          )}

          {activeTab === 'comments' && (
            <TabCommentResponder
              accounts={accounts}
              posts={userPosts}
              setPosts={setUserPosts}
              onShowToast={showToast}
              onNavigateToStudio={() => setActiveTab('studio')}
              creatorName={currentUser?.name || 'Creator'}
            />
          )}

          {activeTab === 'calendar' && (
            <TabCalendarScheduler
              events={calendarEvents}
              setEvents={setCalendarEvents}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'events' && <TabEventDrafter />}

          {activeTab === 'analytics' && <TabOfflineAnalytics />}
        </div>
      </main>

      {/* Connected Accounts Modal (Add, Edit, Delete, Toggle Accounts) */}
      <ConnectedAccountsModal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        accounts={accounts}
        setAccounts={handleUpdateAccounts}
        onShowToast={showToast}
      />

      {/* 🚀 Automated 1-Click Publishing Modal */}
      {publishingState && (
        <PublishingModal
          isOpen={publishingState.isOpen}
          onClose={() => setPublishingState(null)}
          platform={publishingState.platform}
          account={publishingState.account}
          content={publishingState.content}
          mediaType={publishingState.mediaType}
          mediaUrl={publishingState.mediaUrl}
          onSuccess={handlePublishSuccess}
          onViewLivePost={(result) => {
            handleOpenLiveViewer(
              publishingState.platform,
              publishingState.account,
              publishingState.content,
              publishingState.mediaType,
              publishingState.mediaUrl,
              result.postReferenceId
            );
          }}
        />
      )}

      {/* 📱 Live Social App In-App Viewer Modal */}
      {liveViewerState && (
        <LivePostViewerModal
          isOpen={liveViewerState.isOpen}
          onClose={() => setLiveViewerState(null)}
          platform={liveViewerState.platform}
          account={liveViewerState.account}
          content={liveViewerState.content}
          mediaType={liveViewerState.mediaType}
          mediaUrl={liveViewerState.mediaUrl}
          postRefId={liveViewerState.postRefId}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AutoSocial AI</span>
            <span>·</span>
            <span>Autonomous Multi-Channel Social & Story Copilot</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsAccountsModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
            >
              Connected Social Accounts ({accounts.filter((a) => a.connected).length})
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
