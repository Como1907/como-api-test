const axios = require('axios');
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

// const baseURL = 'https://mfapi-06.ticka.it'
const baseURL = 'https://mfapi-05.ticka.it'
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

const getEventOrganizers = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Utenza/Organizzatori', {
      params: {
        soloAttivi: false
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
        // organizzatoreId: 1,
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

const getPlanetEventDetail = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Evento/Evento', {
      params: {
        eventoId: parseInt(params.eventoId)
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

getPlaNetSeasonEvents = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Abbonamento/EventiPerTipoAbbonamento', {
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

const getPlaNetSubscriptionPrices = async (params) => {
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

const getPlanetCheckSeasonTicketHolder = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;
  console.log(params.personaData);
  const results = [];
  params.personaData.forEach(item => {
    const request = axiosClient.get('/api/Abbonamento/IsUtilizzatore', {
      params: {
        tipoAbbonamentoId: parseInt(params.tipoAbbonamentoId),
        personaId: parseInt(item.persona_id)
      }
    });
    results.push(request);
  })
  console.log(results)
  try {
    const data = [];
    const response = await Promise.all(results);
    console.log(response);
    response.forEach((item, index) => {
      data.push({
        ...params.personaData[index],
        has_issued_ticket: item.data ?? false,
      })
    })
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error.message)
    return {
      success: false,
      error: error
    };
  }
}


const getPlanetEventPricing = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Evento/Codiciriduzione', {
      params: {
        eventoId: parseInt(params.eventoId),
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

// Get Seat Info for section with status and label
const getMappaBlocchi = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Mappa/Blocchi', {
      params: {
        piantaId: 1, //parseInt(params.eventoId),
        splitId: 2, //parseInt(params.bloccoId)
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
const utenzaAddPersona = async (params) => {
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
    // delete param.supporter_card
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
      console.log(error)
      console.log(error.response.data)
      results.push({
        success: false,
        error: error,
        param
      });
    }
  }

  return results;
}

getBigliettoIsUtilizzatore = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()
  const results = [];

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  console.log(params)
  
  for (const param of params.personaData) {
    try {
      const response = await axiosClient.get('/api/Biglietto/IsUtilizzatore', {
        params: {
          personaId: parseInt(param.persona_id),
          eventoId: parseInt(params.eventoId),
        }
      });
      results.push({
        success: true,
        dataPlanet: response.data,
        data: {
          ...param,
          has_issued_ticket: response.data
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

      let responseSC
      let response 
      
      console.log('######## typeof param.codiceFiscaleSocieta #############')
      console.log(typeof param.codiceFiscaleSocieta)
     
      if (typeof param.codiceFiscaleSocieta === 'string') {
        
        console.log('Calling Autorizzazione/VerificaTesseraTifoso')
        console.log(param.codiceFiscaleSocieta)
        console.log(param.codiceTesseraTifoso)
        responseSC = await axiosClient.get('/api/Autorizzazione/VerificaTesseraTifoso', {
          params: {
            codiceFiscaleSocieta: param.codiceFiscaleSocieta,
            codiceTesseraTifoso: param.codiceTesseraTifoso,
          }
        });
        results.push({
          success: true,
          dataPlanet: responseSC.data,
          data: {
            ...param,
            is_eligible: responseSC.data.risultato
          }
        });
        
      } else {

        console.log('Calling Autorizzazione/VerificaPersona')
        response = await axiosClient.get('/api/Autorizzazione/VerificaPersona', {
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
      }

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

getAutVerificaTesseraTifoso = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Autorizzazione/VerificaTesseraTifoso', {
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

const issueSingleMatchTickets = async (params) => {
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
      let responseTdT
      let response 
      
      console.log('######## typeof param.codiceFiscaleSocieta #############')
      console.log(typeof param.codiceFiscaleSocieta)
     
      if (typeof param.codiceFiscaleSocieta === 'string') {
        responseTdT = await axiosClient.post('/api/Biglietto/EmettiEstesoTdT', param);
        results.push({
          success: true,
          dataPlanet: responseTdT.data,
          data: {
            ...param,
            ticket_issue_response: responseTdT.data
          }
        });
      } else {
        response = await axiosClient.post('/api/Biglietto/EmettiEsteso', param);
        results.push({
          success: true,
          dataPlanet: response.data,
          data: {
            ...param,
            ticket_issue_response: response.data
          }
        });
      }
    
    } catch (error) {
      console.log(error)
      results.push({
        success: false,
        error: error.response.data,
        data: param
      });
    }
    
  }

  return results;
}

const issueSeasonTickets = async (params) => {
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
      let responseTdT
      let response 
      
      console.log('######## typeof param.codiceFiscaleSocieta #############')
      console.log(typeof param.codiceFiscaleSocieta)
     
      if (typeof param.codiceFiscaleSocieta === 'string') {
        responseTdT = await axiosClient.post('/api/Abbonamento/EmettiEstesoTdT', param);
        results.push({
          success: true,
          dataPlanet: responseTdT.data,
          data: {
            ...param,
            ticket_issue_response: responseTdT.data
          }
        });
      } else {
        //Without Supporter Card
        response = await axiosClient.post('/api/Abbonamento/EmettiEsteso', param);
        results.push({
          success: true,
          dataPlanet: response.data,
          data: {
            ...param,
            ticket_issue_response: response.data
          }
        });
      }
    
    } catch (error) {
      console.log(error)
      results.push({
        success: false,
        error: error.response.data,
        data: param
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
          id: parseInt(param.ticket_issue_response.id)
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

getPlaNetTitoloInfoBySigilloFiscale = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()
  const results = [];

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    console.log('################ params.sigilloFiscale #################')
    console.log(params.sigilloFiscale)
    const response = await axiosClient.get('/api/Titolo/Info', {
      params: {
        sigilloFiscale: params.sigilloFiscale
      }
    });

    if (response.data) {
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
}

getPlanetTitoloEsteso = async (params) => {
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
      const response = await axiosClient.get('/api/Titolo/InfoEsteso', {
        params: {
          id: parseInt(param.ticket_issue_response.id)
        }
      });
      results.push({
        success: true,
        dataPlanet: response.data,
        data: {
          ...param,
          info_esteso: response.data
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

const getPlanetTitoloInfoCessione = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()
  const results = [];

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;
  
  for (const param of Array.isArray(params) ? params : [params]) {
    try {
      const response = await axiosClient.get('/api/Titolo/InfoCessione', {
        params: {
          titoloId: parseInt(param.ticket_issue_response.id),
          eventoId: parseInt(param.info_esteso.eventi[0].id),
        }
      });
      results.push({
        success: true,
        dataPlanet: response.data,
        data: {
          ...param,
          info_cessione: response.data
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

getPlaNetTitoloIsCedibile = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()
  const results = [];

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Titolo/IsCedibile', {
      params: {
        id: parseInt(params.id)
      }
    });

    if (response.data) {
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
}

tesseraTifosoRegistra = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()
  const results = [];

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.post('/api/TesseraTifoso/Registra', params);

    if (response.data) {
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

tesseraTifosoEmetti = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()
  const results = [];

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.post('/api/TesseraTifoso/Emetti', params);

    console.log('$$$$$$$$$$$$$$$$$$$$ response $$$$$$$$$$$$$$$$$$')
    console.log(response)
    if (response.data) {
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

const transferSeasonTicketToPerson = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken();

  if (!plannetAccessTokenResponse.success) {
    throw new Error(plannetAccessTokenResponse.error); 
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;
  const results = [];

  for (const param of Array.isArray(params) ? params : [params]) {
    try {
      const response = await axiosClient.post('/api/Abbonamento/Cessione', param); 
      results.push({ 
        success: true, 
        data: response.data 
      });
    } catch (error) {
      console.error('Transfer event error:', error);
      results.push({ success: false, error: error.message, param });
    }
  }

  return results;
};

const transferTicketToPerson = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken();

  if (!plannetAccessTokenResponse.success) {
    throw new Error(plannetAccessTokenResponse.error); 
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  const results = [];
  for (const param of Array.isArray(params) ? params : [params]) {
    try {
      const response = await axiosClient.post('/api/Biglietto/Cessione', param); 
      results.push({ 
        success: true, 
        data: response.data 
      });
    } catch (error) {
      console.error('Ticket transfer error:', error);
      results.push({ success: false, error: error.message, param }); 
    }
  }

  return results;
};

//Get Max Ticket per event for 1 persona
getTitoliAcquistabili = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()
  const results = [];

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;
  
  try {
    const response = await axiosClient.get('/api/Titolo/GetTitoliAcquistabili', {
      params: {
        eventoId: parseInt(params.eventoId),
        acquirenteId: parseInt(params.acquirenteId)
      }
    });
    return {
      success: true,
      data: { max_seats: response.data }
    };
  } catch (error) {
    console.log(error)
    return {
      success: false,
      error: error
    };
  }

  return results;
}

//Get Max Subscription for 1 persona
getTitoliAcquistabiliAbbonamento = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()
  const results = [];

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;
  
  try {
    const response = await axiosClient.get('/api/Titolo/GetTitoliAcquistabiliAbbonamento', {
      params: {
        acquirenteId: parseInt(params.acquirenteId),
        tipoAbbonamentoId: parseInt(params.tipoAbbonamentoId)
      }
    });
    return {
      success: true,
      data: { max_seats: response.data }
    };
  } catch (error) {
    console.log(error)
    return {
      success: false,
      error: error
    };
  }
}

getMappaPostiAbbonamentoInfo = async (params) => {
  const plannetAccessTokenResponse = await getPlanetToken()

  if (!plannetAccessTokenResponse.success) {
    return {
      success: false,
      error: plannetAccessTokenResponse.error
    }
  }

  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${plannetAccessTokenResponse.data.token}`;

  try {
    const response = await axiosClient.get('/api/Mappa/PostiAbbonamentoInfo', {
      params: {
        postoId: parseInt(params.postoId),
        tipoAbbonamentoId: parseInt(params.tipoAbbonamentoId)
      }
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.log(error)
    return {
      success: false,
      error: error
    };
  }
}

module.exports = { getPlanetToken, getPlanetEvents, getPostiLiberiBiglietto, getEventOrganizers,
                   getMappaPostoInfo, getMappaPostiInfo, getMappaBloccaPosto, getMappaBlocchi,
                   getMappaSbloccaPosto, getPlanetNazioni, getPlanetProvince, 
                   getPlanetComuni, getPlanetsocietaSportiva, getPlaNetSeasonTickets, 
                   getPlaNetSeasonTribunas, getPlaNetSeasonEvents, utenzaAddPersona, 
                   getBigliettoIsUtilizzatore, checkVroTicketIssueEligible, issueSingleMatchTickets, 
                   issueSeasonTickets, getPlaNetTitoloStato, getPlaNetTitoloInfo, 
                   getPlaNetTitoloInfoBySigilloFiscale, getPlanetEventPricing, getTesseraTifoso, 
                   tesseraTifosoRegistra, getAutVerificaTesseraTifoso, tesseraTifosoEmetti, getPlanetTitoloInfoCessione,
                   getPlaNetSubscriptionPrices, getPlanetTitoloEsteso, transferSeasonTicketToPerson, 
                   transferTicketToPerson, getPlanetSubscriptionAvailableSeat, getPlanetCheckSeasonTicketHolder,
                   getMappaPostiAbbonamentoInfo, getTitoliAcquistabiliAbbonamento, getTitoliAcquistabili,
                   getPlanetEventDetail
                  };
