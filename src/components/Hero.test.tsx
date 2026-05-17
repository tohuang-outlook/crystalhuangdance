import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../context/LanguageContext';
import Hero from './Hero';

describe('Hero cover frame', () => {
  it('renders the professional identity and credential strip', () => {
    render(
      <LanguageProvider>
        <Hero />
      </LanguageProvider>
    );

    expect(screen.getByText(/San Francisco Ballet School Trainee/i)).toBeInTheDocument();
    expect(screen.getByText(/ABT JKO School/i)).toBeInTheDocument();
    expect(screen.getByText(/Prix de Lausanne Prize Winner/i)).toBeInTheDocument();
  });
});
