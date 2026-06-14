# Сайт больницы (на базе Tooplate 2149)

## Языки (i18n)

- **Հայերեն (HY)** — по умолчанию
- **Русский (RU)**
- **English (EN)**

Переключатель в шапке сайта. Выбор сохраняется в `localStorage`.

Файлы переводов:
- `lang/config.json` — список языков (добавьте новый язык здесь)
- `lang/hy.json`, `lang/ru.json`, `lang/en.json` — тексты интерфейса и контента

## Запуск

Откройте `index.html` через локальный веб-сервер (для загрузки `data/hospital.json`):

```bash
npx --yes serve .
```

Или в VS Code / Cursor: расширение Live Server.

## Структура

| Раздел | Файл |
|--------|------|
| Главная | `index.html` |
| О больнице | `about.html` |
| Врачи | `doctors.html` |
| Отделения | `departments.html` |
| Запись | `appointment.html` |
| Контакты | `contacts.html` |
| Админ | `admin/index.html` (пароль: `admin123`) |

## Сохранённые оригиналы

- `legacy/strategic-consulting-original.html` — исходная страница консалтинга
- `tooplate-strategic-style.css`, `tooplate-strategic-scripts.js` — без изменений

## Продакшен

Сейчас заявки и правки контента в **localStorage**. Для реальной больницы добавьте бэкенд (Node, PHP, Python) и БД.
