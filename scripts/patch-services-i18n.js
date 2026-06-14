const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const hospital = JSON.parse(fs.readFileSync(path.join(root, 'data/hospital.json'), 'utf8'));

const hyNames = {
  'consult-spine': 'Օրթոպեդ-տրավմատոլոգի խորհրդատվություն',
  'consult-neuro': 'Նյարդաբանի խորհրդատվություն',
  'manual-therapy': 'Մանուալ թերապիա',
  osteopathy: 'Օստեոպատիա',
  physiotherapy: 'Ֆիզիոթերապիա',
  kinesiotherapy: 'Բուժիչ ֆիզկուլտուրա (ԼՖԿ)',
  massage: 'Բուժական մասաժ',
  acupuncture: 'Իգլորեֆլեքսոթերապիա',
  electrotherapy: 'Էլեկտրոթերապիա',
  'ultrasound-therapy': 'Ուլտրաձայնային թերապիա',
  magnetotherapy: 'Մագնիսաթերապիա',
  'laser-therapy': 'Լազերային թերապիա',
  shockwave: 'Շոկային ալիքի թերապիա',
  traction: 'Տրակցիոն թերապիա',
  taping: 'Կինեզիոտեյպավորում',
  'hernia-treatment': 'Պոզանոցի հերնիայի բուժում',
  osteochondrosis: 'Օստեոխոնդրոզի բուժում',
  scoliosis: 'Սկոլիոզի բուժում',
  protrusion: 'Պրոտրուզիայի բուժում',
  radiculitis: 'Ռադիկուլիտի բուժում',
  arthrosis: 'Հոդերի արթրոզի բուժում',
  posture: 'Կարգավորի ուղղում',
  'block-injection': 'Բլոկադաներ և շրջանարկումներ',
  'rehab-trauma': 'Վերականգնում վնասվածքից հետո',
  'rehab-surgery': 'Վերականգնում վիրահատությունից հետո',
  'sports-rehab': 'Սպորտային վերականգնում',
  'pediatric-spine': 'Մանկական օրթոպեդիա և սկոլիոզ',
  'ultrasound-diag': 'Ուլտրաձայնային ախտորոշում',
  xray: 'Ռենտգենոգրաֆիա',
  'mri-referral': 'ՄՌՏ (ուղղորդում)'
};

const enNames = {
  'consult-spine': 'Orthopedic consultation',
  'consult-neuro': 'Neurologist consultation',
  'manual-therapy': 'Manual therapy',
  osteopathy: 'Osteopathy',
  physiotherapy: 'Physiotherapy',
  kinesiotherapy: 'Therapeutic exercise (kinesiotherapy)',
  massage: 'Therapeutic massage',
  acupuncture: 'Acupuncture',
  electrotherapy: 'Electrotherapy',
  'ultrasound-therapy': 'Ultrasound therapy',
  magnetotherapy: 'Magnetotherapy',
  'laser-therapy': 'Laser therapy',
  shockwave: 'Shock wave therapy',
  traction: 'Spinal traction therapy',
  taping: 'Kinesio taping',
  'hernia-treatment': 'Spinal disc hernia treatment',
  osteochondrosis: 'Osteochondrosis treatment',
  scoliosis: 'Scoliosis treatment',
  protrusion: 'Disc protrusion treatment',
  radiculitis: 'Radiculitis treatment',
  arthrosis: 'Joint arthrosis treatment',
  posture: 'Posture correction',
  'block-injection': 'Nerve blocks and injections',
  'rehab-trauma': 'Rehabilitation after injury',
  'rehab-surgery': 'Post-surgical rehabilitation',
  'sports-rehab': 'Sports rehabilitation',
  'pediatric-spine': 'Pediatric orthopedics and scoliosis',
  'ultrasound-diag': 'Ultrasound diagnostics',
  xray: 'X-ray imaging',
  'mri-referral': 'MRI (referral)'
};

const hyCategories = {
  consult: 'Խորհրդատվություններ',
  therapy: 'Թերապիա',
  treatment: 'Բուժում',
  rehab: 'Ռեաբիլիտացիա',
  diagnostics: 'Ախտորոշում'
};

const enCategories = {
  consult: 'Consultations',
  therapy: 'Therapy',
  treatment: 'Treatment',
  rehab: 'Rehabilitation',
  diagnostics: 'Diagnostics'
};

function mapDepartments(lang) {
  return hospital.departments.map((d) => {
    const name =
      lang === 'hy' ? hyNames[d.id] || d.name : lang === 'en' ? enNames[d.id] || d.name : d.name;
    return {
      id: d.id,
      name,
      description: d.description,
      services: d.services
    };
  });
}

