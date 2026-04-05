# Healthify AI

Healthify AI is a full-stack healthcare companion that combines symptom intelligence, personalized guidance, and predictive wellness insights in one experience.

## Live Demo

- Frontend: https://healthify-ai-1-frontend.onrender.com

## Core Highlights

- Personalized health profile with age, activity, diet, and goals
- Symptom checker powered by a dedicated ML service
- AI chat assistant with context-aware health insights
- Predictive charts for weight trend, obesity risk, and health score
- Diet recommendations and custom meal planning
- Health report upload and tracking
- Daily water intake tracking
- Doctor and hospital discovery map

## Architecture

```text
Healthify_AI/
  healthcare-companion/   # React frontend
  healthcare-backend/     # Node.js + Express API
  ml-service/             # Flask + scikit-learn models
```

### Service Flow

1. Frontend calls backend APIs under `/api/*`
2. Backend handles auth, business logic, and data persistence
3. Backend calls ML service for symptom and health predictions
4. MongoDB stores user profiles, chat history, reports, and tracking data

## Tech Stack

- Frontend: React, Axios, Recharts, React Markdown, React Leaflet
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs
- ML Service: Flask, pandas, numpy, scikit-learn, joblib
- AI: Google GenAI integration with graceful fallback handling
- Database: MongoDB Atlas

## Main Features

### Authentication and Profile

- User registration and login
- JWT-based protected routes
- Editable health profile used across recommendations and predictions

### Symptom Intelligence

- Symptom-to-disease prediction
- Risk-level output and safety-oriented guidance
- Disease and symptom catalog endpoints for UI support

### AI Health Chat

- Conversational health guidance
- Profile-grounded responses
- Predictive insights embedded in chat experience

### Predictive Wellness

- Predicted weight and health score
- Obesity risk classification
- Projection charts for progress with and without plan adherence

### Lifestyle Support

- Diet recommendation flow
- Health report management
- Daily water tracking and history
- Doctor locator with map-based exploration

## API Snapshot

### Backend (`healthcare-backend`)

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

### ML Service (`ml-service`)

- `GET /`
- `GET /health`
- `POST /predict`
- `GET /diseases`
- `GET /symptoms`
- `POST /predict/health`

## Local Development

Run all three services in separate terminals.

### 1) ML Service

```powershell
cd ml-service
pip install -r requirements.txt
python app.py
```

### 2) Backend

```powershell
cd healthcare-backend
npm install
npm run dev
```

### 3) Frontend

```powershell
cd healthcare-companion
npm install
npm start
```

## Environment Notes

- Keep secrets in environment variables only
- Do not commit API keys, DB credentials, or auth secrets
- Frontend should use `REACT_APP_API_URL` to point at backend `/api`
- Backend should use `ML_SERVICE_URL` to point at deployed ML service

## Project Vision

Healthify AI is designed to be more than a generic chatbot. The platform emphasizes data-grounded health guidance by combining profile context, domain logic, and model-driven predictions in a practical and user-friendly workflow.
