// deepseek_cli_website/client/src/pages/Profile.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Profile = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 pt-24 pb-20 px-4">
      <SEO
        title="Profile"
        description="User profile page for DeepSeek CLI"
      />
      
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
          User Profile
        </h1>
        
        <div className="card p-8">
          <p className="text-dark-300 text-lg">
            Profile page is under development. This will include:
          </p>
          <ul className="mt-4 space-y-2 text-dark-300">
            <li>• User information management</li>
            <li>• Account settings</li>
            <li>• Usage statistics</li>
            <li>• Subscription details</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;