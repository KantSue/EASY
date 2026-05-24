import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './fr.json';
import mg from './mg.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      fr: { translation: fr },
      mg: { translation: mg },
    },
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
  });

export default i18n;
