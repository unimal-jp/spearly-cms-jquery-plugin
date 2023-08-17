import '@babel/polyfill'
import { nanoid } from 'nanoid'
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

  const toListParams = (params) => {
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

  const toContentParams = (params) => {
    if (!params) return ''
    let queries = '?'

    if (params.distinctId) {
      queries += `distinct_id=${params.distinctId}&`
    }

    if (params.patternName) {
      queries += `pattern_name=${params.patternName}&`
    }

    return queries.slice(0, -1)
  }

  const setSpearlyAPIClient = ({ apiKey }) => {
    const getRequest = async (endpoint, queries = '') => {
      const response = await $.ajax({
        url: `https://api.spearly.com${endpoint}${queries}`,
        type: 'GET',
        headers: {
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
        dataType: 'json',
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
      getList: async (contentTypeId, params = {}) => {
        params.distinctId = params.distinctId || $.spearly.distinctId
        const response = await getRequest(`/content_types/${contentTypeId}/contents`, toListParams(params))
        return mapList(response)
      },
      getContent: async (contentTypeId, contentId, params = {}) => {
        params.distinctId = params.distinctId || $.spearly.distinctId
        const response = await getRequest(
          `/content_types/${contentTypeId}/contents/${contentId}`,
          toContentParams(params)
        )

        return mapContent(response.data)
      },
      getContentPreview: async (contentTypeId, contentId, previewToken) => {
        const response = await getRequest(
          `/content_types/${contentTypeId}/contents/${contentId}`,
          `?preview_token=${previewToken}`
        )
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

  const setSpearlyAnalytics = () => {
    let distinctId = ''
    let sessionId = ''

    const postMetric = async (data) => {
      const body = {
        metric: {
          name: data.name,
          properties: {
            resource_type: 'content',
            resource_id: data.contentId,
            pattern_name: data.patternName,
            value: data.value,
            distinct_id: data.distinctId,
            session_id: data.sessionId,
            session_id_expires_in: data.sessionIdExpiresIn,
          },
        },
      }

      return await $.ajax({
        url: `https://analytics.spearly.com/metrics`,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(body),
      })
    }

    const pageView = async (params) => {
      const sessionExpires = params.expires || 1800
      distinctId = setDistinctId()
      sessionId = setSessionId(sessionExpires)

      await postMetric({
        name: 'impressions',
        contentId: params.contentId,
        patternName: params.patternName,
        value: 1,
        distinctId,
        sessionId,
        sessionIdExpiresIn: sessionExpires,
      })
    }

    const conversion = async (params) => {
      distinctId = setDistinctId()

      await postMetric({
        name: 'conversions',
        contentId: params.contentId,
        patternName: params.patternName,
        value: 1,
        distinctId,
      })
    }

    const setDistinctId = () => {
      const distinctId =
        document.cookie.replace(/(?:(?:^|.*;\s*)spearly_distinct_id\s*\=\s*([^;]*).*$)|^.*$/, '$1') || nanoid()
      const distinctIdExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `spearly_distinct_id=${distinctId}; expires=${distinctIdExpires}; path=/`
      return distinctId
    }

    const setSessionId = (expires = 1800) => {
      const sessionId =
        document.cookie.replace(/(?:(?:^|.*;\s*)spearly_session_id\s*\=\s*([^;]*).*$)|^.*$/, '$1') || nanoid()
      const sessionIdExpires = new Date(Date.now() + expires * 1000).toUTCString()
      document.cookie = `spearly_session_id=${sessionId}; expires=${sessionIdExpires};`
      return sessionId
    }

    distinctId = setDistinctId()
    sessionId = setSessionId()

    $.spearly = Object.assign({}, $.spearly, {
      postMetric,
      distinctId,
      sessionId,
      pageView,
      conversion,
    })
  }

  const initialized = (options) => {
    setSpearlyAPIClient(options)
    setSpearlyAnalytics()
  }

  $.spearly = {
    init: initialized,
  }
})(jQuery, window, document)
