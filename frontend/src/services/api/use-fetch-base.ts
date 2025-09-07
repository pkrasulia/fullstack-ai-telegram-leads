'use client';

import { useCallback } from 'react';
import { Tokens } from './types/tokens';
import { TokensInfo } from '../auth/auth-context';
import { AUTH_REFRESH_URL } from './config';
import { FetchInputType, FetchInitType } from './types/fetch-params';

function useFetchBase() {
  const language = 'en';

  return useCallback(
    async (
      input: FetchInputType,
      init?: FetchInitType,
      tokens?: Tokens & {
        setTokensInfo?: (tokensInfo: TokensInfo) => void;
      },
    ) => {
      let headers: HeadersInit = {
        'x-custom-lang': language,
      };

      if (!(init?.body instanceof FormData)) {
        headers = {
          ...headers,
          'Content-Type': 'application/json',
        };
      }

      if (tokens?.token) {
        headers = {
          ...headers,
          Authorization: `Bearer ${tokens.token}`,
        };
      }

      if (tokens?.tokenExpires && tokens.tokenExpires <= Date.now()) {
        console.log(AUTH_REFRESH_URL);
        const newTokens = await fetch(AUTH_REFRESH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.refreshToken}`,
          },
        }).then((res) => res.json());

        if (newTokens.token) {
          tokens?.setTokensInfo?.({
            token: newTokens.token,
            refreshToken: newTokens.refreshToken,
            tokenExpires: newTokens.tokenExpires,
          });

          headers = {
            ...headers,
            Authorization: `Bearer ${newTokens.token}`,
          };
        } else {
          tokens?.setTokensInfo?.(null);

          throw new Error('Refresh token expired');
        }
      }

      return fetch(input, {
        ...init,
        headers: {
          ...headers,
          ...init?.headers,
        },
      });
    },
    [language],
  );
}

export default useFetchBase;
