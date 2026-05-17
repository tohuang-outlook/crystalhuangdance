import { useRef, useState, type FormEvent } from 'react';
import { CheckCircle, Instagram, Mail, MapPin, Music2, Youtube } from 'lucide-react';
import { siteConfig } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xdknaovq';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>('idle');
  const { t } = useLanguage();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="section-padding section-divider">
      <div className="container-max grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="eyebrow">{t('Professional Inquiries', '專業洽詢')}</p>
            <h2 className="text-4xl sm:text-5xl">{t('Professional Inquiries', '專業洽詢')}</h2>
            <p className="max-w-xl text-base leading-8 text-[var(--text-muted)]">
              {t(
                'For auditions, collaborations, choreography, teaching engagements, and press inquiries, please use the form below or email directly.',
                '如需試演、合作、編舞、教學邀約或媒體洽詢，請使用下列表單或直接來信。'
              )}
            </p>
          </div>

          <div className="space-y-6 border border-[var(--line)] bg-[var(--surface)] p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-[var(--line)] p-3 text-[var(--accent)]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {t('Email', '電子郵件')}
                </h3>
                <p className="mt-2 text-[var(--text)]">{siteConfig.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-[var(--line)] p-3 text-[var(--accent)]">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {t('Location', '所在地')}
                </h3>
                <p className="mt-2 text-[var(--text)]">
                  {t('Available for national and international opportunities', '可配合美國及國際合作機會')}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {t('Follow Along', '追蹤動態')}
              </h3>
              <div className="mt-4 flex gap-4">
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-[var(--line)] p-3 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-[var(--line)] p-3 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href={siteConfig.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-[var(--line)] p-3 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  aria-label="TikTok"
                >
                  <Music2 className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <form
          ref={formRef}
          className="space-y-5 border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="_subject" value="New inquiry from crystalhuangdance.com" />

          <div className="grid gap-5 sm:grid-cols-2">
            <input
              type="text"
              name="name"
              placeholder={t('Your Name', '您的姓名')}
              required
              className="w-full border border-[var(--line)] bg-[rgba(243,238,228,0.02)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[rgba(243,238,228,0.24)]"
            />
            <input
              type="email"
              name="_replyto"
              placeholder={t('Your Email', '您的電子郵件')}
              required
              className="w-full border border-[var(--line)] bg-[rgba(243,238,228,0.02)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[rgba(243,238,228,0.24)]"
            />
          </div>

          <select
            name="interest"
            className="w-full border border-[var(--line)] bg-[rgba(243,238,228,0.02)] px-4 py-3 text-[var(--text-muted)] focus:outline-none focus:border-[rgba(243,238,228,0.24)]"
            defaultValue=""
          >
            <option value="" disabled>
              {t("I'm reaching out about...", '我想洽詢的是...')}
            </option>
            <option value="audition">{t('Audition / School Inquiry', '試演 / 校方洽詢')}</option>
            <option value="collaboration">{t('Collaboration', '合作')}</option>
            <option value="teaching">{t('Teaching / Workshop / Choreography', '教學 / 工作坊 / 編舞')}</option>
            <option value="press">{t('Press / Interview', '媒體 / 訪談')}</option>
          </select>

          <textarea
            name="message"
            rows={5}
            placeholder={t('Your Message', '您的訊息')}
            required
            className="w-full resize-none border border-[var(--line)] bg-[rgba(243,238,228,0.02)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[rgba(243,238,228,0.24)]"
          />

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full border border-[var(--text)] bg-[var(--text)] px-8 py-3.5 text-sm uppercase tracking-[0.18em] text-[var(--bg)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'sending'
              ? t('Sending...', '傳送中...')
              : status === 'success'
                ? t('Message Sent', '已送出')
                : t('Submit Inquiry', '送出洽詢')}
          </button>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle size={16} />
              {t("Thanks for reaching out. We'll follow up soon.", '感謝來信，我們會盡快回覆。')}
            </div>
          )}

          {status === 'error' && (
            <p className="text-sm text-red-400">
              {t(
                'Something went wrong. Please try again, or email directly at',
                '系統出現錯誤，請再試一次，或直接來信至'
              )}{' '}
              <a href={`mailto:${siteConfig.email}`} className="underline">
                {siteConfig.email}
              </a>
              .
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
