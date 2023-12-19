const axios = require('axios');
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

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
    localStorage.setItem('plannet_access_token', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Error in getting token:', error);
    return null;
  }
};

const getPlanetData = async (token) => {
  // Ensure the URL is correctly formatted and encoded

  const plannetAccessToken = JSON.parse(localStorage.getItem('plannet_access_token'))
  console.log("plannetAccessToken", plannetAccessToken)
  const baseUrl = 'https://mfapi-06.ticka.it/api/Evento/Eventi';
  const queryParams = new URLSearchParams({
    // organizzatoreId: '4',
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
      'Authorization': `Bearer ${plannetAccessToken.token}`
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