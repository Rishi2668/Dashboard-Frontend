import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuthStore } from '@/store/authStore';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const registerUser = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password, data.confirm_password);
      toast.success('Account created! Start your streak today.');
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(typeof msg === 'string' ? msg : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Join the Race" subtitle="Start your SSC CGL preparation journey">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {(['name', 'email', 'password', 'confirm_password'] as const).map((field) => (
          <div key={field}>
            <label className="text-xs text-slate-400 uppercase tracking-wider">
              {field === 'confirm_password' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              {...register(field)}
              type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
              className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
            />
            {errors[field] && <p className="text-red-400 text-xs mt-1">{errors[field]?.message}</p>}
          </div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <UserPlus size={18} />
          {loading ? 'Creating account...' : 'Create Account'}
        </motion.button>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
