import { render, fireEvent } from '@testing-library/react';
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

        fireEvent.click(getByText('Home'));
        expect(window.location.pathname).toBe('/');

        fireEvent.click(getByText('Result'));
        expect(window.location.pathname).toBe('/result');

        fireEvent.click(getByText('Example'));
        expect(window.location.pathname).toBe('/');

        fireEvent.click(getByText('About'));
        expect(window.location.pathname).toBe('/');
    });
});