const axios = require('axios');
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

const baseURL = 'https://mfapi-06.ticka.it'
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
    const response = await axiosClient.post('/api/Account/GetToken', params);

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
    const response = await axiosClient.get('/api/Evento/Eventi', {
      params: {
        periodoInizio: '2024-01-01T00:00:00',
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

const getPlaNetSeasonTickets = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Abbonamento/TipiAbbonamento', {
      params: {
        organizzatoreId: parseInt(params.organizzatoreId)
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

const getPlaNetSeasonTribunas = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Abbonamento/Ordiniposto', {
      params: {
        tipoAbbonamentoId: parseInt(params.tipoAbbonamentoId)
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

const getPlaNetSubscription = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Abbonamento/Codiciriduzione', {
      params: {
        tipoAbbonamentoId: parseInt(params.tipoAbbonamentoId),
        codiceOrdinePosto: params.codiceOrdinePosto,
        visibilita: 2
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
}

const getPlanetSubscriptionAvailableSeat = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Mappa/PostiLiberiAbbonamento', {
      params: {
        tipoAbbonamentoId: parseInt(params.tipoAbbonamentoId),
        bloccoId: parseInt(params.bloccoId)
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
}

const getPostiLiberiBiglietto = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Mappa/PostiLiberiBiglietto', {
      params: {
        eventoId: parseInt(params.eventoId),
        bloccoId: parseInt(params.bloccoId)
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

// Get Seat Info for Seats that are free to issue a Ticket
const getMappaPostoInfo = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Mappa/PostoInfo', {
      params: {
        eventoId: parseInt(params.eventoId),
        postoId: parseInt(params.postoId)
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

// Get Seat Info for section with status and label
const getMappaPostiInfo = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Mappa/PostiInfo', {
      params: {
        eventoId: parseInt(params.eventoId),
        bloccoId: parseInt(params.bloccoId)
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

// Block Seat
const getMappaBloccaPosto = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Mappa/BloccaPosto', {
      params: {
        eventoId: parseInt(params.eventoId),
        postoId: parseInt(params.postoId),
        minuti: parseInt(params.minuti)
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

// Block Seat
const getMappaSbloccaPosto = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Mappa/SbloccaPosto', {
      params: {
        eventoId: parseInt(params.eventoId),
        postoId: parseInt(params.postoId)
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

const getPlanetNazioni = async (token) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/nazioni');

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

getPlanetProvince = async (token) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/province');

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

getPlanetComuni = async (token) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/comuni');

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

getPlanetsocietaSportiva = async (token) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/societaSportiva');

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
    // selete param.supporter_card
    try {
      const response = await axiosClient.post('/api/Utenza/AddPersona', param);
      results.push({
        success: true,
        dataPlanet: response.data,
        data: {
          ...param,
          persona_id: response.data.id
        }
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

const checkVroTicketIssueEligible = async (params) => {
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
      const response = await axiosClient.get('/api/Autorizzazione/VerificaPersona', {
        params: {
          personaId: parseInt(param.persona_id),
          puntovenditaId: 10,
          isAbbonamento: false
        }
      });
      results.push({
        success: true,
        dataPlanet: response.data,
        data: {
          ...param,
          is_eligible: response.data.risultato
        }
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

// Check Supporter Card
getTesseraTifoso = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/TesseraTifoso/Get', {
      params: {
        codiceFiscaleSocieta: params.codiceFiscaleSocieta,
        codiceTesseraTifoso: params.codiceTesseraTifoso
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

const issueTickets = async (params) => {
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
      const response = await axiosClient.post('/api/Biglietto/EmettiEsteso', param);
      results.push({
        success: true,
        dataPlanet: response.data,
        data: {
          ...param,
          ticket_issue_response: response.data
        }
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

getPlaNetTitoloStato = async (params) => {
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
      const response = await axiosClient.get('/api/Titolo/Stato', {
        params: {
          id: parseInt(param.ticket_issue_response.id),
          eventoId: parseInt(param.modelloBiglietto.eventoId),
        }
      });
      results.push({
        success: true,
        dataPlanet: response.data,
        data: {
          ...param,
          titolo_stato: response.data
        }
      });
    } catch (error) {
      console.log(error)
      results.push({
        success: false,
        error: error,
        param
      });
    }
  }

  return results;
}

getPlaNetTitoloInfo = async (params) => {
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
      const response = await axiosClient.get('/api/Titolo/Info', {
        params: {
          id: parseInt(param.ticket_issue_response.id)
        }
      });
      results.push({
        success: true,
        dataPlanet: response.data,
        data: {
          ...param,
          titolo_info: response.data
        }
      });
    } catch (error) {
      console.log(error)
      results.push({
        success: false,
        error: error,
        param
      });
    }
  }

  return results;
}

module.exports = { getPlanetToken, getPlanetEvents, getPostiLiberiBiglietto, 
                   getMappaPostoInfo, getMappaPostiInfo, getMappaBloccaPosto, 
                   getMappaSbloccaPosto, getPlanetNazioni, getPlanetProvince, 
                   getPlanetComuni, getPlanetsocietaSportiva,
                   getPlaNetSeasonTickets, getPlaNetSeasonTribunas,
                   createUser, checkVroTicketIssueEligible, issueTickets,
                   getPlaNetTitoloStato, getPlaNetTitoloInfo,
                   getTesseraTifoso, getPlaNetSubscription, getPlanetSubscriptionAvailableSeat
};
