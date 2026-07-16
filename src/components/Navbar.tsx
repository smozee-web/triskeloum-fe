import React from 'react';
import { UserOutlined, LogoutOutlined, BellOutlined, SettingOutlined, GlobalOutlined } from '@ant-design/icons';
import { Avatar, Badge, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useLoadUserQuery, useLogoutMutation } from '../services/api';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useLoadUserQuery(undefined, {
    skip: !localStorage.getItem('accessToken')
  });
  const [logout] = useLogoutMutation({});
  // Fix: user data is at payload, not payload.data
  const user = response?.payload;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const getUserMenuItems = (): MenuProps['items'] => [
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/admin/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <nav className="h-16 px-6 bg-white dark:bg-bg-secondary border-b border-gray-200 dark:border-gray-800 flex items-center justify-between transition-colors duration-300">
      {/* Left side - empty or logo */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold tracking-wider hidden md:block"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          Admin Panel
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* View public site */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-bg-tertiary hover:bg-gray-200 dark:hover:bg-amber-900/20 text-sm text-gray-700 dark:text-text-primary transition-colors duration-200"
          title="Open the public site in a new tab"
        >
          <GlobalOutlined />
          View Site
        </a>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        {user && (
          <Badge count={0} size="small">
            <button className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-bg-tertiary hover:bg-gray-200 dark:hover:bg-amber-900/20 flex items-center justify-center transition-colors duration-200">
              <BellOutlined className="text-gray-600 dark:text-amber-400" />
            </button>
          </Badge>
        )}

        {/* User Profile */}
        {user && (
          <Dropdown
            menu={{ items: getUserMenuItems() }}
            placement="bottomRight"
            trigger={['click']}
          >
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-bg-tertiary transition-colors duration-200">
              <Avatar
                size={32}
                icon={<UserOutlined />}
                className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700]"
              />
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-text-primary">
                  {user.email}
                </div>
                <div className="text-xs text-gray-500 dark:text-text-tertiary">
                  {user.role?.name || 'Admin'}
                </div>
              </div>
            </button>
          </Dropdown>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
