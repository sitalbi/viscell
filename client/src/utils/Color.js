import * as d3 from 'd3';

/**
 * Return a map containing the color for each gene
 * @param {Object} sankeyStructure  The structure of the sankey diagram containing nodes and links
 * @param {Map} cellsMap Cells map is a map containing the genes for each cell
 * @param {Map} colorMap The map containing the color for each gene
 * @returns {Map} A map containing the color for each gene
 */
export function color(sankeyStructure, cellsMap, colorMap) {
    // Sample version with random colors
    const genes = new Set();

    cellsMap.forEach((value, key) => {
        value.forEach((value, gene) => {
            genes.add(gene);
        })
    });

    // Create a color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create a color for each gene
    genes.forEach((gene, i) => {
        colorMap.set(gene, color(i));
    });



}