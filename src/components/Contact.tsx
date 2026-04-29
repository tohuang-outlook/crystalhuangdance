import { useRef, useState, type FormEvent } from 'react';
import { Mail, MapPin, Instagram, Youtube, Music2, CheckCircle } from 'lucide-react';
import { siteConfig } from '../data/siteData';

// ═══════════════════════════════════════════════════════════════
// TODO: 到 https://formspree.io 註冊免費帳號，把下一行的 'xdknaovq'
// 換成你拿到的 Form ID，表單就能正常收信了！
// ═══════════════════════════════════════════════════════════════
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xdknaovq';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>('idle');

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
    <section id="contact" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/[0.03] to-transparent" />

      <div className="container-max relative z-10">
        <div className="text-center mb-16">
          <p className="text-blue-300 tracking-[0.2em] uppercase text-sm mb-4 font-medium">
            Let's Connect
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Get in <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Interested in private classes, workshops, or collaborations? I'd
            love to hear from you.
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
                <h3 className="text-white font-semibold mb-1">Email</h3>
                <p className="text-gray-400">{siteConfig.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 shrink-0">
                <MapPin className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Location</h3>
                <p className="text-gray-400">Los Angeles, California</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4">
              <h3 className="text-white font-semibold mb-4">Follow Along</h3>
              <div className="flex gap-4">
                <a
                  href={siteConfig.social.instagram}
                  className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/10 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href={siteConfig.social.youtube}
                  className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a
                  href={siteConfig.social.tiktok}
                  className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all duration-300"
                  aria-label="TikTok"
                >
                  <Music2 className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form ref={formRef} className="space-y-5" onSubmit={handleSubmit}>
            <input type="hidden" name="_subject" value="New inquiry from crystalhuangdance.com" />

            <div className="grid sm:grid-cols-2 gap-5">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
              />
              <input
                type="email"
                name="_replyto"
                placeholder="Your Email"
                required
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
              />
            </div>
            <select
              name="interest"
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
            >
              <option value="">I'm interested in...</option>
              <option value="private-lessons">Private Lessons</option>
              <option value="workshops">Workshops</option>
              <option value="collaboration">Collaboration</option>
              <option value="other">Other</option>
            </select>
            <textarea
              name="message"
              rows={4}
              placeholder="Your Message"
              required
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all resize-none"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'sending'
                ? 'Sending...'
                : status === 'success'
                  ? 'Message Sent!'
                  : 'Send Message'}
            </button>

            {/* Status messages */}
            {status === 'success' && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle size={16} />
                Thanks for reaching out! I'll get back to you soon.
              </div>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-sm">
                Something went wrong. Please try again, or email me directly at{' '}
                <a href={`mailto:${siteConfig.email}`} className="underline">
                  {siteConfig.email}
                </a>
                .
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
