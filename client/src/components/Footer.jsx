import { Link } from 'react-router-dom'
import { Terminal, Github, Twitter } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Terminal className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold">{t('footer.logo')}</span>
            </Link>
            <p className="text-dark-400 text-sm max-w-md">
              {t('footer.description')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.headings.product')}</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><Link to="/docs" className="hover:text-white transition-colors">{t('footer.links.documentation')}</Link></li>
              <li><a href="#features" className="hover:text-white transition-colors">{t('footer.links.features')}</a></li>
              <li><a href="#plugins" className="hover:text-white transition-colors">{t('footer.links.plugins')}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.headings.community')}</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li>
                <a href="https://github.com/leeoohoo/deepseek-cli" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  <Github className="w-4 h-4" /> {t('footer.links.github')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-dark-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-dark-500">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  )
}