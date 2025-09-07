'use client';
import { useCallback, useEffect, useMemo } from 'react';
import { FacebookAuthLoginResponse, FacebookContext } from './facebook-context';
import { facebookAppId, isFacebookAuthEnabled } from './facebook-config';

type FacebookAuthProviderProps = {
  children: React.ReactNode;
};

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (callback: (response: FacebookAuthLoginResponse) => void) => void;
    };
  }
}

function FacebookProvider({ children }: FacebookAuthProviderProps) {
  useEffect(() => {
    window.fbAsyncInit = function () {
      if (facebookAppId) {
        window.FB.init({
          appId: facebookAppId,
          cookie: true,
          xfbml: true,
          version: 'v11.0',
        });
      } else {
        throw Error('Facebook App ID not found');
      }
    };
    const scriptTag = document.createElement('script');
    scriptTag.src = `https://connect.facebook.net/en_US/sdk.js`;
    scriptTag.async = true;
    scriptTag.defer = true;
    scriptTag.crossOrigin = 'anonymous';
    document.body.appendChild(scriptTag);
    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  const login = useCallback(() => {
    return new Promise<FacebookAuthLoginResponse>((resolve, reject) => {
      window.FB.login((response) => {
        if (response.authResponse) {
          resolve(response);
        } else {
          reject(response);
        }
      });
    });
  }, []);

  const valueContext = useMemo(() => ({ login }), [login]);

  return (
    <FacebookContext.Provider value={valueContext}>
      {children}
    </FacebookContext.Provider>
  );
}

export default function FacebookAuthProvider({
  children,
}: FacebookAuthProviderProps) {
  return isFacebookAuthEnabled ? (
    <FacebookProvider>{children}</FacebookProvider>
  ) : (
    children
  );
}
