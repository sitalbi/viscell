export class SankeyStructure {
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
    // get the root
    for (const cell of meta) {
      if (getParent(cell) === undefined) { // its the root
        // get genes for this cell
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
        this.root = new Pop(null, cell[""], genesMap);
      }
    }
    if (this.root === null) {
      throw new Error("No root found"); // TO BE MODIFIED
    }
    // create all the other pops
    this.root.createAllChildren(worksheets);
  }

  getSize(){
    const getSize = (pop) => {
      let size = 1;
      for(const child of pop.children){
        size += getSize(child);
      }
      return size;
    }

    return getSize(this.root);
  }

  getRoot() {
    return this.root;
  }

  get(popName) {
    const getPop = (pop, name) => {
      if (pop.getName() === name) {
        return pop;
      }
      for(const child of pop.children){
        const result = getPop(child, name);
        if (result !== null) {
          return result;
        }
      }
      return null;
    }
    return getPop(this.root, popName);
  }


  createNodesAndLinks(structure) {
    const addNode = (pop) => {
      structure.nodes.push({ name: pop.name });
      pop.children.forEach((child) => {
        addNode(child);
      });
    };

    const addLink = (pop) => {
      pop.children.forEach((child) => {
        structure.links.push({
          source:structure.nodes.findIndex((node) => node.name === pop.getName()),
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


  print() {
    this.root.print();
  }
}

export class Pop {
  constructor(parent, name, geneMap, n, consensus) {
    this.parent = parent;
    this.name = name;
    this.children = [];
    this.geneMap = geneMap;
    this.n = n;
    this.consensus = consensus;
  }

  addChild(name, geneMap, n, consensus) {
    const newPop = new Pop(this, name, geneMap, n, consensus);
    this.children.push(newPop);
    return newPop;
  }

  getChildren(){
    return this.children;
  }

  hasGene(geneName){
    return this.geneMap.has(geneName);
  }

  createAllChildren(worksheets) {
    let meta = worksheets.get("meta");
    let markers = worksheets.get("markers");

    for(const cell of meta){
        if(cell["parent"] === this.name){
            let genesMap = new Map();
            for (const value of markers) {
                if(value[""] === cell[""]){
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
  getName() {
    return this.name;
  }


  print() {
    if (this.parent === null) {
      console.log(this.name + " - null");
    } else {
      console.log(this.name + " - " + this.parent.getName());
    }
    for(const child of this.children){
        child.print();
    }
  }

}