# Clear Skies

A responsive air-quality monitoring dashboard that retrieves live environmental data and presents it through an interactive, accessible interface.

Developed as a team project for the **NASA Space Apps Challenge – Windsor**.

## Overview

Clear Skies helps users understand current air-quality conditions for supported cities. The dashboard displays the Air Quality Index (AQI), pollutant measurements, monitoring-station information, and an interactive 3D Earth visualization.

## Features

* Live Air Quality Index and health-category display
* Search functionality for supported international cities
* Measurements for PM2.5, PM10, NO₂, O₃, SO₂, CO, NO, and NH₃
* Interactive 3D Earth visualization
* Pollutant cards with colour-coded indicators
* Monitoring-station and data-source information
* Responsive dark-themed dashboard
* Current location, reporting time, and API-status display

## Technology Stack

* **Frontend:** React, JavaScript, HTML, CSS
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Data Fetching:** Axios
* **Visualizations:** Recharts
* **3D Rendering:** Three.js, React Three Fiber, React Three Drei
* **Air-Quality Data:** External air-quality API

## Getting Started

### Prerequisites

Install the following before running the project:

* [Node.js](https://nodejs.org/)
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/faisalaldurra/clear-skies-air-quality-dashboard.git
```

Enter the project directory:

```bash
cd clear-skies-air-quality-dashboard
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local address displayed in the terminal, normally:

```text
http://localhost:5173
```

## Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```text
clear-skies-air-quality-dashboard/
├── public/
├── src/
│   ├── assets/
│   ├── services/
│   │   ├── airQualityAPI.js
│   │   └── aqiCalculator.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Current Limitations

* City search is limited to locations currently defined in the application.
* Data availability depends on external monitoring stations and API services.
* Some monitoring stations may not report every pollutant.
* A demonstration API token is currently used for development.

## Contributors

Developed collaboratively by:

* **Neftalem Gebremicael**
* **Utkarash Kanade**
* **Faisal Al-Durra** 

## Acknowledgements

Created for the **NASA Space Apps Challenge – Windsor**. Air-quality readings are supplied by external monitoring services and may vary based on station availability and reporting frequency.
