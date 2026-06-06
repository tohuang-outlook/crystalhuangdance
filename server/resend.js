const resendApiUrl = 'https://api.resend.com/emails';

function buildPasswordResetHtml({ resetUrl, expiresInMinutes }) {
  return `
    <p>A password reset was requested for your Crystal Huang account.</p>
    <p>This link expires in ${expiresInMinutes} minutes.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;
}

function buildPasswordResetText({ resetUrl, expiresInMinutes }) {
  return [
    'A password reset was requested for your Crystal Huang account.',
    `This link expires in ${expiresInMinutes} minutes.`,
    `Reset your password: ${resetUrl}`,
    'If you did not request this, you can ignore this email.',
  ].join('\n\n');
}

export function createResendPasswordResetSender({
  apiKey,
  fromAddress,
  fetchImpl = globalThis.fetch,
}) {
  return async function sendPasswordResetEmail({ email, resetUrl, expiresInMinutes }) {
    if (!apiKey) {
      console.warn('Password reset email skipped because RESEND_API_KEY is not configured.');
      return;
    }

    if (typeof fetchImpl !== 'function') {
      throw new Error('Global fetch is unavailable for Resend email delivery.');
    }

    const response = await fetchImpl(resendApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: 'Reset your Crystal Huang account password',
        html: buildPasswordResetHtml({ resetUrl, expiresInMinutes }),
        text: buildPasswordResetText({ resetUrl, expiresInMinutes }),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Resend request failed (${response.status}): ${errorBody}`);
    }
  };
}
