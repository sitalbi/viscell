import { Container, Row, Col } from 'react-bootstrap';
import { RiFileUploadLine } from 'react-icons/ri';
import { React, useState } from 'react';
import * as XLSX from 'xlsx/xlsx.mjs';

import { Sankey } from './Sankey.js';

export const FileImport = () => {
    const [worksheets, setWorksheets] = useState(null);
    const [title, setTitle] = useState(null);

    const onFileChange = async (value) => {
        // use XLSX to read the file which is a xlss file
        const f = value.target.files[0];
        const data = await f.arrayBuffer();
        const workbook = XLSX.read(data);

        const worksheets = new Map();

        // loop through each sheet in the workbook and convert it to a json object for data processing
        for (const sheetName of workbook.SheetNames) {
            if (sheetName !== "cells" && (sheetName === "meta" || sheetName === "markers")) {
                const sheet = workbook.Sheets[sheetName];
                worksheets.set(sheetName, XLSX.utils.sheet_to_json(sheet));
            }
        }

        // set the states with the worksheets and the title of the file
        setWorksheets(worksheets);
        setTitle(f.name);
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