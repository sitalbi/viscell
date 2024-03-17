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

    const colorMap = new Map([
        ['Gene1', '#ff0000'],
        ['Gene2', '#00ff12'],
        ['Gene3', '#ff00ff'],
        ['Gene4', '#00ff00'],
        ['Gene5', '#0000ff'],
        ['Gene6', '#ffff00'],
    ]);

    const numberOfGenesToDisplay = 3;

    it('renders Barplot component', () => {
        render(<Barplot width={400} height={200} cellName="TestCell" genes={new Map()} colorMap={new Map()} numberOfGenes={numberOfGenesToDisplay} />);

        // Check if the component renders without crashing
        const barplotElement = screen.getByTestId('barplot');
        expect(barplotElement).toBeInTheDocument();
    });

    it('renders with only 3 genes initially', () => {
        render(<Barplot width={500} height={300} cellName="Example" genes={genesMap} colorMap={colorMap} numberOfGenes={numberOfGenesToDisplay}/>);

        // Check that only 3 genes are rendered initially
        expect(screen.queryByText('Gene5')).toBeInTheDocument();
        expect(screen.queryByText('Gene4')).toBeInTheDocument();
        expect(screen.queryByText('Gene2')).toBeInTheDocument();
        expect(screen.queryByText('Gene6')).not.toBeInTheDocument(); // Ensure 4th maximum gene is not present
    });

    it('renders full Barplot with modal', () => {
        render(<Barplot width={400} height={200} cellName="TestCell" genes={genesMap} colorMap={colorMap} numberOfGenes={numberOfGenesToDisplay} />);

        // Click on the svg
        fireEvent.click(screen.getByTestId('barplot-svg'));

        // Check if the modal is rendered
        const modalElement = screen.getByText(/Population/i);
        expect(modalElement).toBeInTheDocument();

        // Check the number of genes
        const numberOfGenes = screen.getByText(/Total number of genes for TestCell : 6/i);
        expect(numberOfGenes).toBeInTheDocument();

    });

    it('renders with all genes after clicking the title', async () => {
        render(<Barplot width={500} height={300} cellName="C6" genes={genesMap} colorMap={colorMap} numberOfGenes={numberOfGenesToDisplay}/>);

        // Click on the svg
        fireEvent.click(screen.getByTestId('barplot-svg'));

        // Wait for the modal to be rendered
        await waitFor(() => {
            expect(screen.getByText(/Population/i)).toBeInTheDocument();
        });;

        const totalGenes = screen.getByText(/Total number of genes for C6 : 6/i);
        expect(totalGenes).toBeInTheDocument();

        // Check if the genes are rendered
        expect(await screen.findByText('Gene5')).toBeInTheDocument();
        expect(await screen.findByText('Gene4')).toBeInTheDocument();
        expect(await screen.findByText('Gene2')).toBeInTheDocument();
        expect(await screen.findByText('Gene6')).toBeInTheDocument();
        expect(await screen.findByText('Gene3')).toBeInTheDocument();
        expect(await screen.findByText('Gene1')).toBeInTheDocument();
    });


    it('closes the modal when "Close" button is clicked', () => {
        render(<Barplot width={400} height={200} cellName="TestCell" genes={new Map()} colorMap={colorMap} numberOfGenes={numberOfGenesToDisplay}/>);

        // Click on the svg
        fireEvent.click(screen.getByTestId('barplot-svg'));

        // Check if the modal is rendered
        const modalElement = screen.getByText(/Population/i);
        expect(modalElement).toBeInTheDocument();

        // Click on the "Close" button
        fireEvent.click(screen.getByText(/Close/i));

        // Check if the modal is closed
        expect(modalElement).not.toBeInTheDocument();
    });

    it('renders the correct information on mouseover on a bar and reset style on mouseout', () => {
        render(<Barplot width={400} height={200} cellName="TestCell" genes={genesMap} colorMap={colorMap} numberOfGenes={numberOfGenesToDisplay}/>);

        // Get a reference to the rectangle element
        const barElement = screen.getByTestId('bar-Gene5');
        fireEvent.mouseOver(barElement);

        // Assertions : check if opacity and cursor are updated
        expect(barElement).toHaveAttribute('opacity', '0.5');
        expect(barElement).toHaveStyle('cursor: pointer');

        // Check if the tooltip is created and contains the correct gene name
        expect(document.querySelector('.tooltip')).toBeInTheDocument();
        expect(document.querySelector('.tooltip')).toHaveTextContent('Gene: Gene5');

        // Mouse out
        fireEvent.mouseOut(barElement);

        // Assertions : check if opacity and cursor are reset
        expect(barElement.getAttribute('opacity')).toBeNull();

        // Check if the tooltip is removed
        expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
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
        const { getByTestId } = render(<Barplot width={width} height={height} cellName={cellName} genes={genes} colorMap={colorMap} numberOfGenes={numberOfGenesToDisplay} />);
        const barElement = getByTestId('bar-ACTA2');
        const originalOpen = window.open;
        window.open = jest.fn();

        fireEvent.click(barElement);

        expect(window.open).toHaveBeenCalledWith('https://pubchem.ncbi.nlm.nih.gov/gene/ACTA2/Homo_sapiens');

        window.open = originalOpen;
    });
});