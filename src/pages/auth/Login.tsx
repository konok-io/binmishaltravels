import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuthStore } from '@/store';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardContent } from '@/components/common/Card';

export const Login: React.FC = () => {
  const { t, language, setLanguage, isRTL } = useI18n();
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ email, password, rememberMe });
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 to-primary-900 ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative w-full max-w-md px-6">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t('appName')}</h1>
          <p className="text-primary-200">{t('appTagline')}</p>
        </div>

        {/* Login card */}
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              {t('loginTitle')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                label={t('email')}
                placeholder="admin@binmishal.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                required
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <Input
                type="password"
                label={t('password')}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                required
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {t(error) || t('loginFailed')}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">{t('rememberMe')}</span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                {isLoading ? t('signingIn') : t('login')}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center mb-3">Demo Credentials:</p>
              <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p><strong>Super Admin:</strong> admin@binmishal.com</p>
                <p><strong>Branch Manager:</strong> mecca1@binmishal.com</p>
                <p><strong>Branch Staff:</strong> jeddah1@binmishal.com</p>
                <p><strong>Password:</strong> demo123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language selector */}
        <div className="mt-6 text-center">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'bn' | 'ar' | 'en')}
            className="text-sm bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="bn" className="text-gray-900">বাংলা</option>
            <option value="ar" className="text-gray-900">العربية</option>
            <option value="en" className="text-gray-900">English</option>
          </select>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-200 text-sm mt-6">
          {t('copyright')}
        </p>
      </div>
    </div>
  );
};
