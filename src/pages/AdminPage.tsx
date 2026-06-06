import { useEffect, useMemo, useState } from 'react';
import {
  deleteAdminUser,
  deleteAdminVideo,
  fetchAdminUsers,
  fetchAdminVideos,
  type AdminUserRecord,
  type AdminVideoRecord,
} from '../services/admin';

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

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [videos, setVideos] = useState<AdminVideoRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDeleteKey, setActiveDeleteKey] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      userCount: users.length,
      videoCount: videos.length,
      adminCount: users.filter((user) => user.role === 'admin').length,
    }),
    [users, videos]
  );

  const adminUsers = useMemo(
    () => users.filter((user) => user.role === 'admin'),
    [users]
  );

  const dancerUsers = useMemo(
    () => users.filter((user) => user.role !== 'admin'),
    [users]
  );

  const videosByUser = useMemo(() => {
    const grouped = new Map<number, AdminVideoRecord[]>();

    videos.forEach((video) => {
      const current = grouped.get(video.uploader.id) ?? [];
      current.push(video);
      grouped.set(video.uploader.id, current);
    });

    grouped.forEach((entries) => {
      entries.sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    });

    return grouped;
  }, [videos]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [usersResponse, videosResponse] = await Promise.all([
          fetchAdminUsers(),
          fetchAdminVideos(),
        ]);

        setUsers(usersResponse.users);
        setVideos(videosResponse.videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load admin dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const handleDeleteVideo = async (video: AdminVideoRecord) => {
    if (
      !window.confirm(
        `Delete "${video.title}" from ${video.uploader.email}? This removes the saved record and uploaded file.`
      )
    ) {
      return;
    }

    setActiveDeleteKey(`video-${video.id}`);
    setError(null);

    try {
      await deleteAdminVideo(video.id);
      setVideos((current) => current.filter((entry) => entry.id !== video.id));
      setUsers((current) =>
        current.map((user) =>
          user.id === video.uploader.id
            ? { ...user, uploadCount: Math.max(0, user.uploadCount - 1) }
            : user
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete video.');
    } finally {
      setActiveDeleteKey(null);
    }
  };

  const handleDeleteUser = async (user: AdminUserRecord) => {
    if (
      !window.confirm(
        `Delete ${user.email}? This will also delete ${user.uploadCount} uploaded video${user.uploadCount === 1 ? '' : 's'}.`
      )
    ) {
      return;
    }

    setActiveDeleteKey(`user-${user.id}`);
    setError(null);

    try {
      await deleteAdminUser(user.id);
      setUsers((current) => current.filter((entry) => entry.id !== user.id));
      setVideos((current) => current.filter((entry) => entry.uploader.id !== user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete user.');
    } finally {
      setActiveDeleteKey(null);
    }
  };

  const renderVideoCard = (video: AdminVideoRecord, compact = false) => {
    const isDeleting = activeDeleteKey === `video-${video.id}`;

    return (
      <article
        key={video.id}
        className="rounded-[1.35rem] border border-[var(--line)] bg-[rgba(255,255,255,0.78)] p-5 shadow-[0_16px_40px_rgba(68,102,136,0.08)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-[10px]">
              {video.sourceType === 'youtube' ? 'YouTube Link' : 'Uploaded File'} ·{' '}
              {formatDate(video.createdAt)}
            </p>
            <h3 className="mt-3 text-3xl text-[var(--text)]">{video.title}</h3>
            {!compact ? (
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Uploaded by{' '}
                <span className="font-medium text-[var(--text)]">{video.uploader.email}</span>
              </p>
            ) : null}
          </div>
          <button
            className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[rgba(255,107,107,0.48)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDeleting}
            onClick={() => void handleDeleteVideo(video)}
            type="button"
          >
            {isDeleting ? 'Deleting...' : 'Delete video'}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
          <span>Status: {video.status}</span>
          <span>Duration: {formatDuration(video.durationSeconds)}</span>
          <span>Size: {formatBytes(video.fileSizeBytes)}</span>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-black/5">
          {video.sourceType === 'youtube' && video.sourceUrl ? (
            <div className="p-5">
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                External reel link saved to the private archive.
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
            <video
              className="block aspect-video w-full bg-black object-contain"
              controls
              preload="metadata"
              src={video.filePath}
            />
          ) : (
            <div className="p-5 text-sm text-[var(--text-muted)]">Processing asset...</div>
          )}
        </div>

        {video.originalFilename ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Original file: {video.originalFilename}
          </p>
        ) : null}
      </article>
    );
  };

  return (
    <section className="section-padding pt-32 sm:pt-36">
      <div className="container-max max-w-7xl">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-8 shadow-[0_28px_80px_rgba(68,102,136,0.15)] backdrop-blur-sm sm:p-10">
          <p className="eyebrow">Admin Console</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl leading-none text-[var(--text)] sm:text-6xl">
                User and video oversight
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-muted)]">
                Review every registered creator, track their uploads, and remove accounts or videos when needed. Deleting a user cascades through every saved clip they uploaded.
              </p>
            </div>
            <div className="grid min-w-[16rem] gap-3 sm:grid-cols-3 lg:min-w-[25rem]">
              {[
                { label: 'Users', value: stats.userCount },
                { label: 'Videos', value: stats.videoCount },
                { label: 'Admins', value: stats.adminCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4 text-center shadow-[0_18px_40px_rgba(68,102,136,0.08)]"
                >
                  <p className="eyebrow text-[10px]">{stat.label}</p>
                  <p className="mt-3 text-3xl text-[var(--text)]">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="mt-8 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
              {error}
            </p>
          )}

          {isLoading ? (
            <div className="mt-10 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-14 text-center">
              <p className="eyebrow">Loading admin data</p>
              <h2 className="mt-4 text-3xl text-[var(--text)]">Preparing admin dashboard</h2>
            </div>
          ) : (
            <div className="mt-10 space-y-10">
              <section aria-labelledby="admin-users-heading">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">Admin</p>
                    <h2
                      id="admin-users-heading"
                      className="mt-3 text-4xl text-[var(--text)]"
                    >
                      Administrator
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {adminUsers.length} account{adminUsers.length === 1 ? '' : 's'}
                  </p>
                </div>

                {adminUsers.length === 0 ? (
                  <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center">
                    <p className="text-sm text-[var(--text-muted)]">No administrator accounts yet.</p>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    {adminUsers.map((user) => {
                      const isDeleting = activeDeleteKey === `user-${user.id}`;
                      return (
                        <article
                          key={user.id}
                          className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)]"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="eyebrow text-[10px]">
                                {user.role === 'admin' ? 'Administrator' : 'Registered user'}
                              </p>
                              <h3 className="mt-3 text-3xl text-[var(--text)]">{user.email}</h3>
                            </div>
                            <button
                              className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[rgba(255,107,107,0.48)] disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isDeleting}
                              onClick={() => void handleDeleteUser(user)}
                              type="button"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete user'}
                            </button>
                          </div>
                          <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            <span>Role: {user.role}</span>
                            <span>Uploads: {user.uploadCount}</span>
                            <span>Joined: {formatDate(user.createdAt)}</span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section aria-labelledby="admin-dancers-heading">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">Dancer</p>
                    <h2
                      id="admin-dancers-heading"
                      className="mt-3 text-4xl text-[var(--text)]"
                    >
                      Registered dancers
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {dancerUsers.length} account{dancerUsers.length === 1 ? '' : 's'}
                  </p>
                </div>

                {dancerUsers.length === 0 ? (
                  <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center">
                    <p className="text-sm text-[var(--text-muted)]">No registered dancers yet.</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {dancerUsers.map((user) => {
                      const userVideos = videosByUser.get(user.id) ?? [];
                      const isDeleting = activeDeleteKey === `user-${user.id}`;

                      return (
                        <article
                          key={user.id}
                          className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-6"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="eyebrow text-[10px]">
                                Registered user
                              </p>
                              <h3 className="mt-3 text-3xl text-[var(--text)]">{user.email}</h3>
                            </div>
                            <button
                              className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[rgba(255,107,107,0.48)] disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isDeleting}
                              onClick={() => void handleDeleteUser(user)}
                              type="button"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete user'}
                            </button>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            <span>Role: {user.role}</span>
                            <span>Uploads: {user.uploadCount}</span>
                            <span>Joined: {formatDate(user.createdAt)}</span>
                          </div>

                          <div className="mt-6 border-t border-[var(--line)] pt-6">
                            <div className="flex items-end justify-between gap-4">
                              <div>
                                <p className="eyebrow text-[10px]">Uploaded videos</p>
                                <h4 className="mt-3 text-2xl text-[var(--text)]">Private archive</h4>
                              </div>
                              <p className="text-sm text-[var(--text-muted)]">
                                {userVideos.length} item{userVideos.length === 1 ? '' : 's'}
                              </p>
                            </div>
                          </div>

                          {userVideos.length === 0 ? (
                            <div className="mt-5 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-6 text-sm text-[var(--text-muted)]">
                              No uploaded videos for this dancer yet.
                            </div>
                          ) : (
                            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                              {userVideos.map((video) => renderVideoCard(video, true))}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
