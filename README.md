# ☕ Coffe Dashbord — P&L Report Generator

Минимальный продукт для автоматического формирования отчётов о прибыли и расходах (P&L).

## 📋 Технологии

- **Frontend**: React + Material UI
- **Backend**: NestJS
- **Контейнеризация**: Docker + Docker Compose

## 🚀 Быстрый старт

### Предварительные требования

- Docker
- Docker Compose

### Запуск приложения

```bash
# Перейдите в директорию проекта
cd project-coffe-dashbord

# Запустите приложение
docker-compose up --build

# Для запуска в фоновом режиме
docker-compose up --build -d
```

После запуска приложение будет доступно по адресу:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:4000

### Остановка приложения

```bash
docker-compose down
```

## 📊 Как использовать

1. Откройте http://localhost в браузере
2. Загрузите файл с данными о бизнесе (CSV или Excel)
3. Система автоматически сформирует P&L отчёт

### Формат данных для загрузки

Файл должен содержать следующие колонки (названия могут варьироваться):

| Колонка | Описание | Пример |
|---------|----------|--------|
| Date | Дата операции | 2026-01-05 |
| Description | Описание | Продажа кофе |
| Category | Категория | Продажи |
| Amount | Сумма | 150000 |
| Type | Тип операции | income/expense |

## 🔌 API Endpoints

### POST /api/upload
Загрузка файла для обработки

**Request**: multipart/form-data
- `file`: CSV или Excel файл

**Response**:
```json
{
  "success": true,
  "message": "Файл успешно обработан",
  "pnl": {
    "summary": { ... },
    "byCategory": [ ... ],
    "monthly": [ ... ]
  }
}
```

### GET /api/pnl/sample
Получение демонстрационного P&L отчёта

### GET /api/health
Проверка состояния сервиса

## 📁 Структура проекта

```
project-coffe-dashbord/
├── backend/                # NestJS backend
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   └── pnl.service.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React + Material UI
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── components/
│   │       ├── FileUpload.tsx
│   │       └── PnlReport.tsx
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## 🔧 Разработка

### Запуск backend отдельно

```bash
cd backend
npm install
npm run start:dev
```

### Запуск frontend отдельно

```bash
cd frontend
npm install
npm start
```

## 📈 Возможности

- ✅ Загрузка данных из CSV и Excel
- ✅ Автоматическое распознавание колонок
- ✅ Формирование P&L отчёта
- ✅ Разбивка по категориям
- ✅ Помесячная аналитика
- ✅ Расчёт маржинальности
- ✅ Красивый UI с Material UI

## 🔮 Планы

- Подключение Telegram-бота
- Экспорт отчётов в PDF/Excel
- Пользовательская аутентификация
- История загруженных отчётов
