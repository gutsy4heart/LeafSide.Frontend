import { useLanguage } from '../app/language-context';
import ruMessages from '../messages/ru.json';
import enMessages from '../messages/en.json';
import plMessages from '../messages/pl.json';

const messages = {
  ru: ruMessages,
  en: enMessages,
  pl: plMessages,
};

export function useTranslations() {
  const { language } = useLanguage();
  
  const t = (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value: any = messages[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      console.log('Available keys:', Object.keys(messages[language] || {}));
      console.log('Trying to access:', keys);
      return key;
    }
    
    // Replace parameters in the translation
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };
  
  return { t, language };
}
