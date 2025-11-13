# Trash Classifier - Frontend

React web application for trash classification with image upload and real-time predictions.

## Tech Stack

- **React:** 18.x
- **JavaScript:** ES6+
- **HTTP Client:** Axios
- **Styling:** Inline CSS
- **Build Tool:** Create React App
- **Dev Server:** Webpack Dev Server (port 3000)

## Prerequisites

- **Node.js:** 18+ (includes npm)

## Installation

### 1. Verify Node.js Installation
```bash
node --version
npm --version
```

Should output Node.js v18+ and npm 9+

### 2. Install Dependencies
```bash
cd frontend
npm install
```

This will install all required packages from `package.json`.

## Running the Application

### Development Mode
```bash
npm start
```

The application will open automatically at `http://localhost:3000`

### Production Build
```bash
npm run build
```

Creates optimized production build in `build/` folder.

## Project Structure
```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── ImageUpload.jsx
│   │   └── ResultDisplay.jsx
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Key Components

### App.js
Main component that manages application state and renders child components.

### ImageUpload.jsx
Handles:
- File selection
- Image preview
- Upload to backend API
- Loading states
- Error handling

### ResultDisplay.jsx
Displays:
- Predicted class name
- Confidence score
- Bar chart with all class predictions
- Color-coded results (green for predicted class, blue for others)

## API Configuration

The frontend connects to the backend at `http://localhost:8080`

To change the backend URL, edit `src/components/ImageUpload.jsx`:
```javascript
const response = await axios.post(
  'http://localhost:8080/api/predict',  // Change this URL
  formData
);
```

## Features

### Image Upload
- File picker interface
- Supported formats: JPEG, PNG
- Image preview before classification

### Real-time Predictions
- Sends image to backend API
- Displays loading state during inference
- Shows results with confidence scores

### Visual Results
- Class name displayed prominently
- Confidence percentage
- Bar chart for all predictions
- Sorted by confidence (highest first)
- Color coding (green for winner, blue for others)

## Customization

### Styling

All styles are inline CSS in component files. To modify:

**Colors:**
Edit background colors in `App.js` and component styles.

**Layout:**
Modify inline `style` objects in component JSX.

### Result Display

Edit `ResultDisplay.jsx` to customize how results are shown:
```javascript
// Change predicted class color
color: '#4CAF50'  // Green

// Change bar colors
backgroundColor: className === predictedClass ? '#4CAF50' : '#2196F3'
```

## Troubleshooting

### Port Already in Use

If port 3000 is occupied, React will prompt to use another port. Type `Y` to accept.

### CORS Errors

Ensure backend has CORS enabled for `http://localhost:3000`. Check backend's `PredictionController.java` for `@CrossOrigin` annotation.

### API Connection Failed

Verify:
1. Backend is running on port 8080
2. Backend health check works: `http://localhost:8080/api/health`
3. No firewall blocking connections

### npm install Warnings

Deprecation warnings during `npm install` are normal and can be ignored. They don't affect functionality.

## Development

### Adding New Features

1. Create new component in `src/components/`
2. Import in `App.js`
3. Update state management if needed
4. Test locally with `npm start`

### Code Structure

Components follow functional React patterns:
- Use React Hooks (useState)
- Props for parent-child communication
- Async/await for API calls

## Available Scripts

### `npm start`
Runs development server with hot reload

### `npm test`
Runs test suite (if configured)

### `npm run build`
Creates production build

### `npm run eject`
Ejects from Create React App (irreversible)

## Browser Support

Supports all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance

- Initial load: ~1-2 seconds
- Image upload: ~100-500ms (depends on image size)
- Prediction display: Instant after API response

## Dependencies

Key packages (see `package.json` for complete list):
- `react`: ^18.x
- `react-dom`: ^18.x
- `axios`: Latest
- `react-scripts`: Latest

## License

Educational project