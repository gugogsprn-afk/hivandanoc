const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const extra = {
  hy: {
    ctaLink: 'Գրանցվեք ընդունելության «Առողջ ողնաշար»',
    learnTitle: 'Իմանալ ավելին',
    infoTitle: 'Տեղեկություն',
    policiesTitle: 'Քաղաքականություն',
    linkContact: 'Կապ մեզ հետ',
    linkStory: 'Կիսվեք ձեր պատմությամբ',
    linkArticles: 'Կարդացեք առողջության մասին',
    linkNewsletter: 'Բաժանորդագրվել',
    linkSupport: 'Աջակցել CHIC',
    learnAbout: 'Մեր մասին',
    learnNews: 'Նորություններ',
    learnChic: 'CHIC մասին',
    learnContact: 'Կապ',
    infoPatients: 'Հիվանդներին',
    infoDoctors: 'Բժիշկներին',
    infoServices: 'Ծառայություններ',
    infoHours: 'Աշխատանքային ժամեր',
    infoBook: 'Գրանցվել առցանց',
    policyPrivacy: 'Գաղտնիության քաղաքականություն',
    policyTerms: 'Օգտագործման պայմաններ',
    policyPatient: 'Հիվանդի տեղեկատվություն',
    legalAddress: 'Հասցե',
    legalDisclaimer: 'Բոլոր իրավունքները պաշտպանված են։'
  },
  ru: {
    ctaLink: 'Запишитесь на приём в «Առողջ ողնաշար»',
    learnTitle: 'Узнать больше',
    infoTitle: 'Информация для',
    policiesTitle: 'Политики',
    linkContact: 'Свяжитесь с нами',
    linkStory: 'Поделитесь своей историей',
    linkArticles: 'Читайте статьи о здоровье',
    linkNewsletter: 'Подпишитесь на рассылку',
    linkSupport: 'Поддержать CHIC',
    learnAbout: 'О центре',
    learnNews: 'Новости',
    learnChic: 'О CHIC',
    learnContact: 'Контакты',
    infoPatients: 'Пациентам и посетителям',
    infoDoctors: 'Медицинским специалистам',
    infoServices: 'Услуги центра',
    infoHours: 'Режим работы',
    infoBook: 'Записаться онлайн',
    policyPrivacy: 'Политика конфиденциальности',
    policyTerms: 'Условия использования',
    policyPatient: 'Информация для пациентов',
    legalAddress: 'Адрес',
    legalDisclaimer: 'Все права защищены. Информация на сайте не заменяет консультацию врача.'
  },
  en: {
    ctaLink: 'Make an appointment at Healthy Spine',
    learnTitle: 'Learn more',
    infoTitle: 'Information for',
    policiesTitle: 'Policies',
    linkContact: 'Contact us',
    linkStory: 'Share your story',
    linkArticles: 'Read health articles',
    linkNewsletter: 'Subscribe to newsletter',
    linkSupport: 'Support CHIC',
    learnAbout: 'About us',
    learnNews: 'News',
    learnChic: 'About CHIC',
    learnContact: 'Contacts',
    infoPatients: 'Patients & visitors',
    infoDoctors: 'Medical professionals',
    infoServices: 'Our services',
    infoHours: 'Hours',
    infoBook: 'Book online',
    policyPrivacy: 'Privacy policy',
    policyTerms: 'Terms of use',
    policyPatient: 'Patient information',
    legalAddress: 'Address',
    legalDisclaimer: 'All rights reserved. Site content does not replace medical advice.'
  }
};

['hy', 'ru', 'en'].forEach((lang) => {
  const file = path.join(root, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(data.footer, extra[lang]);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('OK', lang);
});
