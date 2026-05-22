# Workout Tracker

A lightweight React application for tracking and analyzing workout performance with daily, weekly, and monthly statistics.

## Features

Input

- Log workout sessions with start and end time
- Record exercise name, target muscle group, weight, and reps
- Support multiple sets per exercise
- Multiple exercises in a single session

Statistics

- Daily volume statistics (total weight × reps)
- Weekly and monthly volume trends with bar charts
- Muscle group distribution pie chart
- Session summary showing total volume, sets, count, and duration
- Body muscle heatmap showing front and rear silhouettes with intensity-colored regions per muscle group

Data Management

- Persistent storage across browser sessions using browser storage API
- Edit and delete workout records
- View historical records by day, week, or month

## Tech Stack

- React (v18+)
- Recharts for data visualization
- localStorage for data persistence
- CSS-in-JS for styling

## Installation

Prerequisites: Node.js v14 or higher

1. Clone the repository

git clone <repository-url>
cd workout-tracker

2. Install dependencies

npm install

3. Install additional packages

npm install recharts

4. Start development server

npm start

The app will open at http://localhost:3000

## Usage

Input Tab

1. Select workout date
2. Enter start and end time
3. Add exercise details (name, target muscle, weight, reps)
4. Click "+ 세트 추가" to log multiple sets
5. Click "+ 운동 추가" to log multiple exercises
6. Click "저장하기" to save

Records Tab

- View workout records filtered by daily, weekly, or monthly periods
- Delete records using the delete button
- See duration, volume, and exercise details

Stats Tab

- View today's summary statistics (volume, sets, duration)
- Toggle between weekly and monthly views for volume and distribution charts
- Analyze volume trends with bar chart
- Review muscle group distribution with pie chart
- View body muscle heatmap — front and rear silhouettes with color intensity showing which muscles were trained; toggle between today, weekly, and monthly periods independently

## Mobile Codex PR Workflow

GitHub Mobile can be used to request code changes by commenting on an issue with `/codex <task>`. The repository workflow creates a branch, runs Codex, verifies the app with tests and build, and opens a pull request for mobile review.

See [docs/mobile-codex-pipeline.md](docs/mobile-codex-pipeline.md) for setup and usage.

## Live Demo

https://astonishing-starlight-6975df.netlify.app

## Project Structure

```
src/
├── App.js              # Main component with all features
├── App.css             # Application styles
├── App.test.js         # Component tests
├── index.js            # Entry point
├── index.css           # Global styles
├── logo.svg            # App logo
├── reportWebVitals.js  # Performance reporting
└── setupTests.js       # Test configuration
```

## Data Storage

Workout records are stored in browser localStorage under the key wk_v1 as JSON. Each record contains:

- id: Unique identifier
- date: YYYY-MM-DD format
- startTime, endTime: HH:MM format
- exercises: Array of exercise objects
    - name: Exercise name
    - targetMuscle: Muscle group
    - sets: Array of sets
        - weight: Weight in kg
        - reps: Repetitions

## Future Improvements

- Exercise name autocomplete based on input history
- Auto-fill target muscle group when exercise is selected
- Show previous session weight and reps as placeholders
- Export data to CSV or PDF
- Compare performance across weeks/months
- Set personal records and track progress

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
