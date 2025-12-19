import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, LogOut, Settings } from 'lucide-react';

const UserAvatar = ({ 
  user, 
  onLogout, 
  variant = 'desktop', 
  className = '',
  onCloseMenu = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  // 移动端变体
  if (variant === 'mobile') {
    return (
      <div className={className}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user.email}</p>
            <p className="text-xs text-dark-400">Logged in</p>
          </div>
        </div>
        <div className="space-y-2">
          <Link
            to="/profile"
            className="block py-2 text-dark-300 hover:text-white"
            onClick={onCloseMenu}
          >
            My Profile
          </Link>
          <Link
            to="/settings"
            className="block py-2 text-dark-300 hover:text-white"
            onClick={onCloseMenu}
          >
            Settings
          </Link>
          <button
            onClick={() => {
              onLogout();
              onCloseMenu();
            }}
            className="w-full py-2 text-red-400 hover:text-red-300 text-left"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // 桌面端变体
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm text-white font-medium">
          {user.email.split('@')[0]}
        </span>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 w-48 bg-dark-900 border border-dark-800 rounded-lg shadow-lg z-50"
        >
          <div className="p-4 border-b border-dark-800">
            <p className="text-sm font-medium text-white">{user.email}</p>
            <p className="text-xs text-dark-400 mt-1">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="p-2">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors mt-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UserAvatar;