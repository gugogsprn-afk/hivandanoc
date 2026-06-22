/**
 * Admin CMS UI translations — HY / RU / EN
 */
const AdminI18n = (function () {
  const STORAGE_KEY = 'cms_admin_lang';
  const DEFAULT = 'hy';

  const STRINGS = {
    hy: {
      'login.title': 'Առողջ ողնաշար',
      'login.subtitle': 'Բովանդակության կառավարման համակարգ',
      'login.email': 'Էլ. հասցե',
      'login.password': 'Գաղտնաբառ',
      'login.submit': 'Մուտք',
      'login.signingIn': 'Մուտք…',
      'login.hint': '«Առողջ ողնաշար» · Միայն աշխատակիցների համար',
      'nav.dashboard': 'Վահանակ',
      'nav.leads': 'Դիմումներ և գրանցումներ',
      'nav.pages': 'Էջեր',
      'nav.doctors': 'Բժիշկներ',
      'nav.services': 'Ծառայություններ',
      'nav.media': 'Մեդիա գրադարան',
      'nav.settings': 'Ընդհանուր կարգավորումներ',
      'nav.viewSite': 'Դիտել կայքը ↗',
      'nav.signOut': 'Ելք',
      'nav.openMenu': 'Բացել մենյու',
      'nav.langAria': 'Ադմինի լեզու',
      'view.title.dashboard': 'Վահանակ',
      'view.title.leads': 'Դիմումներ և գրանցումներ',
      'view.title.pages': 'Էջերի խմբագիր',
      'view.title.doctors': 'Բժիշկներ',
      'view.title.services': 'Ծառայություններ',
      'view.title.media': 'Մեդիա գրադարան',
      'view.title.settings': 'Ընդհանուր կարգավորումներ',
      'view.subtitle.dashboard': 'Կլինիկայի ակտիվության և վերջին դիմումների ամփոփում',
      'view.subtitle.leads': 'Կառավարեք գրանցման հարցումներն ու կապի ձևերը',
      'view.subtitle.pages': 'Տեսողական խմբագիր — սեղմեք տեքստին կամ նկարին։ Պահպանեք և հրապարակեք կայքում։',
      'view.subtitle.doctors': 'Ավելացրեք և կառավարեք հանրային կայքի բժիշկներին',
      'view.subtitle.services': 'Կառավարեք ծառայությունների կատեգորիաներն ու բուժումները',
      'view.subtitle.media': 'Վերբեռնեք և կառավարեք նկարները',
      'view.subtitle.settings': 'Կլինիկայի անուն, կապ, ժամեր և սոցիալական հղումներ (HY / RU / EN)',
      'common.loading': 'Բեռնվում է…',
      'common.save': 'Պահպանել',
      'common.cancel': 'Չեղարկել',
      'common.tryAgain': 'Կրկին փորձել',
      'common.errorTitle': 'Ինչ-որ բան սխալ է',
      'common.signInFirst': 'Նախ մուտք գործեք',
      'status.new': 'Նոր',
      'status.contacted': 'Կապվել են',
      'status.booked': 'Գրանցված',
      'status.cancelled': 'Չեղարկված',
      'pageEditor.hint': 'Խմբագրելու ռեժիմ — սեղմեք խմբագրելու համար, «Պահպանել»՝ հերթում, ապա «Պահպանել բոլորը»՝ հրապարակելու համար։',
      'pageEditor.language': 'Լեզու՝',
      'pageEditor.saveAll': 'Պահպանել բոլորը',
      'pageEditor.refresh': '↻ Թարմացնել',
      'pageEditor.openLive': 'Բացել կայքում ↗',
      'pageEditor.manageDoctors': 'Կառավարել բժիշկներին',
      'pageEditor.scrollHint': 'Ոլորեք նախադիտումը՝ ամբողջ վերնագիրը տեսնելու համար։ Սեղմեք ցանկացած մաս՝ խմբագրելու համար։',
      'pageEditor.maximize': 'Լիաէկրան',
      'pageEditor.minimize': 'Դուրս գալ լիաէկրանից',
      'pageEditor.fullscreenTitle': 'Խմբագրելի էջի նախադիտում',
      'pageEditor.home': 'Գլխավոր',
      'pageEditor.doctors': 'Գտնել բժիշկ',
      'pageEditor.locations': 'Հասցեներ',
      'pageEditor.patientCare': 'Բուժում',
      'pageEditor.about': 'Մեր մասին'
    },
    ru: {
      'login.title': 'Здоровый позвоночник',
      'login.subtitle': 'Система управления контентом',
      'login.email': 'Эл. почта',
      'login.password': 'Пароль',
      'login.submit': 'Войти',
      'login.signingIn': 'Вход…',
      'login.hint': '«Здоровый позвоночник» · Только для сотрудников',
      'nav.dashboard': 'Панель',
      'nav.leads': 'Заявки и записи',
      'nav.pages': 'Страницы',
      'nav.doctors': 'Врачи',
      'nav.services': 'Услуги',
      'nav.media': 'Медиатека',
      'nav.settings': 'Общие настройки',
      'nav.viewSite': 'Открыть сайт ↗',
      'nav.signOut': 'Выйти',
      'nav.openMenu': 'Открыть меню',
      'nav.langAria': 'Язык админки',
      'view.title.dashboard': 'Панель',
      'view.title.leads': 'Заявки и записи',
      'view.title.pages': 'Редактор страниц',
      'view.title.doctors': 'Врачи',
      'view.title.services': 'Услуги',
      'view.title.media': 'Медиатека',
      'view.title.settings': 'Общие настройки',
      'view.subtitle.dashboard': 'Обзор активности клиники и последних заявок',
      'view.subtitle.leads': 'Управление записями и обращениями',
      'view.subtitle.pages': 'Визуальный редактор — нажмите на текст или изображение. Сохраните и опубликуйте на сайте.',
      'view.subtitle.doctors': 'Добавляйте и управляйте врачами на публичном сайте',
      'view.subtitle.services': 'Управление категориями услуг и лечением',
      'view.subtitle.media': 'Загрузка и управление изображениями',
      'view.subtitle.settings': 'Название клиники, контакты, часы и соцсети (HY / RU / EN)',
      'common.loading': 'Загрузка…',
      'common.save': 'Сохранить',
      'common.cancel': 'Отмена',
      'common.tryAgain': 'Повторить',
      'common.errorTitle': 'Что-то пошло не так',
      'common.signInFirst': 'Сначала войдите в систему',
      'status.new': 'Новая',
      'status.contacted': 'Связались',
      'status.booked': 'Записан',
      'status.cancelled': 'Отменена',
      'pageEditor.hint': 'Режим редактирования — нажмите для правки, «Сохранить» в очередь, затем «Сохранить всё» для публикации.',
      'pageEditor.language': 'Язык:',
      'pageEditor.saveAll': 'Сохранить всё',
      'pageEditor.refresh': '↻ Обновить',
      'pageEditor.openLive': 'Открыть на сайте ↗',
      'pageEditor.manageDoctors': 'Управление врачами',
      'pageEditor.scrollHint': 'Прокрутите предпросмотр по горизонтали, чтобы увидеть телефон и кнопку записи. Нажмите на текст шапки, чтобы редактировать.',
      'pageEditor.maximize': 'На весь экран',
      'pageEditor.minimize': 'Выйти из полноэкранного режима',
      'pageEditor.fullscreenTitle': 'Редактируемая страница',
      'pageEditor.home': 'Главная',
      'pageEditor.doctors': 'Найти врача',
      'pageEditor.locations': 'Адреса',
      'pageEditor.patientCare': 'Услуги',
      'pageEditor.about': 'О клинике'
    },
    en: {
      'login.title': 'Healthy Spine',
      'login.subtitle': 'Content Management System',
      'login.email': 'Email address',
      'login.password': 'Password',
      'login.submit': 'Sign in',
      'login.signingIn': 'Signing in…',
      'login.hint': 'Healthy Spine · Staff only',
      'nav.dashboard': 'Dashboard',
      'nav.leads': 'Leads & Appointments',
      'nav.pages': 'Pages',
      'nav.doctors': 'Doctors',
      'nav.services': 'Services',
      'nav.media': 'Media Library',
      'nav.settings': 'Global Settings',
      'nav.viewSite': 'View public website ↗',
      'nav.signOut': 'Sign out',
      'nav.openMenu': 'Open menu',
      'nav.langAria': 'Admin language',
      'view.title.dashboard': 'Dashboard',
      'view.title.leads': 'Leads & Appointments',
      'view.title.pages': 'Page Editor',
      'view.title.doctors': 'Doctors',
      'view.title.services': 'Services',
      'view.title.media': 'Media Library',
      'view.title.settings': 'Global Settings',
      'view.subtitle.dashboard': 'Overview of clinic activity and recent leads',
      'view.subtitle.leads': 'Manage appointment requests and contact form submissions',
      'view.subtitle.pages': 'Visual editor — click text or images to edit. Saves publish to the public site automatically.',
      'view.subtitle.doctors': 'Add and manage doctors shown on the public website',
      'view.subtitle.services': 'Manage service categories and treatment offerings',
      'view.subtitle.media': 'Upload and manage images for doctors, clinic, and blog',
      'view.subtitle.settings': 'Clinic name, contact info, hours, and social links (HY / RU / EN)',
      'common.loading': 'Loading…',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.tryAgain': 'Try again',
      'common.errorTitle': 'Something went wrong',
      'common.signInFirst': 'Please sign in first',
      'status.new': 'New',
      'status.contacted': 'Contacted',
      'status.booked': 'Booked',
      'status.cancelled': 'Cancelled',
      'pageEditor.hint': 'Edit mode — click to edit, press Save to queue, then Save All to publish to the live website.',
      'pageEditor.language': 'Language:',
      'pageEditor.saveAll': 'Save All',
      'pageEditor.refresh': '↻ Refresh',
      'pageEditor.openLive': 'Open live page ↗',
      'pageEditor.manageDoctors': 'Manage doctors',
      'pageEditor.scrollHint': 'Scroll the preview horizontally to see the full header (phone, book button). Click any header text to edit.',
      'pageEditor.maximize': 'Full screen',
      'pageEditor.minimize': 'Exit full screen',
      'pageEditor.fullscreenTitle': 'Editable page preview',
      'pageEditor.home': 'Home page',
      'pageEditor.doctors': 'Find a Doctor',
      'pageEditor.locations': 'Locations',
      'pageEditor.patientCare': 'Patient Care',
      'pageEditor.about': 'About'
    }
  };

  let currentLang = DEFAULT;
  const listeners = new Set();

  function codes() {
    return ['hy', 'ru', 'en'];
  }

  function t(key, params) {
    let val = STRINGS[currentLang]?.[key] || STRINGS.en[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return val;
  }

  function getLang() {
    return currentLang;
  }

  function applyDOM() {
    document.querySelectorAll('[data-admin-i18n]').forEach((el) => {
      const key = el.getAttribute('data-admin-i18n');
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll('[data-admin-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.getAttribute('data-admin-i18n-placeholder'));
    });
    document.querySelectorAll('[data-admin-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-admin-i18n-aria')));
    });
    const view = document.querySelector('#main-nav button.active')?.dataset.view;
    if (view && typeof AdminUI !== 'undefined') {
      AdminUI.setViewTitle(view);
      const sub = document.getElementById('view-subtitle');
      if (sub) sub.textContent = t(`view.subtitle.${view}`);
    }
    renderSwitcher();
  }

  function renderSwitcher() {
    const mount = document.getElementById('admin-lang-switcher');
    if (!mount) return;
    mount.innerHTML = codes()
      .map(
        (code) =>
          `<button type="button" class="cms-lang-btn${code === currentLang ? ' active' : ''}" data-admin-lang="${code}" aria-pressed="${code === currentLang}">${code.toUpperCase()}</button>`
      )
      .join('');
    mount.querySelectorAll('[data-admin-lang]').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.dataset.adminLang));
    });
  }

  function setLang(lang) {
    if (!codes().includes(lang) || lang === currentLang) return;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
    applyDOM();
    listeners.forEach((fn) => fn(lang));
    window.dispatchEvent(new CustomEvent('admin-lang-change', { detail: { lang } }));
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function init() {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    currentLang = codes().includes(saved) ? saved : DEFAULT;
    document.documentElement.lang = currentLang;
    applyDOM();
    return currentLang;
  }

  return { init, t, getLang, setLang, applyDOM, onChange, codes };
})();
