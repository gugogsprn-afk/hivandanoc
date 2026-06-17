const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const hospital = JSON.parse(fs.readFileSync(path.join(root, 'data/hospital.json'), 'utf8'));

const homePages = {
  hy: {
    heroBadge: 'Վերականգնողական կենտրոն · Առողջ ողնաշար',
    introLabel: 'Մեր մոտեցումը',
    introTitle: 'Բազմակողմանի վերականգնողական կենտրոն',
    conditionsLabel: 'Բուժում',
    conditionsTitle: 'Հիվանդություններ, որոնք մենք բուժում ենք',
    conditionsDesc: 'Պոզանոցի, հոդերի և շարժական համակարգի լայն սպեկտր',
    approachTitle: 'Կոնսերվատիվ մոտեցում',
    approachDesc:
      'Մեր մասնագետները նպատակ ունեն օգնել հիվանդներին խուսափել ավելորդ միջամտություններից։ Մենք կիրառում ենք ժամանակակից ոչ վիրահատական մեթոդներ՝ ցավը նվազեցնելու, շարժունակությունը վերականգնելու և կյանքի որակը բարելավելու համար։',
    equipmentLabel: 'Սարքավորում',
    equipmentTitle: 'Ժամանակակից սարքավորում',
    equipmentDesc: 'Ապացուցված տեխնոլոգիաներ ախտորոշման և բուժման համար',
    programsLabel: 'Ծրագրեր',
    programsTitle: 'Վերականգնողական ծրագրեր',
    programsDesc: 'Անհատական պլաններ՝ ձեր նպատակներին համապատասխան',
    bookingLabel: 'Գրանցում',
    bookingStep1: 'Լրացրեք ձևը',
    bookingStep2: 'Ընտրեք ծառայությունը',
    bookingStep3: 'Մենք կզանգահարենք հաստատելու համար',
    reviewsDesc: 'Մեր հիվանդները վստահում են մեզ',
    tileDoctors: 'Մեր մասնագետները',
    tileDoctorsDesc: 'Օրթոպեդներ, նյարդաբաններ, ֆիզիոթերապևտներ և ռեաբիլիտոլոգներ',
    tileAppointment: 'Գրանցվել ընդունելության',
    tileAppointmentDesc: 'Ընտրեք հարմար ժամանակը առցանց',
    tileContacts: 'Կապ և հասցե',
    tileContactsDesc: 'Ինչպես գտնել մեզ և կապվել'
  },
  ru: {
    heroBadge: 'Реабилитационный центр · Առողջ ողնաշար',
    introLabel: 'Наш подход',
    introTitle: 'Мультидисциплинарный реабилитационный центр',
    conditionsLabel: 'Лечение',
    conditionsTitle: 'Заболевания, которые мы лечим',
    conditionsDesc: 'Широкий спектр состояний позвоночника, суставов и опорно-двигательного аппарата',
    approachTitle: 'Консервативный подход',
    approachDesc:
      'Наши специалисты помогают пациентам избежать ненужных вмешательств. Мы применяем современные неоперационные методы для снятия боли, восстановления подвижности и улучшения качества жизни.',
    equipmentLabel: 'Оборудование',
    equipmentTitle: 'Современное оборудование',
    equipmentDesc: 'Доказательные технологии для диагностики и лечения',
    programsLabel: 'Программы',
    programsTitle: 'Реабилитационные программы',
    programsDesc: 'Индивидуальные планы под ваши цели восстановления',
    bookingLabel: 'Запись',
    bookingStep1: 'Заполните форму',
    bookingStep2: 'Выберите услугу',
    bookingStep3: 'Мы перезвоним для подтверждения',
    reviewsDesc: 'Наши пациенты доверяют нам',
    tileDoctors: 'Наши специалисты',
    tileDoctorsDesc: 'Ортопеды, неврологи, физиотерапевты и реабилитологи',
    tileAppointment: 'Записаться на приём',
    tileAppointmentDesc: 'Выберите удобное время онлайн',
    tileContacts: 'Контакты и адрес',
    tileContactsDesc: 'Как нас найти и связаться с нами'
  },
  en: {
    heroBadge: 'Rehabilitation Center · Առողջ ողնաշար',
    introLabel: 'Our approach',
    introTitle: 'A Multidisciplinary Rehabilitation Center',
    conditionsLabel: 'Treatment',
    conditionsTitle: 'Conditions we treat',
    conditionsDesc: 'A wide range of spine, joint and musculoskeletal conditions',
    approachTitle: 'A Conservative Approach',
    approachDesc:
      'Our specialists help patients avoid unnecessary procedures. We use modern nonsurgical methods to relieve pain, restore mobility and improve quality of life.',
    equipmentLabel: 'Equipment',
    equipmentTitle: 'State-of-the-art equipment',
    equipmentDesc: 'Evidence-based technology for diagnosis and treatment',
    programsLabel: 'Programs',
    programsTitle: 'Rehabilitation programs',
    programsDesc: 'Individual plans tailored to your recovery goals',
    bookingLabel: 'Appointment',
    bookingStep1: 'Fill out the form',
    bookingStep2: 'Choose a service',
    bookingStep3: 'We will call to confirm',
    reviewsDesc: 'Our patients trust us',
    tileDoctors: 'Our specialists',
    tileDoctorsDesc: 'Orthopedists, neurologists, physiotherapists and rehabilitologists',
    tileAppointment: 'Make an appointment',
    tileAppointmentDesc: 'Choose a convenient time online',
    tileContacts: 'Contact & location',
    tileContactsDesc: 'How to find us and get in touch'
  }
};

