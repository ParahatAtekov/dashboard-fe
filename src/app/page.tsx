'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        setUser(
          {
            id: data.user.id,
            email: data.user.email!,
            orgId: '', // Resolved by backend from user_profiles
            role: '',
          },
          data.session.access_token
        );
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-mint mb-4">
            <Zap className="w-8 h-8 text-void" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gradient-cyan">HyperLiquid Analytics</h1>
          <p className="text-text-muted mt-2">Sign in to your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}