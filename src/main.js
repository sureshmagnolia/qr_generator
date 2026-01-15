import './style.css';
import { fetchPlantData } from './services/api.js';
import { loadSelectedPlants } from './services/storage.js';
import { domReady, ELEMENTS } from './ui/dom.js';
import { initSearch } from './ui/search.js';
import { initLabelGenerator } from './ui/label-gen.js';
import { initPrintHandler } from './ui/print.js';
import { initExportHandlers } from './ui/export.js';

let plantData = [];
let selectedPlants = [];

async function init() {
    try {
        console.log('Initializing App...');

        // 1. Load LocalStorage
        selectedPlants = loadSelectedPlants();

        // 2. Fetch Data
        plantData = await fetchPlantData();

        ELEMENTS.loading.classList.add('hidden');
        ELEMENTS.controls.classList.remove('hidden');

        // 3. Init Modules
        initSearch(plantData, selectedPlants, (updatedList) => {
            selectedPlants = updatedList;
        });

        initLabelGenerator(plantData, () => selectedPlants);
        initPrintHandler();
        initExportHandlers();

    } catch (err) {
        console.error(err);
        ELEMENTS.loading.classList.add('hidden');
        ELEMENTS.errorMessage.textContent = err.message;
        ELEMENTS.error.classList.remove('hidden');
    }
}

domReady(init);
