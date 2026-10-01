import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  X,
  Sparkles,
  Send,
  Calendar,
  Copy,
  Check,
  Music,
  HelpCircle,
  TrendingUp,
  Instagram,
  Linkedin,
  Twitter,
  Share2,
  CheckCircle2,
  Eye,
  Sliders,
  Loader2,
  FileCheck,
  Key,
  Plus,
} from 'lucide-react';
import { generateAllSocialPosts, MultiPlatformPosts, computeOfflineMetrics } from '../utils/aiEngine';
import { SocialAccount } from '../utils/socialAccounts';
import { CalendarItem } from '../utils/calendarExport';

interface TabPostStudioProps {
  accounts: SocialAccount[];
  onTriggerAutoPublish: (
    platform: string,
    account: SocialAccount,
    content: string,
    mediaType: 'image' | 'video' | 'none',
    mediaUrl: string
  ) => void;
  onAddToCalendar: (item: Omit<CalendarItem, 'id'>) => void;
  onOpenLiveViewer?: (
    platform: string,
    account: SocialAccount,
    content: string,
    mediaType: 'image' | 'video' | 'none',
    mediaUrl: string
  ) => void;
  onOpenAccountsModal?: () => void;
}

const INITIAL_EMPTY_POSTS: MultiPlatformPosts = {
  visualSummary: 'Upload your photo or video or type your announcement brief to generate custom copy.',
  instagramFeed: 'Enter your brief and click "Generate Captions for All Platforms" to create tailored Instagram copy with line breaks and targeted hashtags.',
  instagramStory: {
    caption: 'Story caption will appear here with interactive poll & sticker ideas.',
    stickerIdea: 'Interactive Poll / Question sticker',
    pollQuestion: 'Which do you prefer?',
    musicVibe: 'Trending Lo-Fi / Upbeat audio',
  },
  tiktok: {
    hook: '3-second hook will be crafted based on your uploaded media.',
    caption: 'Short TikTok caption under 150 characters.',
    soundSuggestion: 'Trending Creator Audio',
    hashtags: ['#fyp', '#viral', '#trending'],
  },
  snapchat: {
    caption: 'Snappy 1-liner with emoji.',
    lensIdea: 'Glow Filter',
    spotlightTitle: 'Spotlight Title',
  },
  linkedin: 'Strategic professional thought leadership with key takeaways will appear here.',
  twitter: 'Punchy post under 280 characters with live character counter.',
  statusUpdate: 'Conversational status update for WhatsApp and Facebook.',
};

