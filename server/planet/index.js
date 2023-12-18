const axios = require('axios');

const getPlanetToken = async () => {
  const url = 'https://mfapi-06.ticka.it/api/Account/GetToken';
  const data = {
    userName: process.env.PLANET_AUTH_USERNAME,
    password: process.env.PLANET_AUTH_PASSWORD
  };
  const config = {
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios.post(url, data, config);
    console.log('Token:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getting token:', error);
    return null;
  }
};

module.exports = { getPlanetToken };