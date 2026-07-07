import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import Videos from './Videos';

function VideosHarness() {
  const { setLang } = useLanguage();

  return (
    <>
      <button type="button" onClick={() => setLang('zh')}>
        switch to chinese
      </button>
      <Videos />
    </>
  );
}

describe('Videos modal', () => {
  it('opens a non-first featured reel dialog and uses local video playback for Prix de Lausanne', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <Videos />
      </LanguageProvider>
    );

    await user.click(
      screen.getByRole('button', {
        name: /Prix de Lausanne 2024 Contemporary Dance Award and Prize Winner/i,
      })
    );

    expect(
      screen.getByRole('dialog', {
        name: /Prix de Lausanne 2024 Contemporary Dance Award and Prize Winner/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByTitle(/Prix de Lausanne 2024 Contemporary Dance Award and Prize Winner/i).tagName
    ).toBe('VIDEO');
  });

  it('opens and closes the featured reel dialog in English', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <Videos />
      </LanguageProvider>
    );

    await user.click(
      screen.getByRole('button', {
        name: /XV Moscow Ballet Competition — Round 2 Contemporary/i,
      })
    );

    expect(
      screen.getByRole('dialog', {
        name: /XV Moscow Ballet Competition — Round 2 Contemporary/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens a supporting reel dialog and localizes the close control in Chinese mode', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <VideosHarness />
      </LanguageProvider>
    );

    await user.click(screen.getByRole('button', { name: /switch to chinese/i }));
    expect(screen.getByAltText('2024 YoungArts — 芭蕾傑出得獎者')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: /2024 YoungArts — 芭蕾傑出得獎者/i,
      })
    );

    expect(
      screen.getByRole('dialog', {
        name: /2024 YoungArts — 芭蕾傑出得獎者/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '關閉' })).toBeInTheDocument();
  });
});