export const TabPostStudio: React.FC<TabPostStudioProps> = ({
  accounts,
  onTriggerAutoPublish,
  onAddToCalendar,
  onOpenLiveViewer,
  onOpenAccountsModal,
}) => {
  // Real User Input States (No fake preloaded posts)
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaBase64, setMediaBase64] = useState<string>('');
  const [mediaMimeType, setMediaMimeType] = useState<string>('');
  const [mediaDescription, setMediaDescription] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const [captionPrompt, setCaptionPrompt] = useState<string>('');
  const [tone, setTone] = useState<string>('Friendly & Casual');
  const [formatMode, setFormatMode] = useState<'feed' | 'story'>('feed');

  // Active Platform Tab for Preview
  const [activePlatform, setActivePlatform] = useState<
    'Instagram' | 'TikTok' | 'Snapchat' | 'LinkedIn' | 'X (Twitter)' | 'WhatsApp'
  >('Instagram');

  // Loading & Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [posts, setPosts] = useState<MultiPlatformPosts>(INITIAL_EMPTY_POSTS);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real File Upload Handler (reads image base64 for Gemini Vision or video URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMediaMimeType(file.type);
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const url = URL.createObjectURL(file);
    setMediaUrl(url);

    if (isVideo) {
      setMediaType('video');
      setMediaDescription(`Video file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
      setMediaBase64('');
      if (!captionPrompt) {
        setCaptionPrompt(`Check out our new video: ${file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')}`);
      }
    } else if (isImage) {
      setMediaType('image');
      setMediaDescription(`Image file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);

      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaBase64(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (!captionPrompt) {
        setCaptionPrompt(`Exciting announcement: ${file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')}`);
      }
    }
  };

  const handleClearMedia = () => {
    setMediaType('none');
    setMediaUrl('');
    setMediaBase64('');
    setMediaMimeType('');
    setMediaDescription('');
    setFileName('');
  };

  const handleGenerate = async () => {
    if (!captionPrompt.trim() && !mediaUrl) {
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAllSocialPosts(
        captionPrompt,
        tone,
        mediaType,
        mediaDescription,
        mediaBase64,
        mediaMimeType,
        formatMode
      );
      setPosts(result);
    } catch (err) {
      console.error('Error generating social posts:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Find real linked social account for active platform
  const matchedAccount = accounts.find((a) => a.platform === activePlatform) || null;

  const getCurrentContent = (): string => {
    if (formatMode === 'story') {
      if (activePlatform === 'Instagram') return posts.instagramStory.caption;
      if (activePlatform === 'TikTok') return posts.tiktok.caption;
      if (activePlatform === 'Snapchat') return posts.snapchat.caption;
      if (activePlatform === 'WhatsApp') return posts.statusUpdate;
      return posts.instagramStory.caption;
    }

    switch (activePlatform) {
      case 'Instagram':
        return posts.instagramFeed;
      case 'TikTok':
        return `${posts.tiktok.caption}\n\n${(posts.tiktok.hashtags || []).join(' ')}`;
      case 'Snapchat':
        return posts.snapchat.caption;
      case 'LinkedIn':
        return posts.linkedin;
      case 'X (Twitter)':
        return posts.twitter;
      case 'WhatsApp':
        return posts.statusUpdate;
      default:
        return posts.instagramFeed;
    }
  };

  const currentContent = getCurrentContent();
  const metrics = computeOfflineMetrics(currentContent);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real Creator Media & Prompt Input */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Real Media File Upload */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                {mediaType === 'video' ? (
                  <VideoIcon className="w-4 h-4 text-purple-400" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                )}
                <span>1. Upload Your Photo or Video</span>
              </label>

              {mediaUrl && (
                <button
                  type="button"
                  onClick={handleClearMedia}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Remove File</span>
                </button>
              )}
            </div>

            {/* Media Upload Box / Player */}
            {mediaUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center group">
                {mediaType === 'video' ? (
                  <video
                    src={mediaUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Uploaded media"
                    className="w-full h-full object-contain"
                  />
                )}

                <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-cyan-300 border border-slate-800 flex items-center gap-1.5">
                  <FileCheck className="w-3 h-3 text-emerald-400" />
                  <span>{fileName || (mediaType === 'video' ? 'VIDEO LOADED' : 'IMAGE LOADED')}</span>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2.5 right-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition-all opacity-0 group-hover:opacity-100 shadow-lg cursor-pointer"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 rounded-2xl p-7 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-cyan-950/10 group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 mx-auto flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:scale-110 transition-all border border-slate-800">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-200 mt-3">
                  Click to browse or drag & drop your media
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports JPG, PNG, WebP, MP4, MOV, WebM from your device
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* 2. Format Mode & Real User Prompt */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Post Format Mode
              </label>
              <span className="text-xs text-cyan-400 font-semibold font-mono">
                {formatMode === 'feed' ? 'Standard Feed Post' : 'Story & Status (24h)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFormatMode('feed')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  formatMode === 'feed'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ðŸ“° Standard Feed Post
              </button>

              <button
                type="button"
                onClick={() => setFormatMode('story')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  formatMode === 'story'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                âš¡ Story / Status (24h)
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                What is your announcement or message? *
              </label>
              <textarea
                value={captionPrompt}
                onChange={(e) => setCaptionPrompt(e.target.value)}
                rows={3}
                placeholder="Type your message, key points, product angle, or launch announcement..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* 3. Tone Selector */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>3. Brand Tone</span>
              </label>
              <span className="text-xs text-cyan-400 font-semibold">{tone}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                'Friendly & Casual',
                'Professional',
                'Energetic / Hype',
                'Funny & Witty',
                'Educational',
              ].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${
                    tone === t
                      ? 'border-cyan-500/80 bg-cyan-500/15 text-cyan-300 font-bold shadow-sm'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button using Gemini 3.8 Flash */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!captionPrompt.trim() && !mediaUrl)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-98 cursor-pointer disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Media with Gemini Vision & Generating Copy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Generate Captions for All Platforms</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Platform Tabs & Live Review */}
        <div className="lg:col-span-7 space-y-4">
          {/* Platform Selector Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {[
                { id: 'Instagram', label: 'Instagram', icon: 'ðŸ“¸' },
                { id: 'TikTok', label: 'TikTok', icon: 'ðŸŽµ' },
                { id: 'Snapchat', label: 'Snapchat', icon: 'í ½í±»' },
                { id: 'LinkedIn', label: 'LinkedIn', icon: 'ðŸ’¼' },
                { id: 'X (Twitter)', label: 'X (Twitter)', icon: 'ðŸ¦' },
                { id: 'WhatsApp', label: 'Status', icon: 'ðŸ’¬' },
              ].map((p) => {
                const isActive = activePlatform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatform(p.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-md ring-1 ring-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/60'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Preview Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            {/* Account Authorization Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              {matchedAccount ? (
                <div className="flex items-center gap-2.5">
                  <img
                    src={matchedAccount.avatar}
                    alt={matchedAccount.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{matchedAccount.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Posting to {matchedAccount.handle} {matchedAccount.apiVerified ? 'Â· API Verified' : ''}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-mono text-xs font-bold">
                    {activePlatform.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">No {activePlatform} Account Connected</span>
                    <span className="text-[11px] text-amber-400 font-mono">
                      Connect via API Key to enable 1-click publishing
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons: Preview in App, Copy, Schedule */}
              <div className="flex items-center gap-2">
                {!matchedAccount && onOpenAccountsModal && (
                  <button
                    type="button"
                    onClick={onOpenAccountsModal}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Connect Account</span>
                  </button>
                )}

                {matchedAccount && onOpenLiveViewer && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenLiveViewer(
                        activePlatform,
                        matchedAccount,
                        currentContent,
                        mediaType,
                        mediaUrl
                      )
                    }
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Show how this post appears live in the social app"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Preview in App</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopy(currentContent, activePlatform)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === activePlatform ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onAddToCalendar({
                      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                      time: '12:00 PM',
                      platform: activePlatform as any,
                      title: captionPrompt.slice(0, 35) || 'Generated Social Post',
                      caption: currentContent,
                      status: 'Scheduled',
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Schedule</span>
                </button>
              </div>
            </div>

            {/* Platform Details & Enhancements */}
            {formatMode === 'story' ? (
              <div className="p-3 bg-gradient-to-r from-purple-950/40 via-pink-950/20 to-slate-950 rounded-xl border border-purple-800/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>Story & Status Creator Pack (9:16 Vertical)</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      STICKER / POLL IDEA
                    </span>
                    <p className="text-pink-300 font-medium">
                      {posts.instagramStory.stickerIdea}
                    </p>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      SUGGESTED MUSIC / AUDIO
                    </span>
                    <p className="text-cyan-300 font-medium flex items-center gap-1">
                      <Music className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{posts.instagramStory.musicVibe}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              activePlatform === 'TikTok' && (
                <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-800/40 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-cyan-300">
                    <span className="flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Trending Audio Recommendation</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">ðŸ”¥ High Virality</span>
                  </div>
                  <p className="text-slate-300 font-sans">{posts.tiktok.soundSuggestion}</p>
                </div>
              )
            )}

            {/* Main Generated Text Content */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/90 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                {formatMode === 'story' ? 'Story / Status Overlay Text' : 'Generated Social Caption'}
              </span>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed selection:bg-cyan-500/25">
                {currentContent}
              </pre>
            </div>

            {/* Readability & Hashtags */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono pt-1">
              <div className="flex items-center gap-3">
                <span>
                  Length: <strong className="text-slate-200">{metrics.charCount}</strong> chars
                  {activePlatform === 'X (Twitter)' && (
                    <span className={metrics.charCount <= 280 ? 'text-emerald-400 ml-1' : 'text-rose-400 ml-1'}>
                      ({metrics.charCount <= 280 ? 'Within limit' : 'Over limit'})
                    </span>
                  )}
                </span>
                <span aria-hidden="true">Â·</span>
                <span>
                  Hashtags: <strong className="text-cyan-400">{metrics.hashtagCount}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">
                  {metrics.engagementIndex}% Expected Reach
                </span>
              </div>
            </div>

            {/* Approve & Post via Live API */}
            <div className="pt-2">
              {matchedAccount ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      onTriggerAutoPublish(
                        activePlatform,
                        matchedAccount,
                        currentContent,
                        mediaType,
                        mediaUrl
                      )
                    }
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 active:scale-98 cursor-pointer"
                  >
                    <Send className="w-5 h-5 text-slate-950" />
                    <span>Approve & Post to {activePlatform} via API ðŸš€</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Dispatches to {activePlatform} as <strong className="text-cyan-300">{matchedAccount.handle}</strong> using your saved API credentials.
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAccountsModal) onOpenAccountsModal();
                    }}
                    className="w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer"
                  >
                    <Key className="w-5 h-5 text-cyan-400" />
                    <span>Connect {activePlatform} API Key to Auto-Post</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    You can also click <strong className="text-slate-300">"Copy"</strong> above to copy the generated copy and paste it into {activePlatform} right away!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
