import { render, screen, fireEvent } from '@testing-library/react';
import { FileImport } from '../components/FileImport.js';
import { BrowserRouter as Router } from 'react-router-dom';

describe('FileImport', () => {
    it('renders without crashing', () => {
        render(
            <Router>
                <FileImport />
            </Router>
        );
    });

    it('renders FileImport component', () => {
        render(
            <Router>
                <FileImport />
            </Router>
        );
        expect(screen.getByText('Import your file')).toBeInTheDocument();
        expect(screen.getByText('Supported file types: .csv, .xlsx, .xls')).toBeInTheDocument();
        expect(screen.getByLabelText('Choose a file')).toBeInTheDocument();
        expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('displays "File uploaded successfully" on Upload button click', () => {
        render(
            <Router>
                <FileImport />
            </Router>
        );
        const originalAlert = window.alert; // Save the original alert function

        // Mock window.alert with a jest function
        window.alert = jest.fn();

        const uploadButton = screen.getByText('Upload');
        fireEvent.click(uploadButton);

        // Assert that the jest mock for window.alert was called with the expected message
        expect(window.alert).toHaveBeenCalledWith('File uploaded successfully');

        // Restore the original window.alert function
        window.alert = originalAlert;
      });
});