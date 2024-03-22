const { SankeyStructure, Population } = require('../utils/SankeyStructure.js');

describe('SankeyStructure', () => {
    describe('constructor', () => {
        it('should create a SankeyStructure object', () => {
            const worksheetsMock = new Map([
                ["meta", [{ "parent": null, "": "Root" }]],
                ["markers", [{ "": "Root" }]]
            ]);
            const sankeyStructure = new SankeyStructure(worksheetsMock);
            expect(sankeyStructure).toBeInstanceOf(SankeyStructure);
        });

        it('should throw an error if "meta" or "markers" sheets are missing', () => {
            const missingMetaWorksheets = new Map([
                ["markers", [{ "": "Root" }]]
            ]);
            const missingMarkersWorksheets = new Map([
                ["meta", [{ "parent": null, "": "Root" }]]
            ]);
            expect(() => new SankeyStructure(missingMetaWorksheets)).toThrowError('Missing sheets (need \'meta\' and \'markers\' sheets)');
            expect(() => new SankeyStructure(missingMarkersWorksheets)).toThrowError('Missing sheets (need \'meta\' and \'markers\' sheets)');
        });

        it('should throw an error if no root is found', () => {
            const emptyWorksheets = new Map([
                ["meta", []],
                ["markers", []]
            ]);
            expect(() => new SankeyStructure(emptyWorksheets)).toThrowError('Root not found');
        });

        it('should sort genes in descending order when creating a Population', () => {
            const worksheetsMock = new Map([
                ["meta", [{ "parent": null, "": "Root" }]],
                ["markers", [{ "": "Root", "Gene1": 20, "Gene2": 10 }]]
            ]);
            const sankeyStructure = new SankeyStructure(worksheetsMock);
            const rootPop = sankeyStructure.root;
            expect(rootPop.geneMap.get("Gene1")).toBe(20);
            expect(rootPop.geneMap.get("Gene2")).toBe(10);
        });
    });

    describe('print', () => {
        it('should print the SankeyStructure', () => {
            // Spy on console.log to capture its output
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            // Mock worksheets
            const worksheetsMock = new Map([
                ["meta", [
                    { "parent": null, "": "Root" },
                    { "parent": "Root", "": "Child" },
                    { "parent": "Child", "": "Grandchild" }
                ]],
                ["markers", [
                    { "": "Root" },
                    { "": "Child" },
                    { "": "Grandchild" }
                ]]
            ]);

            // Create SankeyStructure object
            const sankeyStructure = new SankeyStructure(worksheetsMock);

            // Call print method
            sankeyStructure.print();

            // Assert console.log was called with the expected output
            expect(consoleLogSpy).toHaveBeenCalledWith("Root - null");
            expect(consoleLogSpy).toHaveBeenCalledWith("Child - Root");
            expect(consoleLogSpy).toHaveBeenCalledWith("Grandchild - Child");

            // Restore console.log
            consoleLogSpy.mockRestore();
        });
    });

    describe('getRoot', () => {
        it('should return the root Population', () => {
            const worksheetsMock = new Map([
                ["meta", [{ "parent": null, "": "Root" }]],
                ["markers", [{ "": "Root" }]]
            ]);
            const sankeyStructure = new SankeyStructure(worksheetsMock);
            expect(sankeyStructure.getRoot()).toBeInstanceOf(Population);
        });
    });

    describe('get', () => {
        it('should return the Population with the given name', () => {
            // huge mock
            const worksheetsMock = new Map([
                ["meta", [
                    { "parent": null, "": "Root" },
                    { "parent": "Root", "": "Child" },
                    { "parent": "Child", "": "Grandchild" }
                ]],
                ["markers", [
                    { "": "Root" },
                    { "": "Child" },
                    { "": "Grandchild" }
                ]]
            ]);
            const sankeyStructure = new SankeyStructure(worksheetsMock);
            expect(sankeyStructure.get("Root")).toBeInstanceOf(Population);
            expect(sankeyStructure.get("Child")).toBeInstanceOf(Population);
            expect(sankeyStructure.get("Grandchild")).toBeInstanceOf(Population);
        });
        it('should return null if the Population with the given name does not exist', () => {
            const worksheetsMock = new Map([
                ["meta", [{ "parent": null, "": "Root" }]],
                ["markers", [{ "": "Root" }]]
            ]);
            const sankeyStructure = new SankeyStructure(worksheetsMock);
            expect(sankeyStructure.get("NonExistent")).toBe(null);
        }
        );
    });
});

describe('Population', () => {
    describe('constructor', () => {
        it('should create a Population object', () => {
            const parentPop = new Population(null, "Parent", new Map(), 0, 0);
            expect(parentPop).toBeInstanceOf(Population);
        });
    });

    describe('addChild', () => {
        it('should add a child to the parent Population', () => {
            const parentPop = new Population(null, "Parent", new Map(), 0, 0);
            parentPop.addChild("Child", new Map());
            expect(parentPop.children.length).toBe(1);
        });
    });

    describe('createAllChildren', () => {
        it('should create all child populations recursively', () => {
            const parentPop = new Population(null, "Root", new Map(), 0, 0);
            const worksheetsMock = new Map([
                ["meta", [
                    { "parent": "Root", "": "Child" },
                    { "parent": "Child", "": "Grandchild" }
                ]],
                ["markers", [
                    { "": "Root" },
                    { "": "Child" },
                    { "": "Grandchild" }
                ]]
            ]);
            parentPop.createAllChildren(worksheetsMock);
            expect(parentPop.children.length).toBe(1); // One direct child
            expect(parentPop.children[0].children.length).toBe(1); // One grandchild
        });
    });

    describe('getName', () => {
        it('should return the name of the Population', () => {
            const pop = new Population(null, "Name", new Map(), 0, 0);
            expect(pop.getName()).toBe("Name");
        });
    });
});
