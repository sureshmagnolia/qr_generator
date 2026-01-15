/**
 * Format Binomial Name (Italicize first two words)
 */
export function formatBinomialName(binomial) {
    if (!binomial || typeof binomial !== 'string') {
        return 'N/A';
    }
    const parts = binomial.trim().split(/\s+/);
    if (parts.length >= 2) {
        return `<span class="italic">${parts[0]} ${parts[1]}</span> ${parts.slice(2).join(' ')}`;
    }
    return binomial;
}
