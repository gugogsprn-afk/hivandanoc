/**
 * Apply hospital team profiles and services from Gohar (June 2026).
 * Run: node scripts/apply-gohar-content.js && node scripts/build-embed.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const doctors = [
  {
    id: 'doc-gohar',
    name: 'Գոհար',
    role: 'Մանուալ թերապևտ, սկոլիոզի և ողնաշարի մասնագետ',
    departmentId: 'manual-therapy',
    location: 'Երևան, «Առողջ ողնաշար»',
    isSurgeon: false,
    experience: '10+ տարի',
    image: 'images/doctors/placeholder.svg',
    bio:
      'Երևանի Մխիթար Հերացու անվան պետական բժշկական համալսարան (դիպլոմ), օրդինատուրա՝ մանուալ թերապիա; ԵՊԲՀ՝ օրդինատուրա (ընթացքում)՝ ֆիզիկական ռեաբիլիտացիա և ֆիզիոթերապիա; միջազգային վերապատրաստում (ԱՄՆ, Գերմանիա). ISICO Institute (Milan)՝ մանկական իդիոպատիկ սկոլիոզի կոնսերվատիվ բուժում; SIAS, LION, BSPTS, KATARINA SCHROTH մեթոդաբանություններ; Medical Skills Courses (London); Osteo World School; Anterpen Back Pain Management Institute. Անդամ՝ Ցավի բժշկության ասոցիացիա, SOSORT. Մասնագիտացում՝ ողնաշարի և հոդերի կոնսերվատիվ բուժում, մանկական սկոլիոզ և կորսետավորում, սագիտալ խանգարումներ, մանուալ թերապիա, օստեոպաթիա, կինեզոթերապիա.'
  },
  {
    id: 'doc-elya',
    name: 'Էլյա Սիմոնի Թարխանյան',
    role: 'Սոցիալական հոգեբան',
    departmentId: 'consult-neuro',
    location: 'Երևան, «Առողջ ողնաշար»',
    isSurgeon: false,
    experience: '15+ տարի',
    image: 'images/doctors/placeholder.svg',
    bio:
      'ՀՊՄՀ՝ սոցիալական հոգեբանության բաժին (դիպլոմ); Մեհրաբյանի անվան բժշկական քոլեջ (2026). Աշխատանքային փորձ՝ Խաչատուր Աբովյանի անվան հայկական պետական մանկավարժական համալսարան (2009–ից առ այսօր). Գիտական հետաքրքրություններ՝ սոցիալական, տարիքային և մանկավարժական հոգեբանություն. Մասնակցություն միջազգային դասընթացներին (Լուցեռն, Շվեյցարիա, 2026). Լեզուներ՝ հայերեն, ռուսերեն, անգլերեն.'
  }
];

const departmentUpdates = {
  'manual-therapy': {
    name: 'Մանուալ թերապիա',
    description:
      'Պարանոցի, կրծքային, գոտկային և ողնաշարային խնդիրների բուժման նպատակով ձեռքի տեխնիկաներ.',
    services: ['Սեգմենտար մոբիլիզացիա', 'Փափուկ մանուալ տեխնիկաներ', 'Բուժման կուրս']
  },
  'consult-neuro': {
    name: 'Նյարդաբանական և նյարդավիրաբուժական խորհրդատվություն',
    description: 'Նյարդաբանական ախտորոշում և խորհրդատվություն պոզանոցի և շարժական համակարգի խնդիրների դեպքում.',
    services: ['Նյարդաբանական զննում', 'Խորհրդատվություն', 'Հետազոտությունների նշանակում']
  },
  'physiotherapy': {
    name: 'Ֆիզիոթերապևտիկ բազմապրոֆիլ բուժումներ',
    description: 'Ապարատային ֆիզիոթերապիայի համակցված ծրագրեր ցավի, բորբոքման և շարժունակության վերականգնման համար.',
    services: ['Էլեկտրոթերապիա', 'Ուլտրաձայն', 'Մագնիսաթերապիա', 'Լազեր']
  },
  'massage': {
    name: 'Բուժական մերսում',
    description: 'Բուժական մերսում մկանա-կմախքային համակարգի և հոդերի համար.',
    services: ['Դասական մասաժ', 'Բուժական մերսում', 'Սպորտային մասաժ']
  },
  'osteopathy': {
    name: 'Օստեոպաթիա',
    description: 'Օստեոպաթիական և բիոդինամիկ մոտեցում շարժական համակարգի վերականգնման համար.',
    services: ['Օստեոպատիկ ընդունելություն', 'Բիոդինամիկա', 'Բուժման կուրս']
  },
  'shockwave': {
    name: 'Հարվածալիքային թերապիա',
    description: 'Շոկային ալիքի թերապիա քրոնիկական ցավերի և մկանա-կմախքային խնդիրների դեպքում.',
    services: ['Ողնաշար', 'Հոդեր', 'Ներքին օրգաններ']
  },
  'magnetotherapy': {
    name: 'Մագնիտոթերապիա',
    description: 'Մագնիսաթերապիա (4–7 տեսակ) ցավի նվազեցման և վերականգնման համար.',
    services: ['Տեղային', 'Ընդհանուր', 'Բազմատեսակ մագնիսաթերապիա']
  },
  'laser-therapy': {
    name: 'Լազերոթերապիա',
    description: 'Բարձր և միջին ինտենսիվության լազերային թերապիա.',
    services: ['Բարձր ինտենսիվություն', 'Միջին ինտենսիվություն']
  },
  'electrotherapy': {
    name: 'Էլեկտրամկանային և էլեկտրոթերապիա',
    description: 'Էլեկտրամկանային և էլեկտրոթերապևտիկ միջամտություններ, ինտերֆերենց հոսքեր.',
    services: ['Ինտերֆերենց հոսքեր', 'Էլեկտրամկանային ստիմուլյացիա', 'Էլեկտրոթերապիա']
  },
  'ultrasound-therapy': {
    name: 'Գերձայնային (ուլտրաձայնային) բուժում',
    description: 'Ուլտրաձայնային թերապիա մկանա-կմախքային և հոդային խնդիրների համար.',
    services: ['Ուլտրաձայն պոզանոց', 'Ուլտրաձայն հոդեր']
  },
  'scoliosis': {
    name: 'SIAS սեղմումով մանկական սկոլիոզի բուժում',
    description: 'Մանկական իդիոպատիկ սկոլիոզի կոնսերվատիվ բուժում՝ SIAS, Schroth և կորսետավորման մեթոդներով.',
    services: ['SIAS մեթոդ', 'Schroth', 'Կորսետավորում']
  },
  'pediatric-spine': {
    name: 'Մանկական սկոլիոզ և կորսետավորում',
    description: 'Մանկական սկոլիոզի դիտարկում, կորսետավորում (օրթեզավորում) և կինեզոթերապիա.',
    services: ['Զննում', 'Կորսետ', 'ԼՖԿ']
  },
  'hernia-treatment': {
    name: 'Ողնաշարի միջողնային սկավառակի ճողվածքի կոնսերվատիվ բուժում',
    description: 'Գրիժայի (հերնիայի) կոնսերվատիվ բուժում առանց վիրահատության.',
    services: ['Կոնսերվատիվ թերապիա', 'Ֆիզիոթերապիա', 'Ռեաբիլիտացիա']
  },
  'rehab-trauma': {
    name: 'Ողնաշարի սեգմենտների հետտրավմատիկ վերականգնում',
    description: 'Պոզանոցի և հոդերի վնասվածքներից հետո փուլային վերականգնում.',
    services: ['Անհատական ծրագիր', 'Փուլային բեռնում', 'Բժշկի վերահսկողություն']
  },
  'rehab-surgery': {
    name: 'Հետվիրահատական վերականգնում',
    description: 'Վիրահատություններից հետո ողնաշարի և հոդերի վերականգնում.',
    services: ['Վաղ փուլ', 'Ուշ փուլ', 'Ամբուլատոր ռեաբիլիտացիա']
  },
  'arthrosis': {
    name: 'Հոդերի շարժման ակտիվության վերականգնում',
    description: 'Հոդերի լիգամենտային և հենաշարժողական խնդիրների վերականգնում.',
    services: ['Լիգամենտներ', 'Շարժունակություն', 'ԼՖԿ']
  },
  'sports-rehab': {
    name: 'Սպորտային վնասվածքների բուժում',
    description: 'Սպորտային վնասվածքներ, ջլաբորբ, մկանացավ, հոդաբորբի բուժում և վերականգնում.',
    services: ['Սպորտային վնասվածք', 'Ջլաբորբ', 'Հոդաբորբ']
  },
  'posture': {
    name: 'Պարանոցային հիպերլորդոզի և հիպերկիֆոզի բուժում',
    description: 'Կուզիկության (կիբոզ) և պարանոցի հիպերլորդոզի կոնսերվատիվ բուժում, կարգավորի ուղղում.',
    services: ['Կարգավորի գնահատում', 'ԼՖԿ', 'Մանուալ թերապիա']
  },
  'pediatric-spine-teen': {
    name: 'Պատանեկան անթափանց և շարժողական դիսֆունկցիաների վերականգնում',
    description: 'Պատանիների շարժողական դիսֆունկցիաների և անթափանց խնդիրների վերականգնում.',
    services: ['Գնահատում', 'Կինեզոթերապիա', 'Դիտարկում']
  }
};

const newDepartments = [
  {
    id: 'infrared-laser',
    category: 'therapy',
    name: 'Ինֆրակարմիր լազերային թերապիա',
    icon: '🔴',
    description: 'Ինֆրակարմիր լազերային թերապիա ցավի և բորբոքման բուժման համար.',
    services: ['Ինֆրակարմիր լազեր', 'Տեղային ազդեցություն']
  },
  {
    id: 'compression-therapy',
    category: 'therapy',
    name: 'Բազմաֆունկցիոնալ սեղմող թերապիա',
    icon: '🩹',
    description: 'Բազմաֆունկցիոնալ սեղմող թերապիա լիմֆայի և մկանների վերականգնման համար.',
    services: ['Սեղմող թերապիա', 'Բազմաֆունկցիոնալ ռեժիմներ']
  },
  {
    id: 'high-frequency',
    category: 'therapy',
    name: 'Գերբարձր հաճախականությամբ թերապևտիկ միջամտություն',
    icon: '〰',
    description: 'ԳԲՀ թերապիա ցավի և բորբոքման դեպքում.',
    services: ['ԳԲՀ թերապիա']
  },
  {
    id: 'pain-inflammation',
    category: 'therapy',
    name: 'Ցավային երևույթների և բորբոքման բուժում',
    icon: '💊',
    description: 'Ցավի և բորբոքման համակցված բուժում ֆիզիոթերապևտիկ մեթոդներով.',
    services: ['Ցավի կառավարում', 'Հակաբորբոքային թերապիա']
  }
];

const hospitalPath = path.join(root, 'data', 'hospital.json');
const hospital = JSON.parse(fs.readFileSync(hospitalPath, 'utf8'));

hospital.doctors = doctors;
hospital.hospital.about =
  '«Առողջ ողնաշար» վերականգնողական կենտրոնը մատուցում է ողնաշարի, հոդերի և շարժական համակարգի կոնսերվատիվ բուժում՝ մանուալ թերապիա, ֆիզիոթերապիա, սկոլիոզի բուժում և վերականգնում:';
hospital.hospital.mission =
  'Վերականգնել շարժունակությունը և կյանքի որակը՝ կիրառելով ապացուցված ռեաբիլիտացիոն մեթոդներ և մուլտիդիսցիպլինար մոտեցում:';

for (const dept of hospital.departments) {
  const patch = departmentUpdates[dept.id];
  if (patch) Object.assign(dept, patch);
}

const existingIds = new Set(hospital.departments.map((d) => d.id));
for (const dept of newDepartments) {
  if (!existingIds.has(dept.id)) hospital.departments.push(dept);
}

if (!hospital.departments.find((d) => d.id === 'pediatric-spine-teen')) {
  hospital.departments.push({
    id: 'pediatric-spine-teen',
    category: 'rehab',
    name: departmentUpdates['pediatric-spine-teen'].name,
    icon: '👧',
    description: departmentUpdates['pediatric-spine-teen'].description,
    services: departmentUpdates['pediatric-spine-teen'].services
  });
}

fs.writeFileSync(hospitalPath, JSON.stringify(hospital, null, 2) + '\n', 'utf8');
console.log('Updated hospital.json');

function mergeLang(code) {
  const langPath = path.join(root, 'lang', `${code}.json`);
  const lang = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  lang.content = lang.content || {};
  lang.content.doctors = doctors.map((d) => ({
    id: d.id,
    name: d.name,
    role: d.role,
    experience: d.experience,
    bio: d.bio
  }));

  const ruNames = {
    'doc-gohar': {
      name: 'Гохар',
      role: 'Врач мануальной терапии, специалист по сколиозу и позвоночнику',
      bio: doctors[0].bio
    },
    'doc-elya': {
      name: 'Эля Симони Тарханян',
      role: 'Социальный психолог',
      bio: doctors[1].bio
    }
  };
  const enNames = {
    'doc-gohar': {
      name: 'Gohar',
      role: 'Manual therapist, scoliosis and spine specialist',
      bio:
        'Yerevan State Medical University (diploma), residency in manual therapy; residency in progress in physical rehabilitation and physiotherapy; international training (USA, Germany). ISICO Institute (Milan); SOSORT member. Specializations: conservative spine and joint treatment, pediatric scoliosis and bracing, manual therapy, osteopathy, kinesiotherapy.'
    },
    'doc-elya': {
      name: 'Elya Simoni Tarkhanyan',
      role: 'Social psychologist',
      bio:
        'YSU social psychology (diploma). Experience at Armenian State Pedagogical University. Interests: social, developmental and educational psychology. Languages: Armenian, Russian, English.'
    }
  };

  if (code === 'ru') {
    lang.content.doctors = lang.content.doctors.map((d) => ({ ...d, ...ruNames[d.id] }));
  }
  if (code === 'en') {
    lang.content.doctors = lang.content.doctors.map((d) => ({ ...d, ...enNames[d.id] }));
  }

  for (const dept of lang.content.departments || []) {
    const patch = departmentUpdates[dept.id];
    if (patch) {
      dept.name = patch.name;
      dept.description = patch.description;
      dept.services = patch.services;
    }
  }

  for (const nd of newDepartments) {
    if (!lang.content.departments.find((d) => d.id === nd.id)) {
      lang.content.departments.push({
        id: nd.id,
        name: nd.name,
        description: nd.description,
        services: nd.services
      });
    }
  }

  if (lang.content.hospital) {
    lang.content.hospital.about = hospital.hospital.about;
    lang.content.hospital.mission = hospital.hospital.mission;
  }

  fs.writeFileSync(langPath, JSON.stringify(lang, null, 2) + '\n', 'utf8');
  console.log('Updated lang/' + code + '.json');
}

['hy', 'ru', 'en'].forEach(mergeLang);
console.log('Done.');
