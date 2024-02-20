import { render } from '@testing-library/react';
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
});