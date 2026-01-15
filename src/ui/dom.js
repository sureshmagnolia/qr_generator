export const ELEMENTS = {
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorMessage: document.getElementById('error-message'),
    controls: document.getElementById('controls'),
    controlsBlock: document.getElementById('controls-block'),
    addPlantBtn: document.getElementById('addPlantBtn'),
    plantModal: document.getElementById('plantModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    plantSearch: document.getElementById('plantSearch'),
    searchResults: document.getElementById('searchResults'),
    plantDetailConfirm: document.getElementById('plantDetailConfirm'),
    selectedPlantsList: document.getElementById('selected-plants-list'),
    emptyListMsg: document.getElementById('empty-list-msg'),
    plantCount: document.getElementById('plant-count'),
    resetListBtn: document.getElementById('resetListBtn'),
    generateBtn: document.getElementById('generateBtn'),
    labelOutput: document.getElementById('label-output'),
    labelOutputPlaceholder: document.getElementById('label-output-placeholder'),
    bgColorPicker: document.getElementById('bgColor'),
    textColorPicker: document.getElementById('textColor'),
    printControls: document.getElementById('print-controls'),
    printBtn: document.getElementById('printBtn'),
    printStyles: document.getElementById('print-styles'),
    labelContainer: document.getElementById('label-container'),
    institutionName: document.getElementById('institutionName'),
    downloadPngBtn: document.getElementById('downloadPngBtn'),
    downloadPdfBtn: document.getElementById('downloadPdfBtn'),
    paperSizeSelect: document.getElementById('paperSize'),
    paperOrientationSelect: document.getElementById('paperOrientation'),
    numColumnsSelectH: document.getElementById('numColumnsH'),
    numRowsSelectV: document.getElementById('numRowsV')
};

export const domReady = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
};
