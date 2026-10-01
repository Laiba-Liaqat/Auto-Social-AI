/**
 * userDataStorage.ts
 * Real-time persistent data storage using browser LocalStorage.
 * Stores user profiles, real connected social accounts, real user-created posts,
 * comments on those posts, and scheduled publishing calendar items.
 */

export interface StoredUserProfile {
  name: string;
  email: string;
  avatar: string;
  brandName: string;
  bio?: string;
}

export interface StoredSocialAccount {
  id: string;
  platform: 'Instagram' | 'TikTok' | 'Snapchat' | 'LinkedIn' | 'X (Twitter)' | 'Facebook' | 'WhatsApp';
  handle: string;
  name: string;
  avatar: string;
  connected: boolean;
  autoPostEnabled: boolean;
  followerCount?: string;
  connectedAt: string;
  credentials?: {
    accessToken?: string;
    bearerToken?: string;
    apiKey?: string;
    apiSecret?: string;
    clientKey?: string;
    clientSecret?: string;
    pageId?: string;
    accountId?: string;
  };
  apiVerified?: boolean;
  lastVerifiedAt?: string;
  verifiedStatusMessage?: string;
}

export interface PostComment {
  id: string;
  author: string;
  authorAvatar: string;
  timeAgo: string;
  comment: string;
  category: 'Question / Inquiry' | 'Positive / Fan' | 'Constructive / Feedback' | 'Spam';
  response: string;
  status: 'pending' | 'auto_sent';
  sentTimestamp?: string;
}

export interface StoredUserPost {
  id: string;
  title: string;
  caption: string;
  platform: string;
  accountHandle: string;
  mediaType: 'image' | 'video' | 'none';
  mediaUrl: string;
  publishedAt: string;
  postReferenceId: string;
  status: 'Published' | 'Scheduled' | 'Draft';
  comments: PostComment[];
}

const KEYS = {
  USER: 'autosocial_user_profile',
  ACCOUNTS: 'autosocial_user_accounts',
  POSTS: 'autosocial_user_posts',
};

// 1. USER PROFILE STORAGE
export function getStoredUserProfile(): StoredUserProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading user profile:', e);
  }
  return null;
}

export function saveStoredUserProfile(profile: StoredUserProfile): void {
  try {
    localStorage.setItem(KEYS.USER, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving user profile:', e);
  }
}

// 2. SOCIAL ACCOUNTS STORAGE
export function getStoredAccounts(): StoredSocialAccount[] {
  try {
    const raw = localStorage.getItem(KEYS.ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading accounts:', e);
  }
  return [];
}

export function saveStoredAccounts(accounts: StoredSocialAccount[]): void {
  try {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving accounts:', e);
  }
}

export function addStoredAccount(newAccount: StoredSocialAccount): StoredSocialAccount[] {
  const current = getStoredAccounts();
  const updated = [newAccount, ...current];
  saveStoredAccounts(updated);
  return updated;
}

export function updateStoredAccount(id: string, updates: Partial<StoredSocialAccount>): StoredSocialAccount[] {
  const current = getStoredAccounts();
  const updated = current.map((a) => (a.id === id ? { ...a, ...updates } : a));
  saveStoredAccounts(updated);
  return updated;
}

export function deleteStoredAccount(id: string): StoredSocialAccount[] {
  const current = getStoredAccounts();
  const updated = current.filter((a) => a.id !== id);
  saveStoredAccounts(updated);
  return updated;
}

// 3. USER POSTS & COMMENTS STORAGE
export function getStoredPosts(): StoredUserPost[] {
  try {
    const raw = localStorage.getItem(KEYS.POSTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading posts:', e);
  }
  return [];
}

export function saveStoredPosts(posts: StoredUserPost[]): void {
  try {
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  } catch (e) {
    console.error('Error saving posts:', e);
  }
}

export function addStoredPost(newPost: StoredUserPost): StoredUserPost[] {
  const current = getStoredPosts();
  const updated = [newPost, ...current];
  saveStoredPosts(updated);
  return updated;
}

export function deleteStoredPost(id: string): StoredUserPost[] {
  const current = getStoredPosts();
  const updated = current.filter((p) => p.id !== id);
  saveStoredPosts(updated);
  return updated;
}

export function addCommentToStoredPost(postId: string, comment: PostComment): StoredUserPost[] {
  const current = getStoredPosts();
  const updated = current.map((p) => {
    if (p.id === postId) {
      return {
        ...p,
        comments: [comment, ...(p.comments || [])],
      };
    }
    return p;
  });
  saveStoredPosts(updated);
  return updated;
}

export function updatePostCommentReply(
  postId: string,
  commentId: string,
  replyText: string,
  status: 'pending' | 'auto_sent'
): StoredUserPost[] {
  const current = getStoredPosts();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const updated = current.map((p) => {
    if (p.id === postId) {
      return {
        ...p,
        comments: (p.comments || []).map((c) =>
          c.id === commentId
            ? { ...c, response: replyText, status, sentTimestamp: status === 'auto_sent' ? timestamp : c.sentTimestamp }
            : c
        ),
      };
    }
    return p;
  });

  saveStoredPosts(updated);
  return updated;
}
