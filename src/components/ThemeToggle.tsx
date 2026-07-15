import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const ThemeToggle = ({ className = '', showLabel = false }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
        isDark
          ? 'bg-amber-900/20 hover:bg-amber-900/30 text-amber-400'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      } ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Enable light mode' : 'Enable dark mode'}
    >
      {isDark ? (
        <>
          <SunOutlined className="text-lg" />
          {showLabel && <span className="text-sm font-medium">Light</span>}
        </>
      ) : (
        <>
          <MoonOutlined className="text-lg" />
          {showLabel && <span className="text-sm font-medium">Dark</span>}
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
