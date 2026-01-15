import QRCode from 'qrcode';
import { ELEMENTS } from './dom.js';
import { formatBinomialName } from '../utils/formatter.js';
import { CONFIG } from '../config.js';

export function initLabelGenerator(plantData, getSelectedPlants) {
    ELEMENTS.generateBtn.addEventListener('click', () => {
        const selectedPlants = getSelectedPlants();
        generateLabels(plantData, selectedPlants);
    });
}

function generateLabels(plantData, selectedPlants) {
    console.log('--- Generating Labels ---');
    ELEMENTS.labelOutput.innerHTML = '';

    if (selectedPlants.length === 0) {
        console.log('No plants selected. Aborting.');
        ELEMENTS.labelOutputPlaceholder.classList.remove('hidden');
        ELEMENTS.printControls.classList.add('hidden');
        return;
    }

    if (selectedPlants.length > CONFIG.MAX_LABELS) {
        ELEMENTS.labelOutputPlaceholder.classList.add('hidden');
        ELEMENTS.printControls.classList.add('hidden');
        const errorCard = document.createElement('div');
        errorCard.className = 'label-card bg-red-50 border-red-300 text-red-700 md:col-span-2 lg:col-span-3 text-center';
        errorCard.innerHTML = `<p class="font-bold">Error: Too Many Labels</p><p>You have selected ${selectedPlants.length} plants. The maximum is ${CONFIG.MAX_LABELS} at a time. Please reduce your list and try again.</p>`;
        ELEMENTS.labelOutput.appendChild(errorCard);
        return;
    }

    ELEMENTS.labelOutputPlaceholder.classList.add('hidden');
    ELEMENTS.printControls.classList.remove('hidden');

    const bgColor = ELEMENTS.bgColorPicker.value;
    const textColor = ELEMENTS.textColorPicker.value;
    const institutionName = ELEMENTS.institutionName.value.trim();

    document.documentElement.style.setProperty('--label-bg-color', bgColor);
    document.documentElement.style.setProperty('--label-text-color', textColor);

    selectedPlants.forEach((selectedItem, index) => {
        const binomial = selectedItem.binomial;
        const customUrl = selectedItem.customUrl;
        const plant = plantData.find(p => (p.Binomial || null) === binomial);

        if (!plant) {
            const errorCard = document.createElement('div');
            errorCard.className = 'label-card bg-red-50 border-red-300 text-red-700';
            errorCard.innerHTML = `<p class="font-bold">Error: Plant Not Found</p><p>The plant "${binomial || 'N/A'}" could not be found.</p>`;
            ELEMENTS.labelOutput.appendChild(errorCard);
            return;
        }

        const qrId = `qr-${index}`;

        // 1. Create Label Card
        const labelCard = document.createElement('div');
        labelCard.className = 'label-card';
        labelCard.style.backgroundColor = bgColor;
        labelCard.style.color = textColor;
        labelCard.style.borderColor = textColor;

        // 2. Institution Name
        if (institutionName) {
            const institutionDiv = document.createElement('div');
            institutionDiv.className = 'institution-name-box text-center font-bold text-base';
            institutionDiv.style.borderBottom = `1px solid ${textColor}`;
            institutionDiv.style.paddingBottom = '0.5rem';
            institutionDiv.style.marginBottom = '0.5rem';

            const institutionP = document.createElement('p');
            institutionP.className = 'institution-name';
            institutionP.style.overflowWrap = 'break-word';
            institutionP.style.wordBreak = 'break-word';
            institutionP.textContent = institutionName;

            institutionDiv.appendChild(institutionP);
            labelCard.appendChild(institutionDiv);
        }

        // 3. Content Wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'label-content-wrapper';

        // 4. Text Content
        const textDiv = document.createElement('div');
        textDiv.className = 'label-text';

        const binomialDiv = document.createElement('div');
        binomialDiv.className = 'binomial-box';
        binomialDiv.innerHTML = formatBinomialName(plant.Binomial);
        textDiv.appendChild(binomialDiv);

        if (plant.Family) {
            const familyP = document.createElement('p');
            familyP.className = 'family-name';
            familyP.textContent = plant.Family;
            textDiv.appendChild(familyP);
        }

        if (plant['Common Name']) {
            const commonP = document.createElement('p');
            commonP.className = 'common-name';
            commonP.textContent = plant['Common Name'];
            textDiv.appendChild(commonP);
        }

        if (plant.Vernacular) {
            const vernacularP = document.createElement('p');
            vernacularP.className = 'vernacular-name';
            vernacularP.textContent = plant.Vernacular;
            textDiv.appendChild(vernacularP);
        }

        contentWrapper.appendChild(textDiv);

        // 5. QR Code
        const qrDiv = document.createElement('div');
        qrDiv.id = qrId;
        qrDiv.className = 'label-qr-code';
        contentWrapper.appendChild(qrDiv);
        labelCard.appendChild(contentWrapper);

        // 6. Footer
        const footerDiv = document.createElement('div');
        footerDiv.className = 'footer-box';
        footerDiv.style.borderColor = textColor;

        const footerP = document.createElement('p');
        footerP.className = 'footer-note';
        footerP.textContent = "Generated By QRit, Department of Botany Government Victoria College Palakkad Kerala India";
        footerDiv.appendChild(footerP);
        labelCard.appendChild(footerDiv);

        ELEMENTS.labelOutput.appendChild(labelCard);

        // 7. Generate QR
        try {
            const qrData = customUrl || plant['ShortURL'] || 'No Data';
            QRCode.toCanvas(document.createElement('canvas'), qrData, {
                width: 100,
                color: {
                    dark: textColor,
                    light: bgColor
                },
                errorCorrectionLevel: 'H'
            }, function (error, canvas) {
                if (error) throw error;
                // Append canvas directly or convert to image if needed. 
                // The original code used QRCode.js which appends an IMG or Canvas.
                // npm 'qrcode' `toCanvas` creates a canvas.
                // We want to force it to look consistent.
                qrDiv.innerHTML = '';
                // Make the canvas fit
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.objectFit = 'contain';
                qrDiv.appendChild(canvas);
            });
            // Note: npm 'qrcode' is different from 'qrcodejs' used in CDN.
            // 'qrcode' (node) has toCanvas, toDataURL, etc.
            // Adjusting code to use 'qrcode' npm package.
        } catch (e) {
            console.error('QR generation error', e);
            qrDiv.textContent = 'QR Error';
        }
    });
}
