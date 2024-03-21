import { render, screen } from '@testing-library/react';
import { FileImport, checkData } from '../components/FileImport.js';
import { BrowserRouter as Router } from 'react-router-dom';

describe('FileImport', () => {
    it('renders without crashing', () => {
        render(
            <Router>
                <FileImport />
            </Router>
        );
    });

    it('renders FileImport component', () => {
        render(
            <Router>
                <FileImport />
            </Router>
        );
        expect(screen.getByText('Import your file')).toBeInTheDocument();
        expect(screen.getByLabelText('Upload a file')).toBeInTheDocument();
    });
});

describe('checkData', () => {
    it('returns correct result for valid data', () => {
        const data = new Map();
        data.set("meta", [{ "": "cell1", "parent": null, "n": 10, "consensus": 0.15 }]);
        data.set("markers", [{ "": "cell1", "marker1": 5, "marker2": 8 }]);

        const result = checkData(data);
        expect(result[0]).toBe(true);
    });

    it('returns correct result for invalid data without meta', () => {
        const data = new Map();
        data.set("markers", [{ "": "cell1", "marker1": 5, "marker2": 8 }]);

        const result = checkData(data);
        expect(result[1]).toBe("- Missing sheets (need 'meta' and 'markers' sheets)\n");
        expect(result[0]).toBe(false);
    });

    it('- There should be only one root cell (no parent) in the meta sheet', () => {
        const data = new Map();
        data.set("meta", [{ "": "cell1", "parent": null, "n": 10, "consensus": 0.15 }, { "": "cell2", "parent": null, "n": 10, "consensus": 0.15 }]);
        data.set("markers", [{ "": "cell1", "marker1": 5, "marker2": 8 }]);

        const result = checkData(data);
        expect(result[1]).toContain("- There should be only one root cell (no parent) in the 'meta' sheet\n");
        expect(result[0]).toBe(false);
    });

    // it('- A cell has a parent that is not present in the "meta" sheet\n',() => {
    //     const data = new Map();
    //     data.set("meta", [{ "": "cell1", "parent": null, "n": 10, "consensus": 0.15 }, { "": "cell2", "parent": "cell3", "n": 10, "consensus": 0.15 }]);
    //     data.set("markers", [{ "": "cell1", "marker1": 5, "marker2": 8 }, { "": "cell2", "marker1": 5, "marker2": 8 }]);

    //     const result = checkData(data);
    //     expect(result[1]).toContain("- A cell has a parent that is not present in the 'meta' sheet\n");
    //     expect(result[0]).toBe(false);

    // });

    it("Invalid data: circularity in the parent-child relationship", () => {
        const data = new Map();
        data.set("meta", [
                            { "": "cell1", "parent": null, "n": 10, "consensus": 0.15 }, 
                            { "": "cell2", "parent": "cell3", "n": 10, "consensus": 0.15 },
                            {"": "cell3", "parent": "cell2", "n": 10, "consensus": 0.15 }]);
        data.set("markers", [
                            { "": "cell1", "marker1": 5, "marker2": 8 },
                            { "": "cell2", "marker1": 5, "marker2": 8 }, 
                            { "": "cell3", "marker1": 5, "marker2": 8 }]);

        const result = checkData(data);
        expect(result[1]).toContain("- Invalid data: circularity in the parent-child relationship\n");
        expect(result[0]).toBe(false);
    });


    it("A cell is missing the 'n' or 'consensus' value in the 'meta' sheet", () => {
        const data = new Map();
        data.set("meta", [
                            { "": "cell1", "parent": null, "n": 10, "consensus": 0.15 }, 
                            { "": "cell2", "parent": null, "n": 10 }]);
        data.set("markers", [
                            { "": "cell1", "marker1": 5, "marker2": 8 },
                            { "": "cell2", "marker1": 5, "marker2": 8 }]);

        const result = checkData(data);
        expect(result[1]).toContain("- A cell is missing the 'n' or 'consensus' value in the 'meta' sheet\n");
        expect(result[0]).toBe(false);
    });

    it("A cell in the 'markers' sheet is not present in the 'meta' sheet", () => {
        const data = new Map();
        data.set("meta", [
                            { "": "cell1", "parent": null, "n": 10, "consensus": 0.15 }, 
                            { "": "cell2", "parent": null, "n": 10, "consensus": 0.15 }]);
        data.set("markers", [
                            { "": "cell1", "marker1": 5, "marker2": 8 },
                            { "": "cell3", "marker1": 5, "marker2": 8 }]);

        const result = checkData(data);
        expect(result[1]).toContain("- A cell in the 'markers' sheet is not present in the 'meta' sheet\n");
        expect(result[0]).toBe(false);
    });

    it("A cell in the 'meta' sheet is not present in the 'markers' sheet", () => {
        const data = new Map();
        data.set("meta", [
                            { "": "cell1", "parent": null, "n": 10, "consensus": 0.15 }, 
                            { "": "cell2", "parent": null, "n": 10, "consensus": 0.15 }]);
        data.set("markers", [
                            { "": "cell1", "marker1": 5, "marker2": 8 }]);

        const result = checkData(data);
        expect(result[1]).toContain("- A cell in the 'meta' sheet is not present in the 'markers' sheet\n");
        expect(result[0]).toBe(false);
    });

    it("A cell in the 'markers' sheet has a negative value", () => {
        const data = new Map();
        data.set("meta", [
                            { "": "cell1", "parent": null, "n": 10, "consensus": 0.15 }, 
                            { "": "cell2", "parent": null, "n": 10, "consensus": 0.15 }]);
        data.set("markers", [
                            { "": "cell1", "marker1": 5, "marker2": -8 },
                            { "": "cell2", "marker1": 5, "marker2": 8 }]);

        const result = checkData(data);
        expect(result[1]).toContain("\n[ERROR] A cell in the 'markers' sheet has a negative value");
        expect(result[0]).toBe(false);
    });
  });