// export const frontendIp = "192.168.1.4";
// export const frontendIp = "localhost";
// export const frontendPort = "8080";
import "dotenv/config";
export const frontendDomain = process.env.FRONTEND_DOMAIN;
export const backendDomain = process.env.BACKEND_DOMAIN;

export const frontendUrls = {
  home: `${frontendDomain}/`,
  loginError: `${frontendDomain}/error`,
};

// export const frontendUrls = {
//   home: `/`,
//   loginError: `/error`,
// };
export const pageSize = 10;

export const serverIp = "0.0.0.0";
