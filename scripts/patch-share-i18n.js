const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const share = {
  hy: {
    barAria: 'Կիսվել',
    modalTitle: 'Լրացուցիչ կիսման տարբերակներ',
    more: 'Ավելին',
    facebook: 'Facebook',
    twitter: 'X',
    linkedin: 'LinkedIn',
    pinterest: 'Pinterest',
    tumblr: 'Tumblr',
    xing: 'Xing',
    reddit: 'Reddit',
    vk: 'VK',
    print: 'Տպել',
    email: 'Էլ. փոստ'
  },
  ru: {
    barAria: 'Поделиться',
    modalTitle: 'Дополнительные возможности обмена',
    more: 'Ещё',
    facebook: 'Facebook',
    twitter: 'X',
    linkedin: 'LinkedIn',
    pinterest: 'Пинтерест',
    tumblr: 'Tumblr',
    xing: 'Xing',
    reddit: 'Реддит',
    vk: 'ВКонтакте',
    print: 'Печать',
    email: 'Электронная почта'
  },
  en: {
    barAria: 'Share',
    modalTitle: 'Additional sharing options',
    more: 'More',
    facebook: 'Facebook',
    twitter: 'X',
    linkedin: 'LinkedIn',
    pinterest: 'Pinterest',
    tumblr: 'Tumblr',
    xing: 'Xing',
    reddit: 'Reddit',
    vk: 'VK',
    print: 'Print',
    email: 'Email'
  }
};

['hy', 'ru', 'en'].forEach((lang) => {
  const file = path.join(root, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.share = share[lang];
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('OK', lang);
});
