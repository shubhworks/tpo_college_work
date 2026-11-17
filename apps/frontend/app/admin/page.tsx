'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI, staffAuthAPI, type AuthUser } from '@/lib/api';
import { 
  Plus, 
  Copy, 
  Check, 
  Clock, 
  Activity,
  ShieldAlert,
  Calendar,
  Trash2,
  LogOut,
  Mail,
  Pencil,
  Power,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/footer';

interface AccessToken {
  id: string;
  token: string;
  label: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

interface WhitelistEntry {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  isActive: boolean;
  isActivated: boolean;
  lastLoginAt: string | null;
}

const getApiErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { error?: string } } }).response;
    return response?.data?.error || fallback;
  }

  return fallback;
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [whitelistError, setWhitelistError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [label, setLabel] = useState('');
  const [expiry, setExpiry] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newTokenData, setNewTokenData] = useState<{ label: string, token: string } | null>(null);

  const fetchTokens = useCallback(async () => {
    setTokensLoading(true);
    try {
      const response = await adminAPI.getTokens();
      setTokens(response.data);
    } catch (err) {
      console.error('Failed to fetch tokens', err);
    } finally {
      setTokensLoading(false);
    }
  }, []);

  const fetchWhitelist = useCallback(async () => {
    try {
      const response = await adminAPI.getWhitelist();
      setWhitelist(response.data);
    } catch (err) {
      setWhitelistError(getApiErrorMessage(err, 'Failed to load whitelist'));
    }
  }, []);

  // Admin access requires a signed-in staff account.
  useEffect(() => {
    staffAuthAPI
      .me()
      .then((res) => setUser(res.data))
      .catch(() => router.replace('/login?next=/admin'));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetchTokens();
    if (user.role === 'SUPER_ADMIN') fetchWhitelist();
  }, [user, fetchTokens, fetchWhitelist]);

  const handleSignOut = async () => {
    try {
      await staffAuthAPI.logout();
    } finally {
      router.replace('/login');
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setWhitelistError(null);
    try {
      await adminAPI.addWhitelistedEmail(newEmail);
      setNewEmail('');
      fetchWhitelist();
    } catch (err) {
      setWhitelistError(getApiErrorMessage(err, 'Failed to add email'));
    }
  };

  const handleEditEmail = async (entry: WhitelistEntry) => {
    const email = prompt(
      `Replace ${entry.email} with a new email?\nThe new owner must activate their own account; the old password is wiped.`,
      entry.email,
    );
    if (!email || email.trim().toLowerCase() === entry.email) return;
    setWhitelistError(null);
    try {
      await adminAPI.updateWhitelistedEmail(entry.id, { email });
      fetchWhitelist();
    } catch (err) {
      setWhitelistError(getApiErrorMessage(err, 'Failed to update email'));
    }
  };

  const handleToggleEmail = async (entry: WhitelistEntry) => {
    setWhitelistError(null);
    try {
      await adminAPI.updateWhitelistedEmail(entry.id, { isActive: !entry.isActive });
      fetchWhitelist();
    } catch (err) {
      setWhitelistError(getApiErrorMessage(err, 'Failed to update email'));
    }
  };

  const handleRemoveEmail = async (entry: WhitelistEntry) => {
    if (!confirm(`Remove ${entry.email} from the whitelist? They will lose access immediately.`)) return;
    setWhitelistError(null);
    try {
      await adminAPI.removeWhitelistedEmail(entry.id);
      fetchWhitelist();
    } catch (err) {
      setWhitelistError(getApiErrorMessage(err, 'Failed to remove email'));
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.createToken(label, expiry);
      setNewTokenData({ 
        label: response.data.label, 
        token: response.data.fullToken 
      });
      setLabel('');
      fetchTokens();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to create token'));
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this token?')) return;
    try {
      await adminAPI.revokeToken(id);
      fetchTokens();
    } catch (err) {
      console.error('Failed to revoke token', err);
    }
  };

  const handleUpdateExpiry = async (id: string, newExpiry: string) => {
    if (!newExpiry) return;
    setLoading(true);
    try {
      await adminAPI.updateTokenExpiry(id, newExpiry);
      fetchTokens();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to update expiry'));
    } finally {
      setLoading(false);
    }
  };

  const getAccessUrl = (token: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;
    return `${baseUrl.replace(/\/$/, '')}/portal?token=${encodeURIComponent(token)}`;
  };

  const copyToClipboard = async (token: string) => {
    const url = getAccessUrl(token);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopySuccess(token);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy access link', err);
      setError('Could not copy the link automatically. Please select and copy it manually.');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (!user) {
    return <div className="min-h-screen bg-slate-100" />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Access Management</h1>
            <p className="text-slate-700 mt-2">Create and manage secure access links for HRs and Partners</p>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="text-slate-700">
              {user.email}
              {user.role === 'SUPER_ADMIN' && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200 font-medium">
                  Super admin
                </span>
              )}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-800"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>

        {user.role === 'SUPER_ADMIN' && (
          <div className="bg-white border border-slate-200 rounded-2xl mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" /> Whitelisted Emails
                </h2>
                <p className="text-xs text-slate-700 mt-1 font-medium">Only these emails can activate an account and sign in.</p>
              </div>
              <form onSubmit={handleAddEmail} className="flex gap-2">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                    required
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>
            </div>
            {whitelistError && <p className="px-6 pt-4 text-sm text-red-600 font-medium">{whitelistError}</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Last Login</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {whitelist.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm text-slate-900 font-medium">
                        {entry.email}
                        {entry.role === 'SUPER_ADMIN' && <span className="ml-2 text-xs text-blue-600 font-medium">(super admin)</span>}
                      </td>
                      <td className="px-6 py-3 text-xs font-medium">
                        {!entry.isActive ? (
                          <span className="text-red-600">Disabled</span>
                        ) : entry.isActivated ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-yellow-600">Awaiting activation</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-700 font-medium">{entry.lastLoginAt ? formatDate(entry.lastLoginAt) : 'Never'}</td>
                      <td className="px-6 py-3 text-right">
                        {entry.role !== 'SUPER_ADMIN' && (
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleEditEmail(entry)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-blue-600" title="Edit email">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleToggleEmail(entry)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-yellow-600" title={entry.isActive ? 'Disable access' : 'Enable access'}>
                              <Power className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRemoveEmail(entry)} className="p-2 hover:bg-red-50 rounded-lg text-slate-700 hover:text-red-600" title="Remove">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {whitelist.length === 0 && <p className="py-8 text-center text-slate-700 text-sm font-medium">No whitelisted emails.</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Token Form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Generate New Link
              </h2>
              
              <form onSubmit={handleCreateToken} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Label (e.g. HR Name - Company)</label>
                  <input
                    type="text"
                    placeholder="Rajesh - TCS HR"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Period</label>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="1d">1 Day</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="never">Never (Permanent)</option>
                  </select>
                </div>

                {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {loading ? 'Generating...' : 'Generate Access Link'}
                </button>
              </form>

              {newTokenData && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-600 font-medium mb-2">Success! Link generated for {newTokenData.label}</p>
                  <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
                    <code className="text-xs text-slate-800 truncate flex-1 font-medium">
                      {getAccessUrl(newTokenData.token)}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(newTokenData.token)}
                      className="p-1 hover:bg-slate-200 rounded text-blue-600"
                    >
                      {copySuccess === newTokenData.token ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-700 mt-2 italic">Link generated successfully. You can also copy it from the list below anytime.</p>
                </div>
              )}
            </div>
          </div>

          {/* Tokens Table */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-semibold">Active Access Tokens</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4">Label & Token</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Expires</th>
                      <th className="px-6 py-4">Last Used</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {tokensLoading ? (
                      // Skeleton rows
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <div className="h-4 bg-slate-200 rounded w-24"></div>
                              <div className="h-3 bg-slate-200 rounded w-32"></div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-slate-200 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-slate-200 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                              <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      tokens.map((token) => {
                        const expired = isExpired(token.expiresAt);
                        const active = token.isActive && !expired;
                        
                        return (
                          <tr key={token.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900">{token.label}</span>
                                <span className="text-xs text-slate-700 font-mono">
                                  {token.token.substring(0, 4)}...{token.token.substring(token.token.length - 4)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {active ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                  <Activity className="w-3 h-3 mr-1" /> Active
                                </span>
                              ) : expired ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                                  <Clock className="w-3 h-3 mr-1" /> Expired
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                                  <ShieldAlert className="w-3 h-3 mr-1" /> Revoked
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(token.expiresAt)}
                                </div>
                                <select
                                  onChange={(e) => handleUpdateExpiry(token.id, e.target.value)}
                                  className="text-[11px] bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500/50 max-w-[110px]"
                                  value=""
                                >
                                  <option value="" disabled>Change Expiry</option>
                                  <option value="1d">1 Day</option>
                                  <option value="7d">7 Days</option>
                                  <option value="30d">30 Days</option>
                                  <option value="never">Never</option>
                                </select>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-slate-700 font-medium">
                                {token.lastUsedAt ? formatDate(token.lastUsedAt) : 'Never used'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {active && (
                                  <button
                                    onClick={() => copyToClipboard(token.token)}
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-blue-600 transition-colors"
                                    title="Copy Access Link"
                                  >
                                    {copySuccess === token.token ? (
                                      <Check className="w-4 h-4 text-green-700" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                                {token.isActive && (
                                  <button
                                    onClick={() => handleRevoke(token.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-slate-700 hover:text-red-600 transition-colors"
                                    title="Revoke Access"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
                {!tokensLoading && tokens.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-slate-700">No tokens generated yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {copySuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 border border-blue-500 min-w-[300px] justify-center"
          >
            <div className="bg-white/20 p-1 rounded-lg">
              <Check className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
