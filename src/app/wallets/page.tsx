'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Upload,
  Search,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Wallet,
  ExternalLink,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { api } from '@/lib/api';
import { formatAddress, getRelativeTime, isValidEthAddress } from '@/lib/utils';
import type { WalletWithDetails } from '@/types';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [bulkAddresses, setBulkAddresses] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Fetch wallets from API
  const fetchWallets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getWallets(100, 0);
      setWallets(response.wallets || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch wallets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWallets();
  }, []);

  // Filter wallets based on search
  const filteredWallets = wallets.filter(
    (w) =>
      w.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.label && w.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Add single wallet
  const handleAddWallet = async () => {
    setAddError('');
    
    if (!newAddress.trim()) {
      setAddError('Address is required');
      return;
    }
    
    if (!isValidEthAddress(newAddress.trim())) {
      setAddError('Invalid Ethereum address format');
      return;
    }

    setActionLoading(true);
    
    try {
      await api.addWallet(newAddress.trim().toLowerCase(), newLabel.trim() || undefined);
      setNewAddress('');
      setNewLabel('');
      setShowAddModal(false);
      await fetchWallets();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add wallet');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk add wallets
  const handleBulkAdd = async () => {
    const addresses = bulkAddresses
      .split('\n')
      .map((a) => a.trim().toLowerCase())
      .filter((a) => isValidEthAddress(a));

    if (addresses.length === 0) {
      setAddError('No valid addresses found');
      return;
    }

    setActionLoading(true);
    
    try {
      const walletsToAdd = addresses.map(address => ({ address }));
      await api.addWalletsBulk(walletsToAdd);
      setBulkAddresses('');
      setShowBulkModal(false);
      await fetchWallets();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add wallets');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove wallet
  const handleRemoveWallet = async (walletId: number) => {
    if (!confirm('Are you sure you want to remove this wallet?')) {
      return;
    }

    setActionLoading(true);
    
    try {
      await api.deleteWallet(walletId);
      await fetchWallets();
    } catch (err) {
      console.error('Failed to remove wallet:', err);
      alert(err instanceof Error ? err.message : 'Failed to remove wallet');
    } finally {
      setActionLoading(false);
    }
  };

  // Copy address to clipboard
  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Get status badge
  const getStatusBadge = (wallet: WalletWithDetails) => {
    if (!wallet.is_active) return <Badge variant="default">Inactive</Badge>;
    if (wallet.error_count > 0) return <Badge variant="danger">{wallet.error_count} errors</Badge>;
    if (wallet.cursor_status === 'ok') return <Badge variant="success">Synced</Badge>;
    if (!wallet.last_ingested_at) return <Badge variant="warning">Pending</Badge>;
    return <Badge variant="info">Syncing</Badge>;
  };

  // Stats
  const stats = {
    total: wallets.length,
    active: wallets.filter((w) => w.is_active).length,
    pending: wallets.filter((w) => !w.last_ingested_at).length,
    errors: wallets.filter((w) => w.error_count > 0).length,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Wallet Management</h1>
          <p className="text-text-secondary">Add and manage wallets to track on HyperLiquid</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={fetchWallets}
            loading={loading}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowBulkModal(true)} 
            icon={<Upload className="w-4 h-4" />}
          >
            Bulk Import
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)} 
            icon={<Plus className="w-4 h-4" />}
          >
            Add Wallet
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchWallets}>
            Retry
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-text-muted text-sm">Total Wallets</p>
              <p className="font-display font-bold text-xl text-white">
                {loading ? '-' : stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-text-muted text-sm">Active</p>
              <p className="font-display font-bold text-xl text-white">
                {loading ? '-' : stats.active}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-text-muted text-sm">Pending</p>
              <p className="font-display font-bold text-xl text-white">
                {loading ? '-' : stats.pending}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-text-muted text-sm">Errors</p>
              <p className="font-display font-bold text-xl text-white">
                {loading ? '-' : stats.errors}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search by address or label..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5" />}
          className="max-w-md"
        />
      </div>

      {/* Wallets Table */}
      <SectionCard title="Tracked Wallets" subtitle={`${filteredWallets.length} wallets found`}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'address',
                header: 'Address',
                render: (wallet) => (
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-neon-cyan">{formatAddress(wallet.address)}</span>
                        <button 
                          onClick={() => copyAddress(wallet.address)} 
                          className="text-text-muted hover:text-white transition-colors"
                        >
                          {copiedAddress === wallet.address ? 
                            <Check className="w-4 h-4 text-success" /> : 
                            <Copy className="w-4 h-4" />
                          }
                        </button>
                        <a 
                          href={`https://app.hyperliquid.xyz/explorer/address/${wallet.address}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-text-muted hover:text-neon-cyan transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      {wallet.label && <p className="text-text-muted text-sm">{wallet.label}</p>}
                    </div>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (wallet) => getStatusBadge(wallet),
              },
              {
                key: 'last_ingested_at',
                header: 'Last Synced',
                render: (wallet) => (
                  <span className="text-text-secondary">
                    {wallet.last_ingested_at ? getRelativeTime(wallet.last_ingested_at) : 'Never'}
                  </span>
                ),
              },
              {
                key: 'added_at',
                header: 'Added',
                render: (wallet) => (
                  <span className="text-text-secondary">{getRelativeTime(wallet.added_at)}</span>
                ),
              },
              {
                key: 'actions',
                header: '',
                render: (wallet) => (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-danger hover:bg-danger/10" 
                    onClick={() => handleRemoveWallet(wallet.wallet_id)}
                    disabled={actionLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                ),
                className: 'text-right',
              },
            ]}
            data={filteredWallets}
            keyExtractor={(w) => w.wallet_id}
            emptyMessage="No wallets found. Add a wallet to start tracking."
          />
        )}
      </SectionCard>

      {/* Add Single Wallet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <h2 className="font-display font-semibold text-xl text-white mb-4">Add New Wallet</h2>
            <div className="space-y-4">
              <Input 
                label="Wallet Address" 
                placeholder="0x..." 
                value={newAddress} 
                onChange={(e) => setNewAddress(e.target.value)} 
                error={addError} 
                icon={<Wallet className="w-5 h-5" />} 
              />
              <Input 
                label="Label (Optional)" 
                placeholder="e.g., Main Trading" 
                value={newLabel} 
                onChange={(e) => setNewLabel(e.target.value)} 
              />
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={() => {
                    setShowAddModal(false);
                    setAddError('');
                    setNewAddress('');
                    setNewLabel('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleAddWallet} 
                  loading={actionLoading}
                >
                  Add Wallet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg animate-scale-in">
            <h2 className="font-display font-semibold text-xl text-white mb-4">Bulk Import Wallets</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Wallet Addresses (one per line)
                </label>
                <textarea
                  className="w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm h-48 resize-none focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20"
                  placeholder={"0x1234...\n0xabcd...\n0x5678..."}
                  value={bulkAddresses}
                  onChange={(e) => setBulkAddresses(e.target.value)}
                />
              </div>
              <p className="text-text-muted text-sm">
                {bulkAddresses.split('\n').filter((a) => isValidEthAddress(a.trim())).length} valid addresses detected
              </p>
              {addError && (
                <p className="text-danger text-sm">{addError}</p>
              )}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={() => {
                    setShowBulkModal(false);
                    setAddError('');
                    setBulkAddresses('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleBulkAdd} 
                  loading={actionLoading}
                >
                  Import Wallets
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}