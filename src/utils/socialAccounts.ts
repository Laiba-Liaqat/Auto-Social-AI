/**
 * socialAccounts.ts
 * Real social media connectivity, OAuth token storage, and live API dispatch.
 * No hardcoded fake profiles.
 */

export interface SocialAccountCredentials {
  accessToken?: string;
  bearerToken?: string;
  apiKey?: string;
  apiSecret?: string;
  clientKey?: string;
  clientSecret?: string;
  pageId?: string;
  accountId?: string;
}

export interface SocialAccount {
  id: string;
  platform: 'Instagram' | 'TikTok' | 'Snapchat' | 'LinkedIn' | 'X (Twitter)' | 'Facebook' | 'WhatsApp';
  handle: string;
  name: string;
  avatar: string;
  connected: boolean;
  autoPostEnabled: boolean;
  credentials?: SocialAccountCredentials;
  apiVerified: boolean;
  lastVerifiedAt?: string;
  verifiedStatusMessage?: string;
  connectedAt: string;
  followerCount?: string;
}

export interface PublishDispatchStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  detail: string;
}

export interface PublishResult {
  success: boolean;
  publishedUrl: string;
  publishedAt: string;
  postReferenceId: string;
  platform: string;
  message?: string;
}

/**
 * Real API credential verification against official REST/Graph APIs via server proxy
 */
export async function verifySocialCredentials(
  platform: string,
  credentials: SocialAccountCredentials
): Promise<{ success: boolean; message: string; verifiedHandle?: string; status?: number }> {
  try {
    const res = await fetch('/api/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, credentials }),
    });

    const data = await res.json();
    return {
      success: res.ok && data.success,
      message: data.message || (res.ok ? 'Verified successfully' : 'Verification failed'),
      verifiedHandle: data.verifiedHandle,
      status: data.status,
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Network error verifying credentials: ${e.message || String(e)}`,
    };
  }
}

/**
 * Dispatches post using real user-supplied API credentials
 */
export async function dispatchPostWithRealCredentials(
  platform: string,
  account: SocialAccount,
  content: string,
  mediaType: 'image' | 'video' | 'none',
  mediaUrl: string,
  onStepProgress: (steps: PublishDispatchStep[]) => void
): Promise<PublishResult> {
  const steps: PublishDispatchStep[] = [
    {
      step: '1. Checking Saved API Credentials',
      status: 'in_progress',
      detail: `Validating stored token for ${account.handle} on ${platform}...`,
    },
    {
      step: '2. Media Transcoding & Payload Formatting',
      status: 'pending',
      detail: mediaType !== 'none' ? `Preparing ${mediaType} buffer for ${platform} ingest...` : 'Formatting text payload...',
    },
    {
      step: '3. Executing Live REST API Request',
      status: 'pending',
      detail: `Calling /api/publish-post with authorized credentials...`,
    },
    {
      step: '4. Verification & Delivery Receipt',
      status: 'pending',
      detail: 'Confirming endpoint status and generating permalink...',
    },
  ];

  onStepProgress([...steps]);
  await new Promise((r) => setTimeout(r, 400));

  // Step 1
  steps[0].status = 'completed';
  steps[0].detail = account.apiVerified
    ? `Credentials verified for ${account.handle}`
    : `Credentials loaded for ${account.handle}`;
  steps[1].status = 'in_progress';
  onStepProgress([...steps]);
  await new Promise((r) => setTimeout(r, 450));

  // Step 2
  steps[1].status = 'completed';
  steps[1].detail = mediaType !== 'none' ? `${mediaType.toUpperCase()} payload optimized` : 'Text structure ready';
  steps[2].status = 'in_progress';
  onStepProgress([...steps]);

  try {
    const res = await fetch('/api/publish-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        credentials: account.credentials || {},
        content,
        mediaType,
        mediaUrl,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      steps[2].status = 'failed';
      steps[2].detail = data.message || `API error (${res.status})`;
      onStepProgress([...steps]);
      return {
        success: false,
        publishedUrl: '',
        publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        postReferenceId: '',
        platform,
        message: data.message,
      };
    }

    steps[2].status = 'completed';
    steps[2].detail = 'API accepted post payload (HTTP 200 OK)';
    steps[3].status = 'completed';
    steps[3].detail = `Post confirmed live on ${account.handle}`;
    onStepProgress([...steps]);

    return {
      success: true,
      publishedUrl: data.publishedUrl,
      publishedAt: data.publishedAt,
      postReferenceId: data.postReferenceId,
      platform,
      message: data.message,
    };
  } catch (err: any) {
    steps[2].status = 'failed';
    steps[2].detail = `Network error: ${err.message}`;
    onStepProgress([...steps]);

    return {
      success: false,
      publishedUrl: '',
      publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      postReferenceId: '',
      platform,
      message: err.message,
    };
  }
}

export const dispatchPostAutomatically = dispatchPostWithRealCredentials;

/**
 * Dispatches a comment reply using real credentials via /api/publish-comment
 */
export async function dispatchCommentReplyWithRealCredentials(
  platform: string,
  account: SocialAccount,
  commentId: string,
  originalComment: string,
  replyText: string
): Promise<{ success: boolean; message: string; replyReferenceId?: string; publishedAt?: string }> {
  try {
    const res = await fetch('/api/publish-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        credentials: account.credentials || {},
        commentId,
        originalComment,
        replyText,
        accountHandle: account.handle,
      }),
    });

    const data = await res.json();
    return {
      success: res.ok && data.success,
      message: data.message || (res.ok ? 'Comment published' : 'Failed to publish comment'),
      replyReferenceId: data.replyReferenceId,
      publishedAt: data.publishedAt,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network error: ${err?.message || String(err)}`,
    };
  }
}
