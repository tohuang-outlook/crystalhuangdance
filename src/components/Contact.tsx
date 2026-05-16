import { useRef, useState, type FormEvent } from 'react';
import { Mail, MapPin, Instagram, Youtube, Music2, CheckCircle } from 'lucide-react';
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
      if (res.ok) { setStatus('success'); form.reset(); }
      else { setStatus('error'); }
    } catch { setStatus('error'); }
  };

  return (
    <section id="contact" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/[0.03] to-transparent" />

      <div className="container-max relative z-10">
        <div className="text-center mb-16">
          <p className="text-blue-300 tracking-[0.2em] uppercase text-sm mb-4 font-medium">
            {t("Let's Connect", '保持聯繫')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            {t('Get in', '聯絡')} <span className="gradient-text">{t('Touch', '我')}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {t(
              "Interested in private classes, workshops, or collaborations? I'd love to hear from you.",
              '對私人課程、工作坊或合作有興趣嗎？歡迎與我聯絡。'
            )}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{t('Email', '電子郵件')}</h3>
                <p className="text-gray-400">{siteConfig.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 shrink-0">
                <MapPin className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{t('Location', '所在地')}</h3>
                <p className="text-gray-400">{t('Los Angeles, California', '加州 · 洛杉磯')}</p>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-white font-semibold mb-4">{t('Follow Along', '追蹤我')}</h3>
              <div className="flex gap-4">
                <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/10 transition-all duration-300"
                  aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300"
                  aria-label="YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href={siteConfig.social.tiktok} target="_blank" rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all duration-300"
                  aria-label="TikTok">
                  <Music2 className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form ref={formRef} className="space-y-5" onSubmit={handleSubmit}>
            <input type="hidden" name="_subject" value="New inquiry from crystalhuangdance.com" />
            <div className="grid sm:grid-cols-2 gap-5">
              <input type="text" name="name" placeholder={t('Your Name', '您的姓名')} required
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all" />
              <input type="email" name="_replyto" placeholder={t('Your Email', '您的電子郵件')} required
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all" />
            </div>
            <select name="interest"
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all">
              <option value="">{t("I'm interested in...", '我有興趣的是...')}</option>
              <option value="private-lessons">{t('Private Lessons', '私人課程')}</option>
              <option value="workshops">{t('Workshops', '工作坊')}</option>
              <option value="collaboration">{t('Collaboration', '合作')}</option>
              <option value="other">{t('Other', '其他')}</option>
            </select>
            <textarea name="message" rows={4} placeholder={t('Your Message', '您的訊息')} required
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all resize-none" />
            <button type="submit" disabled={status === 'sending'}
              className="w-full px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed">
              {status === 'sending' ? t('Sending...', '傳送中...') :
               status === 'success' ? t('Message Sent!', '訊息已傳送！') :
               t('Send Message', '傳送訊息')}
            </button>
            {status === 'success' && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle size={16} />
                {t("Thanks for reaching out! I'll get back to you soon.", '感謝您的來信！我會盡快回覆。')}
              </div>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-sm">
                {t('Something went wrong. Please try again, or email me directly at', '出現錯誤，請再試一次，或直接寄信至')}{' '}
                <a href={`mailto:${siteConfig.email}`} className="underline">{siteConfig.email}</a>.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
