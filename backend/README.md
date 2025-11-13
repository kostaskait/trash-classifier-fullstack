# Trash Classifier - Backend

Spring Boot REST API for trash classification with ONNX Runtime inference and PostgreSQL database integration.

## Tech Stack

- **Java:** 17+
- **Spring Boot:** 3.5.7
- **Spring Data JPA:** For database operations
- **PostgreSQL:** 18
- **ONNX Runtime:** 1.16.3 (ML inference)
- **Maven:** 3.9+
- **Server:** Embedded Tomcat (port 8080)

## Features

- **ML Inference:** ONNX Runtime for EfficientNetB0 model
- **Image Processing:** Resize, normalize, tensor conversion
- **Database Integration:** Auto-save all classifications
- **REST API:** 6 endpoints for predictions, history, and statistics
- **CORS Enabled:** For frontend communication
- **JPA/Hibernate:** ORM for PostgreSQL

## Prerequisites

- **JDK 17+**
- **Maven 3.9+**
- **PostgreSQL 18+** (running on port 5432)

## Database Setup

### 1. Install PostgreSQL

Download from: https://www.postgresql.org/download/

### 2. Create Database

Open pgAdmin or psql and run:
```sql
CREATE DATABASE trash_classifier;
```

### 3. Create Tables
```sql
-- Classifications table
CREATE TABLE classifications (
    id SERIAL PRIMARY KEY,
    predicted_class VARCHAR(20) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    image_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classification scores table
CREATE TABLE classification_scores (
    id SERIAL PRIMARY KEY,
    classification_id INTEGER REFERENCES classifications(id) ON DELETE CASCADE,
    class_name VARCHAR(20) NOT NULL,
    score DOUBLE PRECISION NOT NULL
);

-- Environmental impact table
CREATE TABLE environmental_impact (
    id SERIAL PRIMARY KEY,
    material VARCHAR(20) UNIQUE NOT NULL,
    decomposition_time VARCHAR(100),
    co2_per_kg DOUBLE PRECISION,
    recycling_rate DOUBLE PRECISION,
    fun_fact TEXT,
    tips TEXT
);

-- Insert environmental data
INSERT INTO environmental_impact (material, decomposition_time, co2_per_kg, recycling_rate, fun_fact, tips) VALUES
('plastic', '450 years', 6.0, 9.0, 
 'Globally, only around 9% of plastic waste is estimated to be recycled, so correct sorting at home and at work really matters.',
 'Empty and lightly rinse plastic packaging and place it loose in the blue recycling bin.'),

('paper', '2-6 weeks', 1.5, 66.0,
 'Recycling paper saves energy and raw materials; one ton of recycled paper can save around 17 trees and thousands of liters of water.',
 'Place only clean and dry paper in the blue recycling bin. Remove staples, large paper clips and plastic windows from envelopes as much as you can.'),

('glass', '1 million years', 0.5, 27.0,
 'Glass can be recycled practically endlessly without losing quality, which makes it one of the most circular packaging materials.',
 'Put glass bottles and jars into the special glass containers or into the blue recycling bin if your municipality accepts glass there. Remove caps and lids.'),

('metal', '50-500 years', 2.5, 70.0,
 'Recycling aluminium can save up to 95% of the energy needed to produce new aluminium from ore, while also cutting CO2 emissions.',
 'Empty, lightly rinse and then crush cans so they take up less space. Place them in the blue recycling bin, loose and not sealed inside bags.'),

('cardboard', '2-3 months', 1.2, 85.0,
 'Producing cardboard from recycled material can require up to 75% less energy than making it from virgin fibers, while also saving landfill space.',
 'Always flatten cardboard boxes before you recycle them. Remove tape, plastic film and foam; if they do not fit inside the blue recycling bin, leave them clean and neatly stacked next to it.');
```

## Configuration

### application.properties

Located at: `src/main/resources/application.properties`
```properties
# Server Configuration
server.port=8080

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/trash_classifier
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD_HERE
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true
```

**IMPORTANT:** Replace `YOUR_PASSWORD_HERE` with your PostgreSQL password!

## Installation & Running

### 1. Clone the repository
```bash
cd backend
```

### 2. Configure database
Edit `src/main/resources/application.properties` and set your PostgreSQL password.

