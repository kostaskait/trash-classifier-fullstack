# Trash Classifier - Full-Stack ML Application

A complete machine learning application for automatic trash classification using computer vision. Built with Python (training), Java/Spring Boot (backend), and React (frontend).

## Project Overview

This application classifies images of trash into 5 categories:
- **Cardboard**
- **Glass**
- **Metal**
- **Paper**
- **Plastic**

**Accuracy:** ~90% on test data

---

## Architecture
```
┌─────────────────────────────────────────┐
│  Frontend (React)                       │
│  - Image upload UI                      │
│  - Real-time predictions                │
│  - Results visualization                │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
               ↓
┌─────────────────────────────────────────┐
│  Backend (Java + Spring Boot)           │
│  - REST API endpoints                   │
│  - ONNX Runtime inference               │
│  - Image preprocessing                  │
└──────────────┬──────────────────────────┘
               │ Loads model
               ↓
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
- **Build Tool:** Maven 3.9+
- **Server:** Embedded Tomcat (port 8080)

### Frontend
- **Language:** JavaScript (ES6+)
- **Framework:** React 18
- **HTTP Client:** Axios
- **Styling:** Inline CSS
- **Dev Server:** Webpack (port 3000)

---

## Project Structure
```
trash-classifier-fullstack/
├── ml-training/              # Python ML training code
│   ├── trash_classification.ipynb
│   └── README.md
├── backend/                  # Java Spring Boot API
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── frontend/                 # React web app
│   ├── src/
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

### 1. Backend Setup
```bash
cd backend
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

### 3. Test the Application

1. Open browser: `http://localhost:3000`
2. Upload an image of trash
3. Click "Classify Image"
4. View results with confidence scores

---

## Model Performance

- **Training Accuracy:** 90-91%
- **Validation Accuracy:** 90%
- **Test Accuracy (with TTA):** 90.6%
- **Dataset Split:** 70% train / 15% validation / 15% test

### Confusion Matrix
*(See ml-training/README.md for detailed metrics)*

---

## Academic Context

This project was developed as part of a thesis/capstone project demonstrating:
- End-to-end ML pipeline (training to deployment)
- Full-stack development skills
- Enterprise tech stack (Java/Spring Boot)
- Modern frontend frameworks (React)
- Production-ready practices (Git, CI/CD ready)

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