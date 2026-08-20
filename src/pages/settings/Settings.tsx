import React, { useState } from 'react';
import { useI18n } from '@/i18n';
import { useAuthStore, useAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export const Settings: React.FC = () => {
  const { t, language, setLanguage } = useI18n();
  const { user } = useAuthStore();
  const { theme, setTheme } = useAppStore();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  // Language options
  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
  ];

  // Theme options
  const themes = [
    { value: 'light', label: t('lightTheme'), icon: '☀️' },
    { value: 'dark', label: t('darkTheme'), icon: '🌙' },
    { value: 'system', label: t('systemTheme'), icon: '💻' },
  ];

  // Handle profile save
  const handleProfileSave = () => {
    // In a real app, this would update the user profile
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as 'en' | 'bn' | 'ar');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
        <p className="text-gray-600 mt-1">{t('manageYourPreferences')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profileSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-primary-700">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('userName')}
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
                <Input
                  label={t('email')}
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
                <Input
                  label={t('phone')}
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleProfileSave}>
                  {t('saveChanges')}
                </Button>
                {profileSuccess && (
                  <span className="text-green-600 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('settingsSaved')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('changePassword')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label={t('currentPassword')}
                type="password"
                placeholder="••••••••"
              />
              <Input
                label={t('newPassword')}
                type="password"
                placeholder="••••••••"
              />
              <Input
                label={t('confirmPassword')}
                type="password"
                placeholder="••••••••"
              />
              <Button variant="outline">
                {t('updatePassword')}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('notificationSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">{t('emailNotifications')}</span>
                  <button
                    onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-gray-700">{t('smsNotifications')}</span>
                  <button
                    onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.sms ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.sms ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-gray-700">{t('pushNotifications')}</span>
                  <button
                    onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.push ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preferences */}
        <div className="space-y-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('language')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      language === lang.code
                        ? 'bg-primary-50 border-2 border-primary-600'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{lang.native}</p>
                      <p className="text-sm text-gray-500">{lang.name}</p>
                    </div>
                    {language === lang.code && (
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('theme')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => setTheme(themeOption.value as 'light' | 'dark' | 'system')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      theme === themeOption.value
                        ? 'bg-primary-50 border-2 border-primary-600'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{themeOption.icon}</span>
                      <span className="font-medium text-gray-900">{themeOption.label}</span>
                    </div>
                    {theme === themeOption.value && (
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('aboutApp')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('version')}</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('build')}</span>
                <span className="font-medium">2024.01</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-gray-500 text-center">{t('copyright')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">{t('dangerZone')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                {t('exportData')}
              </Button>
              <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50 mt-2">
                {t('deleteAccount')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
