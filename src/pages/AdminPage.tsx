import { useEffect, useMemo, useState } from 'react';
import {
  createAdminYoutubeVideo,
  deleteAdminUser,
  deleteAdminVideo,
  fetchAdminUsers,
  fetchAdminVideos,
  type AdminUserRecord,
  type AdminVideoRecord,
  updateAdminUserMemberType,
  uploadAdminVideoFile,
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

type AdminUploadMode = 'youtube' | 'upload';

interface DancerUploadDraft {
  mode: AdminUploadMode;
  title: string;
  youtubeUrl: string;
  file: File | null;
  isSubmitting: boolean;
  error: string | null;
  resetKey: number;
}

function createDefaultDraft(): DancerUploadDraft {
  return {
    mode: 'youtube',
    title: '',
    youtubeUrl: '',
    file: null,
    isSubmitting: false,
    error: null,
    resetKey: 0,
  };
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [videos, setVideos] = useState<AdminVideoRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDeleteKey, setActiveDeleteKey] = useState<string | null>(null);
  const [activeMemberTypeUserId, setActiveMemberTypeUserId] = useState<number | null>(null);
  const [uploadDrafts, setUploadDrafts] = useState<Record<number, DancerUploadDraft>>({});

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

  const loadDashboard = async ({ keepLoadingState = false }: { keepLoadingState?: boolean } = {}) => {
    if (keepLoadingState) {
      setIsLoading(true);
    }

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
      if (keepLoadingState) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadDashboard({ keepLoadingState: true });
  }, []);

  const getDraft = (userId: number) => uploadDrafts[userId] ?? createDefaultDraft();

  const updateDraft = (userId: number, patch: Partial<DancerUploadDraft>) => {
    setUploadDrafts((current) => ({
      ...current,
      [userId]: {
        ...(current[userId] ?? createDefaultDraft()),
        ...patch,
      },
    }));
  };

  const resetDraft = (userId: number, mode?: AdminUploadMode) => {
    const nextDraft = createDefaultDraft();
    if (mode) {
      nextDraft.mode = mode;
    }
    setUploadDrafts((current) => ({
      ...current,
      [userId]: nextDraft,
    }));
  };

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

  const handleMemberTypeChange = async (
    user: AdminUserRecord,
    memberType: 'dancer' | 'investor'
  ) => {
    if (user.memberType === memberType) {
      return;
    }

    setActiveMemberTypeUserId(user.id);
    setError(null);

    try {
      const response = await updateAdminUserMemberType(user.id, { memberType });
      setUsers((current) =>
        current.map((entry) =>
          entry.id === user.id ? { ...entry, memberType: response.user.memberType } : entry
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update member type.');
    } finally {
      setActiveMemberTypeUserId(null);
    }
  };

  const handleSubmitAssignedYoutube = async (user: AdminUserRecord) => {
    const draft = getDraft(user.id);
    updateDraft(user.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      await createAdminYoutubeVideo(user.id, {
        title: draft.title.trim(),
        youtubeUrl: draft.youtubeUrl.trim(),
      });

      await loadDashboard();
      resetDraft(user.id, 'youtube');
    } catch (err) {
      updateDraft(user.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to save this YouTube link.',
      });
      return;
    }

    updateDraft(user.id, { isSubmitting: false });
  };

  const handleSubmitAssignedUpload = async (user: AdminUserRecord) => {
    const draft = getDraft(user.id);
    updateDraft(user.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      if (!draft.file) {
        throw new Error('Please choose a video file to upload.');
      }

      await uploadAdminVideoFile(user.id, {
        title: draft.title.trim(),
        file: draft.file,
      });

      await loadDashboard();
      setUploadDrafts((current) => ({
        ...current,
        [user.id]: {
          ...createDefaultDraft(),
          mode: 'upload',
          resetKey: (current[user.id]?.resetKey ?? 0) + 1,
        },
      }));
    } catch (err) {
      updateDraft(user.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to upload this video.',
      });
      return;
    }

    updateDraft(user.id, { isSubmitting: false });
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
                      const isUpdatingMemberType = activeMemberTypeUserId === user.id;
                      const draft = getDraft(user.id);
                      const isAssigningYoutube = draft.mode === 'youtube';

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
                            <span>Member type: {user.memberType}</span>
                            <span>Uploads: {user.uploadCount}</span>
                            <span>Joined: {formatDate(user.createdAt)}</span>
                          </div>

                          <label className="mt-5 block">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                              Member type
                            </span>
                            <select
                              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isUpdatingMemberType}
                              onChange={(event) =>
                                void handleMemberTypeChange(
                                  user,
                                  event.target.value as 'dancer' | 'investor'
                                )
                              }
                              value={user.memberType}
                            >
                              <option value="dancer">Dancer</option>
                              <option value="investor">Investor</option>
                            </select>
                          </label>

                          <div className="mt-6 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                            <div className="flex flex-wrap items-end justify-between gap-4">
                              <div>
                                <p className="eyebrow text-[10px]">Admin upload</p>
                                <h4 className="mt-3 text-2xl text-[var(--text)]">
                                  Assign private archive media
                                </h4>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                                  Upload a YouTube link or compressed video directly into this dancer&apos;s private archive. The dancer will see it the next time they sign in.
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(['youtube', 'upload'] as const).map((mode) => {
                                  const isActive = draft.mode === mode;
                                  return (
                                    <button
                                      key={mode}
                                      className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
                                        isActive
                                          ? 'border-[var(--text)] bg-[var(--text)] text-white'
                                          : 'border-[var(--line)] text-[var(--text)] hover:border-[var(--text)]'
                                      }`}
                                      onClick={() =>
                                        updateDraft(user.id, {
                                          mode,
                                          error: null,
                                        })
                                      }
                                      type="button"
                                    >
                                      {mode === 'youtube' ? 'YouTube link' : 'Upload file'}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                              <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                <span className="eyebrow text-[10px]">Video title</span>
                                <input
                                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                  onChange={(event) =>
                                    updateDraft(user.id, {
                                      title: event.target.value,
                                    })
                                  }
                                  placeholder="Enter a private archive title"
                                  type="text"
                                  value={draft.title}
                                />
                              </label>

                              {isAssigningYoutube ? (
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                  <span className="eyebrow text-[10px]">YouTube URL</span>
                                  <input
                                    className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                    onChange={(event) =>
                                      updateDraft(user.id, {
                                        youtubeUrl: event.target.value,
                                      })
                                    }
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    type="url"
                                    value={draft.youtubeUrl}
                                  />
                                </label>
                              ) : (
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                  <span className="eyebrow text-[10px]">Video file</span>
                                  <input
                                    key={draft.resetKey}
                                    accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo,video/avi"
                                    className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--text)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--text)] file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.18em] file:text-white"
                                    onChange={(event) =>
                                      updateDraft(user.id, {
                                        file: event.target.files?.[0] ?? null,
                                      })
                                    }
                                    type="file"
                                  />
                                </label>
                              )}

                              <div className="flex items-end">
                                <button
                                  className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={draft.isSubmitting}
                                  onClick={() =>
                                    void (
                                      isAssigningYoutube
                                        ? handleSubmitAssignedYoutube(user)
                                        : handleSubmitAssignedUpload(user)
                                    )
                                  }
                                  type="button"
                                >
                                  {draft.isSubmitting
                                    ? isAssigningYoutube
                                      ? 'Saving...'
                                      : 'Uploading...'
                                    : isAssigningYoutube
                                      ? 'Save link'
                                      : 'Upload video'}
                                </button>
                              </div>
                            </div>

                            {draft.error ? (
                              <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                                {draft.error}
                              </p>
                            ) : null}
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
