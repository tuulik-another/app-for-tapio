# App for Tapio

This is a small toy app I made for fun for my son. It combines real-time transportation data from HSL with an AI feature to generate transport-related facts. The app includes:

- A **Node.js backend** that fetches GTFS data from the HSL API and integrates with OpenRouter for AI-generated facts.
- A **React TypeScript frontend** built with Vite, featuring an OpenLayers map to display HSL transportation data and a button to fetch AI-generated facts.

Currently, the UI and backend AI API support only Finnish.

---

## Features

### Backend
- **Real-Time Vehicle Data**: Fetches live vehicle positions from HSL's GTFS-realtime API.
- **Stop Information**: Provides detailed stop data from HSL's GTFS static data.
- **AI-Generated Fun Facts**: Uses OpenRouter's AI to generate fun transport-related facts.

### Frontend
- **Interactive Map**: Displays real-time vehicle positions and stop locations using OpenLayers.
- **AI Fact Button**: Fetches and displays a fun transport fact with a single click.

---

## Installing

### Backend

```bash
cd backend
npm install
node server.js
```

### Frontend

```bash
npm install
npm run dev
```

---

## Usage

1. Open the frontend in your browser (e.g., `http://localhost:5173`).
2. View real-time vehicle positions and stops on the map.
3. Click the "AI Fact" button to fetch a fun transport-related fact in Finnish.

---

## Known Limitations
- The app currently supports only Finnish for the UI and AI-generated facts.
- The backend fetches GTFS data on startup and does not refresh it dynamically.

---

## Future Improvements
- Add support for multiple languages.
- Implement dynamic GTFS data refreshing.
- Enhance the frontend UI with additional features like filtering vehicles by type.
- Add unit tests and E2E tests
- Wrap the UI in an Android WebView to make it easily available on Android
- Host server

---

## License

This project is licensed under the ISC License.

---

## Acknowledgments

- **HSL**: For providing GTFS and GTFS-realtime data.
- **OpenAI/OpenRouter**: For enabling AI-generated transport facts.
- **OpenLayers**: For the interactive map.