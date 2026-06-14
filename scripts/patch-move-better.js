const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const IMG = {
  knee: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80',
  back: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
  bike: 'https://images.unsplash.com/photo-1517649763961-0c62306601b7?w=600&q=80',
  hands: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
  doctor: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80',
  hip: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
  sports: 'https://images.unsplash.com/photo-1517649763961-0c62306601b7?w=600&q=80',
  yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
  pool: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80',
  stretch: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
  exercise: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80',
  fitness: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&q=80',
  kids: 'https://images.unsplash.com/photo-1503454537845-2319abb1ba87?w=500&q=80',
  health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&q=80',
  mind: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80',
  injury: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80',
  video1: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
  video2: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
  video3: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80'
};

const moveBetterBase = {
  featured: {
    id: 'feat1',
    image: IMG.knee,
    category: 'Здоровье',
    title: 'Что нужно знать и делать до и после операции по замене коленного сустава',
    excerpt:
      'Знание того, чего ожидать до и после операции, помогает добиться лучших результатов и быстрее вернуться к активной жизни.'
  },
  sidebar: [
    {
      id: 'sb1',
      image: IMG.back,
      category: 'Здоровье',
      title: 'Боль в копчике: причины её возникновения и методы лечения'
    },
    {
      id: 'sb2',
      image: IMG.bike,
      category: 'Здоровье',
      title: 'Болит поясница? Возможно, дело в бедре'
    },
    {
      id: 'sb3',
      image: IMG.hands,
      category: 'Здоровье',
      title: 'Почему женщины подвержены более высокому риску развития артрита'
    }
  ],
  topicSections: [
    {
      id: 'hip',
      articles: [
        {
          id: 'hip1',
          image: IMG.doctor,
          category: 'Здоровье',
          title: 'Что нужно знать и делать до и после операции по замене тазобедренного сустава',
          excerpt: 'Знание того, чего ожидать, помогает добиться лучших результатов.',
          author: 'Врач-реабилитолог, «Առողջ ողնաշար»'
        },
        {
          id: 'hip2',
          image: IMG.sports,
          category: 'Здоровье',
          title: 'Занятия спортом после эндопротезирования: чего ожидать',
          excerpt: 'Большинство людей могут вернуться к спорту, но важен план до операции.',
          author: 'Ортопед, «Առողջ ողնաշար»'
        },
        {
          id: 'hip3',
          image: IMG.yoga,
          category: 'Здоровье',
          title: 'Что такое ягодичная тендинопатия и почему она часто встречается у женщин?',
          excerpt: 'Специалист объясняет, почему боль в бедре часто возникает в период менопаузы.',
          author: 'Физиотерапевт, «Առողջ ողնաշար»'
        }
      ]
    },
    {
      id: 'stretching',
      articles: [
        {
          id: 'st1',
          image: IMG.stretch,
          category: 'Фитнес',
          title: 'Упражнения для укрепления и растяжки мышц спины',
          excerpt: 'Простые упражнения от специалистов центра для ежедневной практики.',
          author: 'Физиотерапевт, «Առողջ ողնաշար»'
        },
        {
          id: 'st2',
          image: IMG.yoga,
          category: 'Разум и тело',
          title: '5 упражнений для растяжки поясницы',
          excerpt: 'Особенно полезно тем, кто много сидит за работой.',
          author: 'Реабилитация «Առողջ ողնաշար»'
        },
        {
          id: 'st3',
          image: IMG.stretch,
          category: 'Фитнес',
          title: 'Растяжка икроножных мышц стоя',
          excerpt: 'Базовое упражнение для профилактики боли в спине и ногах.',
          author: 'Реабилитация «Առողջ ողնաշար»'
        }
      ]
    },
    {
      id: 'backPain',
      articles: [
        {
          id: 'bp1',
          image: IMG.back,
          category: 'Фитнес',
          title: 'Болит поясница после тренировки? Вот как это предотвратить',
          excerpt: 'Несколько методов, которые помогут защитить поясницу во время нагрузок.',
          author: 'Врач ЛФК, «Առողջ ողնաշար»'
        },
        {
          id: 'bp2',
          image: IMG.pool,
          category: 'Здоровье',
          title: 'Лучшие виды упражнений при болях в спине',
          excerpt: 'Физические упражнения могут помочь — если они правильно подобраны.',
          author: 'Физиотерапевт, «Առողջ ողնաշար»'
        },
        {
          id: 'bp3',
          image: IMG.doctor,
          category: 'Здоровье',
          title: 'К какому врачу обратиться при болях в спине?',
          excerpt: 'С чего начать поиск облегчения и какой специалист вам нужен в первую очередь.',
          author: 'Ортопед, «Առողջ ողնաշար»'
        }
      ]
    }
  ],
  programsBanner: {
    badge: 'Программы просвещения и работы с населением',
    title: 'Движение и образование для вас',
    text: 'Новые программы! Улучшите здоровье с помощью занятий, мастер-классов, вебинаров и видео от «Առողջ ողնաշար». Многие из них бесплатны или недороги.',
    cta: 'Ознакомьтесь с программами',
    image: IMG.exercise
  },
  textArticles: [
    {
      id: 'ta1',
      title: 'Руководство по мышцам спины: анатомия и упражнения',
      excerpt: 'Понимание анатомии помогает эффективнее тренироваться и избегать травм.',
      author: 'Физиотерапевт, «Առողջ ողնաշար»'
    },
    {
      id: 'ta2',
      title: 'Анатомия мышц руки: познакомьтесь с основными группами',
      excerpt: 'Краткий обзор для тех, кто восстанавливается после травм верхних конечностей.',
      author: 'Реабилитолог, «Առողջ ողնաշար»'
    },
    {
      id: 'ta3',
      title: 'Руководство по работе с мышцами кора',
      excerpt: 'Сильный кор — основа здоровой осанки и стабильности позвоночника.',
      author: 'Инструктор ЛФК, «Առողջ ողնաշար»'
    }
  ],
  videos: [
    {
      id: 'v1',
      image: IMG.video1,
      title: 'Регенеративная медицина для здоровья мышц, костей и суставов',
      overlay: ''
    },
    {
      id: 'v2',
      image: IMG.video2,
      title: 'Изменение поведения ради здоровья: с чего начать',
      overlay: 'Beyond Resolutions'
    },
    {
      id: 'v3',
      image: IMG.video3,
      title: 'Питание для энергии: советы для активных женщин',
      overlay: 'Food to Fuel'
    }
  ],
  pressNews: [
    {
      id: 'pn1',
      source: 'ЗДОРОВЬЕ+',
      title: 'Такая поза во время сидения может принести пользу для здоровья в пожилом возрасте',
      author: 'Врач-реабилитолог, «Առողջ ողնաշար»'
    },
    {
      id: 'pn2',
      source: 'Пресс-центр',
      title: 'Центр представил новые программы реабилитации без операции',
      author: '«Առողջ ողնաշար»'
    },
    {
      id: 'pn3',
      source: 'МЕДИА',
      title: 'Консервативное лечение спины: когда оно работает лучше операции',
      author: 'Ортопед, «Առողջ ողնաշար»'
    }
  ],
  categories: [
    { id: 'fitness', image: IMG.fitness, label: 'Фитнес' },
    { id: 'injury', image: IMG.injury, label: 'Профилактика травм' },
    { id: 'kids', image: IMG.kids, label: 'Дети и спорт' },
    { id: 'health', image: IMG.health, label: 'Здоровье' },
    { id: 'mind', image: IMG.mind, label: 'Разум и тело' }
  ]
};

