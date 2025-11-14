# Sunnah Way Articles API

Simple Node/Express API serving Articles data (categories, list, detail) from JSON files.

## Requirements
- Node.js 18+
- npm

## Install & Run
```bash
# from articles_api folder
npm install
npm run dev   # reload on changes
# or
npm start     # plain node
```

- Server will run at: http://localhost:8081

## Endpoints
- GET /articles/categories
- GET /articles?categoryId=<id>
- GET /articles/:id

## Data Source
JSON files located in `data/`:
- `data/categories.json`
- `data/articles.json`

Edit these files to manage content (bn/en/ar supported fields):
```json
{
  "id": "intro-aqidah-1",
  "categoryId": "aqeedah",
  "titleBn": "আকীদার প্রাথমিক পরিচিতি",
  "titleEn": "Introduction to Aqidah",
  "titleAr": "مقدمة في العقيدة",
  "contentBn": "...",
  "contentEn": "...",
  "contentAr": "..."
}
```

## Flutter Integration
Set base URL via dart-define when running the app:

Android emulator:
```bash
flutter run --dart-define=ARTICLES_API_BASE_URL=http://10.0.2.2:8081
```
Windows/iOS simulator:
```bash
flutter run --dart-define=ARTICLES_API_BASE_URL=http://localhost:8081
```
Physical device (on same network):
```bash
flutter run --dart-define=ARTICLES_API_BASE_URL=http://<YOUR_PC_IP>:8081
```

The Flutter repo uses `ArticlesRepository` with automatic fallback to local placeholders if API is unavailable.

## Deploy (optional)
- Use Railway/Render/Vercel to deploy this folder
- Set PORT via platform (defaults to 8081)

## Publish to GitHub
```powershell
# from project root
git -C articles_api init
git -C articles_api add .
git -C articles_api commit -m "Initial commit: Articles API (categories, list, detail)"
git -C articles_api branch -M main
git -C articles_api remote add origin https://github.com/USER/sunnahway-Article.git
git -C articles_api push -u origin main
```
