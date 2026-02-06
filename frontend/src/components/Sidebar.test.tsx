import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

describe('Sidebar Component', () => {
    const renderSidebar = (isDarkMode = true) => {
        return render(
            <BrowserRouter>
                <Sidebar isDarkMode={isDarkMode} />
            </BrowserRouter>
        );
    };

    it('renders all menu items', () => {
        renderSidebar();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Logs & Metrics')).toBeInTheDocument();
        expect(screen.getByText('Model Insights')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('has correct links for navigation', () => {
        renderSidebar();
        expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
        expect(screen.getByRole('link', { name: /logs/i })).toHaveAttribute('href', '/logs');
    });

    it('applies dark mode classes when isDarkMode is true', () => {
        renderSidebar(true);
        const aside = screen.getByRole('complementary');
        expect(aside).toHaveClass('bg-[#1F2937]');
    });

    it('applies light mode classes when isDarkMode is false', () => {
        renderSidebar(false);
        const aside = screen.getByRole('complementary');
        expect(aside).toHaveClass('bg-white');
    });
});
