import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {Sankey} from '../components/Sankey.js';
import { SankeyStructure } from '../utils/SankeyStructure.js';


describe('Sankey component', () => {
    // create a mock data structure
    const worksheetsMock = new Map([
        ["meta", [
            { "parent": "", "": "Root", "n": 15 , "consensus" : "0.2"},
            { "parent": "Root", "": "Child1", "n": 10 , "consensus" : "0.3"},
            { "parent": "Root", "": "Child2", "n": 5 , "consensus" : "0.6"},
            { "parent": "Child1", "": "Grandchild1", "n": 7 , "consensus" : "0.8"},
            { "parent": "Child1", "": "Grandchild2", "n": 3 , "consensus" : "0.9"},
            { "parent": "Child2", "": "Grandchild3", "n": 4 , "consensus" : "0.5"},
            { "parent": "Child2", "": "Grandchild4", "n": 1 , "consensus" : "0.6"},
        ]],
        ["markers", [
            { "": "Root" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Child1" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Child2" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild1" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild2" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild3" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild4" , "gene1" : 10, "gene2" : 20, "gene3": 30},
        ]]
    ]);
    const sankeyStructure = new SankeyStructure(worksheetsMock);
    const numberOfGenes = 1;
    it('renders Sankey component', () => {
        render(<Sankey sankeyStructure={sankeyStructure} numberOfGenes={numberOfGenes} title="sankey" />);
        // Check if the sankey component renders without crashing
        const sankeyElement = screen.getByTestId('sankey');
        expect(sankeyElement).toBeInTheDocument();
    });
    it('renders Sankey component with title', () => {
        render(<Sankey sankeyStructure={sankeyStructure} numberOfGenes={numberOfGenes} title="sankey_title_test" />);
        // Check if the title is rendered
        expect(screen.queryByText('sankey_title_test')).toBeInTheDocument();
    });
    it('check that the sankey component renders the correct number of links', () => {   
        render(<Sankey sankeyStructure={sankeyStructure} numberOfGenes={numberOfGenes} title="sankey" />);
        // Check that the number of links is correct
        expect(screen.queryAllByTestId('link').length).toBe(6);
    });
    it('check that the sankey component renders the correct number of nodes', () => {
        render(<Sankey sankeyStructure={sankeyStructure} numberOfGenes={numberOfGenes} title="sankey" />);
        // Check that the number of nodes is correct
        expect(screen.queryAllByTestId('node').length).toBe(6);
    });   
    const hugeWorksheetsMock = new Map([
        ["meta", [
            { "parent": "", "": "Root", "n": 15 , "consensus" : "0.2"},
            { "parent": "Root", "": "Child1", "n": 10 , "consensus" : "0.3"},
            { "parent": "Root", "": "Child2", "n": 5 , "consensus" : "0.6"},
            { "parent": "Child1", "": "Grandchild1", "n": 7 , "consensus" : "0.8"},
            { "parent": "Child1", "": "Grandchild2", "n": 3 , "consensus" : "0.9"},
            { "parent": "Child2", "": "Grandchild3", "n": 4 , "consensus" : "0.5"},
            { "parent": "Child2", "": "Grandchild4", "n": 1 , "consensus" : "0.6"},
            { "parent": "Grandchild1", "": "Grandchild5", "n": 7 , "consensus" : "0.8"},
            { "parent": "Grandchild1", "": "Grandchild6", "n": 3 , "consensus" : "0.9"},
            { "parent": "Grandchild2", "": "Grandchild7", "n": 4 , "consensus" : "0.5"},
            { "parent": "Grandchild2", "": "Grandchild8", "n": 1 , "consensus" : "0.6"},
            { "parent": "Grandchild3", "": "Grandchild9", "n": 7 , "consensus" : "0.8"},
            { "parent": "Grandchild3", "": "Grandchild10", "n": 3 , "consensus" : "0.9"},
            { "parent": "Grandchild4", "": "Grandchild11", "n": 4 , "consensus" : "0.5"},
            { "parent": "Grandchild4", "": "Grandchild12", "n": 1 , "consensus" : "0.6"},
            { "parent": "Grandchild5", "": "Grandchild13", "n": 7 , "consensus" : "0.8"},
            { "parent": "Grandchild5", "": "Grandchild14", "n": 3 , "consensus" : "0.9"},
            { "parent": "Grandchild6", "": "Grandchild15", "n": 4 , "consensus" : "0.5"},
            { "parent": "Grandchild6", "": "Grandchild16", "n": 1 , "consensus" : "0.6"},
            { "parent": "Grandchild7", "": "Grandchild17", "n": 7 , "consensus" : "0.8"},
            { "parent": "Grandchild7", "": "Grandchild18", "n": 3 , "consensus" : "0.9"},
            { "parent": "Grandchild8", "": "Grandchild19", "n": 4 , "consensus" : "0.5"},
            { "parent": "Grandchild8", "": "Grandchild20", "n": 1 , "consensus" : "0.6"},
            { "parent": "Grandchild9", "": "Grandchild21", "n": 7 , "consensus" : "0.8"},
            { "parent": "Grandchild9", "": "Grandchild22", "n": 3 , "consensus" : "0.9"},
            { "parent": "Grandchild10", "": "Grandchild23", "n": 4 , "consensus" : "0.5"},
            { "parent": "Grandchild10", "": "Grandchild24", "n": 1 , "consensus" : "0.6"},
            { "parent": "Grandchild11", "": "Grandchild25", "n": 7 , "consensus" : "0.8"},
            { "parent": "Grandchild11", "": "Grandchild26", "n": 3 , "consensus" : "0.9"},
            { "parent": "Grandchild12", "": "Grandchild27", "n": 4 , "consensus" : "0.5"},
            { "parent": "Grandchild12", "": "Grandchild28", "n": 1 , "consensus" : "0.6"},
            { "parent": "Grandchild13", "": "Grandchild29", "n": 7 , "consensus" : "0.8"}
        ]],
        ["markers", [
            { "": "Root" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Child1" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Child2" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild1" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild2" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild3" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild4" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild5" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild6" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild7" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild8" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild9" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild10" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild11" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "": "Grandchild12" , "gene1" : 10, "gene2" : 20, "gene3": 30},
            { "" : "Grandchild13" , "gene1" : 10, "gene2" : 20, "gene3": 30}
        ]]
    ]);
    const hugeSankeyStructure = new SankeyStructure(hugeWorksheetsMock);
    it('check the alert if data are not available', () => {
        render(<Sankey sankeyStructure={hugeSankeyStructure} numberOfGenes={numberOfGenes} title="sankey" />);
        // Check that the alert is rendered
        expect(screen.queryByTestId('alert')).toBeInTheDocument();
    });
    // it('check the opacity of links when the mouse is over a specific link', () => {
    //     render(<Sankey sankeyStructure={sankeyStructure} numberOfGenes={numberOfGenes} title="sankey" />);
    //     // Check that the opacity of the link is correct when the mouse is over it
    //     const firstLink = screen.queryAllByTestId('link')[0];
    //     fireEvent.mouseOver(firstLink);
    //     expect(firstLink).toHaveAttribute('stroke-opacity', '1');
    //     fireEvent.mouseOut(firstLink);
    // });
    it('check that the opacity depends on the toggle', () => {
        render(<Sankey sankeyStructure={sankeyStructure} numberOfGenes={numberOfGenes} title="sankey" />);
        // Check that the opacity depend on the consensus when the toggle is on
        const toggle = screen.getByTestId('toggle');
        fireEvent.click(toggle);
        const links = screen.queryAllByTestId('link');
        links.forEach(link => {
            expect(link).toHaveAttribute('stroke-opacity', link.consensus);
        });
        // Check that the opacity is 1 when the toggle is off
        fireEvent.click(toggle);
        links.forEach(link => {
            expect(link).toHaveAttribute('stroke-opacity', '1');
        });
    });
    // it('check the content of the tooltip', () => {
    //     render(<Sankey sankeyStructure={sankeyStructure} numberOfGenes={numberOfGenes} title="sankey" />);
    //     // Check that the tooltip is rendered
    //     const firstLink = screen.queryAllByTestId('link')[0];
    //     fireEvent.mouseOver(firstLink);
    //     const tooltip = document.querySelector('.tooltip');
    //     expect(tooltip).toBeInTheDocument();
    //     // Check that the content of the tooltip is correct
    //     console.log(tooltip);
    //     expect(tooltip).toHaveTextContent('Root -> Child1');
    //     fireEvent.mouseOut(firstLink);
    // });
    // it('check that opacity boolean is updated when the toggle is clicked', () => {
    //     render(<Sankey sankeyStructure={sankeyStructure} numberOfGenes={numberOfGenes} title="sankey" />);
    //     // Check that the opacity boolean is updated when the toggle is clicked
    //     const toggle = screen.getByTestId('toggle');
    //     fireEvent.click(toggle);
    //     // how to get opacity boolean?
    //     expect(opacity).toBe(true);

    // });
    
});

