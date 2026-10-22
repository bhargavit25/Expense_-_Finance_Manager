import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Lock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Palette,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { formatDate } from '../utils/formatters';
import { ThemeSelector } from '../components/common/ThemeToggle';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Profile Form
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      currency: user?.currency || 'INR',
    },
  });

  // Password Form
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onUpdateProfile = async (data) => {
    try {
      setIsUpdatingProfile(true);
      setProfileSuccess('');
      setProfileError('');
      const updatedUser = await authService.updateProfile(data);
      updateUser(updatedUser);
      setProfileSuccess('Profile preferences updated successfully.');
    } catch (err) {
      setProfileError(err.userMessage || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordSuccess('');
      setPasswordError('');
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess('Password successfully updated.');
      resetPasswordForm();
    } catch (err) {
      setPasswordError(err.userMessage || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Account Profile & Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal profile, preferred currency, theme appearance, and security credentials.
        </p>
      </div>

      {/* User Information Card */}
      <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-100 dark:shadow-none flex-shrink-0">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="text-center sm:text-left min-w-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5" />
            {user?.email}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full">
              <Coins className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Currency: {user?.currency || 'INR'}
            </span>
            <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Joined: {formatDate(user?.createdAt, 'medium')}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance & Theme Selector Card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Appearance & Theme</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose between clean light mode, sleek dark mode, or follow your operating system settings.
              </p>
            </div>
          </div>
          <div>
            <ThemeSelector />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings Form */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile Preferences</h3>
          </div>

          {profileSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs rounded-lg font-medium">
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                {...registerProfile('name', { required: 'Name is required' })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              {profileErrors.name && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{profileErrors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Display Currency
              </label>
              <select
                {...registerProfile('currency')}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="INR" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">INR (₹ - Indian Rupee)</option>
                <option value="USD" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">USD ($ - United States Dollar)</option>
                <option value="EUR" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">EUR (€ - Euro)</option>
                <option value="GBP" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">GBP (£ - British Pound)</option>
                <option value="CAD" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">CAD ($ - Canadian Dollar)</option>
                <option value="AUD" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">AUD ($ - Australian Dollar)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="btn-primary text-xs py-2 px-4"
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h3>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs rounded-lg font-medium">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...registerPassword('currentPassword', {
                  required: 'Current password is required',
                })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password (Min 8 chars, 1 number, 1 special)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...registerPassword('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...registerPassword('confirmPassword', {
                  required: 'Please confirm your new password',
                })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="btn-primary text-xs py-2 px-4"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Assurance Card */}
      <div className="card p-5 bg-slate-900 dark:bg-slate-900/90 border-slate-800 text-white flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <h4 className="font-bold text-sm text-white mb-1">Security & Financial Precision Standards</h4>
          <p className="text-slate-300">
            Passwords are salted and securely hashed with bcryptjs. JSON Web Tokens (JWT) authenticate
            every API endpoint with strict database tenant isolation. All monetary amounts are
            calculated using PostgreSQL NUMERIC Decimal types to prevent JavaScript floating-point rounding errors.
          </p>
        </div>
      </div>
    </div>
  );
}
