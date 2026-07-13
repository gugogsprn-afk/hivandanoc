#!/usr/bin/env node
/**
 * Generate condition-specific RU/EN overlays from embedded translations.
 * Output: server/services/condition-i18n-expanded.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const CLINIC_RU = '«Здоровый позвоночник»';
const CLINIC_EN = 'Healthy Spine';

const CONDITIONS = {
  'back-pain-treatment': {
    ru: {
      intro:
        'Боль в спине — частая причина обращения в реабилитационный центр. Возможные причины включают мышечное напряжение, длительное сидение или проблемы с дисками. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку и программы восстановления после осмотра специалиста. Материал не заменяет медицинский совет; результаты могут отличаться.',
      symptoms: [
        'Боль в спине или пояснице, с одной или обеих сторон',
        'Усиление боли при движении или смене положения',
        'Мышечная скованность или напряжение',
        'Ограничение подвижности',
        'Боль, которая может отдавать в ногу или ягодицу (по результатам оценки)'
      ],
      whenToSeek: [
        'Если боль сохраняется более нескольких дней и не уменьшается после отдыха',
        'Если боль мешает сну, работе или повседневной активности',
        'Если нарастают неврологические симптомы (онемение, слабость)',
        'Если боль началась после травмы, падения или подъёма тяжести',
        'При сильной боли, потере контроля мочеиспускания или стула — обратитесь за экстренной помощью'
      ],
      servicesIntro:
        'При боли в спине после оценки специалиста могут рассматриваться следующие реабилитационные услуги. Они часто применяются как часть консервативного плана и могут сочетаться между собой.'
    },
    en: {
      intro:
        'Back pain is a common reason for visits to a rehabilitation center. Causes may include muscle strain, prolonged sitting, or disc-related issues. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment and recovery programs after specialist evaluation. This page is informational and does not replace medical advice; results may vary.',
      symptoms: [
        'Pain in the back or lumbar area, on one or both sides',
        'Pain worsened by movement or position changes',
        'Muscle stiffness or tension',
        'Limited mobility',
        'Pain that may radiate to the leg or buttock (per assessment)'
      ],
      whenToSeek: [
        'If pain lasts more than a few days and does not improve with rest',
        'If pain interferes with sleep, work, or daily activity',
        'If neurological symptoms (numbness, weakness) are increasing',
        'If pain started after injury, a fall, or heavy lifting',
        'For severe pain or loss of bladder or bowel control — seek emergency care'
      ],
      servicesIntro:
        'For back pain, the following rehabilitation services may be considered after specialist assessment. They are often used as part of a conservative plan and may be combined.'
    }
  },
  'neck-pain-treatment': {
    ru: {
      intro:
        'Боль в шее может быть связана с мышечным напряжением, осанкой, длительной работой за компьютером или другими факторами. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку и программы восстановления без постановки диагноза по сайту или обещаний излечения.',
      symptoms: [
        'Скованность или боль в шее при движении',
        'Дискомфорт при повороте головы или смене положения',
        'Напряжение в плечах или верхней части спины',
        'Ощущение «тяжести» головы',
        'Головные боли на фоне боли в шее — требуют оценки'
      ],
      whenToSeek: [
        'Если боль в шее не уменьшается в течение нескольких дней',
        'Если боль сопровождается онемением или слабостью в руках',
        'Если боль началась после травмы или ДТП',
        'Если боль мешает сну, работе или вождению',
        'При сильной головной боли, нарушении зрения или лихорадке — обратитесь за экстренной помощью'
      ],
      servicesIntro:
        'При боли в шее могут рассматриваться следующие реабилитационные услуги по назначению специалиста. Они могут поддерживать улучшение подвижности и управление болью.'
    },
    en: {
      intro:
        'Neck pain may relate to muscle tension, posture, prolonged computer work, or other factors. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment and recovery programs without website diagnosis or cure promises.',
      symptoms: [
        'Neck stiffness or pain with movement',
        'Discomfort when turning the head or changing position',
        'Tension in the shoulders or upper back',
        'Heavy-head sensation',
        'Headaches with neck pain — warrant assessment'
      ],
      whenToSeek: [
        'If neck pain does not improve within several days',
        'If pain is accompanied by arm numbness or weakness',
        'If pain started after injury or a traffic accident',
        'If pain interferes with sleep, work, or driving',
        'For severe headache, vision changes, or fever — seek emergency care'
      ],
      servicesIntro:
        'For neck pain, the following rehabilitation services may be considered per specialist guidance. They may support mobility and pain management.'
    }
  },
  'sciatica': {
    ru: {
      intro:
        'Ишиас часто описывают как боль, которая может иррадиировать из поясницы в ногу и может быть связана с раздражением нерва. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку и программы восстановления после консультации специалиста.',
      symptoms: [
        'Боль в пояснице с возможной иррадиацией в ногу',
        'Онемение или слабость в ноге',
        'Жгучая или стреляющая боль по задней поверхности ноги',
        'Усиление боли в сидячем положении',
        'Обострение боли при движении или кашле'
      ],
      whenToSeek: [
        'Если боль не уменьшается в течение нескольких дней',
        'Если нарастают онемение или слабость',
        'Если боль мешает сну или повседневной активности',
        'Если появились нарушения мочеиспускания или стула',
        'При тревожных симптомах — обратитесь за экстренной помощью'
      ],
      servicesIntro:
        'При ишиасе после оценки специалиста могут рассматриваться следующие реабилитационные услуги.'
    },
    en: {
      intro:
        'Sciatica is often described as pain that may radiate from the lower back into the leg and may relate to nerve irritation. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment and recovery programs after specialist consultation.',
      symptoms: [
        'Low back pain that may radiate into the leg',
        'Numbness or weakness in the leg',
        'Burning or shooting pain along the back of the leg',
        'Pain worsened by sitting',
        'Pain aggravated by movement or coughing'
      ],
      whenToSeek: [
        'If pain does not improve within several days',
        'If numbness or weakness is increasing',
        'If pain interferes with sleep or daily activity',
        'If bladder or bowel function is affected',
        'For red-flag symptoms — seek emergency care'
      ],
      servicesIntro:
        'For sciatica, the following rehabilitation services may be considered after specialist assessment.'
    }
  },
  'herniated-disc': {
    ru: {
      intro:
        'Грыжа межпозвонкового диска может сопровождаться болью в спине, неврологическими симптомами или ограничением движения. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку и программы восстановления после консультации специалиста.',
      symptoms: [
        'Боль в спине или пояснице',
        'Боль с возможной иррадиацией в ногу',
        'Онемение или слабость',
        'Мышечная слабость',
        'Ограничение подвижности'
      ],
      whenToSeek: [
        'Если боль сохраняется более нескольких дней и не уменьшается после отдыха',
        'Если боль мешает повседневной активности',
        'Если нарастают онемение или слабость',
        'Если симптомы начались после травмы',
        'При нарушении мочеиспускания или стула — обратитесь за экстренной помощью'
      ],
      servicesIntro:
        'При грыже диска после оценки специалиста могут рассматриваться следующие реабилитационные услуги.'
    },
    en: {
      intro:
        'A herniated disc may cause back pain, neurological symptoms, or limited movement. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment and recovery programs after specialist consultation.',
      symptoms: [
        'Back or lumbar pain',
        'Pain that may radiate into the leg',
        'Numbness or weakness',
        'Muscle weakness',
        'Limited mobility'
      ],
      whenToSeek: [
        'If pain lasts more than a few days and does not improve with rest',
        'If pain interferes with daily activity',
        'If numbness or weakness is increasing',
        'If symptoms started after injury',
        'For bladder or bowel changes — seek emergency care'
      ],
      servicesIntro:
        'For herniated disc, the following rehabilitation services may be considered after specialist assessment.'
    }
  },
  'lower-back-pain': {
    ru: {
      intro:
        'Боль в пояснице — частая жалоба, которая может возникать по разным причинам: от мышечного напряжения до проблем с дисками или длительного сидения. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку после консультации специалиста.',
      symptoms: [
        'Боль в пояснице с одной или обеих сторон',
        'Усиление боли при сидении или вставании',
        'Мышечное напряжение или скованность в поясничной области',
        'Ограничение подвижности',
        'Боль с возможной иррадиацией в ногу (по результатам оценки)'
      ],
      whenToSeek: [
        'Если боль сохраняется более нескольких дней',
        'Если боль мешает сну, работе или активности',
        'Если нарастают неврологические симптомы',
        'Если боль началась после травмы или подъёма тяжести',
        'При сильной боли или потере контроля мочеиспускания — экстренная помощь'
      ],
      servicesIntro:
        'При боли в пояснице после оценки специалиста могут рассматриваться следующие реабилитационные услуги.'
    },
    en: {
      intro:
        'Lower back pain is a common complaint with many possible causes, from muscle strain to disc issues or prolonged sitting. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment after specialist consultation.',
      symptoms: [
        'Pain in the lumbar area on one or both sides',
        'Pain worsened by sitting or standing',
        'Muscle tension or stiffness in the lumbar region',
        'Limited mobility',
        'Pain that may radiate to the leg (per assessment)'
      ],
      whenToSeek: [
        'If pain lasts more than a few days',
        'If pain interferes with sleep, work, or activity',
        'If neurological symptoms are increasing',
        'If pain started after injury or lifting',
        'For severe pain or loss of bladder control — emergency care'
      ],
      servicesIntro:
        'For lower back pain, the following rehabilitation services may be considered after specialist assessment.'
    }
  },
  'leg-numbness': {
    ru: {
      intro:
        'Онемение ноги может возникать по разным причинам, включая сдавление нерва. Иногда оно связано с болью в пояснице или проблемами диска, но возможны и другие причины. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку после консультации специалиста.',
      symptoms: [
        'Покалывание или «мурашки» в ноге',
        'Слабость или боль в задней поверхности ноги',
        'Снижение или изменение чувствительности',
        'Усиление симптомов в сидячем положении',
        'Симптомы, которые не проходят в течение нескольких дней'
      ],
      whenToSeek: [
        'Если онемение не проходит в течение нескольких дней',
        'Если нарастает слабость',
        'Если есть нарушения мочеиспускания или стула',
        'Если симптомы начались после травмы',
        'При тревожных признаках — обратитесь за экстренной помощью'
      ],
      servicesIntro:
        'При онемении ноги и неврологических симптомах после оценки могут рассматриваться следующие реабилитационные услуги.'
    },
    en: {
      intro:
        'Leg numbness may have various causes, including nerve compression. It is sometimes linked to lumbar pain or disc issues, but other causes are possible. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment after specialist consultation.',
      symptoms: [
        'Tingling or «pins and needles» in the leg',
        'Weakness or pain in the back of the leg',
        'Reduced or altered sensation',
        'Symptoms worsened by sitting',
        'Symptoms that persist for several days'
      ],
      whenToSeek: [
        'If numbness does not resolve within several days',
        'If weakness is increasing',
        'If bladder or bowel function is affected',
        'If symptoms started after injury',
        'For red flags — seek emergency care'
      ],
      servicesIntro:
        'For leg numbness and neurological symptoms, the following rehabilitation services may be considered after assessment.'
    }
  },
  'shoulder-pain': {
    ru: {
      intro:
        'Боль в плече может быть связана с мышечным напряжением, травмой сустава, осанкой или проблемами шейного отдела. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку после консультации специалиста.',
      symptoms: [
        'Боль в плечевом суставе при движении',
        'Ограничение поднятия или вращения руки',
        'Напряжение в плече или области лопаток',
        'Боль при поднятии руки ночью',
        'Жжение или стреляющая боль в области плеча'
      ],
      whenToSeek: [
        'Если боль сохраняется более нескольких дней',
        'Если подвижность плеча постепенно ограничивается',
        'Если боль мешает повседневной активности',
        'Если боль началась после травмы',
        'При тревожных симптомах — обратитесь за медицинской помощью'
      ],
      servicesIntro:
        'При боли в плече после оценки специалиста могут рассматриваться следующие реабилитационные услуги.'
    },
    en: {
      intro:
        'Shoulder pain may relate to muscle strain, joint injury, posture, or neck-area issues. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment after specialist consultation.',
      symptoms: [
        'Shoulder joint pain with movement',
        'Limited ability to raise or rotate the arm',
        'Tension in the shoulder or scapular area',
        'Pain when raising the arm at night',
        'Burning or shooting pain around the shoulder'
      ],
      whenToSeek: [
        'If pain lasts more than a few days',
        'If shoulder mobility is progressively limited',
        'If pain interferes with daily activity',
        'If pain started after injury',
        'For concerning symptoms — seek medical care'
      ],
      servicesIntro:
        'For shoulder pain, the following rehabilitation services may be considered after specialist assessment.'
    }
  },
  'joint-pain': {
    ru: {
      intro:
        'Боль в суставах может возникать по разным причинам — от возрастных изменений до травм или перегрузки. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку после консультации специалиста.',
      symptoms: [
        'Боль в суставе при движении',
        'Отёк или скованность сустава',
        'Ограничение подвижности в суставе',
        'Мышечное напряжение вокруг сустава',
        'Усиление боли после нагрузки или движения'
      ],
      whenToSeek: [
        'Если боль в суставе сохраняется более нескольких дней',
        'Если сустав отекает или скован',
        'Если боль мешает повседневной активности',
        'Если нарастает тяжесть симптомов',
        'При тревожных признаках — обратитесь за медицинской помощью'
      ],
      servicesIntro:
        'При боли в суставах после оценки специалиста могут рассматриваться следующие реабилитационные услуги.'
    },
    en: {
      intro:
        'Joint pain may arise from age-related changes, injury, or overuse. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment after specialist consultation.',
      symptoms: [
        'Joint pain with movement',
        'Joint swelling or stiffness',
        'Limited mobility in the joint',
        'Muscle tension around the joint',
        'Pain worsened after strain or movement'
      ],
      whenToSeek: [
        'If joint pain lasts more than a few days',
        'If the joint is swollen or stiff',
        'If pain interferes with daily activity',
        'If symptoms are progressively worsening',
        'For red flags — seek medical care'
      ],
      servicesIntro:
        'For joint pain, the following rehabilitation services may be considered after specialist assessment.'
    }
  },
  'scoliosis-pain': {
    ru: {
      intro:
        'Сколиоз — искривление позвоночника, которое может сопровождаться болью в спине или шее, мышечным напряжением или проблемами осанки. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку после консультации специалиста.',
      symptoms: [
        'Боль в спине, связанная с изменением осанки',
        'Мышечное напряжение в области спины или шеи',
        'Асимметрия осанки',
        'Ограничение подвижности',
        'Усиление боли при длительном сидении или стоянии'
      ],
      whenToSeek: [
        'Если боль сохраняется более нескольких недель',
        'Если проблемы с осанкой постепенно ухудшаются',
        'Если боль мешает сну или работе',
        'Если появляются неврологические симптомы',
        'При тревожных признаках — обратитесь за медицинской помощью'
      ],
      servicesIntro:
        'При боли, связанной со сколиозом, после оценки специалиста могут рассматриваться следующие реабилитационные услуги.'
    },
    en: {
      intro:
        'Scoliosis is a spinal curvature that may be accompanied by back or neck pain, muscle tension, or posture concerns. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment after specialist consultation.',
      symptoms: [
        'Back pain related to posture changes',
        'Muscle tension in the back or neck',
        'Postural asymmetry',
        'Limited mobility',
        'Pain worsened by prolonged sitting or standing'
      ],
      whenToSeek: [
        'If pain lasts more than several weeks',
        'If posture problems are progressively worsening',
        'If pain interferes with sleep or work',
        'If neurological symptoms appear',
        'For red flags — seek medical care'
      ],
      servicesIntro:
        'For scoliosis-related pain, the following rehabilitation services may be considered after specialist assessment.'
    }
  },
  'osteochondrosis': {
    ru: {
      intro:
        'Остеохондроз — термин для возрастных изменений межпозвонковых дисков, который может сопровождаться болью в спине, ограничением движения или скованностью. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку после консультации специалиста.',
      symptoms: [
        'Боль в спине или шее',
        'Утренняя скованность',
        'Ограничение подвижности',
        'Мышечное напряжение',
        'Боль с возможной иррадиацией в конечности'
      ],
      whenToSeek: [
        'Если боль сохраняется более нескольких дней',
        'Если подвижность постепенно ограничивается',
        'Если боль мешает сну или работе',
        'Если нарастают неврологические симптомы',
        'При тревожных признаках — обратитесь за медицинской помощью'
      ],
      servicesIntro:
        'При остеохондрозе после оценки специалиста могут рассматриваться следующие реабилитационные услуги.'
    },
    en: {
      intro:
        'Osteochondrosis refers to age-related disc changes that may cause back pain, limited movement, or stiffness. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment after specialist consultation.',
      symptoms: [
        'Back or neck pain',
        'Morning stiffness',
        'Limited mobility',
        'Muscle tension',
        'Pain that may radiate to a limb'
      ],
      whenToSeek: [
        'If pain lasts more than a few days',
        'If mobility is progressively limited',
        'If pain interferes with sleep or work',
        'If neurological symptoms are increasing',
        'For red flags — seek medical care'
      ],
      servicesIntro:
        'For osteochondrosis, the following rehabilitation services may be considered after specialist assessment.'
    }
  },
  'radiculopathy': {
    ru: {
      intro:
        'Радикулопатия — сдавление корешка спинномозгового нерва, которое может возникать при проблемах с диском, остеофитах или других факторах. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку после консультации специалиста.',
      symptoms: [
        'Боль, иррадирующая в руку или ногу',
        'Онемение или слабость в конечности',
        'Жжение или стреляющая боль',
        'Мышечная слабость',
        'Усиление боли при движении или кашле'
      ],
      whenToSeek: [
        'Если боль не уменьшается в течение нескольких дней',
        'Если нарастают онемение или слабость',
        'Если боль мешает сну или активности',
        'Если есть нарушения мочеиспускания или стула',
        'При тревожных симптомах — обратитесь за экстренной помощью'
      ],
      servicesIntro:
        'При радикулопатии после оценки специалиста могут рассматриваться следующие реабилитационные услуги.'
    },
    en: {
      intro:
        'Radiculopathy is nerve root compression that may arise from disc problems, bone spurs, or other factors. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment after specialist consultation.',
      symptoms: [
        'Pain radiating into the arm or leg',
        'Numbness or weakness in the limb',
        'Burning or shooting pain',
        'Muscle weakness',
        'Pain worsened by movement or coughing'
      ],
      whenToSeek: [
        'If pain does not improve within several days',
        'If numbness or weakness is increasing',
        'If pain interferes with sleep or activity',
        'If bladder or bowel function is affected',
        'For red flags — seek emergency care'
      ],
      servicesIntro:
        'For radiculopathy, the following rehabilitation services may be considered after specialist assessment.'
    }
  },
  'thoracic-back-pain': {
    ru: {
      intro:
        'Боль в грудном отделе — частая жалоба, которая может быть связана с осанкой, мышечным напряжением или изменениями в грудном отделе позвоночника. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку после консультации специалиста.',
      symptoms: [
        'Боль в грудной области',
        'Мышечное напряжение между лопатками',
        'Дискомфорт или скованность осанки',
        'Ограничение подвижности в грудном отделе',
        'Усиление боли при глубоком дыхании или поворотах'
      ],
      whenToSeek: [
        'Если боль сохраняется более нескольких дней',
        'Если боль мешает дыханию',
        'Если сопровождается неврологическими симптомами',
        'Если началась после травмы',
        'При тревожных признаках — обратитесь за медицинской помощью'
      ],
      servicesIntro:
        'При боли в грудном отделе после оценки специалиста могут рассматриваться следующие реабилитационные услуги.'
    },
    en: {
      intro:
        'Thoracic back pain is a common complaint that may relate to posture, muscle strain, or changes in the mid-back. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment after specialist consultation.',
      symptoms: [
        'Pain in the thoracic area',
        'Muscle tension between the shoulder blades',
        'Postural discomfort or stiffness',
        'Limited mobility in the mid-back',
        'Pain worsened by deep breathing or twisting'
      ],
      whenToSeek: [
        'If pain lasts more than a few days',
        'If pain interferes with breathing',
        'If accompanied by neurological symptoms',
        'If it started after injury',
        'For red flags — seek medical care'
      ],
      servicesIntro:
        'For thoracic back pain, the following rehabilitation services may be considered after specialist assessment.'
    }
  },
  'posture-disorders': {
    ru: {
      intro:
        'Нарушения осанки могут влиять на боль в спине, шее и грудном отделе, мышечное напряжение и ограничение подвижности. Центр ' +
        CLINIC_RU +
        ' в Ереване может предложить консервативную оценку после консультации специалиста.',
      symptoms: [
        'Боль в спине или шее при длительном сидении или стоянии',
        'Мышечное напряжение в области плеч и шеи',
        'Головные боли на фоне проблем с осанкой',
        'Ограничение подвижности',
        'Дискомфорт при длительном стоянии или сидении'
      ],
      whenToSeek: [
        'Если проблемы с осанкой сопровождаются болью',
        'Если боль сохраняется более нескольких недель',
        'Если боль мешает повседневной активности',
        'Если есть неврологические симптомы',
        'При тревожных признаках — обратитесь за медицинской помощью'
      ],
      servicesIntro:
        'При нарушениях осанки после оценки специалиста могут рассматриваться следующие реабилитационные услуги.'
    },
    en: {
      intro:
        'Posture disorders may affect back, neck, and thoracic pain, muscle tension, and mobility. ' +
        CLINIC_EN +
        ' in Yerevan may offer conservative assessment after specialist consultation.',
      symptoms: [
        'Back or neck pain during prolonged sitting or standing',
        'Muscle tension in the shoulders and neck',
        'Headaches related to posture issues',
        'Limited mobility',
        'Discomfort during prolonged standing or sitting'
      ],
      whenToSeek: [
        'If posture problems are accompanied by pain',
        'If pain lasts more than several weeks',
        'If pain interferes with daily activity',
        'If neurological symptoms are present',
        'For red flags — seek medical care'
      ],
      servicesIntro:
        'For posture disorders, the following rehabilitation services may be considered after specialist assessment.'
    }
  }
};

const baseI18n = require('../server/services/condition-i18n');
const out = { ru: {}, en: {} };

for (const slug of Object.keys(CONDITIONS)) {
  for (const lang of ['ru', 'en']) {
    const base = baseI18n[lang]?.[slug] || {};
    const expanded = CONDITIONS[slug][lang];
    out[lang][slug] = { ...base, ...expanded };
  }
}

const outPath = path.join(__dirname, '../server/services/condition-i18n-expanded.js');
fs.writeFileSync(
  outPath,
  `'use strict';\n/** Auto-generated — node scripts/generate-condition-i18n-expanded.js */\nmodule.exports = ${JSON.stringify(out, null, 2)};\n`,
  'utf8'
);
console.log('Wrote', Object.keys(CONDITIONS).length, 'conditions to', outPath);
