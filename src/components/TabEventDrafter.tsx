import React, { useState, useRef } from 'react';
import {
  FileText,
  Mail,
  Download,
  Copy,
  Check,
  Mic,
  Sparkles,
  Images,
  BookOpen,
  Upload,
  X,
  Plus,
} from 'lucide-react';
import { generateEventRecap, EventRecap } from '../utils/aiEngine';
import { downloadFile } from '../utils/calendarExport';

interface UploadedEventPhoto {
  id: string;
  url: string;
  name: string;
}

const INITIAL_EMPTY_RECAP: EventRecap = {
  blogMarkdown: '# Event Title\n\nAdd your event title, attach pictures, and paste your bullet points on the left, then click "Generate Blog Post & Newsletter" to draft your publication.',
  newsletterSubjects: [
    'Highlights & Takeaways from our recent showcase',
    'Inside Look: What happened and what comes next',
    'Key moments you might have missed'
  ],
  newsletterPreview: 'Quick recap of our recent event and highlights',
  newsletterBody: 'Hey there,\n\nHere is a quick summary of what happened at our recent event...',
};

export const TabEventDrafter: React.FC = () => {
  const [eventTitle, setEventTitle] = useState('');
  const [bulletNotes, setBulletNotes] = useState('');
  const [tone, setTone] = useState('Friendly & Casual');
  const [photos, setPhotos] = useState<UploadedEventPhoto[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'blog' | 'newsletter'>('blog');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [output, setOutput] = useState<EventRecap>(INITIAL_EMPTY_RECAP);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: UploadedEventPhoto[] = Array.from(files).map((file, idx) => ({
      id: `up-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setPhotos((prev) => [...newPhotos, ...prev]);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const handleSynthesize = async () => {
    if (!eventTitle.trim() && !bulletNotes.trim() && photos.length === 0) {
      return;
    }
    setIsGenerating(true);
    try {
      const res = await generateEventRecap(eventTitle, bulletNotes, tone, photos.length);
      setOutput(res);
    } catch (e) {
      console.error('Error in handleSynthesize:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Event-to-Blog & Newsletter Drafter</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload your event photos, enter talking points or voice memos, and generate a Medium-form blog post and email newsletter.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <span>AI Editorial Writer</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400 font-semibold">{photos.length} Photos Attached</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Event or Announcement Title
            </label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          {/* Real Photo Upload Gallery */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Images className="w-4 h-4 text-cyan-400" />
                <span>Upload Event Photos / Pictures ({photos.length})</span>
              </label>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pictures</span>
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Photo Grid / Upload Dropzone */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-xl overflow-hidden border border-slate-800 aspect-square bg-slate-950"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-1 right-1 bg-slate-950/80 hover:bg-rose-600 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove picture"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Plus add card */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/70 aspect-square flex flex-col items-center justify-center text-slate-400 hover:text-cyan-400 bg-slate-950/50 hover:bg-cyan-950/20 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-semibold">Upload</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 rounded-xl p-5 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-cyan-950/10 group"
              >
                <Upload className="w-5 h-5 mx-auto text-slate-400 group-hover:text-cyan-400 transition-colors" />
                <p className="text-xs font-semibold text-slate-200 mt-2">
                  Click to upload pictures from your event
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select multiple JPG, PNG, or WebP files
                </p>
              </div>
            )}
          </div>

          {/* Agenda / Bullet Points */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Key Highlights & Talking Points
            </label>
            <textarea
              value={bulletNotes}
              onChange={(e) => setBulletNotes(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Tone Selector */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Writing Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Friendly & Casual', 'Professional', 'Educational'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
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
            onClick={handleSynthesize}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-98 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing Article & Newsletter...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Synthesize Medium Blog & Newsletter</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            {/* View Switcher & Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewMode('blog')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    viewMode === 'blog'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Medium-Form Blog Post (.md)</span>
                </button>
                <button
                  onClick={() => setViewMode('newsletter')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    viewMode === 'newsletter'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Newsletter Edition</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleCopy(
                      viewMode === 'blog' ? output.blogMarkdown : output.newsletterBody,
                      viewMode
                    )
                  }
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copiedKey === viewMode ? (
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
                  onClick={() => {
                    if (viewMode === 'blog') {
                      downloadFile(
                        output.blogMarkdown,
                        `${eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_blog.md`,
                        'text/markdown'
                      );
                    } else {
                      downloadFile(
                        output.newsletterBody,
                        `${eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_newsletter.txt`,
                        'text/plain'
                      );
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{viewMode === 'blog' ? 'Download .MD' : 'Download .TXT'}</span>
                </button>
              </div>
            </div>

            {/* Display Body */}
            {viewMode === 'blog' ? (
              <div className="bg-slate-950 rounded-xl p-5 border border-slate-800/80 max-h-[500px] overflow-y-auto space-y-4">
                <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed selection:bg-cyan-500/20">
                  {output.blogMarkdown}
                </pre>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Subject Lines */}
                <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    A/B Test Email Subject Lines:
                  </span>
                  <div className="space-y-1.5">
                    {output.newsletterSubjects.map((sub, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800"
                      >
                        <span className="font-medium text-cyan-300">{sub}</span>
                        <span className="text-[11px] text-slate-500 font-mono">Subject Option #{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 max-h-[360px] overflow-y-auto">
                  <p className="text-xs text-slate-400 mb-2 font-mono">
                    <strong className="text-slate-300">Preview Text:</strong> {output.newsletterPreview}
                  </p>
                  <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed border-t border-slate-800 pt-3">
                    {output.newsletterBody}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
