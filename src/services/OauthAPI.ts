import type { AxiosResponse } from 'axios';
import axios from 'axios';

const BASE_URL = process.env.VUE_APP_DATAGOUV_PUBLISH_URL ?? 'https://www.data.gouv.fr';

interface TokenParams {
  code: string;
  pkceCodeVerifier: string;
  clientId: string;
  redirectURI: string;
}

export default class OauthAPI {
  async token (p: TokenParams): Promise<string> {
    const url = `${BASE_URL}/oauth/token`;

    const form = new FormData();
    form.append('grant_type',    'authorization_code');
    form.append('code',          p.code);
    form.append('redirect_uri',  p.redirectURI);
    form.append('client_id',     p.clientId);
    form.append('code_verifier', p.pkceCodeVerifier);

    const { data } = await axios.post(url, form);
    return data.access_token;
  }

  async logout (token: string, clientId: string): Promise<AxiosResponse> {
    const url = `${BASE_URL}/oauth/revoke`;

    const form = new FormData();
    form.append('token',      token);
    form.append('client_id',  clientId);

    return axios.post(url, form);
  }
}
