import React, { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user?: any;
  levels?: any[];
  isLoading?: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  levels = [],
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    level: ''
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        role: user.role || 'user',
        level: user.level?.id || ''
      });
    } else {
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
        role: 'user',
        level: ''
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Password is required for creation';
    } else if (!user && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const generateRandomPassword = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 9; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({
      ...prev,
      password
    }));
    if (errors.password) {
      setErrors((prev: any) => ({
        ...prev,
        password: ''
      }));
    }
    toast.success('Password generated successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData: any = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone || undefined,
        role: formData.role,
        level: formData.level ? Number(formData.level) : undefined
      };

      // For creation, include email and password
      if (!user) {
        submitData.email = formData.email;
        submitData.password = formData.password;
      }

      await onSubmit(submitData);
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error while saving');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-all duration-300 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-bg-tertiary rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-text-primary">
            {user ? 'Edit user' : 'Create a user'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Firstname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1">
              First name
            </label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:opacity-50 transition-all ${
                errors.firstname ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {errors.firstname && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.firstname}</p>}
          </div>

          {/* Lastname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1">
              Last name
            </label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:opacity-50 transition-all ${
                errors.lastname ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {errors.lastname && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.lastname}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading || !!user}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:opacity-50 transition-all ${
                errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1">
              Phone (optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:opacity-50 transition-all"
            />
          </div>

          {/* Password - only for creation */}
          {!user && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary">
                  Password
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  title="Generate a random password"
                >
                  <SparklesIcon className="h-3 w-3" />
                  <span>Auto-generate</span>
                </button>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter a password or click Auto-generate"
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary placeholder-gray-400 dark:placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:opacity-50 transition-all ${
                  errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'
                }`}
              />
              {errors.password && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:opacity-50 transition-all"
            >
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Level */}
          {levels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1">
                Level (optional)
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:opacity-50 transition-all"
              >
                <option value="">Select a level</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-text-primary rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-black font-medium rounded-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isLoading && <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />}
              {user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;