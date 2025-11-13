# Trash Classifier - Full-Stack ML Application

A complete machine learning application for automatic trash classification using computer vision. Built with Python (training), Java/Spring Boot (backend), React (frontend), and PostgreSQL (database).

## Project Overview

This application classifies images of trash into 5 categories:
- **Cardboard**
- **Glass**
- **Metal**
- **Paper**
- **Plastic**

**Accuracy:** ~90% on test data

---

## Features

### Core Functionality
- **Image Classification**: Upload images and get real-time predictions with confidence scores
- **Multi-class Support**: Classifies 5 different material types
- **Confidence Visualization**: Bar charts showing all prediction scores

### Database Integration
- **PostgreSQL Database**: All classifications are automatically saved
- **Classification History**: View all past classifications with timestamps
- **Statistics Dashboard**: Visual analytics with pie charts and bar charts
- **Environmental Information**: Learn about the environmental impact of each material

### Analytics & Insights
- **Total Classifications Counter**: Track your recycling awareness
- **Material Distribution**: Pie chart showing breakdown by material type
- **Classification Trends**: Bar chart with counts per material
- **Detailed Statistics Table**: Percentages and counts for each category

### Educational Content
- **Decomposition Times**: How long each material takes to decompose
- **Recycling Rates**: Current recycling statistics for each material
- **CO2 Impact**: Carbon footprint per kilogram of material
- **Fun Facts**: Interesting environmental facts
- **Recycling Tips**: Best practices for proper recycling

---

## Architecture
```
┌─────────────────────────────────────────┐
│  Frontend (React)                       │
│  - Image upload UI                      │
│  - Real-time predictions                │
│  - History page                         │
│  - Statistics dashboard                 │
│  - Environmental info                   │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
               ↓
┌─────────────────────────────────────────┐
│  Backend (Java + Spring Boot)           │
│  - REST API endpoints                   │
│  - ONNX Runtime inference               │
│  - Image preprocessing                  │
│  - Database operations (JPA)            │
└──────────────┬──────────────────────────┘
               │ JDBC
               ↓
┌─────────────────────────────────────────┐
│  Database (PostgreSQL)                  │
│  - Classifications storage              │
│  - Classification scores                │
│  - Environmental impact data            │
└─────────────────────────────────────────┘
               ↑
               │ Loads model
┌─────────────────────────────────────────┐
│  ML Model (ONNX)                        │
│  - EfficientNetB0 architecture          │
│  - Trained on custom dataset            │
└─────────────────────────────────────────┘
```

---

## Tech Stack

### Machine Learning
- **Language:** Python 3.x
- **Framework:** TensorFlow/Keras
- **Model:** EfficientNetB0 (transfer learning)
- **Training:** Kaggle Notebooks (GPU: Tesla P100)
- **Techniques:** MixUp augmentation, label smoothing, 2-stage fine-tuning

### Backend
- **Language:** Java 17+
- **Framework:** Spring Boot 3.5.7
- **ML Runtime:** ONNX Runtime Java 1.16.3
- **Database:** PostgreSQL 18
- **ORM:** Spring Data JPA / Hibernate
- **Build Tool:** Maven 3.9+
- **Server:** Embedded Tomcat (port 8080)

### Frontend
- **Language:** JavaScript (ES6+)
- **Framework:** React 18
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Styling:** Inline CSS
- **Dev Server:** Webpack (port 3000)

### Database
- **DBMS:** PostgreSQL 18
- **Tables:** 3 (classifications, classification_scores, environmental_impact)
- **Management Tool:** pgAdmin 4

---

## Project Structure
```
trash-classifier-fullstack/
├── ml-training/              # Python ML training code
│   ├── trash_classification.ipynb
│   └── README.md
├── backend/                  # Java Spring Boot API
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/trashclassifier/trash_classifier_backend/
│   │       │       ├── controller/
│   │       │       │   └── PredictionController.java
│   │       │       ├── entity/
│   │       │       │   ├── Classification.java
│   │       │       │   ├── ClassificationScore.java
│   │       │       │   └── EnvironmentalImpact.java
│   │       │       ├── model/
│   │       │       │   └── PredictionResponse.java
│   │       │       ├── repository/
│   │       │       │   ├── ClassificationRepository.java
│   │       │       │   └── EnvironmentalImpactRepository.java
│   │       │       └── service/
│   │       │           └── ModelService.java
│   │       └── resources/
│   │           ├── application.properties
│   │           ├── model_effb0_mixup.onnx
│   │           └── labels.txt
│   ├── pom.xml
│   └── README.md
├── frontend/                 # React web app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── ResultDisplay.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Statistics.jsx
│   │   │   └── EnvironmentalInfo.jsx
│   │   ├── App.js
│   │   └── App.css
│   ├── package.json
│   └── README.md
└── README.md                 # This file
```

