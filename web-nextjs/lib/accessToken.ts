let accessToken = '';
let isAuthenticated = true;

export const setAccessToken = (s: string) => {
  accessToken = s;
};

export const getAccessToken = () => {
  return accessToken;
};

export const setIsAuthenticated = (a: boolean) => {
  isAuthenticated = a;
};

export const getIsAuthenticated = () => {
  return isAuthenticated;
};
