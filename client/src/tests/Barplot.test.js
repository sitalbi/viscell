import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Barplot from '../components/Barplot';


describe('Barplot component', () => {
    const genesMap = new Map([
        ['Gene1', 10],
        ['Gene2', 20],
        ['Gene3', 15],
        ['Gene4', 25],
        ['Gene5', 30],
        ['Gene6', 18],
    ]);

    it('renders Barplot component', () => {
        render(<Barplot width={400} height={200} cellName="TestCell" genes={new Map()} />);

        // Check if the component renders without crashing
        const barplotElement = screen.getByTestId('barplot');
        expect(barplotElement).toBeInTheDocument();
    });

    it('renders with only 3 maximum genes initially', () => {
        render(<Barplot width={500} height={300} cellName="Example" genes={genesMap} />);

        // Check that only 3 genes are rendered initially
        expect(screen.queryByText('Gene5')).toBeInTheDocument();
        expect(screen.queryByText('Gene4')).toBeInTheDocument();
        expect(screen.queryByText('Gene2')).toBeInTheDocument();
        expect(screen.queryByText('Gene6')).not.toBeInTheDocument(); // Ensure 4th maximum gene is not present
    });

    it('renders with all genes after clicking the title', async () => {
        render(<Barplot width={500} height={300} cellName="Example" genes={genesMap} />);
        fireEvent.click(screen.getByText(/Open/i));

        // Wait for the modal to be rendered
        await waitFor(() => {
            const modalElement = screen.getByText(/Full Barplot for Example/i);
            expect(modalElement).toBeInTheDocument();
        });;

        const totalGenes = screen.getByText(/Number of total genes for Example : 6/i);
        expect(totalGenes).toBeInTheDocument();

        // Check if the genes are rendered decreasingly
        expect(await screen.findByText('Gene5')).toBeInTheDocument();
        expect(await screen.findByText('Gene4')).toBeInTheDocument();
        expect(await screen.findByText('Gene2')).toBeInTheDocument();
        expect(await screen.findByText('Gene6')).toBeInTheDocument();
        expect(await screen.findByText('Gene3')).toBeInTheDocument();
        expect(await screen.findByText('Gene1')).toBeInTheDocument();
    });

    it('renders Barplot with modal', () => {
        render(<Barplot width={400} height={200} cellName="TestCell" genes={genesMap} />);

        // Click on the title to open the modal
        fireEvent.click(screen.getByText(/Open/i));

        // Check if the modal is rendered
        const modalElement = screen.getByText(/Full Barplot for TestCell/i);
        expect(modalElement).toBeInTheDocument();

    });

    it('closes the modal when "Close" button is clicked', () => {
        render(<Barplot width={400} height={200} cellName="TestCell" genes={new Map()} />);

        // Click on the title to open the modal
        fireEvent.click(screen.getByText(/Open/i));

        // Check if the modal is rendered
        const modalElement = screen.getByText(/Full Barplot for TestCell/i);
        expect(modalElement).toBeInTheDocument();

        // Click on the "Close" button
        fireEvent.click(screen.getByText(/Close/i));

        // Check if the modal is closed
        expect(modalElement).not.toBeInTheDocument();
    });

    it('clicking on a bar opens the correct hyperlink', () => {
        const width = 300;
        const height = 200;
        const cellName = "TestCell";
        const genes = new Map([
            ["ACTA2", 1],
            ["ACTC1", 1],
            ["ACTG2", 1]
        ]);
        const { getByTestId } = render(<Barplot width={width} height={height} cellName={cellName} genes={genes} />);
        const barElement = getByTestId('bar-ACTA2');
        const originalOpen = window.open;
        window.open = jest.fn();

        fireEvent.click(barElement);

        expect(window.open).toHaveBeenCalledWith('https://pubchem.ncbi.nlm.nih.gov/gene/ACTA2/Homo_sapiens');

        window.open = originalOpen;
    });
});


