
export class SankeyStructure {
  constructor(worksheets) {
    this.root = null; // Initialize the root

    let meta = worksheets.get("meta");
    let markers = worksheets.get("markers");
    if(meta === undefined || markers === undefined){
        throw new Error("Missing sheets (need 'meta' and 'markers' sheets)");
    }
    const getParent = (cell) => {
        return meta.find((d) => d[""] === cell["parent"]);
    }
    // get the root
    for (const cell of meta) {
        if(getParent(cell) === undefined){ // its the root
            // get genes for this cell
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
            this.root = new Pop(null, cell[""], genesMap);
        }
    }
    if(this.root === null){
        throw new Error("No root found"); // TO BE MODIFIED
    }
    // create all the other pops
    this.root.createAllChilds(worksheets);
  }

  getRoot(){
    return this.root;
  }

  get(popName){
    const getPop = (pop, name) => {
      if(pop.getName() === name){
        return pop;
      }
      for(const child of pop.childs){
        const result = getPop(child, name);
        if(result !== null){
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
      pop.childs.forEach((child) => {
        addNode(child);
      });
    };

    const addLink = (pop) => {
      pop.childs.forEach((child) => {
        structure.links.push({
          source:structure.nodes.findIndex((node) => node.name === pop.name),
          target: structure.nodes.findIndex((node) => node.name === child.name),
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


  print(){
    this.root.print();
  }
}

class Pop {
  constructor(parent, name, geneMap, n, consensus) {
    this.parent = parent;
    this.name = name;
    this.childs = [];
    this.geneMap = geneMap;
    this.n = n;
    this.consensus = consensus;
  }

  addChild(name, geneMap, n, consensus){
    const newPop = new Pop(this, name, geneMap, n, consensus);
    this.childs.push(newPop);
    return newPop;
  }

  createAllChilds(worksheets) {
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
            this.addChild(cell[""], genesMap, cell["n"], cell["consensus"]).createAllChilds(worksheets);
        }
    }
  }
  getName(){
    return this.name;
  }


  print(){
    if(this.parent === null){
        console.log(this.name + " - null");
    }else{
        console.log(this.name + " - " + this.parent.getName());
    }
    for(const child of this.childs){
        child.print();
    }
  }

}