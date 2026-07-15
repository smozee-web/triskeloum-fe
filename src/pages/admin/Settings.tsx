// src/pages/admin/Settings.tsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Bell, Globe, Lock, Edit2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLoadUserQuery, useUpdateUserProfileMutation, useUpdatePasswordMutation } from '../../services/api';

const Settings: React.FC = () => {
    const { data: response } = useLoadUserQuery({});
    const user = response?.payload;
    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation();
    const [updatePassword, { isLoading: isUpdatingPassword }] = useUpdatePasswordMutation();

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        email: user?.email || '',
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        phone: user?.phone || '',
    });

    // Update profile data when user data loads
    useEffect(() => {
        if (user) {
            setProfileData({
                email: user.email || '',
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        courseUpdates: true,
        newMessages: true,
        weeklyDigest: false,
    });

    const [languagePreference, setLanguagePreference] = useState('en');

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSaveProfile = async () => {
        try {
            await updateProfile({
                firstname: profileData.firstname,
                lastname: profileData.lastname,
                phone: profileData.phone || undefined,
            }).unwrap();
            toast.success('Profile updated successfully');
            setIsEditingProfile(false);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error?.data?.message || 'Error updating profile');
        }
    };

    const handleSaveNotifications = async () => {
        try {
            // TODO: API call to update notification settings
            toast.success('Notification preferences updated');
        } catch (error) {
            toast.error('Error updating preferences');
        }
    };

    const handleSaveLanguage = async () => {
        try {
            // TODO: API call to update language preference
            toast.success('Language updated');
        } catch (error) {
            toast.error('Error updating language');
        }
    };

    const handleChangePassword = async () => {
        try {
            // Validation
            if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
                toast.error('Please fill in all fields');
                return;
            }

            if (passwordData.newPassword !== passwordData.confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }

            if (passwordData.newPassword.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
            }

            await updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            }).unwrap();

            toast.success('Password updated successfully');
            setIsPasswordModalOpen(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            console.error('Error updating password:', error);
            toast.error(error?.data?.message || 'Error updating password');
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-bg-primary p-4 sm:p-6 lg:p-8 overflow-auto transition-colors duration-300">
            <div className="max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1"
                        style={{
                            background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                        Settings
                    </h1>
                    <p className="text-gray-600 dark:text-text-tertiary mt-1 text-sm sm:text-base">
                        Manage your profile and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Information */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-bg-tertiary rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center">
                                        <User className="w-5 h-5 text-black" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary">
                                        Profile Information
                                    </h2>
                                </div>
                                <button
                                    onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                                >
                                    {isEditingProfile ? (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            disabled={!isEditingProfile}
                                            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all disabled:bg-gray-100 dark:disabled:bg-bg-primary disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.firstname}
                                            onChange={(e) => setProfileData({ ...profileData, firstname: e.target.value })}
                                            disabled={!isEditingProfile}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all disabled:bg-gray-100 dark:disabled:bg-bg-primary disabled:cursor-not-allowed"
                                            placeholder="Your first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.lastname}
                                            onChange={(e) => setProfileData({ ...profileData, lastname: e.target.value })}
                                            disabled={!isEditingProfile}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all disabled:bg-gray-100 dark:disabled:bg-bg-primary disabled:cursor-not-allowed"
                                            placeholder="Your last name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                        Phone (optional)
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        disabled={!isEditingProfile}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all disabled:bg-gray-100 dark:disabled:bg-bg-primary disabled:cursor-not-allowed"
                                        placeholder="Your phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                        Role
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={user?.role?.name || 'Admin'}
                                            disabled
                                            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-bg-primary text-gray-600 dark:text-text-tertiary cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="bg-white dark:bg-bg-tertiary rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mt-6 transition-colors">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-black" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary">
                                    Security
                                </h2>
                            </div>

                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-bg-secondary transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-text-primary">
                                            Change password
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-text-tertiary">
                                            Update your password regularly
                                        </p>
                                    </div>
                                    <Lock className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-6">
                        {/* Notifications */}
                        <div className="bg-white dark:bg-bg-tertiary rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-black" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary">
                                    Notifications
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(notificationSettings).map(([key, value]) => (
                                    <label key={key} className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-sm text-gray-700 dark:text-text-secondary group-hover:text-gray-900 dark:group-hover:text-text-primary transition-colors">
                                            {key === 'emailNotifications' && 'Email notifications'}
                                            {key === 'pushNotifications' && 'Push notifications'}
                                            {key === 'courseUpdates' && 'Course updates'}
                                            {key === 'newMessages' && 'New messages'}
                                            {key === 'weeklyDigest' && 'Weekly digest'}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                                            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                        />
                                    </label>
                                ))}
                            </div>

                            <button
                                onClick={handleSaveNotifications}
                                className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                            >
                                Save
                            </button>
                        </div>

                        {/* Language */}
                        <div className="bg-white dark:bg-bg-tertiary rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-black" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary">
                                    Language
                                </h2>
                            </div>

                            <select
                                value={languagePreference}
                                onChange={(e) => setLanguagePreference(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            >
                                <option value="en">English</option>
                                <option value="fr">Français</option>
                            </select>

                            <button
                                onClick={handleSaveLanguage}
                                className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>

                {/* Password Change Modal */}
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-all duration-300 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-bg-tertiary rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">Change password</h3>
                                <button
                                    onClick={() => {
                                        setIsPasswordModalOpen(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                        Current password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                                        placeholder="Enter your current password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                        New password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                                        placeholder="Enter a new password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                        Confirm new password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                                        placeholder="Confirm the new password"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setIsPasswordModalOpen(false);
                                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                        }}
                                        disabled={isUpdatingPassword}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-text-primary rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={isUpdatingPassword}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 transition-all duration-200"
                                    >
                                        {isUpdatingPassword && (
                                            <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                                        )}
                                        Change
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
