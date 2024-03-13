import { Container, Row, Col, Toast } from 'react-bootstrap';
import { RiFileUploadLine } from 'react-icons/ri';
import { React, useState } from 'react';
import * as XLSX from 'xlsx/xlsx.mjs';

import { SankeyStructure } from '../utils/SankeyStructure.js';

import { Sankey } from './Sankey.js';

export const FileImport = () => {
    const [showToast, setShowToast] = useState(false); // State to control toast visibility
    const [toastMessage, setToastMessage] = useState(''); // State to manage toast message
    const handleToastClose = () => setShowToast(false); // Function to close the toast
    
    const [title, setTitle] = useState(null);

    const[sankeyStructure, setSankeyStructure] = useState(null);

    /**
     * Check if data is valid
     * 
     * @param {*} data The filtered worksheets only containing the meta and markers sheets (total of 2)
     * 
     * @returns {boolean} True if data is valid, false otherwise
     */
    const checkData = (data) => {
        // Auxiliar function to search the parent of a cell (use in circularity check)
        const getParent = (cell) => {
            return data.get("meta").find((d) => d[""] === cell)["parent"];
        }

        // Boolean to store if the data is valid
        let valid = true;

        // Error message to show in the toast
        let toastMessage = "";

        // Check data size and if it has the required sheets
        if (data.size !== 2 || !data.has("meta") || !data.has("markers")) {
            toastMessage += "- Missing sheets (need 'meta' and 'markers' sheets)\n";
            valid = false;
        }

        // Check that only one cell is the root (has no parent)
        let count = 0;
        for (const cell of data.get("meta")) {
            if (!cell["parent"] || cell["parent"] === "?") count++;
        }
        if (count !== 1) {
            toastMessage += "- There should be only one root cell (no parent) in the 'meta' sheet\n";
            valid = false;
        }

        // Check that all other cells have a parent (present in the "meta" sheet)
        for (const cell of data.get("meta")) {
            if (cell["parent"] && cell["parent"] !== "?" && !data.get("meta").find((d) => d[""] === cell["parent"])) {
                toastMessage += "- A cell has a parent that is not present in the 'meta' sheet\n";
                valid = false;
                break;
            }
        }

        // Check that there is no circularity in the parent-child relationship
        let breakFlag = false;
        for (const cell of data.get("meta")) {
            let parent = cell["parent"];
            // Keep track of visited cells to detect circularity
            const visitedCells = new Set();
            while (parent && parent !== "?") {
                if (visitedCells.has(parent)) {
                    toastMessage += "- Invalid data: circularity in the parent-child relationship\n";
                    valid = false;
                    breakFlag = true;
                    break;
                }
                visitedCells.add(parent);
                parent = getParent(parent);
            }
            if (breakFlag) break;
        }

        // Check that all cells have a "n" and "consensus" values
        for (const cell of data.get("meta")) {
            if (cell["n"] === undefined || cell["consensus"] === undefined) {
                toastMessage += "- A cell is missing the 'n' or 'consensus' value in the 'meta' sheet\n";
                valid = false;
                break;
            }
        }

        // Check if all cells in the "markers" sheet are present in the "meta" sheet
        for (const cell of data.get("markers")) {
            if (!data.get("meta").find((d) => d[""] === cell[""])) {
                toastMessage += "- A cell in the 'markers' sheet is not present in the 'meta' sheet\n";
                valid = false;
                break;
            }
        }

        // Check if all cells in the "meta" sheet are present in the "markers" sheet
        for (const cell of data.get("meta")) {
            if (!data.get("markers").find((d) => d[""] === cell[""])) {
                toastMessage += "- A cell in the 'meta' sheet is not present in the 'markers' sheet\n";
                valid = false;
                break;
            }
        }

        // Check if value on "markers" sheet are positive
        breakFlag = false;
        for (const cell of data.get("markers")) {
            for (const key in cell) {
                if (key !== "") {
                    if (cell[key] < 0) {
                        toastMessage += "\n[ERROR] A cell in the 'markers' sheet has a negative value";
                        valid = false;
                        breakFlag = true;
                        break;
                    }
                }
            }
            if (breakFlag) break;
        }

        // Set the toast message
        setToastMessage(toastMessage);

        // Return true if all checks passed
        return valid;
    }

    const onFileChange = async (value) => {
        // Use XLSX to read the file which is a xlss file
        const f = value.target.files[0];
        const data = await f.arrayBuffer();
        const workbook = XLSX.read(data);

        const worksheets = new Map();

        // Loop through each sheet in the workbook and convert it to a json object for data processing
        for (const sheetName of workbook.SheetNames) {
            // If the sheet is not the meta or markers sheet, skip it
            if (sheetName !== "meta" && sheetName !== "markers") {
                continue;
            }

            // Get the sheet
            let sheet = workbook.Sheets[sheetName];

            // We transpose the markers sheet to make it easier to process
            if (sheetName === "markers") {
                const tab = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }); // Convert the sheet to a 2D array with empty cells as empty strings
                // Delete empty rows
                for (let i = 0; i < tab.length; i++) {
                    if (tab[i].length === 0) {
                        tab.splice(i, 1);
                        i--;
                    }
                }
                // Transpose the 2D array
                const transposedTab = transpose(tab);
                // Convert the transposed 2D array to a sheet
                sheet = XLSX.utils.aoa_to_sheet(transposedTab);
            }

            if (sheetName === "meta" || sheetName === "markers") {
                const json = XLSX.utils.sheet_to_json(sheet);

                // Remove empty keys
                const oldKey = '__EMPTY';
                const newKey = '';

                const sanitizedData = json.map((row) => {
                    if (oldKey in row) {
                        row[newKey] = row[oldKey];
                        delete row[oldKey];
                    }
                    return row;
                });

                sheet = XLSX.utils.json_to_sheet(sanitizedData);
            }
            worksheets.set(sheetName, XLSX.utils.sheet_to_json(sheet));
        }

        const isValid = checkData(worksheets);

        if (isValid) {
            // Create SankeyStructure object
            let sankeyStructure = new SankeyStructure(worksheets);
            setSankeyStructure(sankeyStructure);
            setTitle(f.name);
        }
        else {
            // Show toast if data is not valid
            setShowToast(true);
        }
    }

    /**
     * Transpose a matrix
     * 
     * @param {*} matrix A 2D array
     * 
     * @returns A transposed 2D array
     */
    function transpose(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }

    return (
        <Container className="d-flex justify-content-center">
            <Row>
                <Col>
                    <h2 className="text-center mt-2">Import your file</h2>
                    <p className="text-center mt-2">Supported file types: <span className='filetype-span'>.xlsx</span> and <span className='filetype-span'>.xls</span></p>
                    <div className="text-center">
                        <label className='btn btn-outline-primary' htmlFor="file">
                            <RiFileUploadLine style={{ marginRight: '5px' }} /> Choose a file
                        </label>
                        <input className='import-button' type="file" id="file" name="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={onFileChange} />
                    </div>
                    {sankeyStructure && title && <Sankey sankeyStructure={sankeyStructure} title={title} />}
                </Col>
            </Row>
            <Toast show={showToast} onClose={handleToastClose} className="position-fixed center-0 center-0 m-3">
                <Toast.Header>
                    <strong className="me-auto">Error(s) during the loading of the file</strong>
                </Toast.Header>
                <Toast.Body>
                    {toastMessage.split("\n").map((line, index) => {
                        return <p key={index}>{line}</p>;
                    })}
                </Toast.Body>
            </Toast>
        </Container>
    );
}