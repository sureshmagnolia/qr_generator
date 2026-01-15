import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ELEMENTS } from './dom.js';

export function initExportHandlers() {
    ELEMENTS.downloadPngBtn.addEventListener('click', downloadLabelsAsPng);
    ELEMENTS.downloadPdfBtn.addEventListener('click', downloadLabelsAsPdf);
}

function downloadLabelsAsPng() {
    const targetElement = ELEMENTS.labelOutput;

    if (targetElement.children.length === 0) {
        console.error('Download failed: Please generate labels first.');
        return;
    }

    // Temporarily adjust layout
    targetElement.style.maxWidth = 'none';
    targetElement.style.width = 'fit-content';

    html2canvas(targetElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: ELEMENTS.bgColorPicker.value,
    }).then(canvas => {
        targetElement.style.maxWidth = '';
        targetElement.style.width = '';

        const link = document.createElement('a');
        link.download = 'plant_labels_screenshot.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }).catch(error => {
        console.error("Error generating PNG:", error);
    });
}

async function downloadLabelsAsPdf() {
    const labels = Array.from(document.querySelectorAll('.label-card'));

    if (labels.length === 0) {
        return;
    }

    const doc = new jsPDF({
        orientation: ELEMENTS.paperOrientationSelect.value === 'landscape' ? 'l' : 'p',
        unit: 'mm',
        format: ELEMENTS.paperSizeSelect.value.toLowerCase()
    });

    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loading-pdf';
    loadingMessage.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-[9999]';
    loadingMessage.innerHTML = `<div class="bg-white p-6 rounded-xl shadow-2xl"><p class="text-lg font-semibold text-blue-600">Generating PDF...</p></div>`;
    document.body.appendChild(loadingMessage);

    let yOffset = 10;
    const margin = 10;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const numCols = parseInt(ELEMENTS.numColumnsSelectH.value, 10) || 2;
    const gap = 4;
    const availableWidth = pageWidth - (2 * margin);
    let imgWidth = (availableWidth - ((numCols - 1) * gap)) / numCols;

    for (let i = 0; i < labels.length; i++) {
        const label = labels[i];

        const canvas = await html2canvas(label, {
            scale: 2,
            logging: false,
            useCORS: true,
            backgroundColor: ELEMENTS.bgColorPicker.value,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        const xPosition = margin + (i % numCols) * (imgWidth + gap);

        if (i % numCols === 0) {
            if (yOffset + imgHeight + gap > pageHeight - margin && i !== 0) {
                doc.addPage();
                yOffset = margin;
            }
        }

        doc.addImage(imgData, 'PNG', xPosition, yOffset, imgWidth, imgHeight);

        if ((i + 1) % numCols === 0) {
            yOffset += imgHeight + gap;
        }
    }

    document.body.removeChild(loadingMessage);
    doc.save('plant_labels.pdf');
}
