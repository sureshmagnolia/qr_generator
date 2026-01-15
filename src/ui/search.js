import { ELEMENTS } from './dom.js';
import { saveSelectedPlants } from '../services/storage.js';

let plantData = [];
let selectedPlants = [];
let onUpdateCallback = null;

export function initSearch(data, initialSelected, onUpdate) {
    plantData = data;
    selectedPlants = initialSelected;
    onUpdateCallback = onUpdate;

    ELEMENTS.addPlantBtn.addEventListener('click', () => {
        ELEMENTS.plantModal.classList.remove('hidden');
        ELEMENTS.searchResults.classList.remove('hidden');
        ELEMENTS.plantDetailConfirm.classList.add('hidden');
    });

    ELEMENTS.closeModalBtn.addEventListener('click', () => ELEMENTS.plantModal.classList.add('hidden'));
    ELEMENTS.plantModal.addEventListener('click', (e) => {
        if (e.target === ELEMENTS.plantModal) {
            ELEMENTS.plantModal.classList.add('hidden');
        }
    });

    ELEMENTS.plantSearch.addEventListener('input', handleSearch);

    // Bind global reset button
    ELEMENTS.resetListBtn.addEventListener('click', () => {
        selectedPlants.length = 0; // Clear array
        updateState();
    });

    renderSelectedPlants();
}

function updateState() {
    saveSelectedPlants(selectedPlants);
    renderSelectedPlants();
    if (onUpdateCallback) onUpdateCallback(selectedPlants);
}

function handleSearch() {
    const query = ELEMENTS.plantSearch.value.toLowerCase().trim();
    ELEMENTS.searchResults.innerHTML = '';
    ELEMENTS.plantDetailConfirm.classList.add('hidden');
    ELEMENTS.searchResults.classList.remove('hidden');

    if (query.length < 3) {
        ELEMENTS.searchResults.innerHTML = '<p class="text-gray-500 p-4 text-sm">Please type 3 or more letters to search.</p>';
        return;
    }

    const results = plantData.filter(plant => {
        const binomialMatch = plant.Binomial && plant.Binomial.toLowerCase().includes(query);
        const commonNameMatch = plant['Common Name'] && plant['Common Name'].toLowerCase().includes(query);
        const vernacularMatch = plant.Vernacular && plant.Vernacular.toLowerCase().includes(query);
        return binomialMatch || commonNameMatch || vernacularMatch;
    }).sort((a, b) => {
        const binA = a.Binomial || '';
        const binB = b.Binomial || '';
        return binA.localeCompare(binB);
    });

    if (results.length === 0) {
        ELEMENTS.searchResults.innerHTML = '<p class="text-gray-500 p-4 text-sm">No plants found.</p>';
        return;
    }

    results.forEach(plant => {
        const div = document.createElement('div');
        div.className = 'p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100';
        div.innerHTML = `
            <p class="font-medium text-gray-800">${plant.Binomial || 'N/A'}</p>
            <p class="text-sm text-gray-600">${plant['Common Name'] || 'N/A'}</p>
        `;
        div.onclick = () => selectPlant(plant);
        ELEMENTS.searchResults.appendChild(div);
    });
}

function selectPlant(plant) {
    if (!plant || !plant.Binomial) return;

    ELEMENTS.searchResults.classList.add('hidden');
    ELEMENTS.plantDetailConfirm.classList.remove('hidden');

    const displayName = plant.Binomial;
    const commonName = plant['Common Name'] || 'N/A';

    ELEMENTS.plantDetailConfirm.innerHTML = `
        <h4 class="text-xl font-bold text-gray-800 mb-2">${displayName}</h4>
        <p class="text-sm text-gray-600 mb-4">Common Name: ${commonName}</p>
        <div class="mb-4">
            <label for="customUrlInput" class="block text-sm font-medium text-gray-700 mb-1">
                Optional Custom URL (e.g., your website link)
            </label>
            <input type="url" id="customUrlInput" placeholder="Enter custom URL (max 100 characters)"
                maxlength="100"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200">
            <p id="urlError" class="text-xs text-red-500 mt-1 hidden">URL is too long or invalid.</p>
        </div>

        <div class="flex justify-end space-x-3">
            <button id="cancelPlantBtn" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">
                Cancel
            </button>
            <button id="addConfirmedPlantBtn" class="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add to List
            </button>
        </div>
    `;

    document.getElementById('cancelPlantBtn').onclick = () => {
        ELEMENTS.plantDetailConfirm.classList.add('hidden');
        ELEMENTS.searchResults.classList.remove('hidden');
    };

    document.getElementById('addConfirmedPlantBtn').onclick = () => {
        const urlInput = document.getElementById('customUrlInput');
        const customUrl = urlInput.value.trim();
        const urlError = document.getElementById('urlError');

        if (customUrl.length > 100) {
            urlError.textContent = 'URL must be 100 characters or less.';
            urlError.classList.remove('hidden');
            return;
        }

        urlError.classList.add('hidden');
        confirmAddPlant(plant, customUrl.length > 0 ? customUrl : null);
    };
}

function confirmAddPlant(plant, customUrl) {
    const newPlant = {
        binomial: plant.Binomial,
        customUrl: customUrl
    };

    if (selectedPlants.some(p => p.binomial === newPlant.binomial)) {
        console.warn(`${newPlant.binomial} is already in the list.`);
    } else {
        selectedPlants.push(newPlant);
        updateState();
    }

    ELEMENTS.plantModal.classList.add('hidden');
    ELEMENTS.plantSearch.value = '';
    ELEMENTS.searchResults.innerHTML = '';
    ELEMENTS.plantDetailConfirm.classList.add('hidden');
    ELEMENTS.searchResults.classList.remove('hidden');
}

export function renderSelectedPlants() {
    ELEMENTS.selectedPlantsList.innerHTML = '';

    if (selectedPlants.length === 0) {
        ELEMENTS.emptyListMsg.classList.remove('hidden');
    } else {
        ELEMENTS.emptyListMsg.classList.add('hidden');

        selectedPlants.forEach(item => {
            const binomial = item.binomial;
            const customUrl = item.customUrl;
            const plant = plantData.find(p => (p.Binomial || null) === binomial);

            const li = document.createElement('li');
            li.className = 'flex items-center justify-between bg-white p-2 border border-gray-200 rounded-md shadow-sm';

            const displayName = plant ? (plant.Binomial || 'N/A') : (binomial || 'N/A (Not Found)');
            const detailText = customUrl ?
                `<span class="text-xs text-blue-500 block truncate" style="max-width: 150px;">Custom URL: ${customUrl}</span>` :
                '<span class="text-xs text-gray-400 block">DB Link Used</span>';

            li.innerHTML = `
                <div>
                    <span class="text-sm font-medium text-gray-700">${displayName}</span>
                    ${detailText}
                </div>
                <button class="remove-plant-btn text-red-500 hover:text-red-700 transition duration-150" data-binomial="${binomial}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            `;
            ELEMENTS.selectedPlantsList.appendChild(li);
        });
    }

    ELEMENTS.plantCount.textContent = selectedPlants.length;

    document.querySelectorAll('.remove-plant-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bin = e.currentTarget.dataset.binomial;
            const idx = selectedPlants.findIndex(p => p.binomial === bin);
            if (idx > -1) {
                selectedPlants.splice(idx, 1);
                updateState();
            }
        });
    });
}
