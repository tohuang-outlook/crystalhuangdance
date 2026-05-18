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
  it('opens and closes the featured reel dialog in English', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <Videos />
      </LanguageProvider>
    );

    await user.click(
      screen.getByRole('button', {
        name: /Prix de Lausanne 2024/i,
      })
    );

    expect(
      screen.getByRole('dialog', {
        name: /Prix de Lausanne 2024/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('localizes the close control in Chinese mode', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <VideosHarness />
      </LanguageProvider>
    );

    await user.click(screen.getByRole('button', { name: /switch to chinese/i }));
    await user.click(
      screen.getByRole('button', {
        name: /2024 洛桑國際芭蕾舞比賽/i,
      })
    );

    expect(screen.getByRole('button', { name: '關閉' })).toBeInTheDocument();
  });
});
