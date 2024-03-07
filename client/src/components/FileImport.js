import { Button, Container, Row, Col, Toast } from 'react-bootstrap';
import { RiFileUploadLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { React, useState } from 'react';
import * as XLSX from 'xlsx/xlsx.mjs';

export const FileImport = () => {
    const [, setFile] = useState(null);
    const navigate = useNavigate();
    const [showToast, setShowToast] = useState(false); // State to control toast visibility
    const [toastMessage, setToastMessage] = useState(''); // State to manage toast message
    const handleToastClose = () => setShowToast(false); // Function to close the toast


    /**
     * Check if data is valid
     * 
     * @param {*} data The file data
     * 
     * @returns {boolean} True if data is valid, false otherwise
     */
    const checkData = (data) => {
        // Auxiliar function to search the parent of a cell (use in circularity check)
        const getParent = (cell) => {
            return data.get("meta").find((d) => d[""] === cell)["parent"];
        }

        // value of the validity of the data
        let valid = true;

        // Error message to show in the toast
        let toastMessage = "";


        // Check data size and if it has the required sheets
        if (data.size !== 2 || !data.has("meta") || !data.has("markers")) {
            toastMessage+="- Missing sheets (need 'meta' and 'markers' sheets)\n";
            valid = false;
        }

        // Check that only one cell is the root (has no parent)
        let count = 0;
        let originCell = ""; // store the origin cell (C)
        for (const cell of data.get("meta")) {
            if (!cell["parent"]) {
                count++;
                originCell = cell[""];
            }
        }
        if (count !== 1) {
            toastMessage+="- There should be only one root cell (no parent) in the 'meta' sheet\n";
            valid = false;
        }

        // check that all other cells have a parent (present in the "meta" sheet)
        for (const cell of data.get("meta")) {
            if (cell["parent"] && !data.get("meta").find((d) => d[""] === cell["parent"])) {
                toastMessage+="- A cell has a parent that is not present in the 'meta' sheet\n";
                valid = false;
                break;
            }
        }

        // check that there is no circularity in the parent-child relationship
        let breakFlag = false;
        for(const cell of data.get("meta")) {
            let currentCell = cell[""];
            let parent = cell["parent"];
            while(parent) {
                if(parent === originCell) {
                    break;
                }
                if(parent === currentCell) {
                    toastMessage+="- Invalid data: circularity in the parent-child relationship\n";
                    valid = false;
                    breakFlag = true;
                    break;
                }
                parent = getParent(parent);
            }
            if(breakFlag) {
                break;
            }
        }

        // check that all cells have a "n" and "consensus" values
        for (const cell of data.get("meta")) {
            if (cell["n"] === undefined || cell["consensus"] === undefined) {
                toastMessage+="- A cell is missing the 'n' or 'consensus' value in the 'meta' sheet\n";
                valid = false;
                break;
            }
        }

        // Check if all cells in the "markers" sheet are present in the "meta" sheet
        for (const cell of data.get("markers")) {
            if (!data.get("meta").find((d) => d[""] === cell[""])) {
                toastMessage+="- A cell in the 'markers' sheet is not present in the 'meta' sheet\n";
                valid = false;
                break;
            }
        }

        // Check if all cells in the "meta" sheet are present in the "markers" sheet
        for (const cell of data.get("meta")) {
            if (!data.get("markers").find((d) => d[""] === cell[""])) {
                toastMessage+="- A cell in the 'meta' sheet is not present in the 'markers' sheet\n";
                valid = false;
                break;
            }
        }

        // check if value on "markers" sheet are positive
        breakFlag = false;
        for (const cell of data.get("markers")) {
            for (const key in cell) {
                if (key !== "") {
                    if (cell[key] < 0) {
                        toastMessage+="\n[ERROR] A cell in the 'markers' sheet has a negative value";
                        valid = false;
                        breakFlag = true;
                        break;
                    }
                }
            }
            if (breakFlag) {
                break;
            }
        }

        // Set the toast message
        setToastMessage(toastMessage);

        // Return true if all checks passed
        return valid;
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

        const isValid = checkData(worksheets);

        if (isValid) {
            // Navigate to /result with worksheets as parameter
            navigate('/result', { state: { data: worksheets } });
        }
        else {
            // Show toast if data is not valid
            setShowToast(true);
        }
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
       
