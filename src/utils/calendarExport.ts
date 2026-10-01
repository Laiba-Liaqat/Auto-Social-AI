import JSZip from 'jszip';
import { PROJECT_FILES } from '../data/projectFiles';

export interface CalendarItem {
  id: string;
  date: string;
  time: string;
  platform: 'Instagram' | 'TikTok' | 'Snapchat' | 'LinkedIn' | 'X (Twitter)' | 'Facebook' | 'WhatsApp';
  title: string;
  caption: string;
  status: 'Scheduled' | 'Draft' | 'Published';
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportCalendarToCSV(events: CalendarItem[]): string {
  const headers = ['ID', 'Date', 'Time', 'Platform', 'Title', 'Caption', 'Status'];
  const rows = events.map((e) => [
    `"${e.id}"`,
    `"${e.date}"`,
    `"${e.time}"`,
    `"${e.platform}"`,
    `"${e.title.replace(/"/g, '""')}"`,
    `"${e.caption.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    `"${e.status}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportCalendarToICS(events: CalendarItem[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AutoSocial AI//Social Content Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach((evt) => {
    const cleanDate = evt.date.replace(/-/g, '');
    const cleanDesc = evt.caption.replace(/\n/g, '\\n').replace(/,/g, '\\,');
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:autosocial-${evt.id}@autosocial.ai`);
    lines.push(`DTSTAMP:${cleanDate}T090000Z`);
    lines.push(`DTSTART;VALUE=DATE:${cleanDate}`);
    lines.push(`DTEND;VALUE=DATE:${cleanDate}`);
    lines.push(`SUMMARY:[${evt.platform}] ${evt.title}`);
    lines.push(`DESCRIPTION:${cleanDesc}`);
    lines.push(`STATUS:${evt.status === 'Scheduled' ? 'CONFIRMED' : 'TENTATIVE'}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export async function downloadCompleteProjectZip() {
  const zip = new JSZip();

  // Add all project files into the zip archive matching the exact repository tree
  for (const file of PROJECT_FILES) {
    zip.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'autosocial-ai-open-source-package.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
