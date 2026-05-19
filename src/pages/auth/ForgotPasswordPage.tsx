import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';

export function ForgotPasswordPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Password reset link sent! (Demo UI)');
  };

  return (
    <AuthLayout title="Reset Password" subtitle="We'll send you a recovery link">
      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div>
          <label className="text-xs text-slate-400 uppercase tracking-wider">Email</label>
          <input
            type="email"
            required
            className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
            placeholder="you@example.com"
          />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          <Mail size={18} />
          Send Reset Link
        </motion.button>

        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </form>
    </AuthLayout>
  );
}
