import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translationEN from './en/translation.json'
import customer from './vi/customer.json'
import headerTitle from './vi/headerTitle.json'
import internal from './vi/internal.json'
import invoice from './vi/invoice.json'
import sms from './vi/sms.json'
import translationVI from './vi/translation.json'

const resources = {
  en: {
    translation: translationEN
  },
  vi: {
    translation: {
      ...translationVI,
      ...internal,
      ...invoice,
      ...sms,
      ...headerTitle,
      ...customer
    }
  }
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'vi',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n
