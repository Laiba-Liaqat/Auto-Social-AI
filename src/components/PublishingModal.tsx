import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Send,
  Sparkles,
  X,
  Eye,
} from 'lucide-react';
import { SocialAccount, PublishDispatchStep, dispatchPostAutomatically, PublishResult } from '../utils/socialAccounts';

interface PublishingModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string;
  account: SocialAccount;
  content: string;
  mediaType: 'image' | 'video' | 'none';
  mediaUrl: string;
  onSuccess: (result: PublishResult) => void;
  onViewLivePost?: (result: PublishResult) => void;
}

export const PublishingModal: React.FC<PublishingModalProps> = ({
  isOpen,
  onClose,
  platform,
  account,
  content,
  mediaType,
  mediaUrl,
  onSuccess,
  onViewLivePost,
}) => {
  const [steps, setSteps] = useState<PublishDispatchStep[]>([]);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setIsPublishing(true);
      setResult(null);
      dispatchPostAutomatically(platform, account, content, mediaType, mediaUrl, (newSteps) => {
        setSteps(newSteps);
      }).then((res) => {
        setResult(res);
        setIsPublishing(false);
        onSuccess(res);
      });
    }
  }, [isOpen, platform, account, content, mediaType, mediaUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-5">
        {/* Close button (only when finished) */}
        {!isPublishing && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 shrink-0">
            {isPublishing ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-slate-950" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isPublishing ? `Publishing to ${platform}...` : `Live on ${platform}! 🎉`}
            </h3>
            <p className="text-xs text-slate-400">
              Posting automatically as <span className="text-cyan-400 font-semibold">{account.handle}</span>
            </p>
          </div>
        </div>

        {/* Media & Content Snippet Preview */}
        <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 flex gap-3 items-center">
          {mediaType === 'image' && mediaUrl && (
            <img src={mediaUrl} alt="Upload" className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0" />
          )}
          {mediaType === 'video' && (
            <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800 flex items-center justify-center text-purple-300 text-xs font-bold shrink-0">
              VIDEO
            </div>
          )}
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
            {content}
          </p>
        </div>

        {/* Step-by-step progress */}
        <div className="space-y-2">
          {steps.map((st, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl border text-xs transition-all ${
                st.status === 'completed'
                  ? 'bg-emerald-950/25 border-emerald-800/60 text-emerald-300'
                  : st.status === 'in_progress'
                  ? 'bg-cyan-950/30 border-cyan-700/60 text-cyan-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-2">
                  {st.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {st.status === 'in_progress' && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
                  {st.status === 'pending' && <span className="w-3.5 h-3.5 rounded-full border border-slate-700 block" />}
                  <span>{st.step}</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider">
                  {st.status === 'completed' ? 'Done' : st.status === 'in_progress' ? 'Running' : 'Waiting'}
                </span>
              </div>
              <p className="text-[11px] mt-1 pl-5.5 text-slate-400 font-sans">{st.detail}</p>
            </div>
          ))}
        </div>

        {/* Finished Action: Show in designated social app */}
        {!isPublishing && result && (
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                onClose();
                if (onViewLivePost) onViewLivePost(result);
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Show My Auto-Posted Post on {platform}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center transition-colors border border-slate-700"
            >
              Done / Return to Studio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
