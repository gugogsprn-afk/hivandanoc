const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const extra = {
  hy: {
    footer: { ctaText: 'Պատրաստ եք սկսել վերականգնումը? Գրանցվեք ընդունելության այսօր։' },
    appointment: {
      title: 'Գրանցում — Առողջ ողնաշար',
      intro: 'Լրացրեք ձևը, և մեր ադմինիստրատորը կկապվի ձեզ հետ՝ ընդունելության ժամանակը հաստատելու համար։',
      sectionContact: 'Կոնտակտային տվյալներ',
      sectionService: 'Ծառայություն և բժիշկ',
      sectionDate: 'Ամսաթիվ և ժամ'
    },
    contacts: {
      title: 'Կապ — Առողջ ողնաշար',
      feedbackDesc: 'Հարցեր ունե՞ք։ Գրեք մեզ, և մենք կպատասխանենք 1–2 աշխատանքային օրվա ընթացքում։'
    }
  },
  ru: {
    footer: { ctaText: 'Готовы начать восстановление? Запишитесь на приём сегодня.' },
    appointment: {
      title: 'Запись на приём — Առողջ ողնաշար',
      intro: 'Заполните форму — администратор свяжется с вами для подтверждения времени приёма.',
      sectionContact: 'Контактные данные',
      sectionService: 'Услуга и врач',
      sectionDate: 'Дата и время'
    },
    contacts: {
      title: 'Контакты — Առողջ ողնաշար',
      feedbackDesc: 'Есть вопросы? Напишите нам — ответим в течение 1–2 рабочих дней.'
    }
  },
  en: {
    footer: { ctaText: 'Ready to start your recovery? Book an appointment today.' },
    appointment: {
      title: 'Appointment — Healthy Spine',
      intro: 'Fill out the form and our team will contact you to confirm your appointment time.',
      sectionContact: 'Contact information',
      sectionService: 'Service and doctor',
      sectionDate: 'Date and time'
    },
    contacts: {
      title: 'Contacts — Healthy Spine',
      feedbackDesc: 'Have questions? Send us a message — we respond within 1–2 business days.'
    }
  }
};

['hy', 'ru', 'en'].forEach((lang) => {
  const file = path.join(root, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const e = extra[lang];
  Object.assign(data.footer, e.footer);
  Object.assign(data.pages.appointment, e.appointment);
  Object.assign(data.pages.contacts, e.contacts);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('OK', lang);
});
