# Trash Classifier - Backend API

Java Spring Boot REST API for trash classification using ONNX Runtime.

## Tech Stack

- **Java:** 17+
- **Spring Boot:** 3.5.7
- **ONNX Runtime:** 1.16.3
- **Build Tool:** Maven 3.9.11
- **Server:** Embedded Tomcat (port 8080)

## Prerequisites

- Java Development Kit (JDK) 17 or higher
- Maven 3.9 or higher

## Installation

### 1. Verify Java Installation
```bash
java -version
```

Should output: `openjdk version "17"` or higher

### 2. Verify Maven Installation
```bash
mvn -version
```

Should output: `Apache Maven 3.9.x` or higher

## Running the Application

### Development Mode
```bash
cd backend
mvn spring-boot:run
```

The server will start on `http://localhost:8080`

### Production Build
```bash
mvn clean package
java -jar target/trash-classifier-backend-0.0.1-SNAPSHOT.jar
```

## API Endpoints

### Health Check
```
GET http://localhost:8080/api/health
```

**Response:**
```
Backend is running!
```

### Predict
```
POST http://localhost:8080/api/predict
Content-Type: multipart/form-data
```

**Parameters:**
- `image` (file): Image file (JPEG/PNG, max 10MB)

**Response:**
```json
{
  "predictedClass": "plastic",
  "confidence": 0.92,
  "allScores": {
    "cardboard": 0.01,
    "glass": 0.02,
    "metal": 0.01,
    "paper": 0.04,
    "plastic": 0.92
  }
}
```

## Project Structure
```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/trashclassifier/trash_classifier_backend/
│   │   │   ├── TrashClassifierBackendApplication.java
│   │   │   ├── controller/
│   │   │   │   └── PredictionController.java
│   │   │   ├── service/
│   │   │   │   └── ModelService.java
│   │   │   └── model/
│   │   │       └── PredictionResponse.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── model_effb0_mixup.onnx
│   │       └── labels.txt
│   └── test/
├── pom.xml
└── README.md
```

## Key Components

### ModelService
- Loads ONNX model on startup
- Preprocesses images (resize to 224x224, normalize to 0-255 range)
- Runs inference using ONNX Runtime
- Returns predictions with confidence scores

### PredictionController
- REST API endpoint for image classification
- Handles file uploads
- Validates input (file type, size)
- Returns JSON responses

### Image Preprocessing
Images are preprocessed to match training conditions:
1. Resize to 224x224 pixels
2. Convert to RGB
3. Keep pixel values in 0-255 range (no normalization)

## Configuration

Edit `src/main/resources/application.properties`:
```properties
server.port=8080
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

## Troubleshooting

### Port Already in Use

If port 8080 is occupied, change it in `application.properties`:
```properties
server.port=8081
```

### ONNX Model Not Found

Ensure `model_effb0_mixup.onnx` and `labels.txt` are in `src/main/resources/`

### Out of Memory

Increase Java heap size:
```bash
java -Xmx2g -jar target/trash-classifier-backend-0.0.1-SNAPSHOT.jar
```

## Testing

### Unit Tests
```bash
mvn test
```

### Manual Testing with cURL
```bash
curl -X POST http://localhost:8080/api/predict \
  -F "image=@/path/to/image.jpg"
```

## Dependencies

See `pom.xml` for complete list. Key dependencies:
- Spring Boot Starter Web
- ONNX Runtime (1.16.3)
- Apache Commons IO

## Performance

- Average inference time: ~100-200ms per image
- Model size: ~16MB (ONNX FP32)
- Memory usage: ~500MB-1GB

## License

Educational project