# Healthify AI

Healthify AI is a full-stack health companion project split into three services:

- `healthcare-companion`: React frontend for authentication, dashboarding, symptom checks, chat, diet planning, reports, and doctor discovery.
- `healthcare-backend`: Node.js/Express API with MongoDB for auth, user profiles, reports, water tracking, symptom history, diet plans, and AI chat orchestration.
- `ml-service`: Flask-based disease prediction service backed by a trained scikit-learn model and local CSV datasets.

## Project Structure

```text
Healthify_AI/
|-- healthcare-backend/
|-- healthcare-companion/
|-- ml-service/
```

## What The Project Currently Does

### Frontend (`healthcare-companion`)

- Sign up and sign in flows with JWT stored in `localStorage`
- Health dashboard with:
  - editable health profile
  - calorie logging using a built-in food database
  - water intake tracking
  - daily goals and quick actions
- Symptom checker UI that sends symptom data to the backend
- AI chat interface with persistent chat sessions in `localStorage`
- Predictive insight widgets and charts for weight, BMI, obesity risk, and health score
- Diet planner with prebuilt vegetarian and non-vegetarian plans for multiple goals
- Health report upload and viewing for JPG, PNG, and PDF files
- Doctor and hospital finder using React Leaflet plus OpenStreetMap / Overpass live data

### Backend (`healthcare-backend`)

- Express API with CORS enabled for `http://localhost:3000`
- MongoDB integration through Mongoose
- JWT-based authentication
- Protected routes for:
  - auth/profile
  - symptom prediction history
  - AI chat and insight generation
  - diet recommendations
  - report storage
  - water intake submission/history
- Chat layer that tries Gemini first and falls back to hardcoded responses if AI generation fails
- Symptom prediction flow that calls the Python ML service and falls back to rule-based disease mapping if the ML service is unavailable

### ML Service (`ml-service`)

- Flask API with `GET /`, `GET /health`, `POST /predict`, `GET /diseases`, and `GET /symptoms`
- Pretrained model artifacts already present under `ml-service/models`
- Training script for rebuilding the disease model from CSV datasets
- Prediction pipeline that:
  - matches user symptoms with dataset features and synonyms
  - adjusts probabilities by age
  - adjusts risk/advice by symptom duration
  - returns top predictions, precautions, and diet suggestions

## Tech Stack

- Frontend: React 19, `react-scripts`, Axios, Recharts, React Markdown, React Leaflet
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs, Axios
- AI integrations in backend: `@google/genai`, custom fallback logic
- ML service: Flask, pandas, numpy, scikit-learn, joblib
- Database: MongoDB

## Environment Variables

### Backend (`healthcare-backend`)

Create a local `healthcare-backend/.env` file for the backend secrets and service configuration.

The backend reads environment variables for:

- database connection
- JWT/auth secret
- ML service URL
- AI provider key
- optional runtime overrides

### Frontend (`healthcare-companion`)

Create a local `healthcare-companion/.env` file only if you want to override the frontend API base URL.

### ML Service (`ml-service`)

Create a local `ml-service/.env` file only if you want custom runtime configuration.

## How To Run The Project

Open three terminals from the repo root.

### 1. Start the ML service

```powershell
cd d:\Healthify_AI\ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 2. Start the backend

```powershell
cd d:\Healthify_AI\healthcare-backend
npm install
npm run dev
```

### 3. Start the frontend

```powershell
cd d:\Healthify_AI\healthcare-companion
npm install
npm start
```

## Important Runtime Notes

- Start the services in this order: ML service, backend, frontend.
- The backend depends on MongoDB and exits on connection failure.
- Symptom prediction still works without the ML service because the backend has a fallback predictor, but results will come from rule-based logic instead of the Flask model.
- AI chat still responds without Gemini because the backend includes fallback responses.
- The doctors page fetches live place data in the browser, so it needs internet access.
- Uploaded reports are stored in MongoDB as base64 payloads, not on disk.

## API Overview

### Backend

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `POST /api/symptoms/predict`
- `GET /api/symptoms/history`
- `POST /api/chat`
- `POST /api/chat/insights`
- `GET /api/chat/history`
- `GET /api/diet`
- `POST /api/diet/custom`
- `GET /api/reports`
- `GET /api/reports/:id`
- `POST /api/reports`
- `DELETE /api/reports/:id`
- `POST /api/water/submit-daily`
- `GET /api/water/today`
- `GET /api/water/history`

### ML Service

- `GET /`
- `GET /health`
- `POST /predict`
- `GET /diseases`
- `GET /symptoms`

## Model And Data Assets

The repository currently includes:

- trained model files in `ml-service/models`
- source datasets in `ml-service/data`

That means the ML service can run immediately if Python dependencies are installed.

## Conclusion

Healthify AI combines the frontend experience, backend services, and machine learning layer into one unified healthcare companion project. It already covers important flows such as symptom checking, AI chat guidance, report management, nutrition planning, and doctor discovery.

As the project continues to improve in structure, testing, and deployment readiness, it has a strong foundation for becoming a more polished and reliable health support platform.
