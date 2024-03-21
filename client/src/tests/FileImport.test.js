import { render, screen } from '@testing-library/react';
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
        expect(screen.getByLabelText('Upload a file')).toBeInTheDocument();
        expect(screen.getByText('Upload example')).toBeInTheDocument();
    });
});

// Tests on checkData function were removed during merging process
// Lack of rebasing caused too many conflicts to resolve
// They will be added back in the future