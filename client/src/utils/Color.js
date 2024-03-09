import * as d3 from 'd3';

/**
 * Return a map containing the color for each gene
 * @param {Object} sankeyStructure  The structure of the sankey diagram containing nodes and links
 * @param {Map} cellsMap Cells map is a map containing the genes for each cell
 * @param {Map} colorMap The map containing the color for each gene
 * @returns {Map} A map containing the color for each gene
 */
export function color(sankeyStructure, cellsMap, colorMap) {
    const colorsUsed = new Set();
    let randomColor;

    // Assign colors to the most expressed gene in each cell population
    cellsMap.forEach((genes, cellName) => {
        let maxExpression = 0;
        let maxExpressedGene = new Set();
        genes.forEach((expression, gene) => {
            if (expression > maxExpression) {
                maxExpression = expression; // in v2 this should be a continuous value but in v1 it is always 0 and 1
            }
        });
        genes.forEach((expression, gene) => {
            if (expression === maxExpression) {
                maxExpressedGene.add(gene);
            }
        });
        do {
            randomColor = d3.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255);
        } while (colorsUsed.has(randomColor));
        colorsUsed.add(randomColor);
        maxExpressedGene.forEach(gene => {
            sankeyStructure.links.forEach(l => {
                let target = sankeyStructure.nodes[l.target];
                let source = sankeyStructure.nodes[l.source];
                if (target.name === cellName) {
                    if(source.name === "C") { // If the population is a child of the root cell, assign a random color
                        colorMap.set(gene, randomColor);
                    } else { // Interpolate the color of the gene based on the color of the parent cell if it is a child population of an already colored cell
                        let parentColor = colorMap.get(cellsMap.get(source.name).keys().next().value);
                        let rnd = Math.floor(Math.random() * 2);
                        let newColor = d3.interpolateRgb(parentColor, rnd === 0 ? d3.rgb(parentColor).brighter() :d3.rgb(parentColor).darker())(1);
                        colorMap.set(gene, newColor);
                    }
                }
            });

        });
    });

    // Assign gray color to other genes
    cellsMap.forEach(genes => {
        genes.forEach((expression, gene) => {
            if (!colorMap.has(gene)) {
                colorMap.set(gene, 'gray');
            }
        });
    });
}
