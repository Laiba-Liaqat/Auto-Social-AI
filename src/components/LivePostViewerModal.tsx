import React, { useState } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
  MoreHorizontal,
  CheckCircle2,
  ExternalLink,
  ThumbsUp,
  Repeat2,
  Music2,
  Copy,
  Check,
} from 'lucide-react';
import { SocialAccount } from '../utils/socialAccounts';

interface LivePostViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string;
  account: SocialAccount;
  content: string;
  mediaType: 'image' | 'video' | 'none';
  mediaUrl: string;
  postRefId?: string;
}

export const LivePostViewerModal: React.FC<LivePostViewerModalProps> = ({
  isOpen,
  onClose,
  platform,
  account,
  content,
  mediaType,
  mediaUrl,
  postRefId,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const publicUrl = `https://${platform.toLowerCase().replace(/[^a-z]/g, '')}.com/${account.handle.replace('@', '')}/status/${postRefId || 'live-post-882'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg p-5 shadow-2xl relative space-y-4 max-h-[92vh] flex flex-col">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Social App View: {platform}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content View: In-app Social Simulator */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {/* INSTAGRAM SIMULATOR */}
          {platform === 'Instagram' && (
            <div className="bg-black border border-slate-800 rounded-2xl overflow-hidden max-w-md mx-auto text-white shadow-2xl font-sans">
              {/* IG Top User Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-900">
                <div className="flex items-center gap-2.5">
                  <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                    <img
                      src={account.avatar}
                      alt={account.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold">{account.handle.replace('@', '')}</span>
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-[10px] text-zinc-400">Original Audio</span>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-zinc-400" />
              </div>

              {/* IG Media Display */}
              <div className="aspect-square bg-zinc-950 flex items-center justify-center relative overflow-hidden">
                {mediaType === 'video' ? (
                  <video
                    src={mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : mediaUrl ? (
                  <img src={mediaUrl} alt="Post" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-zinc-600 text-xs">Photo Post</div>
                )}
              </div>

              {/* IG Action Icons */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setIsLiked(!isLiked)}>
                      <Heart
                        className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                      />
                    </button>
                    <MessageCircle className="w-5 h-5 text-white" />
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <Bookmark className="w-5 h-5 text-white" />
                </div>

                <p className="text-xs font-bold">{isLiked ? '129 likes' : '128 likes'}</p>

                {/* Caption */}
                <div className="text-xs space-y-1">
                  <p className="leading-relaxed">
                    <span className="font-bold mr-1.5">{account.handle.replace('@', '')}</span>
                    <span className="whitespace-pre-wrap text-zinc-200">{content}</span>
                  </p>
                </div>

                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Just now · Published via AutoSocial AI</p>
              </div>
            </div>
          )}

          {/* TIKTOK SIMULATOR */}
          {platform === 'TikTok' && (
            <div className="bg-black border border-zinc-800 rounded-3xl overflow-hidden max-w-sm mx-auto text-white shadow-2xl font-sans aspect-[9/16] relative flex flex-col justify-between p-4">
              {/* Background media */}
              {mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              ) : (
                <img
                  src={mediaUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'}
                  alt="TikTok"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              )}

              {/* Top Bar */}
              <div className="relative z-10 flex items-center justify-center pt-2">
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-zinc-400">Following</span>
                  <span className="text-white border-b-2 border-white pb-0.5">For You</span>
                </div>
              </div>

              {/* Bottom & Right Toolbar */}
              <div className="relative z-10 flex items-end justify-between">
                <div className="space-y-2 max-w-[70%]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{account.handle}</span>
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  </div>
                  <p className="text-xs text-zinc-100 line-clamp-3 leading-relaxed drop-shadow-md">
                    {content}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-mono">
                    <Music2 className="w-3 h-3 animate-spin" />
                    <span className="truncate">Original Sound - AutoSocial Trending</span>
                  </div>
                </div>

                {/* Right Action Stack */}
                <div className="flex flex-col items-center gap-4 pb-2">
                  <div className="relative">
                    <img
                      src={account.avatar}
                      alt={account.name}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <span className="absolute -bottom-1 left-3 bg-pink-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                      +
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Heart className="w-6 h-6 text-white" />
                    <span className="text-[10px] font-bold">1.4K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                    <span className="text-[10px] font-bold">86</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bookmark className="w-6 h-6 text-white" />
                    <span className="text-[10px] font-bold">342</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Share2 className="w-6 h-6 text-white" />
                    <span className="text-[10px] font-bold">Share</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LINKEDIN SIMULATOR */}
          {platform === 'LinkedIn' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-2xl font-sans space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white">{account.name}</span>
                      <span className="text-[10px] text-slate-400">· 1st</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Creator & Automation Lead</p>
                    <p className="text-[10px] text-slate-500">Just now · 🌐</p>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </div>

              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {content}
              </div>

              {mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center">
                  {mediaType === 'video' ? (
                    <video src={mediaUrl} controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={mediaUrl} alt="Post asset" className="w-full h-full object-cover" />
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <button className="flex items-center gap-1.5 hover:text-cyan-400">
                  <ThumbsUp className="w-4 h-4" /> <span>Like</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-cyan-400">
                  <MessageCircle className="w-4 h-4" /> <span>Comment</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-cyan-400">
                  <Repeat2 className="w-4 h-4" /> <span>Repost</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-cyan-400">
                  <Send className="w-4 h-4" /> <span>Send</span>
                </button>
              </div>
            </div>
          )}

          {/* X / TWITTER SIMULATOR */}
          {platform === 'X (Twitter)' && (
            <div className="bg-black border border-zinc-800 rounded-2xl p-4 text-white shadow-2xl font-sans space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={account.avatar}
                  alt={account.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{account.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs text-zinc-500 font-mono">{account.handle}</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-xs text-zinc-500">Just now</span>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                  </div>

                  <p className="text-xs text-zinc-100 whitespace-pre-wrap leading-relaxed">
                    {content}
                  </p>

                  {mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-950">
                      {mediaType === 'video' ? (
                        <video src={mediaUrl} controls className="w-full h-full object-contain" />
                      ) : (
                        <img src={mediaUrl} alt="X media" className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 text-zinc-500 text-xs">
                    <button className="flex items-center gap-1 hover:text-blue-400">
                      <MessageCircle className="w-4 h-4" /> <span>14</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-emerald-400">
                      <Repeat2 className="w-4 h-4" /> <span>28</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-rose-400">
                      <Heart className="w-4 h-4" /> <span>142</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-400">
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-400">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SNAPCHAT OR STATUS SIMULATOR */}
          {(platform === 'Snapchat' || platform === 'WhatsApp' || platform === 'Facebook') && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-sm mx-auto text-white shadow-2xl font-sans aspect-[9/16] relative flex flex-col justify-between p-4">
              {mediaUrl ? (
                mediaType === 'video' ? (
                  <video src={mediaUrl} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover z-0" />
                ) : (
                  <img src={mediaUrl} alt="Snap" className="absolute inset-0 w-full h-full object-cover z-0" />
                )
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900 z-0" />
              )}

              {/* Progress bars at top */}
              <div className="relative z-10 flex gap-1 pt-1">
                <div className="h-1 flex-1 bg-white rounded-full" />
                <div className="h-1 flex-1 bg-white/40 rounded-full" />
              </div>

              {/* Sender */}
              <div className="relative z-10 flex items-center gap-2 mt-2">
                <img src={account.avatar} alt={account.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                <div>
                  <span className="text-xs font-bold drop-shadow">{account.name}</span>
                  <span className="text-[10px] text-zinc-300 block drop-shadow">Live Story · Just now</span>
                </div>
              </div>

              {/* Caption Overlay */}
              <div className="relative z-10 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-xs text-white leading-relaxed">
                {content}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="pt-2 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-cyan-500/20"
          >
            Close App View
          </button>
        </div>
      </div>
    </div>
  );
};
