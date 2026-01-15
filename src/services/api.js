import Papa from 'papaparse';
import { CONFIG } from '../config.js';

let cachedData = [];

export async function fetchPlantData() {
    if (cachedData.length > 0) return cachedData;

    try {
        const response = await fetch(CONFIG.GOOGLE_SHEET_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}. Ensure the Google Sheet is 'Published to the web'.`);
        }
        const csvText = await response.text();
        if (!csvText) {
            throw new Error('Fetched data is empty.');
        }

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.data && results.data.length > 0) {
                        cachedData = results.data;
                        resolve(cachedData);
                    } else {
                        reject(new Error('No data found in parsed CSV. Check CSV format.'));
                    }
                },
                error: (err) => {
                    reject(new Error(`PapaParse Error: ${err.message || 'An unknown error occurred.'}`));
                }
            });
        });

    } catch (err) {
        throw err;
    }
}
