# QRit - Codebase Documentation

## 1. Project Overview
**QRit** is a client-side Single Page Application (SPA) designed to generate printable QR code labels for botanical specimens. It fetches data dynamically from a Google Sheet, allows users to select plants, and generates formatted labels with QR codes.

### Technical Stack
*   **Core**: Vanilla JavaScript (ES6 Modules).
*   **Build Tool**: [Vite](https://vitejs.dev/) (Handling dev server, bundling, and hot module replacement).
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first framework) + Custom CSS.
*   **Data Source**: Published Google Sheet (CSV format).

## 2. Architecture & Modules
The application is refactored from a monolithic HTML file into a modular structure based on **Concern Separation**.

### Directory Structure
```text
/
├── index.html              # Application entry point (HTML shell)
├── package.json            # Project metadata and dependencies
├── src/
│   ├── main.js             # Bootstrapper / Orchestrator
│   ├── config.js           # Global constants
│   ├── style.css           # Global styles & Tailwind directives
│   ├── services/           # Data fetching and persistence
│   │   ├── api.js          # Google Sheet CSV fetching & parsing
│   │   └── storage.js      # LocalStorage CRUD operations
│   ├── ui/                 # User Interface logic
│   │   ├── dom.js          # Centralized DOM element references
│   │   ├── search.js       # Search logic & result rendering
│   │   ├── label-gen.js    # Label card DOM construction & QR generation
│   │   ├── print.js        # Print handling & dynamic CSS injection
│   │   └── export.js       # PDF & PNG export logic
│   └── utils/              # Helper functions
│       └── formatter.js    # String manipulation (e.g., Binomial formatting)
```

---

## 3. Deep Dive: Modules & Functions

### 3.1. Configuration (`src/config.js`)
Holds application-wide constants to avoid hardcoding magic values.
*   `CONFIG.GOOGLE_SHEET_URL`: The URL to the published Google Sheet CSV.
*   `CONFIG.MAX_LABELS`: Safety limit (set to 20) to prevent browser crashing during rendering.

### 3.2. Entry Point (`src/main.js`)
The orchestrator that ties everything together.
*   **`init()`**:
    1.  Loads saved state from `localStorage`.
    2.  Calls `api.fetchPlantData()` to get the master database.
    3.  Initializes UI modules (`initSearch`, `initLabelGenerator`, etc.), passing necessary data and callbacks.
    4.  Handles top-level error catching (e.g., if the network request fails).

### 3.3. Services Layer
#### `src/services/api.js`
Handles external data communication.
*   **`fetchPlantData()`**:
    *   Uses `fetch` to get the CSV content.
    *   Uses **PapaParse** library to convert CSV text into a JSON array.
    *   Implements simple in-memory caching (`cachedData`) to prevent redundant network requests.
    *   Returns a `Promise` that resolves to the array of plant objects.

#### `src/services/storage.js`
Manages data persistence so user selections survive page reloads.
*   **`saveSelectedPlants(selectedPlants)`**: Serializes the list of selected plants to `localStorage`.
*   **`loadSelectedPlants()`**: Deserializes data from `localStorage`. Contains robust error handling to catch malformed JSON and map old data structures to the current schema.

### 3.4. UI Layer
#### `src/ui/dom.js`
A centralized registry of all HTML elements.
*   **`ELEMENTS`**: An object containing references to DOM nodes (e.g., `addPlantBtn`, `searchResults`). This prevents `document.getElementById` calls from being scattered across the codebase.
*   **`domReady(callback)`**: A utility to ensure code runs only after the DOM is fully loaded.

#### `src/ui/search.js`
Manages the "Add Plant" modal and search functionality.
*   **`initSearch(data, initialSelected, onUpdate)`**: Sets up event listeners for the search input and results list.
*   **`handleSearch()`**: Filters the `plantData` array based on the user's query (matching Binomial, Common Name, or Vernacular Name). Renders results dynamically.
*   **`selectPlant(plant)`**: Opens the detailed confirmation view where users can input an optional Custom URL.
*   **`confirmAddPlant()`**: Adds the plant to the state and calls the `onUpdate` callback to sync changes.
*   **`renderSelectedPlants()`**: Updates the "Selected Plants" side panel list in the main UI.

#### `src/ui/label-gen.js`
The core rendering engine for the visible labels.
*   **`initLabelGenerator(plantData, getSelectedPlants)`**: Binds the "Generate Labels" button.
*   **`generateLabels()`**:
    *   Clears previous output.
    *   Iterates through `selectedPlants`.
    *   **DOM Layout**: Programmatically creates the HTML structure for each label (Card -> Content Wrapper -> Text/QR).
    *   **Logic**:
        *   Applies `formatBinomialName` to italicize the genus and species.
        *   Injects the Institution Name if provided.
        *   Generates the QR code using the **`qrcode`** library (rendering to a dynamic Canvas element).
        *   Handles errors for individual missing plants without crashing the whole batch.

#### `src/ui/print.js`
Manages the browser's native print dialog.
*   **`handlePrint()`**: Reads user preferences (Paper Size, Orientation, Grid Config) and triggers the print dialog.
*   **`updatePrintStyles()`**: Crucial function. It injects a `<style>` block with `@media print` rules.
    *   Hides all UI elements (`visibility: hidden`).
    *   Makes *only* the `#label-container` visible.
    *   Sets `@page` margins and size based on user selection (A4/A3).
    *   Uses CSS Grid (`repeat(cols, 1fr)`) to arrange labels perfectly on the printed page.

#### `src/ui/export.js`
Handles downloading labels as files.
*   **`downloadLabelsAsPng()`**: Uses **`html2canvas`** to take a "screenshot" of the generated labels div and saves it as a PNG.
*   **`downloadLabelsAsPdf()`**:
    *   Uses **`jspdf`** to create a multi-page PDF document.
    *   Iterates through every generated `.label-card`.
    *   Rasterizes each card into an image using `html2canvas`.
    *   Calculates coordinates (`x`, `y`) to place the images on the PDF pages in a grid pattern.
    *   Adds new PDF pages automatically when the content exceeds the page height.

### 3.5. Utilities (`src/utils/formatter.js`)
*   **`formatBinomialName(name)`**: A regex/string manipulation helper. It splits the plant name and wraps the first two words (Genus + Species) in a `<span class="italic">` tag, leaving the rest (Authorities/Var) standard. This adheres to botanical nomenclature rules.

---

## 4. Key Libraries
1.  **[PapaParse](https://www.papaparse.com/)**: Fast, reliable CSV parser. Handles the Google Sheet data.
2.  **[QRCode](https://www.npmjs.com/package/qrcode)**: Generates 2D barcodes (QR codes) on HTML Canvas elements.
3.  **[html2canvas](https://html2canvas.hertzen.com/)**: Captures DOM elements and converts them into Javascript Canvas objects (bitmaps). Used for PNG/PDF export.
4.  **[jspdf](https://github.com/parallax/jsPDF)**: Client-side PDF generation. Used to compile the captured label images into a printable PDF document.

## 5. Development Workflow

### Setup
1.  Install Node.js.
2.  Run `npm install` to load dependencies defined in `package.json`.

### Running Locally
*   `npm run dev`: Starts the Vite development server.
    *   Fast startup.
    *   Hot Module Replacement (HMR) - code changes reflect instantly in the browser.

### Building for Production
*   `npm run build`: Bundles the app into the `dist/` folder.
    *   Minifies JS and CSS.
    *   Hashes filenames for cache busting (e.g., `index-a1b2c3.js`).
    *   The `dist/` folder is static and can be hosted on GitHub Pages, Netlify, or Vercel.
