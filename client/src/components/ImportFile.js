import { React, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileContext } from '../context/SankeyFile.js';
import './ImportFile.css';

export const ImportFile = () => {

    const [, setFile] = useContext(FileContext);

    const navigate = useNavigate();

    const onFileChange = (value) => {
        setFile(value.target.files[0]);
        if (document.querySelector('.messageImportFile')) {
            document.querySelector('.messageImportFile').remove();
        }

        // create a message with the name of the file
        const message = document.createElement('p');
        message.className = 'messageImportFile';
        message.innerHTML = value.target.files[0].name;
        message.style.color = 'black';
        document.querySelector('.importFileDiv').appendChild(message);
    }

    const onFileClick = () => {
        // create a message to inform the user that the file has been uploaded
        const message = document.createElement('p');
        message.innerHTML = 'File uploaded';
        message.style.color = 'green';
        document.querySelector('.importFileDiv').appendChild(message);
        navigate('/result');
    }

    return (
        <div className='importFile'>
            <h2>Import your file</h2>
            <div className='importFileDiv'>
                <div className='importFileButton'>
                    <label className='fileImportBt' htmlFor="file">Choose a file</label>
                    <input className='fileImportInput' type="file" id="file" name="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={onFileChange} />
                </div>
                <div className='div3'>
                    <button className='buttonImport' onClick={onFileClick}>Submit</button>
                </div>
            </div>
        </div>
    );
}