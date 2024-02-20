import { Button, Container, Row, Col } from 'react-bootstrap';
import { React, useContext } from 'react';
import { FileContext } from '../context/SankeyFile.js';
import { RiFileUploadLine } from 'react-icons/ri';

export const ImportFile = () => {
    const [, setFile] = useContext(FileContext);

    const onFileChange = (value) => {
        setFile(value.target.files[0]);
    };

    const onFileClick = () => {
        alert("File uploaded successfully"); // This will change very soon
    };

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
                        <Button variant="success" className="btn btn-primary" onClick={onFileClick}>Upload</Button>
                    </div>
                    <div className='info'>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};