function mapCategories(lang) {
  return hospital.serviceCategories.map((c) => ({
    id: c.id,
    name:
      lang === 'hy'
        ? hyCategories[c.id] || c.name
        : lang === 'en'
          ? enCategories[c.id] || c.name
          : c.name
  }));
}

const hyDoctors = [
  {
    id: 'doc-1',
    name: 'Ելենա Իվանովա',
    role: 'Մանուալ թերապևտ',
    experience: '22 տարի',
    bio: 'Մանուալ թերապիայի և պոզանոցի հիվանդությունների բուժման մասնագետ։'
  },
  {
    id: 'doc-2',
    name: 'Անդրեյ Պետրով',
    role: 'Օրթոպեդ-տրավմատոլոգ',
    experience: '15 տարի',
    bio: 'Պոզանոցի և հոդերի հիվանդությունների խորհրդատվություն և բուժում։'
  },
  {
    id: 'doc-3',
    name: 'Օլգա Սմիրնովա',
    role: 'ԼՖԿ բժիշկ',
    experience: '12 տարի',
    bio: 'Կազմում է բուժիչ ֆիզկուլտուրայի և վերականգնման անհատական ծրագրեր։'
  },
  {
    id: 'doc-4',
    name: 'Դմիտրի Կոզլով',
    role: 'Ֆիզիոթերապևտ',
    experience: '18 տարի',
    bio: 'Ապարատային ֆիզիոթերապիայի մասնագետ՝ մեջքի և հոդերի ցավի դեպքում։'
  },
  {
    id: 'doc-5',
    name: 'Աննա Մորոզովա',
    role: 'Նյարդաբան',
    experience: '10 տարի',
    bio: 'Պոզանոցի հիվանդությունների նյարդաբանական արտահայտությունների ախտորոշում և բուժում։'
  },
  {
    id: 'doc-6',
    name: 'Սերգեյ Վոլկով',
    role: 'Ուլտրաձայնային ախտորոշ',
    experience: '14 տարի',
    bio: 'Հոդերի և ներքին օրգանների ուլտրաձայնային ախտորոշում։'
  }
];

const enDoctors = [
  {
    id: 'doc-1',
    name: 'Elena Ivanova',
    role: 'Manual therapist',
    experience: '22 years',
    bio: 'Specialist in manual therapy and spinal conditions.'
  },
  {
    id: 'doc-2',
    name: 'Andrey Petrov',
    role: 'Orthopedic traumatologist',
    experience: '15 years',
    bio: 'Consultation and treatment of spine and joint disorders.'
  },
  {
    id: 'doc-3',
    name: 'Olga Smirnova',
    role: 'Kinesiotherapy physician',
    experience: '12 years',
    bio: 'Designs individual exercise and rehabilitation programs.'
  },
  {
    id: 'doc-4',
    name: 'Dmitry Kozlov',
    role: 'Physiotherapist',
    experience: '18 years',
    bio: 'Expert in device-based physiotherapy for back and joint pain.'
  },
  {
    id: 'doc-5',
    name: 'Anna Morozova',
    role: 'Neurologist',
    experience: '10 years',
    bio: 'Diagnosis and treatment of neurological symptoms in spinal disease.'
  },
  {
    id: 'doc-6',
    name: 'Sergey Volkov',
    role: 'Ultrasound specialist',
    experience: '14 years',
    bio: 'Ultrasound diagnostics of joints and soft tissues.'
  }
];

const hospitalPatch = {
  hy: {
    tagline: 'Պոզանոց, հոդեր և շարժական համակարգ',
    about:
      '«Առողջ ողնաշար» վերականգնողական կենտրոնը մասնագիտացված օգնություն է ապահովում պոզանոցի, հոդերի և շարժական համակարգի հիվանդությունների դեպքում։',
    mission:
      'Վերականգնել շարժունակությունը և կյանքի որակը ապացուցված վերականգնողական մեթոդներով։',
    stats: [
      { value: 30, suffix: '+', label: 'Ծառայություններ' },
      { value: 15, suffix: '+', label: 'Մասնագետներ' },
      { value: 98, suffix: '%', label: 'Գոհ հիվանդներ' },
      { value: 10, suffix: '+', label: 'Տարիների փորձ' }
    ]
  },
  ru: {
    tagline: 'Позвоночник, суставы и опорно-двигательный аппарат',
    about: hospital.hospital.about,
    mission: hospital.hospital.mission,
    stats: hospital.hospital.stats
  },
  en: {
    tagline: 'Spine, joints and musculoskeletal care',
    about:
      'Healthy Spine rehabilitation center provides specialized care for spine, joint and musculoskeletal conditions using conservative treatment and individual recovery programs.',
    mission:
      'Restore mobility and quality of life through evidence-based rehabilitation and a multidisciplinary approach.',
    stats: [
      { value: 30, suffix: '+', label: 'Services' },
      { value: 15, suffix: '+', label: 'Specialists' },
      { value: 98, suffix: '%', label: 'Satisfied patients' },
      { value: 10, suffix: '+', label: 'Years of experience' }
    ]
  }
};

