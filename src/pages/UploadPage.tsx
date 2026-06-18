import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createYoutubeVideo, uploadVideoFile } from '../services/videos';

const maximumDurationSeconds = 300;

type UploadMode = 'youtube' | 'file';

function formatSeconds(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

async function readVideoDuration(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const duration = await new Promise<number>((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = objectUrl;
      video.onloadedmetadata = () => resolve(video.duration);
      video.onerror = () => reject(new Error('Unable to read video duration.'));
    });

    return duration;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [mode, setMode] = useState<UploadMode>('youtube');
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileDurationSeconds, setFileDurationSeconds] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const helperCopy = useMemo(
    () =>
      mode === 'youtube'
        ? 'Paste a valid YouTube URL and we will save it to your private reel list without downloading the video.'
        : isAdmin
          ? 'Upload MP4, MOV, or AVI clips with no maximum length for admin accounts. The server will automatically compress the final file to stay under 20MB.'
          : 'Upload MP4, MOV, or AVI clips up to 5 minutes long. The server will automatically compress the final file to stay under 20MB.',
    [isAdmin, mode]
  );

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setFileDurationSeconds(null);
    setError(null);
    setSuccessMessage(null);

    if (!nextFile) {
      return;
    }

    try {
      const duration = await readVideoDuration(nextFile);

      if (!isAdmin && duration > maximumDurationSeconds) {
        setFile(null);
        setError('Video length must be 5 minutes or less.');
        event.target.value = '';
        return;
      }

      setFileDurationSeconds(duration);
    } catch (err) {
      setFile(null);
      setError(err instanceof Error ? err.message : 'Unable to read video duration.');
      event.target.value = '';
    }
  };

  const resetForm = () => {
    setTitle('');
    setYoutubeUrl('');
    setFile(null);
    setFileDurationSeconds(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setError('Please enter a title for this upload.');
      return;
    }

    if (mode === 'youtube' && !youtubeUrl.trim()) {
      setError('Please paste a YouTube URL.');
      return;
    }

    if (mode === 'file' && !file) {
      setError('Please choose a video file to upload.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'youtube') {
        await createYoutubeVideo({ title: title.trim(), youtubeUrl: youtubeUrl.trim() });
        setSuccessMessage('YouTube reel saved to your private library.');
      } else if (file) {
        await uploadVideoFile({ title: title.trim(), file });
        setSuccessMessage('Video uploaded and compressed successfully.');
      }

      resetForm();
      setTimeout(() => navigate('/my-videos'), 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save this video right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-padding pt-32 sm:pt-36">
      <div className="container-max max-w-5xl">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-8 shadow-[0_28px_80px_rgba(68,102,136,0.15)] backdrop-blur-sm sm:p-10">
          <p className="eyebrow">Private Upload Portal</p>
          <h1 className="mt-4 text-5xl leading-none text-[var(--text)] sm:text-6xl">
            Upload a new video.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--text-muted)]">
            Choose whether you want to save a YouTube link or upload a local file.{' '}
            {isAdmin
              ? 'Admin uploads skip the local duration cap and are still compressed on the server before they enter your library.'
              : 'Local uploads are checked for length and then compressed on the server before they enter your library.'}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { value: 'youtube', label: 'YouTube Link' },
              { value: 'file', label: 'Upload File' },
            ].map((option) => (
              <button
                key={option.value}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] transition ${
                  mode === option.value
                    ? 'border-[var(--text)] bg-[var(--text)] text-white'
                    : 'border-[var(--line)] text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
                onClick={() => {
                  setMode(option.value as UploadMode);
                  setError(null);
                  setSuccessMessage(null);
                }}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Title
              </span>
              <input
                className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--accent-strong)]"
                onChange={(event) => setTitle(event.target.value)}
                placeholder={mode === 'youtube' ? 'Prix 2024 studio reel' : 'Master class rehearsal cut'}
                required
                value={title}
              />
            </label>

            <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="text-sm leading-6 text-[var(--text-muted)]">{helperCopy}</p>

              {mode === 'youtube' ? (
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    YouTube URL
                  </span>
                  <input
                    className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--accent-strong)]"
                    onChange={(event) => setYoutubeUrl(event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    type="url"
                    value={youtubeUrl}
                  />
                </label>
              ) : (
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Video file
                    </span>
                    <input
                      accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
                      className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm text-[var(--text)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--text)] file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.18em] file:text-white"
                      onChange={handleFileChange}
                      type="file"
                    />
                  </label>
                  <div className="grid gap-3 rounded-[1.25rem] border border-dashed border-[var(--line)] bg-white/70 p-4 text-sm text-[var(--text-muted)] sm:grid-cols-3">
                    <div>
                      <p className="eyebrow text-[10px]">Formats</p>
                      <p className="mt-2">MP4, MOV, AVI</p>
                    </div>
                    <div>
                      <p className="eyebrow text-[10px]">Max length</p>
                      <p className="mt-2">{isAdmin ? 'No maximum length for admin uploads' : '5 minutes'}</p>
                    </div>
                    <div>
                      <p className="eyebrow text-[10px]">Compression target</p>
                      <p className="mt-2">Under 20MB</p>
                    </div>
                  </div>
                  {file && (
                    <p className="text-sm text-[var(--text)]">
                      {file.name}
                      {fileDurationSeconds ? ` · ${formatSeconds(fileDurationSeconds)}` : ''}
                    </p>
                  )}
                </div>
              )}
            </div>

            {error && (
              <p className="rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                {error}
              </p>
            )}

            {successMessage && (
              <p className="rounded-2xl border border-[rgba(64,167,106,0.24)] bg-[rgba(64,167,106,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                {successMessage}
              </p>
            )}

            {isSubmitting && (
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/78 p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Video upload and compression in progress...
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(58,44,36,0.08)]">
                  <div className="h-full w-1/3 animate-[pulse_1.4s_ease-in-out_infinite] rounded-full bg-[var(--accent-strong)]" />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full bg-[var(--text)] px-5 py-3 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {mode === 'youtube' ? 'Save video link' : 'Upload and compress'}
              </button>
              <button
                className="rounded-full border border-[var(--line)] px-5 py-3 text-sm uppercase tracking-[0.22em] text-[var(--text-muted)] transition hover:text-[var(--text)]"
                onClick={() => navigate('/my-videos')}
                type="button"
              >
                View my videos
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
