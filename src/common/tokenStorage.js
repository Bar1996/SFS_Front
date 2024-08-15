export const getToken = () => {
    try {
      return localStorage.getItem('accessToken');
    } catch (error) {
      console.error('Error fetching access token', error);
    }
  };
  
  export const getRefreshToken = () => {
    try {
      return localStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Error fetching refresh token', error);
    }
  };
  
  export const setToken = (accessToken, refreshToken) => {
    try {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
      console.error('Error setting tokens', error);
    }
  };
  
  export const removeToken = () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Error removing tokens', error);
    }
  };
  