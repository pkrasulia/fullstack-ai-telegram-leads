import { FetchInitType, FetchInputType } from './types/fetch-params';
import useFetchBase from './use-fetch-base';
import useAuthTokens from '../auth/use-auth-tokens';

export const fetchWithAuth = async (
  input: FetchInputType,
  init?: FetchInitType,
) => {
  const checkInfo = useAuthTokens();
  console.log(checkInfo);
  // console.log(tokensInfoRef);
  // const fetchBase = useFetchBase();

  // return fetchBase(input, init, {
  //   token: tokensInfoRef.current?.token,
  //   refreshToken: tokensInfoRef.current?.refreshToken,
  //   tokenExpires: tokensInfoRef.current?.tokenExpires,
  //   setTokensInfo,
  // });
};
