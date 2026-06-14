const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const extra = {
  hy: {
    nav: { patientCare: 'Բուժում', search: 'Որոնում' },
    common: { bookOnline: 'Գրանցվել առցանց' },
    doctors: {
      filterSurgeons: 'Ցուցադրել միայն վիրաբույջներին'
    },
    home: {
      rankingsLink: 'Տես մեր ձեռքբերումները',
      complexCasesDetail:
        'Մեր բազմակողմանի կենտրոնը ապահովում է բուժում՝ հիմնված վերջին հետազոտությունների և ապացուցված մեթոդների վրա։',
      newsShowMore: 'Ցուցադրել ավելին',
      newsShowLess: 'Փակել'
    }
  },
  ru: {
    nav: { patientCare: 'Услуги', search: 'Поиск' },
    common: { bookOnline: 'Записаться онлайн' },
    doctors: {
      filterSurgeons: 'Показать только хирургов'
    },
    home: {
      rankingsLink: 'Смотреть наши достижения',
      complexCasesDetail:
        'Наш мультидисциплинарный центр обеспечивает лечение на основе последних исследований, проверенных практик и современных методов.',
      newsShowMore: 'Показать ещё',
      newsShowLess: 'Свернуть'
    }
  },
  en: {
    nav: { patientCare: 'Patient Care', search: 'Search' },
    common: { bookOnline: 'Book Online' },
    doctors: {
      filterSurgeons: 'View spine surgeons only'
    },
    home: {
      rankingsLink: 'See our achievements',
      complexCasesDetail:
        'Our multidisciplinary care center delivers treatment based on the latest research, proven practices and cutting-edge techniques.',
      newsShowMore: 'Show more',
      newsShowLess: 'Show less'
    }
  }
};

['hy', 'ru', 'en'].forEach((lang) => {
  const file = path.join(root, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const e = extra[lang];
  Object.assign(data.nav, e.nav);
  Object.assign(data.common, e.common);
  Object.assign(data.pages.home, e.home);
  data.pages.doctors = { ...data.pages.doctors, ...e.doctors };
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('OK', lang);
});
