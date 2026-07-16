const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export interface ArtistProfileRecord {
  coverIdentity: string;
  coverIdentityZh: string;
  coverStatement: string;
  coverStatementZh: string;
  aboutParagraph1: string;
  aboutParagraph1Zh: string;
  aboutParagraph2: string;
  aboutParagraph2Zh: string;
  aboutParagraph3: string;
  aboutParagraph3Zh: string;
}

interface ArtistProfileResponse {
  profile?: Partial<ArtistProfileRecord>;
}

export async function fetchArtistProfile(): Promise<ArtistProfileRecord | null> {
  const response = await fetch(`${apiBaseUrl}/api/artist-profile`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to load artist profile.');
  }

  const data = (await response.json()) as ArtistProfileResponse;
  const profile = data.profile;

  if (
    !profile ||
    typeof profile.coverIdentity !== 'string' ||
    typeof profile.coverIdentityZh !== 'string' ||
    typeof profile.coverStatement !== 'string' ||
    typeof profile.coverStatementZh !== 'string' ||
    typeof profile.aboutParagraph1 !== 'string' ||
    typeof profile.aboutParagraph1Zh !== 'string' ||
    typeof profile.aboutParagraph2 !== 'string' ||
    typeof profile.aboutParagraph2Zh !== 'string' ||
    typeof profile.aboutParagraph3 !== 'string' ||
    typeof profile.aboutParagraph3Zh !== 'string'
  ) {
    return null;
  }

  return {
    coverIdentity: profile.coverIdentity,
    coverIdentityZh: profile.coverIdentityZh,
    coverStatement: profile.coverStatement,
    coverStatementZh: profile.coverStatementZh,
    aboutParagraph1: profile.aboutParagraph1,
    aboutParagraph1Zh: profile.aboutParagraph1Zh,
    aboutParagraph2: profile.aboutParagraph2,
    aboutParagraph2Zh: profile.aboutParagraph2Zh,
    aboutParagraph3: profile.aboutParagraph3,
    aboutParagraph3Zh: profile.aboutParagraph3Zh,
  };
}
