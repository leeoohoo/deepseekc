import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Terminal, Github, BookOpen, User, LogOut, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import UserAvatar from './UserAvatar'

const navLinks = [
  { path: '/', label: 'header.nav.home' },
  { path: '/docs', label: 'header.nav.docs' },
  { path: '/ui-showcase', label: 'header.nav.uiShowcase' },
  { path: '/downloads', label: 'header.nav.downloads' }, // 新增
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // 检查用户登录状态
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  // 登出功能
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Terminal className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold">{t('header.logo')}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary-400'
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                {t(link.label)}
              </Link>
            ))}
            <a
              href="https://github.com/leeoohoo/deepseek-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-300 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <LanguageSwitcher />
            {user ? (
              // 用户已登录：显示用户头像和下拉菜单
                <UserAvatar 
                  user={user} 
                  onLogout={handleLogout} 
                  variant="desktop"
                />
            ) : (
              // 用户未登录：显示登录/注册按钮
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                  {t('header.buttons.login')}
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  {t('header.buttons.getStarted')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-dark-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-dark-800"
          >
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block py-2 text-dark-300 hover:text-white"
              >
                {t(link.label)}
              </Link>
            ))}
            <div className="py-4 border-t border-dark-800">
              <LanguageSwitcher />
            </div>
            {user ? (
                <UserAvatar 
                  user={user} 
                  onLogout={handleLogout} 
                  variant="mobile"
                  className="py-4 border-t border-dark-800"
                  onCloseMenu={() => setIsOpen(false)}
                />
            ) : (
              <div className="flex gap-4 mt-4">
                <Link to="/login" className="btn-secondary flex-1 text-center py-2" onClick={() => setIsOpen(false)}>
                  {t('header.buttons.login')}
                </Link>
                <Link to="/register" className="btn-primary flex-1 text-center py-2" onClick={() => setIsOpen(false)}>
                  {t('header.buttons.getStarted')}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </nav>
    </header>
  )
}