# Trash Classifier - Frontend

React web application for trash classification with image upload, history tracking, statistics dashboard, and environmental information.

## Tech Stack

- **React:** 18.x
- **JavaScript:** ES6+
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Styling:** Inline CSS
- **Build Tool:** Create React App
- **Dev Server:** Webpack Dev Server (port 3000)

## Features

### Home Page
- Image upload with file picker
- Image preview before classification
- Real-time prediction results
- Confidence scores for all classes
- Visual progress bars
- Color-coded results

### History Page
- Grid layout of all past classifications
- Timestamps for each classification
- Image filenames displayed
- Confidence percentages
- Sorted by most recent first
- Responsive card design

### Statistics Dashboard
- Total classifications counter
- Pie chart: Material distribution
- Bar chart: Classification counts
- Detailed breakdown table
- Percentage calculations
- Color-coded by material type

### Environmental Info Page
- Interactive material cards
- Decomposition time information
- Recycling rate statistics
- CO2 impact per kilogram
- Educational fun facts
- Practical recycling tips
- Click to expand details

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

This will install:
- react
- react-dom
- axios
- recharts
- react-scripts
- And all other required packages

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

### Run Production Build Locally
```bash
npm install -g serve
serve -s build
```

## Project Structure
```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── ImageUpload.jsx           # Image upload component
│   │   ├── ResultDisplay.jsx         # Results display
│   │   ├── History.jsx               # History page
│   │   ├── Statistics.jsx            # Statistics dashboard
│   │   └── EnvironmentalInfo.jsx     # Environmental info page
│   ├── App.js                        # Main app with navigation
│   ├── App.css                       # App styles
│   ├── index.js                      # Entry point
│   └── index.css                     # Global styles
├── package.json                      # Dependencies
└── README.md                         # This file
```

## Components Overview

### App.js
Main component managing:
- Page navigation (Home, History, Statistics, Environmental)
- State management
- Navigation bar rendering
- Page routing

### ImageUpload.jsx
Handles:
- File selection with validation
- Image preview rendering
- Upload to backend API
- Loading states
- Error handling
- File type validation (JPEG/PNG only)
- File size validation (max 10MB)

**Key Functions:**
- `handleFileSelect`: Validates and sets selected file
- `handleUpload`: Sends image to backend

### ResultDisplay.jsx
Displays:
- Predicted class name (large, bold)
- Confidence percentage
- All class predictions with scores
- Progress bars for each class
- Color coding (green for predicted, blue for others)
- Sorted by confidence (highest first)

### History.jsx
Features:
- Fetches all classifications from backend
- Grid layout (responsive)
- Card-based UI for each classification
- Hover effects
- Formatted timestamps
- Empty state message

**API Call:** `GET /api/history`

### Statistics.jsx
Displays:
- Total count card (big green banner)
- Pie chart using Recharts
- Bar chart using Recharts
- Detailed table with percentages
- Material-specific colors
- Responsive grid layout

**API Call:** `GET /api/statistics`

### EnvironmentalInfo.jsx
Features:
- 5 material cards (plastic, paper, glass, metal, cardboard)
- Click to expand details
- Decomposition time display
- Recycling rate percentage
- CO2 impact information
- Fun facts panel
- Recycling tips panel
- Color-coded by material
- Smooth animations

**API Calls:** `GET /api/environmental`

## API Configuration

The frontend connects to the backend at `http://localhost:8080`

To change the backend URL, update these files:

### ImageUpload.jsx
```javascript
const response = await axios.post(
  'http://localhost:8080/api/predict',  // Change this
  formData
);
```

### History.jsx
```javascript
const response = await axios.get('http://localhost:8080/api/history');  // Change this
```

### Statistics.jsx
```javascript
const response = await axios.get('http://localhost:8080/api/statistics');  // Change this
```

### EnvironmentalInfo.jsx
```javascript
const response = await axios.get('http://localhost:8080/api/environmental');  // Change this
```

## Styling

All styles are inline CSS for simplicity and portability.

### Color Palette

**Navigation:**
- Background: `#2c3e50` (dark blue-gray)
- Active button: `#4CAF50` (green)
- Inactive button: `#34495e` (blue-gray)

