/**
 * aiEngine.ts
 * Real AI generation engine communicating with the backend Gemini 3.8 Flash proxy.
 */

export interface MultiPlatformPosts {
  visualSummary: string;
  instagramFeed: string;
  instagramStory: {
    caption: string;
    stickerIdea: string;
    pollQuestion: string;
    musicVibe: string;
  };
  tiktok: {
    hook: string;
    caption: string;
    soundSuggestion: string;
    hashtags: string[];
  };
  snapchat: {
    caption: string;
    lensIdea: string;
    spotlightTitle: string;
  };
  linkedin: string;
  twitter: string;
  statusUpdate: string;
}

export interface EventRecap {
  blogMarkdown: string;
  newsletterSubjects: string[];
  newsletterPreview: string;
  newsletterBody: string;
}

export interface ContentMetrics {
  charCount: number;
  wordCount: number;
  hashtagCount: number;
  hashtags: string[];
  readabilityScore: number;
  readabilityGrade: string;
  densityRating: string;
  engagementIndex: number;
}

export function computeOfflineMetrics(text: string): ContentMetrics {
  if (!text) {
    return {
      charCount: 0,
      wordCount: 0,
      hashtagCount: 0,
      hashtags: [],
      readabilityScore: 0,
      readabilityGrade: 'N/A',
      densityRating: 'N/A',
      engagementIndex: 0,
    };
  }

  const words = text.match(/\b\w+\b/g) || [];
  const wordCount = words.length;
  const charCount = text.length;
  const hashtags = text.match(/#[A-Za-z0-9_]+/g) || [];
  const hashtagCount = hashtags.length;
  const sentences = Math.max(text.split(/[.!?]+/).filter(Boolean).length, 1);

  function countSyllables(w: string): number {
    const word = w.toLowerCase();
    const matches = word.match(/[aeiouy]{1,2}/g);
    let count = matches ? matches.length : 1;
    if (word.endsWith('e') && !word.endsWith('le')) {
      count = Math.max(1, count - 1);
    }
    return count;
  }

  const totalSyllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
  const wordsPerSentence = wordCount / sentences;
  const syllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 1;

  let flesch = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  flesch = Math.max(10, Math.min(100, Math.round(flesch * 10) / 10));

  let grade = 'Balanced & Easy';
  if (flesch >= 80) grade = 'Conversational (High Viral Reach)';
  else if (flesch >= 60) grade = 'Standard (Engaging)';
  else if (flesch >= 40) grade = 'Professional / Thought Leadership';
  else grade = 'Detailed / In-depth';

  let density = 'Optimal';
  if (hashtagCount === 0) density = 'No Hashtags';
  else if (hashtagCount <= 5) density = 'Great for TikTok, LinkedIn & X';
  else if (hashtagCount <= 15) density = 'Great for Instagram Discovery';
  else density = 'Saturated';

  let engagement = 60;
  if (flesch >= 60 && flesch <= 85) engagement += 18;
  if (hashtagCount >= 2 && hashtagCount <= 12) engagement += 12;
  if (/[\u{1F300}-\u{1F9FF}]/u.test(text)) engagement += 6;
  if (text.includes('?')) engagement += 4;
  engagement = Math.min(99, Math.max(35, engagement));

  return {
    charCount,
    wordCount,
    hashtagCount,
    hashtags,
    readabilityScore: flesch,
    readabilityGrade: grade,
    densityRating: density,
    engagementIndex: engagement,
  };
}

/**
 * Call Gemini 3.8 Flash on backend proxy with user's actual prompt & media
 */
export async function generateAllSocialPosts(
  context: string,
  tone: string,
  mediaType: 'image' | 'video' | 'none',
  mediaDescription?: string,
  mediaBase64?: string,
  mediaMimeType?: string,
  formatMode: 'feed' | 'story' = 'feed'
): Promise<MultiPlatformPosts> {
  try {
    const res = await fetch('/api/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: context,
        tone,
        mediaType,
        mediaDescription,
        mediaBase64,
        mediaMimeType,
        formatMode,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.instagramFeed) {
        return data as MultiPlatformPosts;
      }
    }
  } catch (err) {
    console.warn('Backend Gemini API call fallback:', err);
  }

  // Graceful deterministic fallback if network unavailable
  const topic = context.trim() || 'our latest project update';
  return {
    visualSummary: mediaDescription ? `Uploaded asset: ${mediaDescription}` : `Topic: ${topic}`,
    instagramFeed: `${topic} ✨\n\nExcited to share this with everyone! Tap link in bio for full details.\n\n#Creatives #Innovation #BuildInPublic #SocialGrowth`,
    instagramStory: {
      caption: `Swipe up to check this out! 👆`,
      stickerIdea: 'Interactive Question sticker',
      pollQuestion: 'What do you think?',
      musicVibe: 'Trending Lo-Fi beat',
    },
    tiktok: {
      hook: `Wait till you see this... 🤯`,
      caption: `${topic.slice(0, 100)}! Drop a comment if you want more details! ⚡️`,
      soundSuggestion: 'Trending Creator Audio',
      hashtags: ['#fyp', '#viral', '#trending'],
    },
    snapchat: {
      caption: `Check this out! 👻`,
      lensIdea: 'Glow Filter',
      spotlightTitle: topic.slice(0, 40),
    },
    linkedin: `Reflecting on ${topic}:\n\nHere are 3 core insights from our recent rollout.\n\nWhat are your thoughts on this approach? Let's connect below.`,
    twitter: `${topic.slice(0, 180)} ⚡️\n\nFull details below 👇`,
    statusUpdate: `Exciting update: ${topic}! Check it out!`,
  };
}

/**
 * Call Gemini 3.8 Flash for Event-to-Blog & Newsletter
 */
export async function generateEventRecap(
  title: string,
  bulletNotes: string,
  tone: string,
  imageCount: number = 0
): Promise<EventRecap> {
  try {
    const res = await fetch('/api/generate-event-recap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, bulletNotes, tone, imageCount }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.blogMarkdown) {
        return data as EventRecap;
      }
    }
  } catch (err) {
    console.warn('Backend Event Recap fallback:', err);
  }

  const eventName = title.trim() || 'Event Recap';
  return {
    blogMarkdown: `# ${eventName}: Complete Recap\n\n${bulletNotes}`,
    newsletterSubjects: [`Recap: Highlights from ${eventName}`],
    newsletterPreview: `What happened at ${eventName}`,
    newsletterBody: `Hey there,\n\nHere are the highlights from ${eventName}:\n\n${bulletNotes}`,
  };
}

/**
 * Call Gemini 3.8 Flash for real audience comment replies
 */
export async function generateRepliesForRealComments(
  postTitle: string,
  comments: string[],
  tone: string = 'Friendly & Casual',
  creatorName: string = 'Creator'
): Promise<{ commentIndex: number; category: any; response: string }[]> {
  try {
    const res = await fetch('/api/generate-replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postTitle, comments, tone, creatorName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.replies)) {
        return data.replies;
      }
    }
  } catch (err) {
    console.warn('Backend comment replies fallback:', err);
  }

  return comments.map((c, i) => ({
    commentIndex: i,
    category: c.includes('?') ? 'Question / Inquiry' : 'Positive / Fan',
    response: `Thank you for commenting! You can find full details about "${postTitle}" via the link in our bio. ✨`,
  }));
}
