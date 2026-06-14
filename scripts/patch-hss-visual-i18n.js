const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const extra = {
  hy: {
    searchTitle: 'Գտեք բժիշկ և գրանցվեք առցանց',
    searchPlaceholder: 'Հիվանդություն, գործընթաց կամ բժշկի անուն',
    searchCategoryAll: 'Բոլոր ծառայությունները',
    searchNext: 'Հաջորդ',
    quickPhysio: 'Ֆիզիոթերապիա',
    quickUrgent: 'Օրթա օրվա օրթոպեդիկ խորհրդատվության հնարավորություն',
    quickSameDay: 'Առողջ ողնաշար — այսօր',
    patientHeroCta: 'Ծանոթացեք նրա պատմությանը',
    awardsTitle: 'Պարգևներ և ճանաչում',
    awardsDesc: 'Մեր կենտրոնը ապահովում է բարձրակարգ վերականգնողական օգնություն՝ հիմնված ապացուցված մեթոդների վրա։',
    newsViewAll: 'Ավելին մեր նորությունների բաժնում ›'
  },
  ru: {
    searchTitle: 'Найдите врача и запишитесь на приём онлайн',
    searchPlaceholder: 'Заболевание, процедура или имя врача',
    searchCategoryAll: 'Все услуги',
    searchNext: 'Далее',
    quickPhysio: 'Физиотерапия',
    quickUrgent: 'Возможность получения ортопедической помощи в тот же день',
    quickSameDay: 'Առողջ ողնաշար — в тот же день',
    patientHeroCta: 'Ознакомьтесь с его историей',
    awardsTitle: 'Награды и признание',
    awardsDesc: 'Наш центр обеспечивает высококачественную реабилитационную помощь на основе доказательных методов и индивидуального подхода.',
    newsViewAll: 'Больше в разделе новостей ›'
  },
  en: {
    searchTitle: 'Find a doctor and book an appointment online',
    searchPlaceholder: 'Condition, procedure, or doctor name',
    searchCategoryAll: 'All services',
    searchNext: 'Next',
    quickPhysio: 'Physical Therapy',
    quickUrgent: 'Same-day orthopedic consultation available',
    quickSameDay: 'Healthy Spine — same day',
    patientHeroCta: 'Read his story',
    awardsTitle: 'Awards and recognition',
    awardsDesc: 'Our center delivers high-quality rehabilitation care based on evidence-based methods and personalized treatment plans.',
    newsViewAll: 'More in our news section ›'
  }
};

['hy', 'ru', 'en'].forEach((lang) => {
  const file = path.join(root, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(data.pages.home, extra[lang]);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('OK', lang);
});
