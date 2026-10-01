import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Download,
  Plus,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';
import { CalendarItem, exportCalendarToCSV, exportCalendarToICS, downloadFile } from '../utils/calendarExport';

interface TabCalendarSchedulerProps {
  events: CalendarItem[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarItem[]>>;
  onShowToast: (msg: string) => void;
}

export const TabCalendarScheduler: React.FC<TabCalendarSchedulerProps> = ({
  events,
  setEvents,
  onShowToast,
}) => {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState<CalendarItem['platform']>('Instagram');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('12:00 PM');
  const [newCaption, setNewCaption] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: CalendarItem = {
      id: `evt-${Date.now()}`,
      title: newTitle.trim(),
      platform: newPlatform,
      date: newDate,
      time: newTime,
      caption: newCaption || 'Drafted social caption',
      status: 'Scheduled',
    };

    setEvents([newItem, ...events]);
    setNewTitle('');
    setNewCaption('');
    setIsAdding(false);
    onShowToast(`Scheduled new post for ${newPlatform}!`);
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const handleMarkPublished = (id: string) => {
    setEvents(
      events.map((e) => (e.id === id ? { ...e, status: 'Published' } : e))
    );
    onShowToast('Post marked as Published Live! 🎉');
  };

  const filteredEvents =
    platformFilter === 'all'
      ? events
      : events.filter((e) => e.platform.toLowerCase().includes(platformFilter.toLowerCase()));

  const handleExportCSV = () => {
    const csvStr = exportCalendarToCSV(events);
    downloadFile(csvStr, 'autosocial_content_calendar.csv', 'text/csv');
    onShowToast('Exported calendar to CSV!');
  };

  const handleExportICS = () => {
    const icsStr = exportCalendarToICS(events);
    downloadFile(icsStr, 'autosocial_schedule.ics', 'text/calendar');
    onShowToast('Exported calendar to iCal (.ics) for Google/Apple Calendar!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Content Calendar & Auto-Publishing Queue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track and export all scheduled, draft, and published social media posts across your connected channels.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Cancel' : 'Schedule Post'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportICS}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export iCal (.ics)</span>
          </button>
        </div>
      </div>

      {/* Inline Form */}
      {isAdding && (
        <form
          onSubmit={handleAddEvent}
          className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-5 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Schedule New Post to Publishing Queue
            </h3>
            <span className="text-[11px] text-cyan-400 font-semibold font-mono">
              Auto-Post upon Scheduled Time
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Post Title / Hook</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="E.g. Weekend Flash Sale Announcement"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Platform</label>
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Snapchat">Snapchat</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="X (Twitter)">X (Twitter)</option>
                <option value="Facebook">Facebook</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Publish Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Publish Time</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="12:00 PM"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Caption & Content</label>
            <textarea
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              rows={2}
              placeholder="Enter post caption or story text..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none font-sans"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 text-xs font-bold rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
            >
              Add to Queue
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs & Count */}
      <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Channels' },
            { id: 'instagram', label: 'Instagram' },
            { id: 'tiktok', label: 'TikTok' },
            { id: 'snapchat', label: 'Snapchat' },
            { id: 'linkedin', label: 'LinkedIn' },
            { id: 'twitter', label: 'X (Twitter)' },
            { id: 'whatsapp', label: 'WhatsApp' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPlatformFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                platformFilter === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          {filteredEvents.length} Item{filteredEvents.length !== 1 ? 's' : ''} in Queue
        </span>
      </div>

      {/* Scheduled Items List */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80 shadow-xl">
        {filteredEvents.map((evt) => {
          const isPublished = evt.status === 'Published';
          return (
            <div
              key={evt.id}
              className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-white tracking-tight">{evt.title}</h4>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60">
                    {evt.platform}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">·</span>
                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> {evt.date} @ {evt.time}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
                  {evt.caption}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                {isPublished ? (
                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Published Live
                  </span>
                ) : (
                  <button
                    onClick={() => handleMarkPublished(evt.id)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post Now</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(evt.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-800"
                  title="Remove from queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="p-10 text-center text-slate-500 text-xs">
            No posts found under this filter. Create a post in the Post Studio and click 'Schedule' or 'Approve & Post'!
          </div>
        )}
      </div>
    </div>
  );
};