['hy', 'ru', 'en'].forEach((lang) => {
  const file = path.join(root, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  data.nav.departments =
    lang === 'hy' ? 'Ծառայություններ' : lang === 'en' ? 'Services' : 'Услуги';
  data.common.allDepartments =
    lang === 'hy'
      ? 'Բոլոր ծառայությունները'
      : lang === 'en'
        ? 'All services'
        : 'Все услуги';

  data.pages.home.servicesTitle =
    lang === 'hy' ? 'Մեր ծառայությունները' : lang === 'en' ? 'Our services' : 'Наши услуги';
  data.pages.home.servicesDesc =
    lang === 'hy'
      ? 'Կոնսերվատիվ բուժում, ֆիզիոթերապիա և վերականգնողական ծրագրեր պոզանոցի և հոդերի համար։'
      : lang === 'en'
        ? 'Conservative treatment, physiotherapy and rehabilitation programs for spine and joints.'
        : 'Консервативное лечение, физиотерапия и реабилитационные программы для позвоночника и суставов.';

  data.pages.departments.title =
    lang === 'hy'
      ? 'Ծառայություններ — Առողջ ողնաշար'
      : lang === 'en'
        ? 'Services — Healthy Spine'
        : 'Услуги — Առողջ ողնաշար';
  data.pages.departments.heroTitle =
    lang === 'hy' ? 'Ծառայություններ' : lang === 'en' ? 'Services' : 'Услуги центра';
  data.pages.departments.heroDesc =
    lang === 'hy'
      ? 'Բոլոր ծառայությունները պոզանոցի, հոդերի և վերականգնման ուղղությամբ'
      : lang === 'en'
        ? 'Full range of spine, joint and rehabilitation services'
        : 'Полный перечень услуг по лечению позвоночника, суставов и реабилитации';

  data.pages.appointment.department =
    lang === 'hy' ? 'Ծառայություն' : lang === 'en' ? 'Service' : 'Услуга';
  data.pages.appointment.step1 =
    lang === 'hy'
      ? 'Ընտրեք ծառայությունը և բժշկին (ըստ ցանկության)։'
      : lang === 'en'
        ? 'Choose a service and doctor (optional).'
        : 'Выберите услугу и врача (необязательно).';
  data.admin.colDept =
    lang === 'hy' ? 'Ծառայություն' : lang === 'en' ? 'Service' : 'Услуга';

  data.content.hospital = { ...data.content.hospital, ...hospitalPatch[lang] };
  data.content.serviceCategories = mapCategories(lang);
  data.content.departments = mapDepartments(lang);
  data.content.doctors =
    lang === 'hy' ? hyDoctors : lang === 'en' ? enDoctors : hospital.doctors.map((d) => ({
        id: d.id,
        name: d.name,
        role: d.role,
        experience: d.experience,
        bio: d.bio
      }));

  data.content.advantages = hospital.advantages.map((a, i) => {
    const icons = a.icon;
    if (lang === 'hy') {
      const titles = [
        'Ժամանակակից կենտրոն',
        'Փորձառու մասնագետներ',
        'Ճշգրիտ ախտորոշում',
        'Առանց վիրահատության'
      ];
      const texts = [
        'Միջազգային ստանդարտներին համապատասխան սարքավորում և հարմարավետ պայմաններ։',
        'Պոզանոցի և հոդերի ոլորտում բազմամյա փորձ ունեցող մասնագետներ։',
        'Գործիքային հետազոտություններ ցավի պատճառը ճշգրիտ որոշելու համար։',
        'Կոնսերվատիվ բուժման և վերականգնման մեթոդները առաջնահերթ են։'
      ];
      return { icon: icons, title: titles[i], text: texts[i] };
    }
    if (lang === 'en') {
      const titles = [
        'Modern center',
        'Experienced specialists',
        'Accurate diagnostics',
        'Without surgery'
      ];
      const texts = [
        'Equipment meeting international standards and comfortable patient conditions.',
        'Physicians and rehabilitologists with years of practice in spine and joints.',
        'Imaging studies to accurately determine the cause of pain.',
        'Conservative treatment and recovery methods are our priority.'
      ];
      return { icon: icons, title: titles[i], text: texts[i] };
    }
    return a;
  });

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Updated', file);
});
