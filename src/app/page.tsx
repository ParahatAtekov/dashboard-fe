'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate authentication - in production, call your Supabase auth
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (email && password) {
        // Mock user for demo
        setUser(
          {
            id: 'demo-user-id',
            email: email,
            orgId: 'demo-org-id',
            role: 'admin',
          },
          'demo-jwt-token'
        );
        router.push('/dashboard');
      } else {
        setError('Please enter your email and password');
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void bg-mesh flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-mint/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/5 rounded-full blur-[128px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-mint/20 border border-neon-cyan/20 mb-6">
            <Zap className="w-10 h-10 text-neon-cyan" />
          </div>
          <h1 className="font-display font-bold text-4xl text-gradient mb-2">
            HyperLiquid Analytics
          </h1>
          <p className="text-text-secondary">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 text-danger text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-text-muted text-sm">
              Demo Mode: Enter any email and password
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-8 animate-fade-in stagger-2">
          Powered by{' '}
          <span className="text-neon-cyan font-medium">HyperLiquid</span>
          {' · '}
          Built with correctness in mind
        </p>
      </div>
    </div>
  );
}
