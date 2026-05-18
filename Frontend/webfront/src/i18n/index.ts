import i18n                 from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr                   from './locales/fr';
import mg                   from './locales/mg';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      mg: { translation: mg },
    },
    lng           : localStorage.getItem('lang') || 'fr',
    fallbackLng   : 'fr',
    interpolation : { escapeValue: false },
  });

export default i18n;