import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../context/LanguageContext';
import Hero from './Hero';

describe('Hero cover frame', () => {
  it('renders the professional identity and archive entry points', () => {
    render(
      <LanguageProvider>
        <Hero />
      </LanguageProvider>
    );

    expect(screen.getByText(/Curated Dossier/i)).toBeInTheDocument();
    expect(screen.getAllByText(/San Francisco Ballet School Trainee/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Crystal Huang/i)).toBeInTheDocument();
    expect(screen.getByText(/^Training$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Awards$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Artistic Range$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Media$/i)).toBeInTheDocument();
  });
});
