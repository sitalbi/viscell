import { render, fireEvent } from '@testing-library/react';
import { FileContext } from '../context/SankeyFile';
import { ImportFile } from '../components/ImportFile';
import { BrowserRouter as Router } from 'react-router-dom';

describe('ImportFile', () => {
    it('renders without crashing', () => {
        render(
            <FileContext.Provider value={[null, jest.fn()]}>
                <Router>
                    <ImportFile />
                </Router>
            </FileContext.Provider>
        );
    });

    it('updates the file in context when a file is selected', () => {
        const setFile = jest.fn();
        const { getByLabelText } = render(
            <FileContext.Provider value={[null, setFile]}>
                <Router>
                    <ImportFile />
                </Router>
            </FileContext.Provider>
        );

        fireEvent.change(getByLabelText('Choose a file'), { target: { files: [new File([''], 'test.csv', { type: 'text/csv' })] } });

        expect(setFile).toHaveBeenCalledWith(expect.any(File));
    });
});