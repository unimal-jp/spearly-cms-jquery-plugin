import '@babel/polyfill'
import jquery from 'jquery'
;(function ($) {
  const setSpearlyAPIClient = ({ apiKey }) => {
    const getRequest = (endpoint, queries = '') => {
      return $.ajax({
        url: `https://api.spearly.com${endpoint}${queries}`,
        type: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.spearly.v2+json',
          Authorization: `Bearer ${apiKey}`,
        },
      })
    }

    $.spearly = {
      getSpearlyList: async (contentTypeId) => {
        const response = await getRequest(`/content_types/${contentTypeId}/contents`)
        return response
      },
    }
  }

  $.spearly = {
    init: setSpearlyAPIClient,
  }

  $(async function () {
    $.spearly.init({ apiKey: '8iLm7ePjfmmBGJA7pmetU5hgNvPpjyfDikuo1mIPpcs' })
    const res = await $.spearly.getSpearlyList('record')
    console.log(res)
  })
})(jquery, window, document)