---

## Quick Start

### Prerequisites
- **Java 17+** (JDK)
- **Maven 3.9+**
- **Node.js 18+** (includes npm)
- **PostgreSQL 18+**

### 1. Database Setup

#### Install PostgreSQL
Download and install from: https://www.postgresql.org/download/

#### Create Database
```sql
-- Open pgAdmin and create database
CREATE DATABASE trash_classifier;

-- Run the schema (see backend/README.md for full SQL)
```

### 2. Backend Setup
```bash
cd backend

# Configure database password in src/main/resources/application.properties
# spring.datasource.password=YOUR_PASSWORD

mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

### 4. Test the Application

1. Open browser: `http://localhost:3000`
2. Navigate through pages:
   - **Home**: Upload and classify images
   - **History**: View past classifications
   - **Statistics**: See analytics dashboard
   - **Environmental**: Learn about recycling

---

## Database Schema

### classifications
- `id` (Primary Key)
- `predicted_class` (varchar)
- `confidence` (double)
- `image_name` (varchar)
- `created_at` (timestamp)

### classification_scores
- `id` (Primary Key)
- `classification_id` (Foreign Key)
- `class_name` (varchar)
- `score` (double)

### environmental_impact
- `id` (Primary Key)
- `material` (varchar, unique)
- `decomposition_time` (varchar)
- `co2_per_kg` (double)
- `recycling_rate` (double)
- `fun_fact` (text)
- `tips` (text)

---

## API Endpoints

### POST /api/predict
Upload image for classification
- **Request:** multipart/form-data with image file
- **Response:** JSON with prediction results
- **Auto-saves** to database

### GET /api/history
Retrieve all past classifications
- **Response:** JSON array of classifications (newest first)

### GET /api/statistics
Get classification statistics
- **Response:** JSON with total count and distribution

### GET /api/environmental
Get all environmental impact data
- **Response:** JSON array of all materials

### GET /api/environmental/{material}
Get environmental info for specific material
- **Response:** JSON with detailed environmental data

### GET /api/health
Health check endpoint

---

## Model Performance

- **Training Accuracy:** 90-91%
- **Validation Accuracy:** 90%
- **Test Accuracy (with TTA):** 90.6%
- **Dataset Split:** 70% train / 15% validation / 15% test

---

## Features in Detail

### Home Page
- Drag-and-drop image upload
- Real-time classification
- Confidence scores for all classes
- Visual progress bars

### History Page
- Grid view of all classifications
- Timestamps and filenames
- Confidence scores
- Sorted by most recent

### Statistics Dashboard
- Total classifications counter
- Pie chart: Material distribution
- Bar chart: Classification counts
- Detailed table with percentages

### Environmental Info
- Interactive cards for each material
- Decomposition time information
- Current recycling rates
- CO2 impact per kilogram
- Educational fun facts
- Practical recycling tips

---

## Academic Context

This project was developed as part of a thesis/capstone project demonstrating:
- End-to-end ML pipeline (training to deployment)
- Full-stack development skills
- Enterprise tech stack (Java/Spring Boot)
- Modern frontend frameworks (React)
- Database design and integration (PostgreSQL)
- RESTful API design
- Production-ready practices (Git, modular architecture)

---

## Future Enhancements

- User authentication system
- Weekly/monthly statistics
- Export reports (PDF/CSV)
- Mobile app version
- Real-time notifications
- Gamification features

---

## Detailed Documentation

- **ML Training:** See [ml-training/README.md](ml-training/README.md)
- **Backend API:** See [backend/README.md](backend/README.md)
- **Frontend UI:** See [frontend/README.md](frontend/README.md)

---

## Contributing

This is an academic project. For issues or suggestions, please open an issue on GitHub.

---

## License

This project is for educational purposes.

---

## Author

**Kostas Kaitetzidis**  
GitHub: [@kostaskait](https://github.com/kostaskait)

---

**Built for learning and demonstrating full-stack ML development**