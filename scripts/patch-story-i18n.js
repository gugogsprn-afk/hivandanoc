const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const story = {
  hy: {
    title: 'Կիսվեք ձեր պատմությամբ — Առողջ ողնաշար',
    backLink: '« Վերադառնալ հիվանդների պատմություններին',
    heroTitle: 'Ուղարկեք ձեր պատմությունը',
    heroDesc:
      'Մենք հրավիրում ենք հիվանդներին կիսվել իրենց վերականգնման պատմություններով։ Ձեր պատմությունը կարող է ոգեշնչել այլ մարդկանց և օգնել նրանց գտնել հույս։',
    success: 'Շնորհակալություն։ Ձեր պատմությունը ստացվել է և կդիտարկվի մեր թիմի կողմից։',
    sectionInfo: 'Ձեր տվյալները',
    firstName: 'Անուն',
    lastName: 'Ազգանուն',
    email: 'Էլ. փոստ',
    phone: 'Հեռախոս',
    country: 'Երկիր',
    state: 'Նահանգ (ըստ ցանկության)',
    city: 'Քաղաք',
    dobHint: 'Խնդրում ենք նշել ծննդյան ամսաթիվը՝ օգնելու մեզ հաստատել ձեր ինքնությունը։',
    dob: 'Ծննդյան ամսաթիվ',
    sectionProviders: 'Ձեր բժիշկ(ները)',
    provider: 'Բժիշկ / մասնագետ',
    providerOptional: 'Բժիշկ (ըստ ցանկության)',
    addProvider: 'Ավելացնել ևս մեկ մասնագետ +',
    sectionStory: 'Գրեք ձեր պատմությունը',
    storyHint:
      'Ներառեք հիմնական մանրամասները՝ ինչ խնդիր ունեքել, ինչու ընտրել եք մեր կենտրոնը և ինչպես եք զգացել բուժումից հետո։',
    conditionPrimary: 'Հիմնական ախտորոշում / բուժում',
    conditionSecondary: 'Երկրորդային ախտորոշում (ըստ ցանկության)',
    addCondition: 'Ավելացնել ևս մեկ ախտորոշում +',
    story: 'Ձեր պատմությունը',
    sectionMedia: 'Նկարներ և վիդեո',
    mediaHint:
      'Կարող եք ավելացնել մինչև 3 նկար և 2 վիդեո հղում։ Խնդրում ենք չներառել վիրահատական գրաֆիկ նկարներ։',
    image1: 'Նկար 1',
    image2: 'Նկար 2 (ըստ ցանկության)',
    image3: 'Նկար 3 (ըստ ցանկության)',
    video1: 'Վիդեո հղում (ըստ ցանկության)',
    video2: 'Վիդեո հղում (ըստ ցանկության)',
    sectionConsent: 'Ձեր համաձայնությունը',
    consentPhotoTitle: 'Համաձայնություն լուսանկարների և/կամ վիդեո հրապարակման համար',
    consentPhotoText:
      '<p>1. Ես, ստորին ստորագրողը, համաձայն եմ, որ իմ լուսանկարներն ու վիդեոները կարող են օգտագործվել «Առողջ ողնաշար» կենտրոնի կողմից կայքում, սոցիալական ցանցերում և տեղեկատվական նյութերում՝ իմ պատմությունը ներկայացնելու նպատակով։</p><p>2. Ես հասկանում եմ, որ կարող եմ ցանկացած ժամանակ հետ կանչել այս համաձայնությունը՝ գրավոր դիմումով։</p>',
    consentPhotoHint:
      'Նշելով ստորևի վանդակը, ես հաստատում եմ, որ կարդացել եմ վերոնշյալ պայմանները և համաձայն եմ, որ իմ լուսանկարներն ու վիդեոները կարող են օգտագործվել նկարագրված կերպով։',
    consentPrivacyTitle: 'Անհատական թույլտվություն տեղեկատվության բացահայտման համար',
    consentPrivacyText:
      '<p>Մենք հասկանում ենք, որ ձեր և ձեր առողջության մասին տեղեկատվությունը անձնական է։ Մենք պարտավոր ենք ստանալ ձեր գրավոր թույլտվությունը, նախքան ձեր բժշկական տեղեկատվությունը օգտագործելը կամ բացահայտելը նշված նպատակներով։</p><p>Այս ձևը թույլ է տալիս օգտագործել ձեր պատմությունը միայն հիվանդների պատմությունների բաժնում և կենտրոնի տեղեկատվական նյութերում՝ առանց ավելորդ անձնական տվյալների հրապարակման։</p>',
    consentPrivacyHint:
      'Նշելով ստորևի վանդակը, ես հաստատում եմ, որ կարդացել եմ վերոնշյալ պայմանները և համաձայն եմ դրանց հետ։',
    consentAccept: 'Այո, ես ընդունում եմ վերոնշյալ պայմանները',
    rolePrompt: 'Ընտրեք մեկ տարբերակ.',
    rolePatient: 'Ես հիվանդն եմ, ում մասին գրում եմ այս հաղորդագրությունը',
    roleRepresentative:
      'Ես հիվանդի օրինական ներկայացուցիչն եմ և իրավունք ունեմ գործել նրա անունից',
    submit: 'Ուղարկել պատմությունը',
    removeRow: 'Հեռացնել',
    errRequired: 'Պարտադիր դաշտ',
    errImageRequired: 'Խնդրում ենք ընտրել նկար',
    errImageSize: 'Նկարի չափը չպետք է գերազանցի {max} ՄԲ',
    errConsent: 'Պարտադիր է համաձայնությունը',
    errRole: 'Ընտրեք տարբերակ'
  },
  ru: {
    title: 'Поделитесь своей историей — Առողջ ողնաշար',
    backLink: '« Вернуться к обзору историй пациентов',
    heroTitle: 'Присылайте свои истории',
    heroDesc:
      'Мы приглашаем пациентов делиться историями восстановления. Ваша история может вдохновить других и помочь им найти надежду на путь к здоровью.',
    success: 'Спасибо! Ваша история получена и будет рассмотрена нашей командой.',
    sectionInfo: 'Ваша информация',
    firstName: 'Имя',
    lastName: 'Фамилия',
    email: 'Электронная почта',
    phone: 'Телефон',
    country: 'Страна',
    state: 'Штат (необязательно)',
    city: 'Город',
    dobHint: 'Пожалуйста, укажите дату рождения, чтобы мы могли подтвердить вашу личность.',
    dob: 'Дата рождения',
    sectionProviders: 'Ваш(и) поставщик(и) услуг',
    provider: 'Поставщик услуг',
    providerOptional: 'Поставщик услуг (необязательно)',
    addProvider: 'Добавить еще одного поставщика +',
    sectionStory: 'Напишите свою историю',
    storyHint:
      'Пожалуйста, включите важные детали: с какими проблемами вы столкнулись, почему выбрали наш центр и как вы себя чувствуете после лечения.',
    conditionPrimary: 'Основное заболевание/лечение',
    conditionSecondary: 'Вторичное заболевание/лечение (по желанию)',
    addCondition: 'Добавить еще одно заболевание или лечение +',
    story: 'Ваша история',
    sectionMedia: 'Изображения и видео',
    mediaHint:
      'Вы можете добавить до трех изображений и двух видеороликов. Пожалуйста, не включайте изображения хирургических операций, содержащие графические подробности.',
    image1: 'Изображение 1',
    image2: 'Изображение 2 (необязательно)',
    image3: 'Изображение 3 (необязательно)',
    video1: 'Видеоссылка (необязательно)',
    video2: 'Видеоссылка (необязательно)',
    sectionConsent: 'Ваше согласие',
    consentPhotoTitle: 'Согласие на публикацию фотографий и/или видеозаписей',
    consentPhotoText:
      '<p>1. Я, нижеподписавшийся, даю согласие на использование моих фотографий и видеозаписей центром «Առողջ ողնաշար» на сайте, в социальных сетях и информационных материалах для представления моей истории.</p><p>2. Я понимаю, что могу отозвать данное согласие в любое время, направив письменное уведомление.</p>',
    consentPhotoHint:
      'Поставив галочку в поле ниже, я подтверждаю, что ознакомился с приведенным выше соглашением и согласен с тем, что мои фотографии и/или видео могут быть использованы, как описано выше.',
    consentPrivacyTitle: 'Индивидуальное разрешение на разглашение информации',
    consentPrivacyText:
      '<p>Мы понимаем, что информация о вас и вашем здоровье является личной, и мы стремимся защитить конфиденциальность этой информации. В связи с этим мы должны получить ваше письменное разрешение, прежде чем использовать или раскрывать вашу защищенную медицинскую информацию в целях, описанных ниже.</p><p>Данная форма позволяет использовать вашу историю только в разделе историй пациентов и информационных материалах центра без публикации избыточных персональных данных.</p>',
    consentPrivacyHint:
      'Поставив галочку в поле ниже, я подтверждаю, что ознакомился с приведенным выше соглашением и согласен с его условиями.',
    consentAccept: 'Да, я принимаю вышеуказанные условия',
    rolePrompt: 'Выберите один из следующих вариантов:',
    rolePatient: 'Я — пациент, в отношении которого я пишу это сообщение',
    roleRepresentative:
      'Я являюсь личным представителем пациента и имею законное право действовать от его/её имени',
    submit: 'Отправить историю',
    removeRow: 'Удалить',
    errRequired: 'Обязательное поле',
    errImageRequired: 'Пожалуйста, выберите изображение',
    errImageSize: 'Размер изображения не должен превышать {max} МБ',
    errConsent: 'Необходимо принять условия',
    errRole: 'Выберите вариант'
  },
  en: {
    title: 'Share Your Story — Healthy Spine',
    backLink: '« Back to patient stories overview',
    heroTitle: 'Submit your stories',
    heroDesc:
      'We invite patients to share their recovery stories. Your story can inspire others and help them find hope on their path to wellness.',
    success: 'Thank you! Your story has been received and will be reviewed by our team.',
    sectionInfo: 'Your information',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    country: 'Country',
    state: 'State (optional)',
    city: 'City',
    dobHint: 'Please provide your date of birth to help us verify your identity.',
    dob: 'Date of birth',
    sectionProviders: 'Your provider(s)',
    provider: 'Provider',
    providerOptional: 'Provider (optional)',
    addProvider: 'Add another provider +',
    sectionStory: 'Write your story',
    storyHint:
      'Please include relevant details such as the conditions or problems you faced, why you chose our center, and how you felt after treatment.',
    conditionPrimary: 'Primary condition/treatment',
    conditionSecondary: 'Secondary condition/treatment (optional)',
    addCondition: 'Add another condition or treatment +',
    story: 'Your story',
    sectionMedia: 'Images and video',
    mediaHint:
      'You can add up to three images and two videos. Please do not include images of surgical operations containing graphic details.',
    image1: 'Image 1',
    image2: 'Image 2 (optional)',
    image3: 'Image 3 (optional)',
    video1: 'Video link (optional)',
    video2: 'Video link (optional)',
    sectionConsent: 'Your consent',
    consentPhotoTitle: 'Consent to publication of photographs and/or video recordings',
    consentPhotoText:
      '<p>1. I, the undersigned, consent to the use of my photographs and video recordings by Healthy Spine Center on the website, social media, and informational materials to present my story.</p><p>2. I understand that I may revoke this consent at any time by submitting a written request.</p>',
    consentPhotoHint:
      'By checking the box below, I confirm that I have read the above agreement and agree that my photographs and/or videos may be used as described above.',
    consentPrivacyTitle: 'Individual authorization for disclosure of information',
    consentPrivacyText:
      '<p>We understand that information about you and your health is personal, and we are committed to protecting the privacy of that information. We must obtain your written authorization before using or disclosing your protected health information for the purposes described below.</p><p>This form allows your story to be used only in the patient stories section and center informational materials without publishing excessive personal data.</p>',
    consentPrivacyHint:
      'By checking the box below, I confirm that I have read the above agreement and agree to its terms.',
    consentAccept: 'Yes, I accept the above terms',
    rolePrompt: 'Select one of the following options:',
    rolePatient: 'I am the patient about whom I am writing this message',
    roleRepresentative:
      'I am the personal representative of the patient and have the legal right to act on their behalf',
    submit: 'Submit story',
    removeRow: 'Remove',
    errRequired: 'Required field',
    errImageRequired: 'Please select an image',
    errImageSize: 'Image size must not exceed {max} MB',
    errConsent: 'Consent is required',
    errRole: 'Please select an option'
  }
};

['hy', 'ru', 'en'].forEach((lang) => {
  const file = path.join(root, 'lang', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.pages.submitStory = story[lang];
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('OK', lang);
});