### 3. Build and run
```bash
# Using Maven wrapper (recommended)
./mvnw spring-boot:run

# Or on Windows
.\mvnw spring-boot:run

# Or with installed Maven
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

You should see:
```
Loading ONNX model...
ONNX model loaded successfully!
Labels loaded: [cardboard, glass, metal, paper, plastic]
Started TrashClassifierBackendApplication in X seconds
```

## Project Structure
```
backend/
├── src/
│   └── main/
│       ├── java/com/trashclassifier/trash_classifier_backend/
│       │   ├── controller/
│       │   │   └── PredictionController.java      # REST API endpoints
│       │   ├── entity/
│       │   │   ├── Classification.java            # JPA entity
│       │   │   ├── ClassificationScore.java       # JPA entity
│       │   │   └── EnvironmentalImpact.java       # JPA entity
│       │   ├── model/
│       │   │   └── PredictionResponse.java        # DTO
│       │   ├── repository/
│       │   │   ├── ClassificationRepository.java  # JPA repository
│       │   │   └── EnvironmentalImpactRepository.java
│       │   ├── service/
│       │   │   └── ModelService.java              # ML inference logic
│       │   └── TrashClassifierBackendApplication.java
│       └── resources/
│           ├── application.properties              # Configuration
│           ├── model_effb0_mixup.onnx             # ONNX model
│           └── labels.txt                          # Class labels
├── pom.xml                                         # Maven dependencies
└── README.md
```

## API Endpoints

### 1. POST /api/predict
Upload image for classification

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: image file (JPEG/PNG, max 10MB)

**Response:**
```json
{
  "predictedClass": "plastic",
  "confidence": 0.9022,
  "allScores": {
    "plastic": 0.9022,
    "glass": 0.0522,
    "metal": 0.0256,
    "cardboard": 0.0119,
    "paper": 0.0081
  }
}
```

**Side Effect:** Automatically saves classification to database

### 2. GET /api/history
Retrieve all past classifications

**Response:**
```json
[
  {
    "id": 1,
    "predictedClass": "plastic",
    "confidence": 0.9022,
    "imageName": "plastic100.jpg",
    "createdAt": "2025-11-13T13:25:28.061831",
    "scores": [...]
  }
]
```

### 3. GET /api/statistics
Get classification statistics

**Response:**
```json
{
  "totalClassifications": 5,
  "distribution": [
    {"name": "paper", "count": 2},
    {"name": "plastic", "count": 1},
    {"name": "metal", "count": 1},
    {"name": "cardboard", "count": 1}
  ]
}
```

### 4. GET /api/environmental
Get all environmental impact data

**Response:**
```json
[
  {
    "id": 1,
    "material": "plastic",
    "decompositionTime": "450 years",
    "co2PerKg": 6.0,
    "recyclingRate": 9.0,
    "funFact": "...",
    "tips": "..."
  }
]
```

### 5. GET /api/environmental/{material}
Get environmental info for specific material

**Example:** `/api/environmental/plastic`

**Response:**
```json
{
  "id": 1,
  "material": "plastic",
  "decompositionTime": "450 years",
  "co2PerKg": 6.0,
  "recyclingRate": 9.0,
  "funFact": "Globally, only around 9% of plastic waste is estimated to be recycled...",
  "tips": "Empty and lightly rinse plastic packaging..."
}
```

### 6. GET /api/health
Health check endpoint

**Response:**
```
Backend is running!
```

## Key Classes

### PredictionController
- REST API endpoints
- Image validation
- Auto-save to database
- CORS configuration

### ModelService
- Load ONNX model at startup
- Image preprocessing (resize to 224x224)
- ONNX Runtime inference
- Post-processing predictions

### Entity Classes
- **Classification:** Main classification record
- **ClassificationScore:** Individual class scores
- **EnvironmentalImpact:** Static environmental data

### Repository Classes
- **ClassificationRepository:** CRUD + custom queries
- **EnvironmentalImpactRepository:** Environmental data access

## Image Processing Pipeline

1. **Upload:** Receive multipart file
2. **Validation:** Check type (JPEG/PNG) and size (<10MB)
3. **Resize:** Scale to 224x224 pixels
4. **Convert:** RGB to float tensor [1, 224, 224, 3]
5. **Inference:** Run through ONNX model
6. **Post-process:** Extract predictions
7. **Save:** Store in PostgreSQL
8. **Response:** Return JSON

## Database Operations

All classifications are automatically saved with:
- Predicted class and confidence
- All class scores (stored in separate table)
- Image filename
- Timestamp

JPA handles:
- Entity relationships (One-to-Many)
- Cascade operations
- Transaction management

## Dependencies (pom.xml)

Key dependencies:
```xml
<!-- Spring Boot Web -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- PostgreSQL Driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- ONNX Runtime -->
<dependency>
    <groupId>com.microsoft.onnxruntime</groupId>
    <artifactId>onnxruntime</artifactId>
    <version>1.16.3</version>
</dependency>
```

## Troubleshooting

### Port 8080 already in use
```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (Windows)
taskkill /PID <PID> /F
```

### Database connection failed
- Verify PostgreSQL is running
- Check username/password in application.properties
- Ensure database `trash_classifier` exists
- Check firewall settings

### Model not loading
- Verify `model_effb0_mixup.onnx` exists in `src/main/resources/`
- Check file is not corrupted
- Ensure ONNX Runtime dependency is included

### Java version mismatch
```bash
# Check Java version
java -version

# Should be 17 or higher
```

## Testing

### Test health endpoint
```bash
curl http://localhost:8080/api/health
```

### Test prediction with image
```bash
curl -X POST http://localhost:8080/api/predict \
  -F "image=@/path/to/image.jpg"
```

### Test database connection
Check logs for:
```
HikariPool-1 - Start completed.
```

## Performance

- **Startup time:** ~3-5 seconds
- **Inference time:** ~100-300ms per image
- **Memory usage:** ~500MB-1GB
- **Concurrent requests:** Supports multiple simultaneous predictions

## License

Educational project