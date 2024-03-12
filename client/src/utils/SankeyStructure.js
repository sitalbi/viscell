
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

  print(){
    this.root.print();
  }
}

export class Pop {
  constructor(parent, name, geneMap) {
    this.parent = parent;
    this.name = name;
    this.childs = [];
    this.geneMap = geneMap;
  }

  addChild(name, geneMap){
    const newPop = new Pop(this, name, geneMap);
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
            this.addChild(cell[""], genesMap).createAllChilds(worksheets);
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