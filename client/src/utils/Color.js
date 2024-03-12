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

    cellsMap.forEach((genes, cellName) => {
        let maxExpression = Math.max(...genes.values());
        let maxExpressedGenes = [...genes.entries()]
            .filter(([gene, expression]) => expression === maxExpression)
            .map(([gene]) => gene);

        let randomColor;
        do {
            randomColor = d3.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255);
        } while (colorsUsed.has(randomColor));
        colorsUsed.add(randomColor);

        maxExpressedGenes.forEach(gene => {
            sankeyStructure.links.forEach(link => {
                let target = sankeyStructure.nodes[link.target];
                let source = sankeyStructure.nodes[link.source];
                if (target.name === cellName) {
                    let parentColor = colorMap.get(cellsMap.get(source.name).keys().next().value);
                    let newColor = parentColor ? d3.interpolateRgb(parentColor, Math.random() < 0.5 ? d3.rgb(parentColor).brighter(0.5) : d3.rgb(parentColor).darker(0.5))(2) : randomColor;
                    colorMap.set(gene, newColor);
                }
            });
        });
    });

    cellsMap.forEach(genes => {
        genes.forEach((_, gene) => {
            if (!colorMap.has(gene)) {
                colorMap.set(gene, 'gray');
            }
        });
    });

}