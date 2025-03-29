import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

// 初始化 i18next
i18n
  .use(initReactI18next) // 传递 i18n 实例给 react-i18next
  .init({
    resources: {
      en: {
        translation: en
      }
    },
    lng: 'en', // 默认语言
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react 已经安全地处理了转义
    }
  });

export default i18n; 