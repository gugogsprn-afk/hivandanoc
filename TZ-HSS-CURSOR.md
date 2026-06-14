# ТЗ для Cursor: сайт «Առողջ ողնաշար» (CHIC NGO)

Документ описывает **всё, что уже сделано** и **что осталось**. Передай этот файл другому агенту Cursor как единственный источник контекста.

---

## 1. Цель проекта

Статический многоязычный сайт реабилитационного центра **«Առողջ ողնաշար»** (организация CHIC NGO).

**Главная задача:** максимально приблизить UX/UI и структуру к референсу [HSS Spine Department](https://www.hss.edu/departments/spine), **не копируя 1:1**, с фирменными цветами CHIC и тремя языками.

**Оценка близости к HSS (на момент сдачи):**
- Главная: ~65–75%
- Внутренние страницы (врачи, услуги, запись, контакты): ~55–65%
- Весь сайт в среднем: ~60%

---

## 2. Референс и принципы

| Аспект | HSS | Наш сайт |
|--------|-----|----------|
| Hero | Белый, H1 + subtitle + 1 CTA | ✅ Сделано |
| Услуги на главной | Нет сетки услуг | ✅ Убрано с главной |
| Услуги | Отдельная Patient Care | ✅ `departments.html` — list-style |
| Врачи | Список, Book Online + Call | ✅ `hss-doctor-item` |
| Запись | Wizard / Book Online API | ⚠️ Упрощённая форма (localStorage) |
| Новости | 40+ статей | ⚠️ 5 заглушек |
| Поиск | Рабочий | ⚠️ Только UI-кнопка |
| Языки | EN | HY (default), RU, EN |
| Mega-menu | Patient Care, Health Library | ❌ Не реализовано |
| CMS | Enterprise CMS | ❌ JSON + localStorage, PHP не начат |

**Правило:** не возвращать на главную старые блоки (fullscreen hero, services grid, doctors grid, testimonials cards, inline booking form, advantages cards).

---

## 3. Бренд

### Цвета (CSS variables в `hospital-theme.css`, переиспользуются в `hss-spine.css`)

| Token | HEX | Использование |
|-------|-----|---------------|
| `--navy` | `#05112B` | Текст, футер |
| `--blue` | `#0E4B8A` | Кнопки, акценты |
| `--blue-bright` | `#1D74C9` | Ссылки, hover |
| `--bg-alt` | `#F5F8FC` | Альтернативные секции |
| `#FFFFFF` | белый | Hero, карточки |

### Логотип

- Файл в репо: `images/brand/logo.svg`
- В `data/hospital.json` указан `images/brand/logo.png` (несоответствие — при необходимости синхронизировать)
- `common.js` → `logoPath()` всегда отдаёт `logo.svg`

### Организация

- Бренд: **CHIC NGO**, центр **«Առողջ ողնաշար»** (Healthy Spine)
- Контакты-заглушки: Ереван, `info@healthyspine.am`, `+374 (10) 00-00-00`
- Фото: Unsplash (заглушки)

---

## 4. Технический стек

- **Frontend:** чистый HTML + CSS + Vanilla JS (без фреймворков)
- **Данные:** `data/hospital.json` + локализованные оверлеи в `lang/*.json`
- **Хранение заявок:** `localStorage` через `js/storage.js` (демо, без бэкенда)
- **i18n:** `js/i18n.js` + `lang/config.json`
- **Embed для file://:** `data/hospital.embed.js`, `lang/*.embed.js` (генерация скриптами)
- **Админка:** `admin/index.html` (пароль `admin123`, правки в localStorage)
- **Legacy:** `legacy/strategic-consulting-original.html` — исходный шаблон Tooplate 2149

### Запуск локально

```powershell
cd "c:\Users\PC\Downloads\2149_strategic_consulting\2149_strategic_consulting"
py -m http.server 3000
```

Открыть: http://localhost:3000 — после изменений CSS **Ctrl+F5**.

Альтернативы: `START-SITE.bat`, `ПРОСМОТР.bat`, `ОТКРЫТЬ-БЕЗ-СЕРВЕРА.bat` (пересобирает embed).

### Пересборка embed (после правок JSON)

```bash
node scripts/build-embed.js
# или
python scripts/build-embed.py
```

`index.html` подключает embed-файлы (работает без сервера). Остальные страницы грузят JSON через `fetch`.

---

## 5. Структура файлов

```
2149_strategic_consulting/
├── index.html              # Главная — 12 блоков HSS
├── about.html              # О центре (частично legacy layout)
├── doctors.html            # Список врачей HSS
├── departments.html        # Каталог услуг list-style
├── appointment.html        # Форма записи HSS
├── contacts.html           # Контакты HSS
├── css/
│   ├── hospital-theme.css  # База (~2400 строк, много legacy)
│   └── hss-spine.css       # НОВЫЙ — основной HSS layout (~890 строк)
├── js/
│   ├── common.js           # Nav, footer, загрузка данных, анимации
│   ├── home.js             # Рендер главной
│   ├── pages.js            # Внутренние страницы (врачи, услуги, контакты)
│   ├── appointment.js      # Форма записи
│   ├── i18n.js             # Переводы
│   └── storage.js          # localStorage заявок
├── data/hospital.json      # Все данные центра
├── lang/
│   ├── config.json         # HY default, RU, EN
│   ├── hy.json, ru.json, en.json
│   └── *.embed.js          # Сгенерированные
├── scripts/
│   ├── build-embed.js
│   ├── patch-hss-phase1-i18n.js
│   ├── patch-hss-phase2-i18n.js
│   └── patch-*.js          # Старые патчи i18n
└── admin/index.html        # Демо-админка
```

**Главный CSS для HSS:** `hss-spine.css` подключён на всех публичных страницах.  
**Body class:** `hss-page` на всех страницах кроме admin.

---

## 6. Что сделано — по страницам

### 6.1. Главная (`index.html` + `js/home.js`)

12 блоков в порядке HSS Spine:

| # | Блок | ID / класс | Источник данных |
|---|------|-----------|-----------------|
| 1 | Hero (белый) | `.hss-hero` | `hospital.name`, `heroTagline` |
| 2 | Multidisciplinary intro | `#intro` | `introParagraphs[]` |
| 3 | 3 action tiles | `.hss-tiles` | Статика + i18n |
| 4 | Complex cases | `#conditions` | `conditions[]` (первые 3) + i18n |
| 5 | Video/feature | `#feature` | `feature` object |
| 6 | Conservative approach | `#approach` | `approachParagraphs[]` + Unsplash |
| 7 | Top experts | `#experts` | `expertsParagraphs[]` + Unsplash |
| 8 | Imaging | `#imaging` | `imagingParagraphs[]`, `equipment[]` |
| 9 | Patient videos | `#reviews` | `storyVideos[]` |
| 10 | News | `#news` | `news[]`, toggle 10→все |
| 11 | Patient stories | `#patient-stories` | `patientStories[]` |
| 12 | Footer CTA band | `.hss-cta-band` | i18n → `appointment.html` |

**Убрано с главной:** services grid, advantages, doctors grid, equipment/programs cards, testimonials, inline booking, contact strip, fullscreen `spine-hero`.

**Mobile:** sticky bar `.hss-mobile-bar` (телефон + запись).

### 6.2. Навигация (`js/common.js` → `renderNav`)

**Utility bar (верх):** Why Us, About CHIC, email.

**Основное меню (как HSS):**
- Find a Doctor → `doctors.html`
- Locations → `contacts.html`
- Patient Care → `departments.html`
- About → `about.html`

**Actions:** иконка поиска (UI only, `#nav-search-btn`), переключатель языка, телефон, CTA «Записаться на приём».

### 6.3. Врачи (`doctors.html` + `pages.js`)

- Hero: `hss-hero hss-hero--inner`
- Checkbox «только хирурги» (`#surgeon-only-filter`)
- Список: `.hss-doctor-item` — имя, роль, локация, кнопки Book Online + Call
- Фильтр хирургов: `isSurgeon === true` или regex в `role`
- URL: `appointment.html?doctor={id}`

### 6.4. Услуги (`departments.html` + `pages.js`)

- Hero inner
- Фильтр категорий: `#service-filters` (`.hss-filter-bar`)
- Рендер: группы по `serviceCategories`, внутри `.hss-service-item` (название, описание, Book Online)
- **30 услуг** в `departments[]`, 5 категорий в `serviceCategories`
- URL: `appointment.html?department={id}`

### 6.5. Запись (`appointment.html` + `appointment.js`)

- Hero inner
- Форма `.hss-form` в 3 fieldset-секциях:
  1. Контактные данные (имя, телефон, email)
  2. Услуга + врач (optional)
  3. Дата + время + комментарий
- Submit → `HospitalStorage.addAppointment()` → success `.hss-alert`
- Query params: `?department=`, `?doctor=` — автозаполнение
- `timeSlots` из `hospital.json`

### 6.6. Контакты (`contacts.html` + `pages.js`)

- Emergency banner `.hss-emergency`
- Сетка `.hss-contact-grid` (телефон кликабельный)
- Map placeholder `.hss-map` (текст адреса)
- Форма обратной связи `.hss-form--narrow` (демо alert)

### 6.7. О центре (`about.html`)

- Hero переведён на `hss-hero--inner`
- Контент: legacy layout (about-section, stats, features) — **не полностью HSS**
- CTA кнопка: `hss-btn`

### 6.8. Футер (`common.js` → `renderFooter`)

- Синяя CTA-полоса `.hss-footer__cta` с текстом `footer.ctaText`
- 4 колонки: бренд, навигация, пациентам, контакты
- Убрана ссылка на legacy-шаблон
- Класс: `site-footer hss-footer`

---

## 7. Дизайн-система HSS (`css/hss-spine.css`)

### Ключевые классы

| Класс | Назначение |
|-------|------------|
| `.hss-page` | Обёртка страницы, padding-top под fixed header |
| `.hss-wrap` | Контейнер max 1140px |
| `.hss-hero` / `.hss-hero--inner` | Белый hero |
| `.hss-section` / `.hss-section--alt` | Секции |
| `.hss-btn`, `--primary`, `--outline`, `--lg` | Кнопки |
| `.hss-link`, `.hss-link-btn` | Ссылки |
| `.hss-tiles`, `.hss-tile` | 3 action tiles |
| `.hss-split` | Split image + text |
| `.hss-feature` | Video/feature block |
| `.hss-videos`, `.hss-video-card` | Video row |
| `.hss-news` | Список новостей |
| `.hss-patients`, `.hss-patient` | Patient stories grid |
| `.hss-cta-band` | CTA перед футером |
| `.hss-mobile-bar` | Sticky mobile bar |
| `.hss-doctor-item` | Строка врача |
| `.hss-service-group`, `.hss-service-item` | Каталог услуг |
| `.hss-form`, `.hss-field` | Формы |
| `.hss-contact-grid`, `.hss-contact-card` | Контакты |
| `.hss-footer__cta` | CTA в футере |

### CSS-конфликты

`hospital-theme.css` содержит legacy: `.page-hero`, `.spine-hero`, `.dept-card`, `.team-grid`, `.action-tiles--blue`.

**Решение:** overrides в `hss-spine.css`:
- `.hss-page .page-hero, .hss-page .spine-hero { display: none }`
- Новые компоненты имеют приоритет по специфичности

**Не удалять** `hospital-theme.css` — там variables, header, footer base, анимации, формы legacy.

---

## 8. Модель данных (`data/hospital.json`)

### `hospital` (объект)

```json
{
  "name", "shortName", "tagline", "heroTagline",
  "logo", "phone", "emergency", "email", "address", "hours",
  "about", "mission", "heroImage", "aboutImage",
  "stats": [{ "value", "suffix", "label" }]
}
```

### Контентные массивы (главная)

| Поле | Описание |
|------|----------|
| `introParagraphs[]` | HTML допускается (`<strong>`) |
| `approachParagraphs[]` | Conservative approach |
| `expertsParagraphs[]` | Top experts |
| `imagingParagraphs[]` | Imaging block |
| `conditions[]` | Список заболеваний (8 шт.) |
| `feature` | `{ title, description, image }` |
| `news[]` | `{ id, title, date }` — 5 заглушек |
| `storyVideos[]` | `{ id, title, image }` — 4 шт. |
| `patientStories[]` | `{ id, name, location, treatment, image }` — 6 шт. |

### Услуги

| Поле | Описание |
|------|----------|
| `serviceCategories[]` | `{ id, name }` — consult, therapy, treatment, rehab, diagnostics |
| `departments[]` | 30 услуг: `{ id, category, name, icon, description, services[] }` |

### Врачи

`doctors[]`: `{ id, name, role, departmentId, location, isSurgeon, experience, image, bio }`

### Прочее (есть в JSON, не на главной)

- `equipment[]`, `programs[]`, `reviews[]`, `advantages[]`, `trustPoints[]`
- `timeSlots[]` — слоты для формы записи

### Локализация контента

`lang/*.json` → секция `content` (или `pages.*`) мержится в `common.js` → `loadData()`:
- `hospital`, `departments`, `doctors`, `serviceCategories` и др. переводятся по `id`

---

## 9. i18n

### Языки (`lang/config.json`)

- **default:** `hy`
- **storageKey:** `gkb_lang`
- HY, RU, EN

### Ключи, добавленные при HSS-редизайне

**nav:**
- `patientCare`, `search`, `locations`, `whyUs`, `aboutOrg`

**common:**
- `bookOnline`, `callUs`

**footer:**
- `ctaText`

**pages.home:**
- `rankingsLink`, `complexCasesDetail`, `complexCasesLead`, `conditionsIntro`
- `newsShowMore`, `newsShowLess`
- `tileDoctors`, `tileAppointment`, `tileContacts`
- `footerCta`, `storiesTitle`, `storiesViewAll`, `newsTitle`

**pages.doctors:**
- `filterSurgeons`

**pages.appointment:**
- `intro`, `sectionContact`, `sectionService`, `sectionDate`

**pages.contacts:**
- `feedbackDesc`

### Патч-скрипты

- `scripts/patch-hss-phase1-i18n.js`
- `scripts/patch-hss-phase2-i18n.js`

После правок `lang/*.json` → `node scripts/build-embed.js`.

### DOM-атрибуты

- `data-i18n="key"` — текст
- `data-i18n-title="pages.home.title"` — `<title>`
- `data-i18n-placeholder="..."` — placeholder
- `data-page="home|doctors|..."` — активный пункт меню

---

## 10. JavaScript — потоки

### Инициализация

1. `HospitalApp.init()` в `common.js`
2. `I18n.init()` → загрузка `lang/{code}.json`
3. `loadData()` → merge `hospital.json` + локальный контент
4. `renderNav()`, `renderFooter()`, `I18n.applyDOM()`
5. Страничный скрипт: `home.js` / `pages.js` / `appointment.js`

### События

- `hospital:refresh` — перерисовка после смены языка
- `I18n.onChange()` → `refreshLanguage()`

### Главная (`home.js`)

- `renderHomePage()` — все 12 блоков
- `renderNews()` — show more/less (порог 10, сейчас 5 новостей)
- `newsExpanded` toggle

### Внутренние (`pages.js`)

- `data-page` на `<body>` определяет страницу
- `renderDoctors(data, surgeonOnly)`
- `renderDepartments(data, filterCategory)` — группировка по категориям
- `initDoctorFilter`, `initServiceFilter`

### Запись (`appointment.js`)

- `fillAppointmentForm()`, `updateDoctorOptions()`
- Submit → `HospitalStorage.addAppointment()`

### Storage (`storage.js`)

Ключи localStorage для заявок и оверрайдов контента (админка).

---

## 11. Заглушки — что заменить на реальный контент CHIC

| Что | Текущее | Нужно |
|-----|---------|-------|
| Адрес | «г. Ереван, ул. Примерная, д. 1» | Реальный адрес CHIC |
| Телефон | +374 (10) 00-00-00 | Реальный |
| Email | info@healthyspine.am | Подтвердить |
| Фото | Unsplash | Фото центра / врачей |
| Врачи | 6 заглушек с русскими именами | Реальные специалисты |
| Новости | 5 фейковых | Реальные или убрать |
| Видео | Play icon без YouTube | Embed или убрать |
| Карта | Текстовый placeholder | Google Maps / Yandex |
| Поиск | Кнопка без логики | Поиск по услугам/врачам |
| Запись | localStorage | Backend / email / CRM |

---

## 12. Не сделано — этап 3+ (для следующего агента)

### Высокий приоритет

1. **`about.html`** — полностью перевести на HSS layout (сейчас legacy about-section)
2. **Реальный контент CHIC** — заменить все заглушки в `hospital.json` и `lang/*.json`
3. **Логотип** — синхронизировать `logo.svg` / `logo.png` в данных
4. **Поиск** — минимум: modal с фильтром по `departments` + `doctors`
5. **YouTube / видео** — реальные embed в `#feature` и `.hss-video-card`

### Средний приоритет

6. **Mega-menu** для Patient Care (dropdown категорий услуг)
7. **Health Library** — страница статей / conditions detail pages
8. **Страницы отдельных услуг** — как у HSS (сейчас только список)
9. **Wizard запись** — многошаговая форма как HSS Book Online
10. **Чистка `hospital-theme.css`** — удалить неиспользуемые `.spine-hero`, `.dept-card` и т.д.

### Низкий приоритет / бэклог

11. **CMS PHP + MySQL** — планировался, не начат
12. **Admin sync** — админка не знает про новые поля (`news`, `storyVideos`, etc.)
13. **SEO** — meta, Open Graph, sitemap
14. **Accessibility audit** — aria, focus states
15. **Тесты** — нет

---

## 13. Правила для следующего Cursor-агента

1. **Не ломать HSS-структуру главной** — 12 блоков, порядок фиксирован.
2. **Новые стили** — в `hss-spine.css`, не раздувать `hospital-theme.css` без нужды.
3. **Минимальный diff** — не рефакторить несвязанный код.
4. **i18n** — любой новый UI-текст в `hy.json`, `ru.json`, `en.json` + `build-embed.js`.
5. **Данные** — новый контент в `hospital.json`, переводы контента в `lang/*.json` (merge по `id`).
6. **Не коммитить** без явного запроса пользователя.
7. **Сервер** — PowerShell не поддерживает `&&`, использовать `;` или отдельные команды.
8. **Проверка** — после CSS всегда напоминать Ctrl+F5.

### Типичные задачи пользователя

- «Добавить услугу» → `hospital.json` departments + i18n content + rebuild embed
- «Изменить текст на главной» → `lang/*.json` pages.home + content arrays
- «Сделать как HSS» → смотреть `hss-spine.css` и https://www.hss.edu/departments/spine
- «Заменить контент» → `hospital.json` + переводы, не хардкодить в HTML

---

## 14. История изменений (хронология)

### Этап 0 (до HSS)
- Шаблон Tooplate 2149 → сайт больницы
- i18n HY/RU/EN
- ~30 услуг в JSON

### Этап 1 — HSS главная + врачи
- `index.html` переписан — 12 блоков
- Создан `css/hss-spine.css`
- `js/home.js`, `js/common.js` (nav HSS)
- `doctors.html` + `pages.js` (hss-doctor-item)
- i18n phase 1

### Этап 2 — внутренние страницы
- `departments.html` — list-style по категориям
- `appointment.html` — упрощённая HSS-форма
- `contacts.html` — HSS layout
- Footer CTA band
- i18n phase 2 + rebuild embed
- CSS overrides для legacy

---

## 15. Быстрые ссылки для проверки

| Страница | URL |
|----------|-----|
| Главная | http://localhost:3000/ |
| Врачи | http://localhost:3000/doctors.html |
| Услуги | http://localhost:3000/departments.html |
| Запись | http://localhost:3000/appointment.html |
| Контакты | http://localhost:3000/contacts.html |
| О центре | http://localhost:3000/about.html |
| Админ | http://localhost:3000/admin/ |

---

## 16. Промпт для старта нового агента

```
Прочитай TZ-HSS-CURSOR.md в корне проекта.
Это сайт «Առողջ ողնաշար» (CHIC), редизайн под HSS Spine.
Этапы 1–2 завершены. Продолжай с этапа 3:
[указать задачу пользователя].
Следуй правилам из раздела 13 ТЗ. Не коммить без запроса.
```

---

*Документ сгенерирован: 2026-05-30. Путь проекта: `c:\Users\PC\Downloads\2149_strategic_consulting\2149_strategic_consulting\`*
