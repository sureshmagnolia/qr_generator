export function saveSelectedPlants(selectedPlants) {
    localStorage.setItem('selectedPlants', JSON.stringify(selectedPlants));
}

export function loadSelectedPlants() {
    const storedPlants = localStorage.getItem('selectedPlants');
    if (storedPlants) {
        try {
            const parsed = JSON.parse(storedPlants);
            if (Array.isArray(parsed)) {
                return parsed.map(item => ({
                    binomial: item.binomial || (item.Binomial || 'N/A'),
                    customUrl: item.customUrl || null
                })).filter(item => item.binomial !== 'N/A');
            }
        } catch (e) {
            console.error('Failed to parse localStorage, resetting.', e);
        }
    }
    return [];
}
