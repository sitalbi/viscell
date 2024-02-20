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

    it('navigates to /result when the submit button is clicked', () => {
        const { getByText } = render(
            <FileContext.Provider value={[null, jest.fn()]}>
                <Router>
                    <ImportFile />
                </Router>
            </FileContext.Provider>
        );

        fireEvent.click(getByText('Submit'));

        expect(window.location.pathname).toBe('/result');
    });

    it('the file is removed from messageImportFile when a new file is selected', () => {
        const { getByLabelText, getByText } = render(
            <FileContext.Provider value={[null, jest.fn()]}>
                <Router>
                    <ImportFile />
                </Router>
            </FileContext.Provider>
        );

        fireEvent.change(getByLabelText('Choose a file'), { target: { files: [new File([''], 'test.csv', { type: 'text/csv' })] } });
        fireEvent.change(getByLabelText('Choose a file'), { target: { files: [new File([''], 'test2.csv', { type: 'text/csv' })] } });

        // expected messageImportFile to be test2.csv
        expect(getByText('test2.csv')).toBeInTheDocument();
    });
});