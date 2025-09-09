import ms from 'ms';

export type AuthConfig = {
  secret?: string;
  expires?: ms.StringValue;
  serviceExpires?: ms.StringValue;
  refreshSecret?: string;
  refreshExpires?: ms.StringValue;
  serviceRefreshExpires?: ms.StringValue;
  forgotSecret?: string;
  forgotExpires?: ms.StringValue;
  confirmEmailSecret?: string;
  confirmEmailExpires?: ms.StringValue;
};
