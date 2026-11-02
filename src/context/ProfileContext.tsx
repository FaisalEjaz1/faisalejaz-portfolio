import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';

const STORAGE_KEY = 'mis_portfolio_profile_v4';

const defaultProfile: UserProfile = {
  name: 'Faisal Ejaz',
  title: 'MIS Executive | Reporting Analyst',
  email: 'faisalejaz797@gmail.com',
  phone: '+966505869094',
  whatsapp: '+923086728781',
  linkedin: 'www.linkedin.com/in/faisal-ejaz-fysi0',
  location: 'Riyadh, Saudi Arabia',
  bio: 'Data-driven MIS Executive and Reporting Analyst based in Riyadh, specializing in automated KPI dashboards, multi-source financial reconciliation, SQL pipeline optimization, and advanced Excel / Power Query workflows.',
  github: 'github.com/faisalejaz',
  yearsExperience: 4,
};

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  resetProfile: () => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultProfile, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed to load profile from localStorage', e);
    }
    return defaultProfile;
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage', e);
    }
  }, [profile]);

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to reset profile', e);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        resetProfile,
        isEditModalOpen,
        setIsEditModalOpen,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
}
