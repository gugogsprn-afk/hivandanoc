const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const hospital = JSON.parse(fs.readFileSync(path.join(root, 'data/hospital.json'), 'utf8'));

const patches = {
  hy: {
    nav: {
      locations: 'Հասցեներ',
      whyUs: 'Ինչու մենք',
      aboutOrg: '«Առողջ ողնաշար» մասին',
      doctors: 'Գտնել բժիշկ'
    },
    home: {
      complexCasesLead:
        'Մենք ընդունում ենք բարդ դեպքեր, այդ թվում բազմակի հիվանդություններ ունեցող և նախկինում բուժված հիվանդներին։',
      conditionsIntro: 'Մեր մասնագետները բուժում են պոզանոցի բոլոր տեսակի հիվանդությունները, այդ թվում՝',
      conditionsTitle: 'Բարդ դեպքերի մասնագիտացված օգնություն',
      expertsTitle: 'Մոտակա լավագույն մասնագետներ',
      newsTitle: '«Առողջ ողնաշար» նորություններում',
      storiesTitle: 'Հիվանդների պատմություններ',
      storiesViewAll: 'Բոլոր պատմությունները',
      footerCta: 'Գրանցվել «Առողջ ողնաշար»',
      reviewsTitle: 'Ինչու ընտրել մեզ? Հիվանդները լավագույնն են ասում'
    }
  },
  ru: {
    nav: {
      locations: 'Адреса',
      whyUs: 'Почему мы',
      aboutOrg: 'О «Առողջ ողնաշար»',
      doctors: 'Найти врача'
    },
    home: {
      complexCasesLead:
        'Мы принимаем сложные случаи, включая пациентов с несколькими сопутствующими заболеваниями и после предыдущего лечения.',
      conditionsIntro: 'Наши специалисты лечат все типы заболеваний позвоночника, включая:',
      conditionsTitle: 'Специализированная помощь при сложных случаях',
      expertsTitle: 'Лучшие специалисты рядом с вами',
      newsTitle: '«Առողջ ողնաշար» в новостях',
      storiesTitle: 'Истории пациентов',
      storiesViewAll: 'Все истории',
      footerCta: 'Записаться в «Առողջ ողնաշար»',
      reviewsTitle: 'Почему выбирают нас? Пациенты говорят лучше всех'
    }
  },
  en: {
    nav: {
      locations: 'Locations',
      whyUs: 'Why Choose Us',
      aboutOrg: 'About «Առողջ ողնաշար»',
      doctors: 'Find a Doctor'
    },
    home: {
      complexCasesLead:
        'We handle complex cases, including patients with multiple coexisting conditions and those who have had previous treatment.',
      conditionsIntro: 'Our specialists treat all types of spine conditions, including:',
      conditionsTitle: 'Specialized Care for Complex Cases',
      expertsTitle: 'Top Specialists Near You',
      newsTitle: 'Healthy Spine in the News',
      storiesTitle: 'Explore Patient Stories',
      storiesViewAll: 'View All Patient Stories',
      footerCta: 'Make an Appointment',
      reviewsTitle: 'Why Choose Us? Our patients say it best.'
    }
  }
};