const callUs = { hy: 'Զանգել', ru: 'Позвонить', en: 'Call' };

['hy', 'ru', 'en'].forEach((lang) => {
  const file = path.join(root, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  data.common.callUs = callUs[lang];
  Object.assign(data.pages.home, homePages[lang]);

  data.content.trustPoints =
    lang === 'ru'
      ? hospital.trustPoints
      : lang === 'hy'
        ? [
            'Բազմակողմանի թիմ՝ օրթոպեդներ, նյարդաբաններ, ֆիզիոթերապևտներ, ռեաբիլիտոլոգներ',
            'Առանց վիրահատության բուժում՝ առաջնահերթություն',
            'Անհատական վերականգնողական ծրագրեր յուրաքանչյուր հիվանդի համար',
            'Ժամանակակից սարքավորում և ապացուցված թերապիա'
          ]
        : [
            'Multidisciplinary team: orthopedists, neurologists, physiotherapists, rehabilitologists',
            'Nonsurgical treatment is our priority',
            'Individual recovery programs for every patient',
            'Modern equipment and evidence-based therapy'
          ];

  data.content.conditions =
    lang === 'ru'
      ? hospital.conditions
      : lang === 'hy'
        ? [
            'Օստեոխոնդրոզ և պոզանոցի դեգեներատիվ փոփոխություններ',
            'Պոզանոցի հերնիա և պրոտրուզիաներ',
            'Սկոլիոզ, կիպոզ և կարգավորի խանգարումներ',
            'Ռադիկուլիտ և ցավային համակարգեր',
            'Հոդերի արթրոզ',
            'Պոզանոցի և հոդերի վնասվածքների հետևանքներ',
            'Սպորտային վնասվածքներ',
            'Քրոնիկական ցավեր մեջքում և պարանոցում'
          ]
        : [
            'Osteochondrosis and degenerative spine changes',
            'Herniated and bulging discs',
            'Scoliosis, kyphosis and posture disorders',
            'Radiculitis and pain syndromes',
            'Joint arthrosis',
            'Aftermath of spine and joint injuries',
            'Sports injuries',
            'Chronic back and neck pain'
          ];

  const eqHy = {
    'eq-traction': ['Տրակցիոն սեղան', 'Անվտանգ ձգում պոզանոցի համար'],
    'eq-physio': ['Ապարատային ֆիզիոթերապիա', 'Էլեկտրո-, ուլտրաձայնային և լազերային թերապիա'],
    'eq-shockwave': ['Շոկային ալիքի թերապիա', 'Քրոնիկական ցավերի բուժում'],
    'eq-ultrasound': ['Ուլտրաձայնային ախտորոշում', 'Հոդերի և ներքին օրգանների ուլտրաձայն']
  };
  const eqEn = {
    'eq-traction': ['Traction table', 'Safe spinal decompression'],
    'eq-physio': ['Device-based physiotherapy', 'Electro, ultrasound and laser therapy'],
    'eq-shockwave': ['Shock wave therapy', 'Treatment of chronic pain'],
    'eq-ultrasound': ['Ultrasound diagnostics', 'Joint and soft tissue imaging']
  };

  data.content.equipment = hospital.equipment.map((e) => {
    if (lang === 'ru') return { id: e.id, name: e.name, description: e.description };
    const tr = lang === 'hy' ? eqHy[e.id] : eqEn[e.id];
    return { id: e.id, name: tr?.[0] || e.name, description: tr?.[1] || e.description };
  });

  const progHy = {
    'prog-spine': ['Պոզանոցի բուժման ծրագիր', '2–4 շաբաթ'],
    'prog-postop': ['Վիրահատությունից հետո վերականգնում', '4–8 շաբաթ'],
    'prog-sport': ['Սպորտային վերականգնում', '3–6 շաբաթ'],
    'prog-posture': ['Կարգավորի ուղղում', '4–12 շաբաթ']
  };
  const progEn = {
    'prog-spine': ['Spine treatment program', '2–4 weeks'],
    'prog-postop': ['Post-surgical rehabilitation', '4–8 weeks'],
    'prog-sport': ['Sports rehabilitation', '3–6 weeks'],
    'prog-posture': ['Posture correction', '4–12 weeks']
  };

  data.content.programs = hospital.programs.map((p) => {
    if (lang === 'ru')
      return { id: p.id, name: p.name, duration: p.duration, description: p.description };
    const tr = lang === 'hy' ? progHy[p.id] : progEn[p.id];
    return {
      id: p.id,
      name: tr?.[0] || p.name,
      duration: tr?.[1] || p.duration,
      description: p.description
    };
  });

  data.content.reviews = hospital.reviews.map((r) => ({ ...r }));

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Patched', lang);
});
