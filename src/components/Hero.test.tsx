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
    expect(screen.getByText(/^Press Highlight$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Archive Timeline$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Artist Profile$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Artistic Range$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Media$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Master Class and Choreographer$/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Archive Timeline/i })).toHaveAttribute(
      'href',
      '#archive-timeline'
    );
    expect(screen.getByText(/Coming Up Events/i)).toBeInTheDocument();
    expect(screen.getAllByText(/July 2026/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/^Press Play Pro Assistant$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Las Vegas$/i)).toBeInTheDocument();
    expect(screen.getByText(/^YAGP Gala$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Beijing$/i)).toBeInTheDocument();
    expect(screen.getByText(/July-August 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/^AEDC Performance and Master Class$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Shanghai \/ Taipei \/ Hong Kong$/i)).toBeInTheDocument();
  });
});
