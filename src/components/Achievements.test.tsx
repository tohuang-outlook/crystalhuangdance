import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../context/LanguageContext';
import Achievements from './Achievements';

describe('Achievements dossier hierarchy', () => {
  it('renders selected distinctions above the archive timeline', () => {
    render(
      <LanguageProvider>
        <Achievements />
      </LanguageProvider>
    );

    expect(screen.getByRole('heading', { name: /Selected Distinctions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Archive Timeline/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Prix de Lausanne Prize Winner/i).length).toBeGreaterThan(0);
  });
});
