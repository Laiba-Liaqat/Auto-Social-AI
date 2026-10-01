import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Sparkles,
  Edit2,
  Trash2,
  ThumbsUp,
  HelpCircle,
  AlertTriangle,
  ShieldAlert,
  Share2,
  Globe,
  Loader2,
} from 'lucide-react';
import { SocialAccount, dispatchCommentReplyWithRealCredentials } from '../utils/socialAccounts';
import { generateRepliesForRealComments } from '../utils/aiEngine';
import { StoredUserPost } from '../utils/userDataStorage';

interface RealCommentItem {
  id: string;
  comment: string;
  category: 'Question / Inquiry' | 'Positive / Fan' | 'Constructive / Feedback' | 'Spam';
  response: string;
  isPublished: boolean;
  publishedTimestamp?: string;
}

interface TabCommentResponderProps {
  accounts: SocialAccount[];
  posts?: StoredUserPost[];
  setPosts?: React.Dispatch<React.SetStateAction<StoredUserPost[]>>;
  onShowToast: (msg: string) => void;
  creatorName?: string;
  onNavigateToStudio?: () => void;
}

export const TabCommentResponder: React.FC<TabCommentResponderProps> = ({
  accounts,
  posts = [],
  setPosts,
  onShowToast,
  creatorName = 'Creator',
  onNavigateToStudio,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0] || null;

  const [postTitle, setPostTitle] = useState('');
  const [rawCommentsInput, setRawCommentsInput] = useState('');
  const [tone, setTone] = useState('Friendly & Casual');

  const [commentsList, setCommentsList] = useState<RealCommentItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Handle generating replies for all pasted comments
  const handleProcessComments = async () => {
    const rawLines = rawCommentsInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLines.length === 0) {
      onShowToast('Please paste at least one comment to analyze.');
      return;
    }

    setIsGenerating(true);

    try {
      const results = await generateRepliesForRealComments(
        postTitle || 'Recent Post',
        rawLines,
        tone,
        creatorName
      );

      const items: RealCommentItem[] = rawLines.map((line, idx) => {
        const found = results.find((r) => r.commentIndex === idx);
        return {
          id: `comm-${Date.now()}-${idx}`,
          comment: line,
          category: found?.category || (line.includes('?') ? 'Question / Inquiry' : 'Positive / Fan'),
          response: found?.response || `Thank you for sharing your thoughts! Check the link in our profile for more details.`,
          isPublished: false,
        };
      });

      setCommentsList(items);
      onShowToast(`Generated replies for ${items.length} comments! ✨`);
    } catch (e: any) {
      onShowToast('Error generating replies.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySingle = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    onShowToast('Reply copied to clipboard!');
  };

  const handleCopyAll = () => {
    const allText = commentsList.map((c, i) => `[Comment ${i + 1}] "${c.comment}"\nReply: ${c.response}`).join('\n\n');
    navigator.clipboard.writeText(allText);
    onShowToast('All replies copied to clipboard!');
  };

  const handlePublishViaApi = async (id: string) => {
    if (!activeAccount) {
      onShowToast('Please connect a social account with API keys first.');
      return;
    }

    const targetComment = commentsList.find((c) => c.id === id);
    if (!targetComment) return;

    setPublishingId(id);
    const result = await dispatchCommentReplyWithRealCredentials(
      activeAccount.platform,
      activeAccount,
      id,
      targetComment.comment,
      targetComment.response
    );
    setPublishingId(null);

    if (result.success) {
      const timestamp = result.publishedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCommentsList((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isPublished: true, publishedTimestamp: timestamp } : c
        )
      );
      onShowToast(result.message || `Reply dispatched via ${activeAccount.platform} API as ${activeAccount.handle}! 🚀`);
    } else {
      onShowToast(result.message || 'Failed to dispatch reply via API');
    }
  };

  const startEdit = (c: RealCommentItem) => {
    setEditingId(c.id);
    setEditText(c.response);
  };

  const saveEdit = (id: string) => {
    setCommentsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, response: editText } : c))
    );
    setEditingId(null);
  };

  const handleDeleteComment = (id: string) => {
    setCommentsList((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Live Post Comment Auto-Responder</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Paste actual incoming comments from your live posts. The AI generates contextual replies tailored to your real text, which you can copy or publish directly via API.
          </p>
        </div>

        {commentsList.length > 0 && (
          <button
            onClick={handleCopyAll}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Copy All Replies</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real Inputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Target Account Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 space-y-2 shadow-lg">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Select Connected Channel for Replies
            </label>
            {accounts.length > 0 ? (
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.platform} — {acc.handle} {acc.apiVerified ? '(Verified API)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-amber-400">
                No accounts connected. Connect your social API keys in "Manage & Add Accounts".
              </div>
            )}
          </div>

          {/* Post Title Context */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 space-y-2 shadow-lg">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Your Post Title or Topic Reference *
            </label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="e.g. Introducing our new spring catalog / Software v2 release"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Paste Real Comments Area */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>3. Paste Actual Audience Comments *</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">1 comment per line</span>
            </div>

            <textarea
              value={rawCommentsInput}
              onChange={(e) => setRawCommentsInput(e.target.value)}
              rows={6}
              placeholder="Paste raw comments from your post here, for example:
Do you ship internationally?
How much does the starter plan cost?
This looks really great, congratulations!
Can I upgrade later?"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed resize-none"
            />
          </div>

          {/* Tone Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 space-y-2 shadow-lg">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              4. Response Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Friendly & Casual', 'Professional', 'Energetic / Hype'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    tone === t
                      ? 'border-cyan-500/80 bg-cyan-500/15 text-cyan-300 font-bold'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleProcessComments}
            disabled={isGenerating || !rawCommentsInput.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Generating Real Contextual Replies...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Generate Replies for Pasted Comments</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generated Replies & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Generated Replies ({commentsList.length})
            </span>

            {activeAccount && (
              <span className="text-[11px] text-cyan-400 font-mono">
                Active API Channel: {activeAccount.handle}
              </span>
            )}
          </div>

          <div className="space-y-3.5 max-h-[680px] overflow-y-auto pr-1">
            {commentsList.map((item, idx) => {
              const isQuestion = item.category.includes('Question');
              const isFan = item.category.includes('Fan');
              const isSpam = item.category.includes('Spam');

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 space-y-3 hover:border-slate-700 shadow-md transition-all"
                >
                  {/* Category and Comment Index */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                    <span className="font-mono text-slate-400 font-bold">
                      Comment #{idx + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      {isQuestion && (
                        <span className="text-cyan-400 flex items-center gap-1 font-semibold text-[11px]">
                          <HelpCircle className="w-3 h-3" /> Question / Inquiry
                        </span>
                      )}
                      {isFan && (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                          <ThumbsUp className="w-3 h-3" /> Positive Feedback
                        </span>
                      )}
                      {isSpam && (
                        <span className="text-rose-400 flex items-center gap-1 font-semibold text-[11px]">
                          <ShieldAlert className="w-3 h-3" /> Spam
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteComment(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Real Pasted Comment */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-200 italic leading-relaxed">
                    "{item.comment}"
                  </div>

                  {/* Generated AI Response */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>AI Crafted Response</span>
                      </span>

                      {editingId !== item.id && (
                        <button
                          onClick={() => startEdit(item)}
                          className="text-slate-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>Edit response</span>
                        </button>
                      )}
                    </div>

                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-950 border border-cyan-500 rounded-xl p-2.5 text-xs text-white focus:outline-none font-sans"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 text-xs text-slate-400"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="px-3 py-1 text-xs font-bold bg-cyan-400 text-slate-950 rounded-lg"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs text-cyan-200 leading-relaxed font-sans">
                        {item.response}
                      </div>
                    )}
                  </div>

                  {/* Action Handlers: Copy to Clipboard or Publish via API */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                    {item.isPublished ? (
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Published via API at {item.publishedTimestamp}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => handleCopySingle(item.response, item.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy to Clipboard</span>
                            </>
                          )}
                        </button>

                        <button
                          disabled={publishingId === item.id}
                          onClick={() => handlePublishViaApi(item.id)}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {publishingId === item.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Publishing...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Publish via API</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {commentsList.length === 0 && (
              <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">No Comments Processed Yet</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Paste live comments from your live Instagram, TikTok, or X posts on the left and click "Generate Replies for Pasted Comments".
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
