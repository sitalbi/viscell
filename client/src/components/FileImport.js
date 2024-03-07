import { Button, Container, Row, Col } from 'react-bootstrap';
import { RiFileUploadLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { React, useState } from 'react';
import * as XLSX from 'xlsx/xlsx.mjs';

export const FileImport = () => {
    const [, setFile] = useState(null);
    const navigate = useNavigate();

    // This function check the validity of data
    const checkData = (data) => {
        // check size of data
        if (data.size !== 2) {
            alert("Invalid data: not enough sheets");
            return false;
        }

        // check if the 2 arrays are named "meta" and "markers"
        if (!data.has("meta") || !data.has("markers")) {
            alert("Invalid data: missing sheets");
            return false;
        }

        // check that just one cell has not a parent
        let count = 0;
        let originCell = ""; // store the origin cell (C)
        for (const cell of data.get("meta")) {
            if (!cell["parent"]) {
                count++;
                originCell = cell[""];
            }
        }
        if (count !== 1) {
            alert("Invalid data: more than one cell has no parent");
            return false;
        }

        // check that all other cells have a parent (present in the "meta" sheet)
        for (const cell of data.get("meta")) {
            if (cell["parent"] && !data.get("meta").find((d) => d[""] === cell["parent"])) {
                alert("Invalid data: a cell has a parent not present in the 'meta' sheet");
                return false;
            }
        }

        // check that there is no circularity in the parent-child relationship
        for(const cell of data.get("meta")) {
            let currentCell = cell[""];
            let parent = cell["parent"];
            while(parent) {
                if(parent === originCell) {
                    break;
                }
                if(parent === currentCell) {
                    alert("Invalid data: circularity in the parent-child relationship");
                    return false;
                }
                parent = data.get("meta").find((d) => d[""] === parent)["parent"];
            }
        }

        // check that all cells have a "n" and "consensus" values
        for (const cell of data.get("meta")) {
            if (cell["n"] === undefined || cell["consensus"] === undefined) {
                alert("Invalid data: a cell has no 'n' or 'consensus' value");
                console.log(cell);
                return false;
            }
        }

        // check if all cells in the "markers" sheet are present in the "meta" sheet
        for (const cell of data.get("markers")) {
            if (!data.get("meta").find((d) => d[""] === cell[""])) {
                alert("Invalid data: a cell in the 'markers' sheet is not present in the 'meta' sheet");
                return false;
            }
        }
        console.log("Data is valid");
        return true;
    }

    const onFileChange = async (value) => {
        // use XLSX to read the file which is a xlss file
        const f = value.target.files[0];
        setFile(f);
        const data = await f.arrayBuffer();
        const workbook = XLSX.read(data);

        const worksheets = new Map();

        // loop through each sheet in the workbook and convert it to a json object for data processing
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
        checkData(worksheets);

        // navigate to /result with worksheets as parameter
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