const pageI18n = {
  hy: {
    title: 'Move Better Feel Better — Առողջ ողնաշար',
    heroTitle: 'Լավ շարժվիր, լավ զգա',
    heroDesc:
      'Խորհուրդներ շարժունակության, ֆիզիկական ֆորմայի և առողջության բարելավման համար՝ մեր վերականգնողական կենտրոնի մասնագետներից։',
    sectionHip: 'Թազա-ազդրի առողջություն',
    sectionStretching: 'Ձգում',
    sectionBackPain: 'Մեջքի ցավ',
    sectionVideos: 'Նոր տեսանյութեր',
    sectionPress: 'Լուրերում',
    sectionReadMore: 'Ավելին կարդացեք',
    ctaCommunityTitle: 'Միացեք առողջ ապրելակերպի համայնքին',
    ctaCommunityDesc: 'Հոդվածներ, տեսանյութեր և ռեսուրսներ շարժման, ֆիթնեսի և առողջության մասին։',
    ctaEventsTitle: 'Գրանցվեք առաջիկա միջոցառումներին',
    ctaEventsDesc: 'Միացեք մեզ վիրտուալ դասերին, վեբինարներին և մաստեր-կլասներին։',
    ctaSubscribe: 'Բաժանորդագրվել'
  },
  ru: {
    title: 'Move Better Feel Better — Առողջ ողնաշար',
    heroTitle: 'Двигайся лучше, чувствуй себя лучше',
    heroDesc:
      'Советы по улучшению подвижности, физической формы и общего состояния здоровья от специалистов реабилитационного центра «Առողջ ողնաշար».',
    sectionHip: 'Здоровье тазобедренных суставов',
    sectionStretching: 'Растяжка',
    sectionBackPain: 'Боль в спине',
    sectionVideos: 'Новые видео',
    sectionPress: 'В новостях',
    sectionReadMore: 'Подробнее читайте в',
    ctaCommunityTitle: 'Присоединяйтесь к нашему сообществу любителей здорового образа жизни!',
    ctaCommunityDesc: 'Статьи, видео и ресурсы о движении, фитнесе и здоровье.',
    ctaEventsTitle: 'Зарегистрируйтесь для участия в предстоящих мероприятиях',
    ctaEventsDesc: 'Присоединяйтесь к нам на виртуальных занятиях, вебинарах, мастер-классах и многом другом.',
    ctaSubscribe: 'Подпишитесь сегодня!'
  },
  en: {
    title: 'Move Better Feel Better — Healthy Spine',
    heroTitle: 'Move better, feel better',
    heroDesc:
      'Tips for improving mobility, fitness, and overall health from specialists at Healthy Spine Rehabilitation Center.',
    sectionHip: 'Hip health',
    sectionStretching: 'Stretching',
    sectionBackPain: 'Back pain',
    sectionVideos: 'New videos',
    sectionPress: 'In the news',
    sectionReadMore: 'Read more in',
    ctaCommunityTitle: 'Join our healthy lifestyle community!',
    ctaCommunityDesc: 'Articles, videos, and resources about movement, fitness, and health.',
    ctaEventsTitle: 'Register for upcoming events',
    ctaEventsDesc: 'Join us for virtual classes, webinars, workshops, and more.',
    ctaSubscribe: 'Subscribe today!'
  }
};

