import { Container, Row, Col, Toast } from 'react-bootstrap';
import { RiFileUploadLine } from 'react-icons/ri';
import { React, useState } from 'react';
import * as XLSX from 'xlsx/xlsx.mjs';

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import { SankeyStructure } from '../utils/SankeyStructure.js';
import { Sankey } from './Sankey.js';
import '../App.js';

export const FileImport = () => {
    const [showToast, setShowToast] = useState(false); // State to control toast visibility
    const [toastMessage, setToastMessage] = useState(''); // State to manage toast message
    const handleToastClose = () => setShowToast(false); // Function to close the toast

    const [title, setTitle] = useState(null);
    const [numberOfGenesToDisplay, setNumberOfGenesToDisplay] = useState(3); // Number of genes to display (3 by default)
    const [sankeyStructure, setSankeyStructure] = useState(null);

    /**
     * Handle the change of the number of genes to display
     * 
     * @param {*} newValue The new value of the slider
     */
    const onChange = (newValue) => {
        setNumberOfGenesToDisplay(newValue);
    };

    /**
     * Check if data is valid
     * 
     * @param {*} data The filtered worksheets only containing the meta and markers sheets (total of 2)
     * 
     * @returns {boolean} True if data is valid, false otherwise
     */
    const checkData = (data) => {
        /**
         * Auxiliary function to search the parent of a cell (used in circularity check)
         * 
         * @param {*} cell A cell
         * 
         * @returns The parent of the cell
         */
        const getParent = (cell) => {
            // Avoiding "Cannot read property 'parent' of undefined" error by returning undefined if the cell is not found
            const parent = data.get("meta").find((d) => d[""] === cell);
            return parent ? parent["parent"] : undefined;
        }

        // Variables to keep track of the validity of the data and the toast message
        let valid = true;
        let toastMessage = "";

        // Check data size and if it has the required sheets
        if (data.size !== 2 || !data.has("meta") || !data.has("markers")) {
            toastMessage += "File should at least contain 'meta' and 'markers' sheets.\n";
            valid = false;
        }

        // Check that only one cell is the root (has no parent)
        let count = 0;
        for (const cell of data.get("meta")) {
            if (!cell["parent"] || cell["parent"] === "?") count++;
        }
        if (count !== 1) {
            toastMessage += "There should be only one root cell in the 'meta' sheet.\n";
            valid = false;
        }

        // Check that F1 Score is well restricted to [0, 1] for the consensus value in the "meta" sheet
        for (const cell of data.get("meta")) {
            if (cell["consensus"] < 0 || cell["consensus"] > 1) {
                toastMessage += "Consensus value should be restricted to [0, 1] in the 'meta' sheet.\n";
                valid = false;
                break;
            }
        }

        // Check that all other cells have a parent (present in the "meta" sheet)
        for (const cell of data.get("meta")) {
            if (cell["parent"] && cell["parent"] !== "?" && !data.get("meta").find((d) => d[""] === cell["parent"])) {
                toastMessage += "A cell has an unknown parent in the 'meta' sheet.\n";
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
                    toastMessage += "Found circularity in the parent-child relationship in the 'meta' sheet.\n";
                    valid = false;
                    breakFlag = true;
                    break;
                }

                visitedCells.add(parent);
                parent = getParent(parent);

                if (parent === undefined) {
                    toastMessage += "A cell has an unknown parent in the 'meta' sheet.\n";
                    valid = false;
                    breakFlag = true;
                    break;
                }
            }
            if (breakFlag) break;
        }

        // Check that all cells have a "n" and "consensus" values
        for (const cell of data.get("meta")) {
            if (cell["n"] === undefined || cell["consensus"] === undefined) {
                toastMessage += "Missing 'n' or 'consensus' value in the 'meta' sheet.\n";
                valid = false;
                break;
            }
        }

        // Check if all cells in the "markers" sheet are present in the "meta" sheet
        for (const cell of data.get("markers")) {
            if (!data.get("meta").find((d) => d[""] === cell[""])) {
                toastMessage += "A cell in the 'markers' sheet is not present in the 'meta' sheet.\n";
                valid = false;
                break;
            }
        }

        // Check if all cells in the "meta" sheet are present in the "markers" sheet
        for (const cell of data.get("meta")) {
            if (!data.get("markers").find((d) => d[""] === cell[""])) {
                toastMessage += "A cell in the 'meta' sheet is not present in the 'markers' sheet.\n";
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
                        toastMessage += "Found negative value in the 'markers' sheet.\n";
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
                            <RiFileUploadLine className='upload-icon' /> Upload a file
                        </label>
                        <p className='text-center mt-2'>Number of genes to display: <span className='number-of-genes'>{numberOfGenesToDisplay}</span></p>
                        <div className="slider-container">
                            <Slider
                                min={3}
                                max={7}
                                step={1}
                                value={numberOfGenesToDisplay}
                                onChange={onChange}
                            />
                        </div>
                        <input className='import-button' type="file" id="file" name="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={onFileChange} />
                    </div>
                    {sankeyStructure && title && <Sankey sankeyStructure={sankeyStructure} title={title} numberOfGenes={numberOfGenesToDisplay} />}
                </Col>
            </Row>

            <Toast show={showToast} onClose={handleToastClose} className="position-fixed center-0 center-0 m-3">
                <Toast.Header>
                    <strong className="me-auto">Error(s) while reading the file</strong>
                </Toast.Header>

                <Toast.Body>
                    {[...new Set(toastMessage.split("\n"))].map((line, index) => {
                        return <p key={index}>{line}</p>;
                    })}
                </Toast.Body>
            </Toast>

        </Container>
    );
}