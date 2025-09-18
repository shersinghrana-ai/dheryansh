import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (userType: 'admin' | 'citizen') => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (userType === 'admin') {
        await login('admin@municipal.gov.in', 'admin123');
      } else {
        await login('citizen@example.com', 'citizen123');
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-slate-400">Sign in to access the municipal dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-red-300">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-3 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-sm text-slate-400 text-center mb-4">Demo Accounts</p>
          <div className="space-y-2">
            <Button
              variant="secondary"
              onClick={() => handleDemoLogin('admin')}
              loading={isSubmitting}
              className="w-full"
              size="sm"
            >
              <Shield size={16} className="mr-2" />
              Login as Admin
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleDemoLogin('citizen')}
              loading={isSubmitting}
              className="w-full"
              size="sm"
            >
              Login as Citizen
            </Button>
          </div>
        </div>

        {onCancel && (
          <div className="mt-4">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};