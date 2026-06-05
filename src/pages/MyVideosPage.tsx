import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchVideos, type VideoRecord } from '../services/videos';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDuration(seconds: number | null) {
  if (!seconds) {
    return 'n/a';
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function formatBytes(bytes: number | null) {
  if (!bytes) {
    return 'n/a';
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MyVideosPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchVideos();
        setVideos(response.videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load your videos.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <section className="section-padding pt-32 sm:pt-36">
      <div className="container-max max-w-6xl">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.56)] p-8 shadow-[0_28px_80px_rgba(68,102,136,0.15)] backdrop-blur-sm sm:p-10">
          <p className="eyebrow">Protected Library</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl leading-none text-[var(--text)] sm:text-6xl">My Videos</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-muted)]">
                Signed in as <span className="font-medium text-[var(--text)]">{user?.email}</span>. This private list includes YouTube links and uploaded clips after server-side compression.
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-[var(--text)] px-5 py-3 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-[var(--text-muted)]"
              to="/upload"
            >
              Upload video
            </Link>
          </div>

          {error && (
            <p className="mt-8 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
              {error}
            </p>
          )}

          {isLoading ? (
            <div className="mt-10 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-14 text-center">
              <p className="eyebrow">Loading library</p>
              <h2 className="mt-4 text-3xl text-[var(--text)]">Preparing your saved videos</h2>
            </div>
          ) : videos.length === 0 ? (
            <div className="mt-10 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-14 text-center">
              <h2 className="text-3xl text-[var(--text)]">No videos yet</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
                Upload a clip or save a YouTube link to start building your private reel archive.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {videos.map((video) => (
                <article
                  key={video.id}
                  className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)]"
                >
                  <p className="eyebrow text-[10px]">
                    {video.sourceType === 'youtube' ? 'YouTube Link' : 'Uploaded File'} · {formatDate(video.createdAt)}
                  </p>
                  <h2 className="mt-3 text-3xl text-[var(--text)]">{video.title}</h2>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    <span>Status: {video.status}</span>
                    {video.durationSeconds ? <span>Duration: {formatDuration(video.durationSeconds)}</span> : null}
                    {video.fileSizeBytes ? <span>Size: {formatBytes(video.fileSizeBytes)}</span> : null}
                  </div>
                  <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-black/5">
                    {video.sourceType === 'youtube' && video.sourceUrl ? (
                      <div className="p-5">
                        <p className="text-sm leading-6 text-[var(--text-muted)]">
                          External reel link saved to your archive.
                        </p>
                        <a
                          className="mt-4 inline-flex rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)]"
                          href={video.sourceUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open YouTube
                        </a>
                      </div>
                    ) : video.filePath ? (
                      <video className="block aspect-video w-full bg-black object-contain" controls preload="metadata" src={video.filePath} />
                    ) : (
                      <div className="p-5 text-sm text-[var(--text-muted)]">Processing asset...</div>
                    )}
                  </div>
                  {video.originalFilename ? (
                    <p className="mt-4 text-sm text-[var(--text-muted)]">Original file: {video.originalFilename}</p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
