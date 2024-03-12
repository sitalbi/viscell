import { render, fireEvent, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MenuBar } from '../components/MenuBar.js';

describe('MenuBar', () => {
    it('renders without crashing', () => {
        render(
            <Router>
                <MenuBar />
            </Router>
        );
    });

    it('navigates to the correct page when a menu button is clicked', () => {
        const { getByText } = render(
            <Router>
                <MenuBar />
            </Router>
        );

        fireEvent.click(screen.getByAltText('University of Bordeaux'));
        expect(window.location.pathname).toBe('/');

        // Removed useless "Result" button as we agreed

        fireEvent.click(getByText('Example'));
        expect(window.location.pathname).toBe('/example');

        fireEvent.click(getByText('About'));
        expect(window.location.pathname).toBe('/about');
    });
});