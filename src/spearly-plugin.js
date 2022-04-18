import '@babel/polyfill'
;(function ($) {
  const snakeToCamel = (text) => {
    const snakeToUpper = (str) => str.charAt(1).toUpperCase()
    return text.replace(/_./g, snakeToUpper)
  }

  const recursiveToCamels = (data) => {
    if (!data || typeof data !== 'object') return data
    if (data instanceof Date || data instanceof RegExp) return data
    if (Array.isArray(data)) {
      const array = []
      data.forEach((d) => array.push(recursiveToCamels(d)))
      return array
    }
    const returns = {}

    Object.keys(data).forEach((key) => {
      const camelCase = snakeToCamel(key)
      returns[camelCase] = recursiveToCamels(data[key])
    }, {})

    return returns
  }

  const bindQueriesFromParams = (params) => {
    if (!params) return ''
    let queries = '?'

    Object.keys(params).forEach((param) => {
      const paramName = param
      const snakeName = camelToSnake(paramName)

      if (typeof params[paramName] === 'number') {
        queries += `${snakeName}=${String(params[paramName])}&`
      } else if (params[paramName] instanceof Date) {
        const year = params[paramName].getFullYear()
        const month = String(params[paramName].getMonth() + 1)
        const date = String(params[paramName].getDate())
        queries += `${snakeName}=${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')}&`
      } else {
        queries += `${snakeName}=${params[paramName]}&`
      }
    })

    return queries.slice(0, -1)
  }

  const setSpearlyAPIClient = ({ apiKey }) => {
    const getRequest = async (endpoint, queries = '') => {
      const response = await $.ajax({
        url: `https://api.spearly.com${endpoint}${queries}`,
        type: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.spearly.v2+json',
          Authorization: `Bearer ${apiKey}`,
        },
      })
      return recursiveToCamels(response)
    }

    const postRequest = async (endpoint, params) => {
      const response = await $.ajax({
        url: `https://api.spearly.com${endpoint}`,
        type: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.spearly.v2+json',
          Authorization: `Bearer ${apiKey}`,
        },
        data: JSON.stringify(params),
      })
      return recursiveToCamels(response)
    }

    $.spearly = {
      getList: async (contentTypeId, params) => {
        const response = await getRequest(`/content_types/${contentTypeId}/contents`, bindQueriesFromParams(params))
        return response
      },
      getContent: async (contentId) => {
        const response = await getRequest(`/contents/${contentId}`)
        return response.data
      },
      getContentPreview: async (contentId, previewToken) => {
        const response = await getRequest(`/contents/${contentId}`, `?preview_token=${previewToken}`)
        return response.data
      },
      getFormLatest: async (publicUid) => {
        const response = await getRequest(`/forms/${publicUid}/latest`)
        return response.form
      },
      postFormAnswer: async (formVersionId, fields) => {
        if (!('_spearly_gotcha' in fields)) throw new Error('Include "_spearly_gotcha" in the fields.')
        const { _spearly_gotcha, ...paramFields } = fields
        const response = await postRequest('/form_answers', {
          form_version_id: formVersionId,
          fields: paramFields,
          _spearly_gotcha,
        })
        return response.answer
      },
    }
  }

  $.spearly = {
    init: setSpearlyAPIClient,
  }
})(jQuery, window, document)
