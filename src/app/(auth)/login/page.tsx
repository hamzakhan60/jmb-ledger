'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { motion } from 'motion/react';
import { AuthPageShell, authContainerVariants, authItemVariants } from '@/components/auth/AuthPageShell';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <AuthPageShell
      title="Sign in"
      subtitle="Enter your credentials to access JMB Card Ledger."
    >
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-sm mx-auto sm:max-w-md px-4 sm:px-0"
        variants={authContainerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={authItemVariants}>
          <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 transition-all focus:ring-2 focus:ring-primary/20 h-10 sm:h-11 text-sm sm:text-base"
          />
        </motion.div>
        <motion.div variants={authItemVariants}>
          <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1.5 transition-all focus:ring-2 focus:ring-primary/20 h-10 sm:h-11 text-sm sm:text-base"
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs sm:text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
        <motion.div variants={authItemVariants}>
          <Button
            type="submit"
            className="w-full font-medium h-10 sm:h-11 text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </motion.div>
      </motion.form>
      <motion.p
        variants={authItemVariants}
        className="mt-6 text-center text-xs sm:text-sm text-muted-foreground px-4 sm:px-0"
      >
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-primary hover:underline underline-offset-2"
        >
          Sign up
        </Link>
      </motion.p>
    </AuthPageShell>
  );
}