/**
 * SankeyStructure class
 */
export class SankeyStructure {
  /**
   * Constructor
   * 
   * @param {*} worksheets The XLSX worksheets
   */
  constructor(worksheets) {
    this.root = null; // Initialize the root

    let meta = worksheets.get("meta");
    let markers = worksheets.get("markers");

    if (meta === undefined || markers === undefined) {
      throw new Error("Missing sheets (need 'meta' and 'markers' sheets)");
    }

    const getParent = (cell) => {
      return meta.find((d) => d[""] === cell["parent"]);
    }

    // Get the root
    for (const cell of meta) {
      if (getParent(cell) === undefined) { // If it's undefined, it's the root
        // Get genes for this cell
        let genesMap = new Map();
        for (const value of markers) {
          if (value[""] === cell[""]) {
            const sortedGenes = Object.entries(value)
              .filter(([key, gene]) => key !== "" && gene !== 0)
              .sort((a, b) => b[1] - a[1]);
            sortedGenes.forEach(([key, gene]) => {
              genesMap.set(key, gene);
            });
          }
        }
        this.root = new Population(null, cell[""], genesMap);
      }
    }

    // If root is null, throw an error
    if (this.root === null) throw new Error("Root not found");
    // Create all populations
    this.root.createAllChildren(worksheets);
  }

  /**
   * Get the number of populations in the structure
   * 
   * @returns {number} The number of populations
   */
  getSize() {
    const getSize = (pop) => {
      let size = 1;
      for (const child of pop.children) {
        size += getSize(child);
      }
      return size;
    }
    return getSize(this.root);
  }

  /**
   * Get the number of genes in the structure
   * 
   * @returns {number} The number of genes
   */
  getNumberOfGenes() {
    const getNumberOfGenes = (pop) => {
      let size = pop.geneMap.size;
      for (const child of pop.children) {
        size += getNumberOfGenes(child);
      }
      return size;
    }
    return getNumberOfGenes(this.root);
  }

  /**
   * Get the root of the structure
   * 
   * @returns {Population} The root of the structure
   */
  getRoot() {
    return this.root;
  }

  /**
   * Get a population by its name
   * 
   * @param {*} popName The name of the population
   * 
   * @returns {Population} The population with the given name
   */
  get(popName) {
    const getPop = (pop, name) => {
      if (pop.getName() === name) return pop;
      for (const child of pop.children) {
        const result = getPop(child, name);
        if (result !== null) return result;
      }
      return null;
    }
    return getPop(this.root, popName);
  }

  /**
   * Create nodes and links for the structure
   * 
   * @param {*} structure The structure to create nodes and links for
   */
  createNodesAndLinks(structure) {
    const addNode = (pop) => {
      structure.nodes.push({ name: pop.name });
      pop.children.forEach((child) => {
        addNode(child);
      });
    };

    /**
     * Add links to the structure
     * 
     * @param {*} pop The population to add links for
     */
    const addLink = (pop) => {
      pop.children.forEach((child) => {
        structure.links.push({
          source: structure.nodes.findIndex((node) => node.name === pop.getName()),
          target: structure.nodes.findIndex((node) => node.name === child.getName()),
          value: child.n,
          consensus: child.consensus,
          stroke: null
        });
        addLink(child);
      });
    };

    addNode(this.root);
    addLink(this.root);
  }

  /**
   * Print the structure
   */
  print() {
    this.root.print();
  }
}

/**
 * Population class
 */
export class Population {
  /**
   * Constructor
   * 
   * @param {*} parent The parent of the population
   * @param {*} name The name of the population
   * @param {*} geneMap The map of genes for the population
   * @param {*} n The number of individuals in the population
   * @param {*} consensus The consensus of the population
   */
  constructor(parent, name, geneMap, n, consensus) {
    this.parent = parent;
    this.name = name;
    this.children = [];
    this.geneMap = geneMap;
    this.n = n;
    this.consensus = consensus;
  }

  /**
   * Add a child to the population
   * 
   * @param {*} name The name of the child
   * @param {*} geneMap The map of genes for the child
   * @param {*} n The number of individuals in the child
   * @param {*} consensus The consensus of the child
   * 
   * @returns {Population} The child population
   */
  addChild(name, geneMap, n, consensus) {
    const newPop = new Population(this, name, geneMap, n, consensus);
    this.children.push(newPop);
    return newPop;
  }

  /**
   * Get the parent of the population
   * 
   * @returns {Population[]} The children of the population
   */
  getChildren() {
    return this.children;
  }

  /**
   * Return true if the population has a gene
   * 
   * @param {*} geneName The name of the gene
   * 
   * @returns {boolean} True if the population has the gene
   */
  hasGene(geneName) {
    return this.geneMap.has(geneName);
  }

  /**
   * Create all children of the population
   * 
   * @param {*} worksheets The XLSX worksheets
   */
  createAllChildren(worksheets) {
    let meta = worksheets.get("meta");
    let markers = worksheets.get("markers");

    for (const cell of meta) {
      if (cell["parent"] === this.name) {
        let genesMap = new Map();
        for (const value of markers) {
          if (value[""] === cell[""]) {
            const sortedGenes = Object.entries(value)
              .filter(([key, gene]) => key !== "" && gene !== 0)
              .sort((a, b) => b[1] - a[1]);
            sortedGenes.forEach(([key, gene]) => {
              genesMap.set(key, gene);
            });
          }
        }
        this.addChild(cell[""], genesMap, cell["n"], cell["consensus"]).createAllChildren(worksheets);
      }
    }
  }

  /**
   * Get the name of the population
   * 
   * @returns {string} The name of the population
   */
  getName() {
    return this.name;
  }

  /**
   * Print the population
   */
  print() {
    if (this.parent === null) {
      console.log(this.name + " - null");
    } else {
      console.log(this.name + " - " + this.parent.getName());
    }
    for (const child of this.children) {
      child.print();
    }
  }
}