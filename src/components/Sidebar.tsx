import React, { useState, useEffect } from 'react';
import {
  DashboardOutlined,
  BookOutlined,
  TeamOutlined,
  MessageOutlined,
  FireOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  AudioOutlined,
  BarsOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const Sidebar = () => {
  const [selectedKey, setSelectedKey] = useState('1');
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const pathToKey: Record<string, string> = {
      '/admin': '1',
      '/admin/users': '2',
      '/admin/levels': '3',
      '/admin/courses/list': '4',
      '/admin/courses/exercises': '5',
      '/admin/crm': '6',
      '/admin/voice-rooms': '7',
      '/admin/courses/reels': '8',
      '/admin/courses/quotes': '9',
      '/admin/courses/faqs': '10',
      '/admin/landing-page-settings': '11',
    };

    const currentKey = pathToKey[location.pathname] || '1';
    setSelectedKey(currentKey);
  }, [location.pathname]);

  const menuItems: MenuItem[] = [
    { key: '1', icon: <DashboardOutlined />, label: 'Dashboard', path: '/admin' },
    { key: '2', icon: <TeamOutlined />, label: 'Users', path: '/admin/users' },
    { key: '3', icon: <BarsOutlined />, label: 'Levels', path: '/admin/levels' },
    { key: '4', icon: <BookOutlined />, label: 'Courses', path: '/admin/courses/list' },
    { key: '5', icon: <FireOutlined />, label: 'Exercises', path: '/admin/courses/exercises' },
    { key: '6', icon: <MessageOutlined />, label: 'Chat', path: '/admin/crm' },
    { key: '7', icon: <AudioOutlined />, label: 'Rooms', path: '/admin/voice-rooms' },
    { key: '8', icon: <VideoCameraOutlined />, label: 'Reels', path: '/admin/courses/reels' },
    { key: '9', icon: <FileTextOutlined />, label: 'Quotes', path: '/admin/courses/quotes' },
    { key: '10', icon: <QuestionCircleOutlined />, label: 'FAQs', path: '/admin/courses/faqs' },
    { key: '11', icon: <GlobalOutlined />, label: 'Homepage', path: '/admin/landing-page-settings' },
  ];

  const handleMenuClick = (item: MenuItem) => {
    setSelectedKey(item.key);
    navigate(item.path);
  };

  const isSelected = (key: string) => selectedKey === key;
  const isHovered = (key: string) => hoveredKey === key;

  return (
    <div className="h-screen w-[200px] bg-white dark:bg-bg-secondary border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-base font-bold tracking-wider text-center"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          USRATUL AZKAAR
        </h2>
      </div>

      {/* Menu items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleMenuClick(item)}
            onMouseEnter={() => setHoveredKey(item.key)}
            onMouseLeave={() => setHoveredKey(null)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200
              ${isSelected(item.key)
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-md'
                : isHovered(item.key)
                ? 'bg-amber-50 dark:bg-amber-900/10 text-gray-900 dark:text-amber-400'
                : 'text-gray-600 dark:text-text-tertiary hover:text-gray-900 dark:hover:text-amber-400'
              }
            `}
          >
            <span className={`text-lg ${isSelected(item.key) ? 'text-black' : ''}`}>
              {item.icon}
            </span>
            <span className="flex-1 text-left text-xs">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
