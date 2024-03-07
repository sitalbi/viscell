import { Button, Container, Row, Col } from 'react-bootstrap';
import { RiFileUploadLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { React, useState } from 'react';
import * as XLSX from 'xlsx/xlsx.mjs';

export const FileImport = () => {
    const [, setFile] = useState(null);
    const navigate = useNavigate();

    /**
     * Check if data is valid
     * 
     * @param {*} data The file data
     * 
     * @returns {boolean} True if data is valid, false otherwise
     */
    const checkData = (data) => {
        // Check data size and if it has the required sheets
        if (data.size !== 2 || !data.has("meta") || !data.has("markers")) {
            alert("[ERROR] Missing sheets");
            return false;
        }

        // Check that only one cell is the root (has no parent)
        let count = 0;
        for (const cell of data.get("meta")) {
            if (!cell["parent"]) count++;
        }

        if (count !== 1) {
            alert("[ERROR] There should be only one root cell (no parent)");
            return false;
        }

        // Check that all other cells have a parent (present in the "meta" sheet)
        // We dont check if there is a loop in the parent-child relationship (circular dependency)
        for (const cell of data.get("meta")) {
            if (cell["parent"] && !data.get("meta").find((d) => d[""] === cell["parent"])) {
                alert("[ERROR] A cell has a parent that is not present in the 'meta' sheet");
                return false;
            }
        }

        // Check that all cells have a "n" and "consensus" values
        for (const cell of data.get("meta")) {
            if (cell["n"] === undefined || cell["consensus"] === undefined) {
                alert("[ERROR] A cell is missing the 'n' or 'consensus' value");
                console.log(cell);
                return false;
            }
        }

        // Check if all cells in the "markers" sheet are present in the "meta" sheet
        for (const cell of data.get("markers")) {
            if (!data.get("meta").find((d) => d[""] === cell[""])) {
                alert("[ERROR] A cell in the 'markers' sheet is not present in the 'meta' sheet");
                return false;
            }
        }

        // Return true if all checks passed
        return true;
    }

    const onFileChange = async (value) => {
        // Use XLSX to read the file which is a xlss file
        const f = value.target.files[0];
        setFile(f);
        const data = await f.arrayBuffer();
        const workbook = XLSX.read(data);

        const worksheets = new Map();

        // Loop through each sheet in the workbook and convert it to a json object for data processing
        for (const sheetName of workbook.SheetNames) {
            if (sheetName === "meta") {
                const sheet = workbook.Sheets[sheetName];
                worksheets.set(sheetName, XLSX.utils.sheet_to_json(sheet));
            }
            if (sheetName === "markers") {
                const sheet = workbook.Sheets[sheetName];
                worksheets.set(sheetName, XLSX.utils.sheet_to_json(sheet));
            }
        }

        // Check if data is valid
        checkData(worksheets);

        // Navigate to /result with worksheets as parameter
        navigate('/result', { state: { data: worksheets } });
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
                    <div className="text-center mt-3">
                        <Button variant="success" className="btn btn-primary">Upload</Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};