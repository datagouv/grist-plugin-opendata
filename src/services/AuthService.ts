import OauthAPI from '@/services/OauthAPI';

const BASE_URL  = process.env.VUE_APP_DATAGOUV_PUBLISH_URL  ?? 'https://www.data.gouv.fr';
const CLIENT_ID = process.env.VUE_APP_DATAGOUV_CLIENT_ID ?? '';

const api = new OauthAPI();

export default class AuthService {
  clientId    = CLIENT_ID;
  baseURL     = BASE_URL;
  redirectURI = `${window.location.origin}/oauth-callback.html`;

  async getRedirectURL (): Promise<string> {
    const verifier  = this.randomString();
    const challenge = await this.pkceChallenge(verifier);
    const state     = this.randomString();

    localStorage.setItem('pkceCodeVerifier', verifier);
    localStorage.setItem('pkceState',        state);

    const p = new URLSearchParams({
      redirect_uri:            this.redirectURI,
      response_type:           'code',
      state,
      client_id:               this.clientId,
      scope:                   'default',
      code_challenge:          challenge,
      code_challenge_method:   'S256'
    });

    return `${this.baseURL}/oauth/authorize?${p.toString()}`;
  }

  async retrieveToken (code: string, state: string): Promise<string> {
    if (state !== localStorage.getItem('pkceState'))
      throw new Error('state mismatch');

    const verifier = localStorage.getItem('pkceCodeVerifier')!;
    return api.token({
      code,
      pkceCodeVerifier: verifier,
      clientId:   this.clientId,
      redirectURI: this.redirectURI
    });
  }

  logout (token: string) {
    return api.logout(token, this.clientId);
  }

  cleanup () {
    localStorage.removeItem('pkceCodeVerifier');
    localStorage.removeItem('pkceState');
  }

  private randomString (len = 32): string {
    const a = crypto.getRandomValues(new Uint8Array(len));
    return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
  }
  private async sha256 (v: string) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(v));
  }
  private base64url (buf: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  private async pkceChallenge (v: string) {
    const hash = await this.sha256(v);
    return this.base64url(hash);
  }
}
