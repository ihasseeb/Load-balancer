import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './badge';

describe('Badge Component', () => {
    it('renders correctly with default variant', () => {
        render(<Badge>Test Badge</Badge>);
        const badge = screen.getByText('Test Badge');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('bg-primary');
    });

    it('renders correctly with destructive variant', () => {
        render(<Badge variant="destructive">Delete</Badge>);
        const badge = screen.getByText('Delete');
        expect(badge).toHaveClass('bg-destructive');
    });

    it('applies custom className', () => {
        render(<Badge className="custom-class">Custom</Badge>);
        const badge = screen.getByText('Custom');
        expect(badge).toHaveClass('custom-class');
    });
});
