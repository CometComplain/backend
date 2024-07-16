// export const frontendIp = "192.168.1.4";
// export const frontendIp = "localhost";
// export const frontendPort = "8080";

export const frontendDomain = process.env.FRONTEND_DOMAIN;

export const frontendUrls = {
  home: `http://${frontendDomain}/`,
  loginError: `http://${frontendDomain}/error`,
};

export const serverDomain = "sodi.ddnsgeek.com";

// export const frontendUrls = {
//   home: `/`,
//   loginError: `/error`,
// };
export const pageSize = 10;

export const serverIp = "0.0.0.0";
