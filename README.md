# DNA Sequence Comparison Application

This full-stack web application allows users to compare DNA sequences from fluorescent chromatogram images using peak intensity analysis, KMP, and Rabin-Karp algorithms.

## Features

- User authentication with JWT
- Upload and process DNA chromatogram images
- Two-stage comparison process:
  1. First stage: Peak intensity-based sequence extraction and visualization
  2. Second stage: KMP and Rabin-Karp algorithm comparison with complexity and time metrics
- Report history tracking
- Detailed report viewing

## Project Structure

```
DNA/
├── backend/               # FastAPI backend
│   ├── app/               # Application code
│   │   ├── main.py        # Main FastAPI application
│   │   ├── auth.py        # Authentication logic
│   │   ├── database.py    # Database configuration
│   │   ├── dna_utils.py   # DNA processing utilities
│   │   └── models.py      # Database models
│   ├── requirements.txt   # Python dependencies
│   └── run.py             # Entry point
└── frontend/              # React frontend
    ├── src/               # Source code
    │   ├── components/    # React components
    │   ├── App.js         # Main React app
    │   └── index.js       # Entry point
    └── package.json       # JavaScript dependencies
```

## Setup and Installation

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the backend server:
   ```
   python run.py
   ```
   The backend will run on http://localhost:8000

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the frontend development server:
   ```
   npm start
   ```
   The frontend will run on http://localhost:3000

## Usage

1. Register a new account or login with existing credentials
2. Navigate to the "Compare" page
3. Upload two DNA chromatogram images
4. Click "Compare DNA Sequences" to see the peak intensity analysis
5. Click "Compare Using KMP and Rabin-Karp Algorithms" to see the algorithm comparison results
6. View your report history in the "History" page

## Technologies Used

- **Backend**: FastAPI, SQLAlchemy, JWT Authentication, OpenCV, NumPy, SciPy, Pandas
- **Frontend**: React, Material-UI, Axios, Chart.js
- **Database**: SQLite (development), can be configured for other databases in production
