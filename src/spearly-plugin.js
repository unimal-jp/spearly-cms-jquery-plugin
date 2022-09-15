import '@babel/polyfill'
;(function ($) {
  const snakeToCamel = (text) => {
    const snakeToUpper = (str) => str.charAt(1).toUpperCase()
    return text.replace(/_./g, snakeToUpper)
  }

  const camelToSnake = (text) => {
    const upperToSnake = (str) => `_${str.charAt(0).toLowerCase()}`
    return text.replace(/[A-Z]/g, upperToSnake).replace(/^_(.+?)$/, '$1')
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
      } else if (paramName === 'orders') {
        const orders = params[paramName]
        Object.keys(orders).forEach((key) => {
          queries += `order_by_${key}=${orders[key]}&`
        })
      } else if (paramName === 'filterValue' && params[paramName] && params[paramName] instanceof Array) {
        const param = params[paramName]
        param.forEach((v) => {
          queries += `filter_value[]=${v}&`
        })
      } else if (paramName === 'filters') {
        const group = params[paramName]

        Object.keys(group).forEach((fieldId) => {
          if (group[fieldId] instanceof Array) {
            group[fieldId].forEach((v) => {
              queries += `filter_by_${fieldId}[]=${v}&`
            })
          } else {
            queries += `filter_by_${fieldId}=${group[fieldId]}&`
          }
        })
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

    const mapList = (list) => ({
      ...list,
      data: list.data.map((content) => mapContent(content)),
    })

    const mapContent = (content) => {
      const values = content.values
      const fields = content.attributes.fields.data.map((field) => {
        if (field.attributes.inputType !== 'calendar') return field
        const date = new Date(field.attributes.value)
        values[field.attributes.identifier] = date
        return {
          ...field,
          value: date,
        }
      })

      return {
        ...content,
        values,
        attributes: {
          ...content.attributes,
          fields: {
            data: fields,
          },
          createdAt: new Date(content.attributes.createdAt),
          updatedAt: new Date(content.attributes.updatedAt),
          publishedAt: content.attributes.publishedAt ? new Date(content.attributes.publishedAt) : null,
        },
      }
    }

    const mapForm = (form) => ({
      ...form,
      startedAt: form.startedAt ? new Date(form.startedAt) : null,
      endedAt: form.endedAt ? new Date(form.endedAt) : null,
      createdAt: new Date(form.createdAt),
    })

    const mapFormAnswer = (formAnswer) => ({
      ...formAnswer,
      createdAt: new Date(formAnswer.createdAt),
    })

    $.spearly = {
      getList: async (contentTypeId, params) => {
        const response = await getRequest(`/content_types/${contentTypeId}/contents`, bindQueriesFromParams(params))
        return mapList(response)
      },
      getContent: async (contentId) => {
        const response = await getRequest(`/contents/${contentId}`)
        return mapContent(response.data)
      },
      getContentPreview: async (contentId, previewToken) => {
        const response = await getRequest(`/contents/${contentId}`, `?preview_token=${previewToken}`)
        return mapContent(response.data)
      },
      getFormLatest: async (publicUid) => {
        const response = await getRequest(`/forms/${publicUid}/latest`)
        return mapForm(response.form)
      },
      postFormAnswer: async (formVersionId, fields) => {
        if (!('_spearly_gotcha' in fields)) throw new Error('Include "_spearly_gotcha" in the fields.')
        const { _spearly_gotcha, ...paramFields } = fields
        const response = await postRequest('/form_answers', {
          form_version_id: formVersionId,
          fields: paramFields,
          _spearly_gotcha,
        })
        return mapFormAnswer(response.answer)
      },
    }
  }

  $.spearly = {
    init: setSpearlyAPIClient,
  }
})(jQuery, window, document)
