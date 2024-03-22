import * as d3 from 'd3';

/**
 * Color the Sankey structure based on the cell populations
 * 
 * @param {*} sankeyStructure The Sankey structure
 * @param {*} cellColorMap The cell color map
 * @param {*} geneColorMap The gene color map
 */
export const Color = (sankeyStructure, cellColorMap, geneColorMap) => {
    const root = sankeyStructure.getRoot();

    // Create a palette of colors
    const createPalette = (numColors) => {
        const colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, numColors]);
        return d3.range(numColors).map(function (d) {
            return colorScale(d);
        });
    }

    // Create a palette of colors
    const palette = createPalette(sankeyStructure.getSize());

    // Color populations
    const colorPop = (pop, index) => {
        if (pop !== root) cellColorMap.set(pop.name, palette[index[0]]);

        for (const child of pop.getChildren()) {
            index[0]++;
            colorPop(child, index);
        }
    }

    colorPop(root, [0]);

    // Count the number of times a gene is present in the pops
    const countGene = (gene, pop) => {
        let count = 0;
        if (pop.hasGene(gene)) count++;

        for (const child of pop.getChildren()) count += countGene(gene, child);

        return count;
    }

    // Check if a gene is specific to a cell pop
    const isSpecificGene = (gene, pop) => {
        return countGene(gene, root) === countGene(gene, pop);
    }

    // Color all genes in grey
    const colorAllGenesInGrey = (pop) => {
        for (const [gene,] of pop.geneMap) geneColorMap.set(gene, "grey");

        for (const child of pop.getChildren()) colorAllGenesInGrey(child);
    }

    // Color genes
    const colorGenes = (pop) => {
        for (const [gene,] of pop.geneMap) {
            // if gene is grey and specific to the pop, color it
            if (geneColorMap.get(gene) === "grey" && isSpecificGene(gene, pop, root)) {
                geneColorMap.set(gene, cellColorMap.get(pop.name));
            }
        }
        for (const child of pop.getChildren()) colorGenes(child);
    }

    colorAllGenesInGrey(root);
    colorGenes(root);
}