**Materials:**
- Plastic: `#FF6384` (pink/red)
- Paper: `#0088FE` (blue)
- Glass: `#00C49F` (teal/green)
- Metal: `#FFBB28` (yellow/gold)
- Cardboard: `#FF8042` (orange)

**UI Elements:**
- Success: `#4CAF50` (green)
- Background: `#f5f5f5` (light gray)
- Cards: `#ffffff` (white)
- Text: `#333333` (dark gray)
- Muted text: `#666666` (gray)

### Responsive Design

- Grid layouts with `auto-fit`
- Minimum column widths (280px-400px)
- Flexible containers
- Mobile-friendly spacing

## Key Features Implementation

### Navigation System
```javascript
const [currentPage, setCurrentPage] = useState('home');

const renderPage = () => {
  switch (currentPage) {
    case 'home': return <Home />;
    case 'history': return <History />;
    case 'statistics': return <Statistics />;
    case 'environmental': return <EnvironmentalInfo />;
  }
};
```

### Image Upload Flow
1. User selects file
2. Frontend validates (type, size)
3. Show preview
4. User clicks "Classify Image"
5. Send to backend via FormData
6. Display loading state
7. Show results or error

### Data Fetching Pattern
```javascript
useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await axios.get(API_URL);
    setData(response.data);
  } catch (err) {
    setError('Error message');
  } finally {
    setLoading(false);
  }
};
```

### Chart Integration (Recharts)

**Pie Chart:**
```javascript
<PieChart>
  <Pie
    data={stats.distribution}
    dataKey="count"
    nameKey="name"
    cx="50%"
    cy="50%"
    outerRadius={100}
  >
    {stats.distribution.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
    ))}
  </Pie>
  <Tooltip />
</PieChart>
```

**Bar Chart:**
```javascript
<BarChart data={stats.distribution}>
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="count" fill="#4CAF50" />
</BarChart>
```

## Troubleshooting

### Port Already in Use

If port 3000 is occupied:
```
? Something is already running on port 3000. Would you like to run the app on another port instead? › (Y/n)
```
Type `Y` to use another port.

### CORS Errors

Ensure backend has CORS enabled for `http://localhost:3000`:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

### API Connection Failed

Verify:
1. Backend is running on port 8080
2. Backend health check works: `http://localhost:8080/api/health`
3. No firewall blocking connections
4. Correct API URLs in components

### npm install Warnings

Deprecation warnings during `npm install` are normal and can be ignored. They don't affect functionality.

### Images Not Uploading

Check:
- File type is JPEG or PNG
- File size is under 10MB
- Backend is running
- CORS is configured

### Charts Not Displaying

Ensure:
- Recharts is installed: `npm list recharts`
- Data format matches expected structure
- No JavaScript errors in console

## Development Tips

### Adding New Components

1. Create component in `src/components/`
2. Import in `App.js`
3. Add to navigation if needed
4. Update `renderPage()` function

### State Management

Components use React Hooks:
- `useState` for local state
- `useEffect` for side effects (API calls)
- Props for parent-child communication

### Code Structure

Follow functional React patterns:
- Arrow functions for components
- Destructuring props
- Async/await for API calls
- Try-catch for error handling

## Available Scripts

### `npm start`
Runs development server with hot reload

### `npm test`
Runs test suite (if configured)

### `npm run build`
Creates production build

### `npm run eject`
Ejects from Create React App (irreversible - not recommended)

## Browser Support

Supports all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance

- **Initial load:** ~1-2 seconds
- **Image upload:** ~100-500ms (depends on image size)
- **Page navigation:** Instant (no reload)
- **API calls:** ~50-200ms (depends on backend)

## Dependencies

Key packages (see `package.json` for complete list):
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "axios": "^1.x",
  "recharts": "^2.x",
  "react-scripts": "5.x"
}
```

## Future Enhancements

- User authentication
- Image history with thumbnails
- Weekly/monthly trend charts
- Export statistics to CSV/PDF
- Dark mode toggle
- Drag-and-drop file upload
- Multiple image batch upload
- Progressive Web App (PWA) support

## License

Educational project