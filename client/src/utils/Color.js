import * as d3 from 'd3';

/**
 * Return a map containing the color for each gene
 * @param {Object} sankeyStructure  The structure of the sankey diagram containing nodes and links
 * @param {Map} cellsMap Cells map is a map containing the genes for each cell
 * @param {Map} colorMap The map containing the color for each gene
 * @returns {Map} A map containing the color for each gene
 */
export function color(sankeyStructure, cellsMap, colorMap) {
    // Assign colors to the most expressed gene in each cell population
    cellsMap.forEach((genes, cellName) => {
        let maxExpression = 0;
        let maxExpressedGene;
        genes.forEach((expression, gene) => {
            if (expression > maxExpression) {
                maxExpressedGene = gene;
                maxExpression = expression; // in v2 this should be a continuous value but in v1 it is always 0 and 1
            }
        });
        if (maxExpressedGene && !colorMap.has(maxExpressedGene)) {
            let randomColor = d3.schemeCategory10[Math.floor(Math.random() * 10)];
            colorMap.set(maxExpressedGene, randomColor); 
        }
    });

    // Assign colors to non-gray genes based on parent population
    sankeyStructure.links.forEach(link => {
        const parentPopulation = link.source.name;
        const parentColor = colorMap.get(parentPopulation);

        if (!parentColor) return; // Skip if parent population color is not defined

        const childPopulation = link.target.name;
        const childGenes = cellsMap.get(childPopulation);
        if (!childGenes) return; // Skip if child population genes are not defined

        let i = 1; // Counter for coloring variants

        childGenes.forEach((_, gene) => {
            if (!colorMap.has(gene)) {
                if (sankeyStructure.nodes.find(node => node.name === childPopulation).parent === sankeyStructure.nodes[0].name) { // Child of the root node
                    let randomColor = d3.schemeCategory10[Math.floor(Math.random() * 10)];
                    colorMap.set(gene, randomColor); 
                } else { // Child of another population
                    const variantColor = d3.rgb(parentColor).brighter(0.1 * i);
                    colorMap.set(gene, variantColor);
                    i++;
                }
            }
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

    return colorMap;
}