const footerLink = {
  hy: 'Կարդացեք հոդվածները Move Better Feel Better կայքում',
  ru: 'Читайте статьи на сайте Move Better Feel Better',
  en: 'Read articles on Move Better Feel Better'
};

// Localized moveBetter content for hy/en (ru uses base)
const locMoveBetter = {
  hy: {
    featured: {
      category: 'Առողջություն',
      title: 'Ինչ պետք է իմանալ և անել թազա-ազդրի փոխարինման վիրահատությունից առաջ և հետո',
      excerpt: 'Իմանալը, թե ինչ սպասել, օգնում է ավելի լավ արդյունքների հասնել։'
    },
    programsBanner: {
      badge: 'Կրթական և հասարակության ծրագրեր',
      title: 'Շարժում և կրթություն ձեզ համար',
      text: 'Նոր ծրագրեր! Բարելավեք առողջությունը մարզումներով, վեբինարներով և տեսանյութերով։',
      cta: 'Դիտել ծրագրերը'
    }
  },
  en: {
    featured: {
      category: 'Health',
      title: 'What to know and do before and after knee replacement surgery',
      excerpt: 'Knowing what to expect helps you achieve better outcomes and recover faster.'
    },
    programsBanner: {
      badge: 'Education and community outreach programs',
      title: 'Movement and education for you',
      text: 'New programs! Improve your health with classes, webinars, and videos. Many are free or low-cost.',
      cta: 'Explore programs now'
    }
  }
};

const hospitalPath = path.join(root, 'data', 'hospital.json');
const hospital = JSON.parse(fs.readFileSync(hospitalPath, 'utf8'));
hospital.moveBetter = moveBetterBase;
fs.writeFileSync(hospitalPath, JSON.stringify(hospital, null, 2) + '\n', 'utf8');
console.log('OK hospital.json');

['hy', 'ru', 'en'].forEach((lang) => {
  const file = path.join(root, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.pages.moveBetter = pageI18n[lang];
  data.footer.linkArticles = footerLink[lang];
  if (!data.content) data.content = {};
  if (locMoveBetter[lang]) {
    data.content.moveBetter = deepMerge(moveBetterBase, locMoveBetter[lang]);
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('OK', lang);
});

function deepMerge(base, patch) {
  const out = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepMerge(base[k] || {}, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