['hy', 'ru', 'en'].forEach((lang) => {
  const file = path.join(root, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const p = patches[lang];

  Object.assign(data.nav, p.nav);
  Object.assign(data.pages.home, p.home);

  const contentByLang = {
    hy: {
      heroTagline: 'Պոզանոցի, հոդերի և շարժական համակարգի մասնագիտացված օգնություն',
      introParagraphs: [
        '«Առողջ ողնաշար» վերականգնողական կենտրոնը ճանաչված է որպես պոզանոցի և հոդերի կոնսերվատիվ բուժման առաջատար։ Տարեկան մեզ դիմում է ավելի քան <strong>5 000 հիվանդ</strong>։ Մեր մոտեցումը հիմնված է հոգատարության, ապացուցված մեթոդների և ժամանակակից տեխնոլոգիաների վրա։',
        'Որակի հանդեպ մեր հավատարմուտությունը հաստատված է փորձով և <strong>98% դրական արձագանքներով</strong>։'
      ],
      approachParagraphs: [
        'Մեր մասնագետները ծանուքանում են ավելորդ միջամտություններից։ Կիրառում ենք ժամանակակից ոչ վիրահատական մեթոդներ։',
        'Թիմում են օրթոպեդներ, նյարդաբաններ, ֆիզիոթերապևտներ, մանուալ թերապևտներ և ռեաբիլիտոլոգներ։',
        'Ախտորոշումից մինչև վերականգնում — յուրաքանչյուր մասնագետ ունի մեծ փորձ ձեր հիվանդության բուժման ոլորտում։'
      ],
      expertsParagraphs: [
        'Մեր մասնագետները բազմամյա փորձ ունեն պոզանոցի և հոդերի ոլորտում։',
        'Գրանցվեք առցանց կամ հեռախոսով «Առողջ ողնաշար» կենտրոնում։'
      ],
      imagingParagraphs: [
        'Առաջին քայլը խնդրի ճշգրիտ պատկերի ստացումն է։ Մենք օգտագործում ենք ժամանակակից սարքավորում ախտորոշման համար։'
      ],
      feature: {
        title: 'Նորարարություններ պոզանոցի վերականգնման մեջ',
        description: 'Ժամանակակից ֆիզիոթերապիա, մանուալ թերապիա և ԼՖԿ ապահովում են անհատականացված վերականգնում առանց վիրահատության։'
      }
    },
    en: {
      heroTagline: 'Specialized care for spine, joints and musculoskeletal conditions',
      introParagraphs: [
        'Healthy Spine rehabilitation center is a recognized leader in conservative spine and joint care. More than <strong>5,000 patients</strong> consult us each year. Our approach is built on exceptional patient care, evidence-based methods and modern rehabilitation technology.',
        'Our commitment to quality is reflected in years of experience and <strong>98% positive patient feedback</strong>.'
      ],
      approachParagraphs: [
        'Our specialists help patients avoid unnecessary procedures. We use modern nonsurgical methods to treat orthopedic and neurological conditions.',
        'Our team includes experts in orthopedics, neurology, physiotherapy, manual therapy, therapeutic exercise and rehabilitation — all focused on spine and neck care.',
        'From diagnosis to recovery, every team member has extensive experience treating your condition. We offer a range of therapies to relieve pain, prevent further damage and restore mobility — often without surgery.'
      ],
      expertsParagraphs: [
        'Our specialists are physicians with years of experience in spine and joint care. They use minimally invasive and conservative methods for less pain, faster recovery and fewer complications.',
        'For convenient access, our specialists see patients at Healthy Spine — you can book online or by phone.'
      ],
      imagingParagraphs: [
        'The first step is a clear picture of the problem. Our specialists use modern equipment and proven diagnostic methods to accurately determine the cause of pain.'
      ],
      feature: {
        title: 'Innovation in spine rehabilitation',
        description: 'Modern physiotherapy, manual therapy and therapeutic exercise deliver personalized recovery — often without surgery.'
      }
    },
    ru: {
      heroTagline: hospital.hospital.heroTagline,
      introParagraphs: hospital.introParagraphs,
      approachParagraphs: hospital.approachParagraphs,
      expertsParagraphs: hospital.expertsParagraphs,
      imagingParagraphs: hospital.imagingParagraphs,
      feature: hospital.feature
    }
  };

  const c = contentByLang[lang];
  data.content.hospital.heroTagline = c.heroTagline;
  data.content.introParagraphs = c.introParagraphs;
  data.content.approachParagraphs = c.approachParagraphs;
  data.content.expertsParagraphs = c.expertsParagraphs;
  data.content.imagingParagraphs = c.imagingParagraphs;
  data.content.feature = { ...hospital.feature, ...c.feature };
  if (lang === 'ru') {
    data.content.news = hospital.news;
    data.content.storyVideos = hospital.storyVideos;
    data.content.patientStories = hospital.patientStories;
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('OK', lang);
});
