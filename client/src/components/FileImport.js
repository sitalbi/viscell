import { Container, Row, Col, Toast, Button } from 'react-bootstrap';
import { React, useState, useEffect } from 'react';
import { RiFileUploadLine } from 'react-icons/ri';
import { LuFilePieChart } from "react-icons/lu";
import * as XLSX from 'xlsx/xlsx.mjs';

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import Darmanis from '../data/Darmanis.xlsx';

import { SankeyStructure } from '../utils/SankeyStructure.js';
import { TOAST_DURATION } from '../utils/Constants.js';
import { Validation } from '../utils/Validation.js';
import { Sankey } from './Sankey.js';
import '../App.js';

export const FileImport = () => {
    const [numberOfGenesToDisplay, setNumberOfGenesToDisplay] = useState(3); // State to manage the number of genes to display, default is 3
    const [sankeyStructure, setSankeyStructure] = useState(null); // State to manage the Sankey structure
    const [toastMessages, setToastMessage] = useState([]); // State to manage toast messages
    const [toast, setToast] = useState(false); // State to control toast visibility
    const [title, setTitle] = useState(null); // State to manage the title of the Sankey diagram

    /**
     * Handle the change of the number of genes to display
     * 
     * @param {*} newValue The new value of the slider
     */
    const onChange = (newValue) => {
        setNumberOfGenesToDisplay(newValue);
    };

    /**
     * Handle the close of the toast
     * 
     * @returns {boolean} True if the toast is open, false otherwise
     */
    const handleToastClose = () => {
        setToast(false);
        setToastMessage([]);
    }

    /**
     * Transpose a matrix
     * 
     * @param {*} matrix A 2D array
     * 
     * @returns A transposed 2D array
     */
    const transpose = (matrix) => {
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }

    /**
     * Filter and combine sheets of the workbook
     * 
     * @param {*} workbook The workbook to be processed
     * 
     * @returns A map containing the filtered and processed sheets
     */
    const processSheets = async (workbook) => {
        const worksheets = new Map();

        for (const sheetName of workbook.SheetNames) {
            if (sheetName !== "meta" && sheetName !== "markers") {
                continue;
            }

            let sheet = workbook.Sheets[sheetName];

            if (sheetName === "markers") {
                const tab = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                for (let i = 0; i < tab.length; i++) {
                    if (tab[i].length === 0) {
                        tab.splice(i, 1);
                        i--;
                    }
                }
                const transposedTab = transpose(tab);
                sheet = XLSX.utils.aoa_to_sheet(transposedTab);
            }

            if (sheetName === "meta" || sheetName === "markers") {
                const json = XLSX.utils.sheet_to_json(sheet);
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

        return worksheets;
    };


    /**
     * Handle the change of the file
     * 
     * @param {*} value The file to be read
     */
    const onFileChange = async (value) => {
        // Use XLSX to read the file which is a xlss file
        const f = value.target.files[0];
        const data = await f.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheets = await processSheets(workbook);

        const result = Validation(worksheets);

        if (result[0]) {
            let sankeyStructure = new SankeyStructure(worksheets);
            setSankeyStructure(sankeyStructure);
            setTitle(f.name);
        } else {
            setToastMessage(result[1]);
            setToast(true);
        }
    }

    /**
     * Upload the example file
     */
    const onExampleChange = async () => {
        const darmanis = await fetch(Darmanis);
        const data = await darmanis.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheets = await processSheets(workbook);

        // No need to check data since it's the example file, we know that it is valid
        let sankeyStructure = new SankeyStructure(worksheets);
        setSankeyStructure(sankeyStructure);
        setTitle("Darmanis.xlsx");
    }

    /**
     * useEffect to close the toast after 5 seconds if it is open
     */
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(false);
            }, TOAST_DURATION);
            // Clear the timer when the component unmounts or when toast is closed manually
            return () => clearTimeout(timer);
        }
    }, [toast]);

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

                        <Button variant="outline-primary" className='example-button' onClick={onExampleChange}>
                            <LuFilePieChart className='upload-icon' /> Upload example
                        </Button>

                        <div className="slider-container">
                            <p className='text-center mt-2'>Number of genes to display: <span className='number-of-genes'>{numberOfGenesToDisplay}</span></p>
                            <Slider
                                min={3}
                                max={7}
                                step={1}
                                marks={{ 3: '3', 4: '4', 5: '5', 6: '6', 7: '7' }}
                                value={numberOfGenesToDisplay}
                                onChange={onChange}
                            />
                        </div>
                        <input
                            className='import-button'
                            type="file"
                            id="file"
                            name="file"
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            onChange={(e) => {
                                onFileChange(e);
                                e.target.value = null;
                            }}
                        />
                    </div>

                    {sankeyStructure && title && <Sankey sankeyStructure={sankeyStructure} title={title} numberOfGenes={numberOfGenesToDisplay} />}
                </Col>
            </Row>

            <Toast show={toast} onClose={handleToastClose} className="position-fixed center-0 center-0 m-3">
                <Toast.Header>
                    <strong className="me-auto">Error(s) while reading the file</strong>
                </Toast.Header>

                <Toast.Body>
                    {toastMessages.map((message, index) => {
                        return <p key={index}>{message}</p>;
                    })}
                </Toast.Body>
            </Toast>

        </Container>
    );
}