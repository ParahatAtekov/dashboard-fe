'use client';

import { useState } from 'react';
import {
  Plus,
  Upload,
  Search,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Wallet,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { cn, formatAddress, getRelativeTime, isValidEthAddress } from '@/lib/utils';

interface WalletData {
  wallet_id: number;
  address: string;
  label: string | null;
  is_active: boolean;
  added_at: string;
  last_ingested_at: string | null;
  cursor_status: string | null;
  error_count: number;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletData[]>([
    { wallet_id: 1, address: '0x1234567890abcdef1234567890abcdef12345678', label: 'Main Trading', is_active: true, added_at: '2026-01-15T10:00:00Z', last_ingested_at: '2026-01-19T11:30:00Z', cursor_status: 'ok', error_count: 0 },
    { wallet_id: 2, address: '0xabcdef1234567890abcdef1234567890abcdef12', label: 'Whale Tracker', is_active: true, added_at: '2026-01-14T15:30:00Z', last_ingested_at: '2026-01-19T11:25:00Z', cursor_status: 'ok', error_count: 0 },
    { wallet_id: 3, address: '0x9876543210fedcba9876543210fedcba98765432', label: null, is_active: true, added_at: '2026-01-13T09:00:00Z', last_ingested_at: '2026-01-19T10:00:00Z', cursor_status: 'error', error_count: 3 },
    { wallet_id: 4, address: '0xfedcba9876543210fedcba9876543210fedcba98', label: 'Bot Account', is_active: false, added_at: '2026-01-10T12:00:00Z', last_ingested_at: '2026-01-18T23:00:00Z', cursor_status: 'ok', error_count: 0 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [bulkAddresses, setBulkAddresses] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const filteredWallets = wallets.filter(
    (w) =>
      w.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.label && w.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddWallet = async () => {
    setAddError('');
    if (!isValidEthAddress(newAddress)) {
      setAddError('Invalid Ethereum address format');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    const newWallet: WalletData = {
      wallet_id: Math.max(...wallets.map((w) => w.wallet_id)) + 1,
      address: newAddress.toLowerCase(),
      label: newLabel || null,
      is_active: true,
      added_at: new Date().toISOString(),
      last_ingested_at: null,
      cursor_status: null,
      error_count: 0,
    };

    setWallets([newWallet, ...wallets]);
    setNewAddress('');
    setNewLabel('');
    setShowAddModal(false);
    setLoading(false);
  };

  const handleBulkAdd = async () => {
    setLoading(true);
    const addresses = bulkAddresses
      .split('\n')
      .map((a) => a.trim())
      .filter((a) => isValidEthAddress(a));

    await new Promise((r) => setTimeout(r, 1500));

    const newWallets: WalletData[] = addresses.map((address, i) => ({
      wallet_id: Math.max(...wallets.map((w) => w.wallet_id)) + i + 1,
      address: address.toLowerCase(),
      label: null,
      is_active: true,
      added_at: new Date().toISOString(),
      last_ingested_at: null,
      cursor_status: null,
      error_count: 0,
    }));

    setWallets([...newWallets, ...wallets]);
    setBulkAddresses('');
    setShowBulkModal(false);
    setLoading(false);
  };

  const handleRemoveWallet = async (walletId: number) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setWallets(wallets.filter((w) => w.wallet_id !== walletId));
    setLoading(false);
  };

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getStatusBadge = (wallet: WalletData) => {
    if (!wallet.is_active) return <Badge variant="default">Inactive</Badge>;
    if (wallet.error_count > 0) return <Badge variant="danger">{wallet.error_count} errors</Badge>;
    if (wallet.cursor_status === 'ok') return <Badge variant="success">Synced</Badge>;
    if (!wallet.last_ingested_at) return <Badge variant="warning">Pending</Badge>;
    return <Badge variant="info">Syncing</Badge>;
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
          <Button variant="secondary" onClick={() => setShowBulkModal(true)} icon={<Upload className="w-4 h-4" />}>
            Bulk Import
          </Button>
          <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
            Add Wallet
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-text-muted text-sm">Total Wallets</p>
              <p className="font-display font-bold text-xl text-white">{wallets.length}</p>
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
              <p className="font-display font-bold text-xl text-white">{wallets.filter((w) => w.is_active).length}</p>
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
              <p className="font-display font-bold text-xl text-white">{wallets.filter((w) => !w.last_ingested_at).length}</p>
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
              <p className="font-display font-bold text-xl text-white">{wallets.filter((w) => w.error_count > 0).length}</p>
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
                      <button onClick={() => copyAddress(wallet.address)} className="text-text-muted hover:text-white transition-colors">
                        {copiedAddress === wallet.address ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a href={`https://app.hyperliquid.xyz/explorer/address/${wallet.address}`} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-neon-cyan transition-colors">
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
              render: (wallet) => <span className="text-text-secondary">{getRelativeTime(wallet.added_at)}</span>,
            },
            {
              key: 'actions',
              header: '',
              render: (wallet) => (
                <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10" onClick={() => handleRemoveWallet(wallet.wallet_id)}>
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
      </SectionCard>

      {/* Add Single Wallet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <h2 className="font-display font-semibold text-xl text-white mb-4">Add New Wallet</h2>
            <div className="space-y-4">
              <Input label="Wallet Address" placeholder="0x..." value={newAddress} onChange={(e) => setNewAddress(e.target.value)} error={addError} icon={<Wallet className="w-5 h-5" />} />
              <Input label="Label (Optional)" placeholder="e.g., Main Trading" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddWallet} loading={loading}>
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
                  placeholder="0x1234...&#10;0xabcd...&#10;0x5678..."
                  value={bulkAddresses}
                  onChange={(e) => setBulkAddresses(e.target.value)}
                />
              </div>
              <p className="text-text-muted text-sm">
                {bulkAddresses.split('\n').filter((a) => isValidEthAddress(a.trim())).length} valid addresses detected
              </p>
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" className="flex-1" onClick={() => setShowBulkModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleBulkAdd} loading={loading}>
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
