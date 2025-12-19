// deepseek_cli_website/client/src/pages/Settings.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 pt-24 pb-20 px-4">
      <SEO
        title="Settings"
        description="Settings page for DeepSeek CLI"
      />
      
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Settings
        </h1>
        
        <div className="card p-8">
          <p className="text-dark-300 text-lg">
            Settings page is under development. This will include:
          </p>
          <ul className="mt-4 space-y-2 text-dark-300">
            <li>• Application preferences</li>
            <li>• Theme customization</li>
            <li>• Notification settings</li>
            <li>• Privacy controls</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;