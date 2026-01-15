import { ELEMENTS } from './dom.js';

export function initPrintHandler() {
    ELEMENTS.printBtn.addEventListener('click', handlePrint);
}

function updatePrintStyles(size, orientation, columns, rows) {
    const bgColor = ELEMENTS.bgColorPicker.value;
    const textColor = ELEMENTS.textColorPicker.value;

    ELEMENTS.printStyles.innerHTML = `
        @media print {
            body * {
                visibility: hidden;
            }

            #label-container, #label-output, #label-output * {
                visibility: visible;
                display: block; 
            }
                                
            #controls-block, 
            #label-output-placeholder,
            #label-container h2 {
                display: none !important;
                visibility: hidden !important;
            }

            .max-w-7xl {
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
            }
                                
            #label-container {
                position: relative; 
                left: 0;
                top: 0;
                width: 100%;
                padding: 0;
                margin: 0;
            }

            @page {
                size: ${size} ${orientation};
                margin: 0.4in;
            }

            #label-output {
                display: grid;
                grid-template-columns: repeat(${columns}, 1fr);
                grid-template-rows: repeat(${rows}, 1fr);
                gap: 0.15in;
                width: 100%;
            }

            .label-card {
                page-break-inside: avoid;
                border: 2px solid ${textColor} !important;
                background-color: ${bgColor} !important;
                color: ${textColor} !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            .footer-box {
                border-top-color: ${textColor} !important;
            }
            .institution-name-box {
                border-bottom-color: ${textColor} !important;
            }

            .label-card * {
                overflow-wrap: break-word;
                word-break: break-word;
            }
                                
            .label-content-wrapper {
                display: grid !important; 
                grid-template-columns: 1fr 100px !important;
            }
            .label-qr-code {
                width: 100px !important;
                height: 100px !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
            }
        }
    `;
}

function handlePrint() {
    const size = ELEMENTS.paperSizeSelect.value;
    const orientation = ELEMENTS.paperOrientationSelect.value;
    const columns = ELEMENTS.numColumnsSelectH.value;
    const rows = ELEMENTS.numRowsSelectV.value;

    if (ELEMENTS.labelOutput.children.length === 0) {
        console.error('Print failed: Please generate labels first.');
        return;
    }

    updatePrintStyles(size, orientation, columns, rows);

    setTimeout(() => {
        window.print();
    }, 50);
}
