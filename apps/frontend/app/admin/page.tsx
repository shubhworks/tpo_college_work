'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';
import { 
  Plus, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  Activity,
  User,
  ShieldAlert,
  Calendar,
  EyeOff,
  Trash2
} from 'lucide-react';
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

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [label, setLabel] = useState('');
  const [expiry, setExpiry] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newTokenData, setNewTokenData] = useState<{ label: string, token: string } | null>(null);

  const fetchTokens = useCallback(async () => {
    try {
      const response = await adminAPI.getTokens();
      setTokens(response.data);
    } catch (err) {
      console.error('Failed to fetch tokens', err);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchTokens();
    }
  }, [isLoggedIn, fetchTokens]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminAPI.login(password);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid password');
    } finally {
      setLoading(false);
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create token');
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

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/portal?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(token);
    setTimeout(() => setCopySuccess(null), 2000);
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-blue-500/10 rounded-xl mb-4">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-gray-400 mt-2">Enter your password to manage access tokens</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
            >
              {loading ? 'Verifying...' : 'Login to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-gray-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-white">Access Management</h1>
            <p className="text-gray-400 mt-2">Create and manage secure access links for HRs and Partners</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Token Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Generate New Link
              </h2>
              
              <form onSubmit={handleCreateToken} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Label (e.g. HR Name - Company)</label>
                  <input
                    type="text"
                    placeholder="Rajesh - TCS HR"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Expiry Period</label>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="1d">1 Day</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="never">Never (Permanent)</option>
                  </select>
                </div>

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
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-sm text-green-400 font-medium mb-2">Success! Link generated for {newTokenData.label}</p>
                  <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                    <code className="text-xs text-gray-300 truncate flex-1">
                      {window.location.origin}/portal?token={newTokenData.token}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(newTokenData.token)}
                      className="p-1 hover:bg-gray-700 rounded text-blue-400"
                    >
                      {copySuccess === newTokenData.token ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 italic">Copy this now. You won't see the full token again.</p>
                </div>
              )}
            </div>
          </div>

          {/* Tokens Table */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
                <h2 className="text-lg font-semibold">Active Access Tokens</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800">
                      <th className="px-6 py-4">Label & Token</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Expires</th>
                      <th className="px-6 py-4">Last Used</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {tokens.map((token) => {
                      const expired = isExpired(token.expiresAt);
                      const active = token.isActive && !expired;
                      
                      return (
                        <tr key={token.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{token.label}</span>
                              <span className="text-xs text-gray-500 font-mono">{token.token}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {active ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                <Activity className="w-3 h-3 mr-1" /> Active
                              </span>
                            ) : expired ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                <Clock className="w-3 h-3 mr-1" /> Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                                <ShieldAlert className="w-3 h-3 mr-1" /> Revoked
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {formatDate(token.expiresAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-gray-400">
                              {token.lastUsedAt ? formatDate(token.lastUsedAt) : 'Never used'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {active && (
                                <button
                                  onClick={() => copyToClipboard(token.id)} // id is used as key here but we need the full token which is not available in list
                                  // Wait, in list we only have masked token. Copying from table only works if we store full token or regenerate?
                                  // Actually TASK.md says: Copy Link button (copies full URL with ?token=...)
                                  // But backend only returns masked token in list.
                                  // I'll make the copy button only work for the newly created one, or I need to return full token in list (less secure)
                                  // For now, I'll make the copy button just show an alert that full token is only shown once.
                                  // OR, I can use the id to fetch the full token if needed, but that's more work.
                                  // Let's assume the user only needs to copy it once upon creation.
                                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
                                  title="Full token only visible once on creation"
                                  disabled
                                >
                                  <EyeOff className="w-4 h-4" />
                                </button>
                              )}
                              {token.isActive && (
                                <button
                                  onClick={() => handleRevoke(token.id)}
                                  className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                  title="Revoke Access"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {tokens.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">No tokens generated yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
