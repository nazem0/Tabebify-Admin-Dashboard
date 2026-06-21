export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

// access_token removed — the token lives in OAuthStorage (localStorage),
// not in the view layer. Components only need to know success/failure.
export interface LoginResult {
  success: boolean;
  error?: string;
}
