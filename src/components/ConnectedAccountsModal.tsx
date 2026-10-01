import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  Plus,
  Shield,
  Trash2,
  Edit2,
  Share2,
  Key,
  Lock,
  Globe,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  SocialAccount,
  SocialAccountCredentials,
  verifySocialCredentials,
} from '../utils/socialAccounts';

interface ConnectedAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SocialAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<SocialAccount[]>>;
  onShowToast?: (msg: string) => void;
}

export const ConnectedAccountsModal: React.FC<ConnectedAccountsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  setAccounts,
  onShowToast,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPlatform, setNewPlatform] = useState<SocialAccount['platform']>('Instagram');
  const [newHandle, setNewHandle] = useState('');
  const [newName, setNewName] = useState('');

  // Real credentials fields
  const [accessToken, setAccessToken] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [accountId, setAccountId] = useState('');

  // Testing connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    verifiedHandle?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const creds: SocialAccountCredentials = {
      accessToken: accessToken.trim(),
      bearerToken: bearerToken.trim(),
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim(),
      accountId: accountId.trim(),
    };

    const res = await verifySocialCredentials(newPlatform, creds);
    setIsTesting(false);
    setTestResult({
      tested: true,
      success: res.success,
      message: res.message,
      verifiedHandle: res.verifiedHandle,
    });

    if (res.verifiedHandle && !newHandle) {
      setNewHandle(res.verifiedHandle);
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle.trim()) return;

    const formattedHandle = newHandle.startsWith('@') || newHandle.startsWith('in/')
      ? newHandle.trim()
      : `@${newHandle.trim()}`;

    const creds: SocialAccountCredentials = {
      accessToken: accessToken.trim(),
      bearerToken: bearerToken.trim(),
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim(),
      accountId: accountId.trim(),
    };

    const newAccount: SocialAccount = {
      id: `acc-${Date.now()}`,
      platform: newPlatform,
      handle: formattedHandle,
      name: newName.trim() || formattedHandle,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      connected: true,
      autoPostEnabled: true,
      credentials: creds,
      apiVerified: testResult?.success || false,
      lastVerifiedAt: testResult?.success ? new Date().toLocaleTimeString() : undefined,
      verifiedStatusMessage: testResult?.message,
      connectedAt: new Date().toLocaleDateString(),
      followerCount: 'Verified API',
    };

    setAccounts([newAccount, ...accounts]);
    setNewHandle('');
    setNewName('');
    setAccessToken('');
    setBearerToken('');
    setApiKey('');
    setApiSecret('');
    setAccountId('');
    setTestResult(null);
    setIsAddingNew(false);

    if (onShowToast) onShowToast(`Saved API credentials for ${formattedHandle} (${newPlatform})!`);
  };

  const handleDeleteAccount = (id: string, name: string) => {
    setAccounts(accounts.filter((a) => a.id !== id));
    if (onShowToast) onShowToast(`Removed ${name}`);
  };

  const handleToggleAutoPost = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, autoPostEnabled: !acc.autoPostEnabled } : acc))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Social Media API Credentials</h3>
              <p className="text-xs text-slate-400">
                Connect your actual developer keys and OAuth tokens to authorize publishing and comment sync.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Connected Accounts ({accounts.length})
          </span>

          <button
            onClick={() => {
              setIsAddingNew(!isAddingNew);
              setTestResult(null);
            }}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:opacity-90 flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? 'Cancel' : 'Connect Account via API Key'}</span>
          </button>
        </div>

        {/* Real Credential Input Form */}
        {isAddingNew && (
          <form
            onSubmit={handleSaveAccount}
            className="p-4 bg-slate-950 border border-cyan-500/50 rounded-2xl space-y-3.5 shrink-0 overflow-y-auto max-h-[55vh]"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Enter Real OAuth / REST API Credentials</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Stored Securely in Local Session</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Target Platform *
                </label>
                <select
                  value={newPlatform}
                  onChange={(e) => {
                    setNewPlatform(e.target.value as any);
                    setTestResult(null);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Instagram">Instagram (Meta Graph API)</option>
                  <option value="X (Twitter)">X / Twitter API v2</option>
                  <option value="LinkedIn">LinkedIn OAuth 2.0</option>
                  <option value="TikTok">TikTok Open API</option>
                  <option value="Facebook">Facebook Graph API</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Username / Handle *
                </label>
                <input
                  type="text"
                  placeholder="@your_real_handle"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Platform specific credential fields */}
            {newPlatform === 'Instagram' && (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Meta Graph API Access Token *
                  </label>
                  <input
                    type="password"
                    placeholder="EAAB..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Generate from Meta for Developers $\rightarrow$ Graph API Explorer with <code className="text-cyan-400">instagram_basic, instagram_content_publish</code>
                  </span>
                </div>
              </div>
            )}

            {newPlatform === 'X (Twitter)' && (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    X / Twitter API Bearer Token *
                  </label>
                  <input
                    type="password"
                    placeholder="AAAA..."
                    value={bearerToken}
                    onChange={(e) => setBearerToken(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Found in X Developer Portal under Project $\rightarrow$ Keys and Tokens $\rightarrow$ Bearer Token
                  </span>
                </div>
              </div>
            )}

            {newPlatform === 'LinkedIn' && (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    LinkedIn OAuth 2.0 Access Token *
                  </label>
                  <input
                    type="password"
                    placeholder="AQV..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    OAuth 2.0 User Token with <code className="text-cyan-400">w_member_social, r_liteprofile</code> permissions
                  </span>
                </div>
              </div>
            )}

            {newPlatform === 'TikTok' && (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    TikTok Developer Access Token *
                  </label>
                  <input
                    type="password"
                    placeholder="act.exampleToken..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>
            )}

            {/* Test Connection Button & Live Response Box */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verify Credentials with Live REST API</span>
                </span>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || (!accessToken && !bearerToken)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                  <span>{isTesting ? 'Verifying with API...' : 'Test API Connection'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                    testResult.success
                      ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-800/80 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{testResult.success ? 'API Connection Verified!' : 'Live API Response Error'}</span>
                  </div>
                  <p className="mt-1 text-[11px] font-mono break-all">{testResult.message}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newHandle.trim() || (!accessToken && !bearerToken)}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
              >
                Save & Authorize Account
              </button>
            </div>
          </form>
        )}

        {/* Existing Accounts List */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{acc.handle}</span>
                  <span className="text-[10px] text-cyan-400 font-mono font-medium bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                    {acc.platform}
                  </span>
                  {acc.apiVerified ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Live API Verified
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                      <Key className="w-3 h-3" /> Credentials Stored
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                  <span>Token: ••••••••{acc.credentials?.accessToken?.slice(-4) || acc.credentials?.bearerToken?.slice(-4) || 'SAVED'}</span>
                  <span>·</span>
                  <span>Connected: {acc.connectedAt || 'Active'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleDeleteAccount(acc.id, acc.handle)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-800"
                  title="Remove Account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {accounts.length === 0 && (
            <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
              <Key className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">No Real Social Accounts Connected Yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Click "Connect Account via API Key" above to enter your actual Instagram Graph Token, Twitter/X Bearer Token, or LinkedIn OAuth Token.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
