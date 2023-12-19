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

const getPlanetData = async (token) => {
  const baseUrl = 'https://mfapi-06.ticka.it/api/Evento/Eventi';
  const queryParams = new URLSearchParams({
    organizzatoreId: '4',
    // periodoInizio: '2012-01-01T00:00:00',
    // periodoFine: '2012-12-01T00:00:00',
    // codiceLocale: '0410170250606',
    // tipoMappa: '2'
  });
  const url = `${baseUrl}?${queryParams.toString()}`;
  console.log("url", url)

  const config = {
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  try {
    const response = await axios.get(url, config);

    console.log('Status', response.status);
    console.log('Data', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error in getting planet data:', error);
    return null;
  }
};

module.exports = { getPlanetToken, getPlanetData };