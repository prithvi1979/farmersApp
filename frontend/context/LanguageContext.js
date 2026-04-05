import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dictionary } from '../locales/dictionary';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  // Load preferred language from AsyncStorage on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('@app_language');
        if (savedLang && dictionary[savedLang]) {
          setLanguage(savedLang);
        }
      } catch (e) {
        console.error('Failed to load language', e);
      }
    };
    loadLanguage();
  }, []);

  const switchLanguage = async (langCode) => {
    if (!dictionary[langCode]) return;
    try {
      setLanguage(langCode);
      await AsyncStorage.setItem('@app_language', langCode);
      
      // Attempt to sync with backend profile silently
      const deviceId = await AsyncStorage.getItem('deviceId');
      if (deviceId) {
        fetch(`https://farmersapp-333z.onrender.com/api/users/profile/${deviceId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: langCode })
        }).catch(err => console.log('Lang sync error:', err));
      }
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  const t = (key) => {
    return dictionary[language]?.[key] || dictionary['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
