const axios = require('axios');
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

const baseURL = 'https://mfapi-06.ticka.it/api'
const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    accept: '*/*',
    'Content-Type': 'application/json',
  },
})

const getPlanetToken = async () => {
  const params = {
    userName: process.env.PLANET_AUTH_USERNAME,
    password: process.env.PLANET_AUTH_PASSWORD
  };

  try {
    const response = await axiosClient.post('/Account/GetToken', params);

    if (!!response.data?.token) {
      localStorage.setItem('plannet_access_token', JSON.stringify(response.data));
      return {
        success: true,
        data: response.data
      };
    } else {
      return {
        success: false,
        error: response.data
      };
    }
  } catch (error) {
    console.error('Error in getting token:', error);
    return {
      success: false,
      error: error
    };
  }
};

const getPlanetEvents = async (token) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/Evento/Eventi', {
      params: {
        periodoInizio: '2023-08-01T00:00:00',
        periodoFine: '2024-06-01T00:00:00',
        tipoMappa: 0
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error
    };
  }
};

// params: similar to: https://mfapi-06.ticka.it/swagger/index.html => /api/Utenza/AddPersona
const createUser = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()
  const results = [];

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;
  
  for (const param of params) {
    try {
      const response = await axiosClient.post('/Utenza/AddPersona', param);
      results.push({
        success: true,
        data: response.data,
        param
      });
    } catch (error) {
      results.push({
        success: false,
        error: error,
        param
      });
    }
  }

  return results;
}


module.exports = { getPlanetToken, getPlanetEvents, createUser };
