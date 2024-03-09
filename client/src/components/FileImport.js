import { Container, Row, Col } from 'react-bootstrap';
import { RiFileUploadLine } from 'react-icons/ri';
import { React, useState } from 'react';
import * as XLSX from 'xlsx/xlsx.mjs';

import { Sankey } from './Sankey.js';

export const FileImport = () => {
    const [worksheets, setWorksheets] = useState(null);
    const [title, setTitle] = useState(null);

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

        // Set states with the worksheets and file title
        setWorksheets(worksheets);
        // console.log(worksheets);
        setTitle(f.name);
    }

    function transpose(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }

    return (
        <Container className="d-flex justify-content-center">
            <Row>
                <Col>
                    <h2 className="text-center mt-2">Import your file</h2>
                    <p className="text-center mt-2">Supported file types: .csv, .xlsx, .xls</p>
                    <div className="text-center">
                        <label className='btn btn-outline-primary' htmlFor="file">
                            <RiFileUploadLine style={{ marginRight: '5px' }} /> Choose a file
                        </label>
                        <input className='import-button' type="file" id="file" name="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={onFileChange} />
                    </div>
                    {worksheets && title && <Sankey worksheets={worksheets} title={title} />}

                </Col>
            </Row>
        </Container>
    );
};