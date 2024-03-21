import { render, screen } from '@testing-library/react';
import { FileImport, processSheets } from '../components/FileImport.js';
import { BrowserRouter as Router } from 'react-router-dom';
import { TOAST_MESSAGES, Validation } from '../utils/Validation.js';
import { XLSX } from 'xlsx/xlsx.mjs';

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
        expect(screen.getByText('Upload example')).toBeInTheDocument();
    });
});

describe('validation', () => {
    it('returns correct result for valid data', () => {
        const data = new Map();
        data.set("meta", [{ "": "cell1", "parent": null, "n": 10, "consensus": 0.15 }]);
        data.set("markers", [{ "": "cell1", "marker1": 5, "marker2": 8 }]);

        const result = Validation(data);
        expect(result[0]).toBe(true);
    });

    it('returns incorrect result for missing sheets', () => {
        const data = new Map();
        data.set("markers", [{ "": "cell1", "marker1": 5, "marker2": 8 }]);

        const result = Validation(data);
        expect(result[0]).toBe(false);
        expect(result[1]).toBe(TOAST_MESSAGES["FILE_ERROR"]);
    });

    it('returns incorrect result for duplicate root cells', () => {
        const data = new Map();
        data.set("meta", [{ "": "cell1", "parent": null, "n": 10, "consensus": 0.15 }, { "": "cell2", "parent": null, "n": 10, "consensus": 0.15 }]);
        data.set("markers", [{ "": "cell1", "marker1": 5, "marker2": 8 }]);

        const result = Validation(data);
        expect(result[0]).toBe(false);
        expect(result[1]).toContain(TOAST_MESSAGES["ROOT_ERROR"]);
    });

    it("returns incorrect result for circularity in the parent-child relationship", () => {
        const data = new Map();
        data.set("meta", [
            { "": "cell1", "parent": null, "n": 10, "consensus": 0.15 },
            { "": "cell2", "parent": "cell3", "n": 10, "consensus": 0.15 },
            { "": "cell3", "parent": "cell2", "n": 10, "consensus": 0.15 }]);
        data.set("markers", [
            { "": "cell1", "marker1": 5, "marker2": 8 },
            { "": "cell2", "marker1": 5, "marker2": 8 },
            { "": "cell3", "marker1": 5, "marker2": 8 }]);

        const result = Validation(data);
        expect(result[0]).toBe(false);
        expect(result[1]).toContain(TOAST_MESSAGES["CIRCULARITY_ERROR"]);
    });

    it("returns incorrect result for missing 'n' or 'consensus' value in the 'meta' sheet", () => {
        const data = new Map();
        data.set("meta", [
            { "": "cell1", "parent": null, "n": 10, "consensus": 0.15 },
            { "": "cell2", "parent": null, "n": 10 }]);
        data.set("markers", [
            { "": "cell1", "marker1": 5, "marker2": 8 },
            { "": "cell2", "marker1": 5, "marker2": 8 }]);

        const result = Validation(data);
        expect(result[0]).toBe(false);
        expect(result[1]).toContain(TOAST_MESSAGES["MISSING_ERROR"]);
    });

    it("returns incorrect result for a cell in the 'markers' sheet not present in the 'meta' sheet", () => {
        const data = new Map();
        data.set("meta", [
            { "": "cell1", "parent": null, "n": 10, "consensus": 0.15 },
            { "": "cell2", "parent": null, "n": 10, "consensus": 0.15 }]);
        data.set("markers", [
            { "": "cell1", "marker1": 5, "marker2": 8 },
            { "": "cell3", "marker1": 5, "marker2": 8 }]);

        const result = Validation(data);
        expect(result[0]).toBe(false);
        expect(result[1]).toContain(TOAST_MESSAGES["MARKERS_ERROR"]);
    });

    it("returns incorrect result for a cell in the 'meta' sheet not present in the 'markers' sheet", () => {
        const data = new Map();
        data.set("meta", [
            { "": "cell1", "parent": null, "n": 10, "consensus": 0.15 },
            { "": "cell2", "parent": null, "n": 10, "consensus": 0.15 }]);
        data.set("markers", [
            { "": "cell1", "marker1": 5, "marker2": 8 }]);

        const result = Validation(data);
        expect(result[0]).toBe(false);
        expect(result[1]).toContain(TOAST_MESSAGES["META_ERROR"]);
    });

    it("returns incorrect result for a cell with non-respectful 'consensus' value", () => {
        const data = new Map();
        data.set("meta", [
            { "": "cell1", "parent": null, "n": 10, "consensus": 0.33 },
            { "": "cell2", "parent": "cell1", "n": 10, "consensus": 1.01 }]);
        data.set("markers", [
            { "": "cell1", "marker1": 5, "marker2": 4 },
            { "": "cell2", "marker1": 5, "marker2": 8 }]);

        const result = Validation(data);
        expect(result[0]).toBe(false);
        expect(result[1]).toContain(TOAST_MESSAGES["CONS_ERROR"]);
    });

    it("returns incorrect result for a cell with negative value in the 'markers' sheet", () => {
        const data = new Map();
        data.set("meta", [
            { "": "cell1", "parent": null, "n": 10, "consensus": 0.33 },
            { "": "cell2", "parent": "cell1", "n": 10, "consensus": 0.55 }]);
        data.set("markers", [
            { "": "cell1", "marker1": 5, "marker2": -4 },
            { "": "cell2", "marker1": 5, "marker2": 8 }]);

        const result = Validation(data);
        expect(result[0]).toBe(false);
        expect(result[1]).toContain(TOAST_MESSAGES["NEGATIVE_ERROR"]);
    });
});

describe('upload example', () => {
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
        expect(screen.getByText('Upload example')).toBeInTheDocument();
    });

    it('uploads example file', () => {
        render(
            <Router>
                <FileImport />
            </Router>
        );
        const uploadExampleButton = screen.getByText('Upload example');
        expect(uploadExampleButton).toBeInTheDocument();
        uploadExampleButton.click();
    });
});