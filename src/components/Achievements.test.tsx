import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../context/LanguageContext';
import Achievements from './Achievements';

describe('Achievements dossier hierarchy', () => {
  it('renders the archive timeline heading and key award entries', () => {
    render(
      <LanguageProvider>
        <Achievements />
      </LanguageProvider>
    );

    expect(screen.getByRole('heading', { name: /Archive Timeline/i })).toBeInTheDocument();
    expect(
      screen.getAllByText(/Prix de Lausanne.+Contemporary Dance Award Winner/i).length
    ).toBeGreaterThan(0);
  });
});
