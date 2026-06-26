/**
 * Merge doctor locale overlays (doc-1..6) into lang/*.json without removing doc-gohar/doc-elya.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const hospital = JSON.parse(fs.readFileSync(path.join(root, 'data/hospital.json'), 'utf8'));
const coreDoctors = hospital.doctors || [];

const enCoreDoctors = [
  {
    id: 'doc-gohar',
    name: 'Gohar',
    role: 'Manual therapist, scoliosis and spine specialist',
    experience: '10+ years',
    bio: 'Specialist in conservative spine and joint care, pediatric scoliosis, and manual therapy.'
  },
  {
    id: 'doc-elya',
    name: 'Elya Simon Tarkhanyan',
    role: 'Social psychologist',
    experience: '15+ years',
    bio: 'Social, developmental and educational psychology; counseling for patients and families.'
  }
];

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

const ruDoctors = [
  {
    id: 'doc-1',
    name: 'Иванова Елена Сергеевна',
    role: 'Врач мануальной терапии',
    experience: '22 года',
    bio: 'Специалист по мануальной терапии и лечению заболеваний позвоночника.'
  },
  {
    id: 'doc-2',
    name: 'Петров Андрей Николаевич',
    role: 'Ортопед-травматолог',
    experience: '15 лет',
    bio: 'Консультации и лечение заболеваний позвоночника и суставов.'
  },
  {
    id: 'doc-3',
    name: 'Смирнова Ольга Викторовна',
    role: 'Врач ЛФК',
    experience: '12 лет',
    bio: 'Составляет индивидуальные программы лечебной физкультуры и реабилитации.'
  },
  {
    id: 'doc-4',
    name: 'Козлов Дмитрий Игоревич',
    role: 'Физиотерапевт',
    experience: '18 лет',
    bio: 'Специалист по аппаратной физиотерапии при болях в спине и суставах.'
  },
  {
    id: 'doc-5',
    name: 'Морозова Анна Петровна',
    role: 'Невролог',
    experience: '10 лет',
    bio: 'Диагностика и лечение неврологических проявлений заболеваний позвоночника.'
  },
  {
    id: 'doc-6',
    name: 'Волков Сергей Александрович',
    role: 'Врач УЗ-диагностики',
    experience: '14 лет',
    bio: 'Ультразвуковая диагностика суставов и мягких тканей.'
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

const overlays = { hy: hyDoctors, ru: ruDoctors, en: enDoctors };

function mergeDoctors(existing, patch) {
  const map = new Map((patch || []).map((d) => [d.id, d]));
  const out = (existing || []).map((d) => {
    const tr = map.get(d.id);
    return tr ? { ...d, ...tr } : d;
  });
  for (const d of patch || []) {
    if (!out.some((x) => x.id === d.id)) out.push(d);
  }
  return out;
}

for (const lang of ['hy', 'ru', 'en']) {
  const file = path.join(root, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data.content) data.content = {};
  const existing = data.content.doctors || [];
  const preserved = existing.filter((d) => d.id === 'doc-gohar' || d.id === 'doc-elya');
  const core =
    preserved.length > 0
      ? preserved
      : lang === 'hy'
        ? coreDoctors
        : lang === 'en'
          ? enCoreDoctors
          : coreDoctors;
  data.content.doctors = mergeDoctors(mergeDoctors(overlays[lang], core), []);

  if (!data.pages.departments.seoDescription) {
    data.pages.departments.seoDescription =
      lang === 'hy'
        ? 'Պոզանոցի, հոդերի և վերականգնման ծառայություններ «Առողջ ողնաշար» կենտրոնում։'
        : lang === 'ru'
          ? 'Услуги по лечению позвоночника, суставов и реабилитации в центре «Առողջ ողնաշար».'
          : 'Spine, joint and rehabilitation services at Healthy Spine center.';
  }

  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log('Updated', file, '— doctors:', data.content.doctors.length);
}
