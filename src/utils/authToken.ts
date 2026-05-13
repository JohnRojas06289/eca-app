export interface AccessTokenPayload {
  sub: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    if (typeof atob === 'function') {
      return atob(padded);
    }

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let index = 0;

    while (index < padded.length) {
      const enc1 = alphabet.indexOf(padded[index++]);
      const enc2 = alphabet.indexOf(padded[index++]);
      const enc3 = alphabet.indexOf(padded[index++]);
      const enc4 = alphabet.indexOf(padded[index++]);

      const chr1 = (enc1 << 2) | (enc2 >> 4);
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const chr3 = ((enc3 & 3) << 6) | enc4;

      output += String.fromCharCode(chr1);
      if (enc3 !== 64) output += String.fromCharCode(chr2);
      if (enc4 !== 64) output += String.fromCharCode(chr3);
    }

    try {
      return decodeURIComponent(escape(output));
    } catch {
      return output;
    }
  } catch {
    return null;
  }
}

export function parseAccessToken(token: string | undefined | null): AccessTokenPayload | null {
  if (!token) return null;

  const [payload] = token.split('.');
  if (!payload) return null;

  const decoded = decodeBase64Url(payload);
  if (!decoded) return null;

  try {
    return JSON.parse(decoded) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string | undefined | null): boolean {
  const payload = parseAccessToken(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp;
}
