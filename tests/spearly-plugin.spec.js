import '../src/spearly-plugin'
import {
  serverList,
  list,
  serverContent,
  content,
  serverLatestForm,
  latestForm,
  serverFormAnswer,
  formAnswer,
} from './mocks'

jest.mock('nanoid', () => {
  return { nanoid: () => 'identifier' }
})

describe('spearly jQuery plugin', () => {
  it('Before initialize, only init exists', () => {
    expect($.spearly.init).toBeTruthy()
    expect($.spearly.getList).toBeFalsy()
  })

  it('After initialize, each function can be used', () => {
    $.spearly.init({ apiKey: 'API_KEY' })
    expect($.spearly.init).toBeFalsy()
    expect($.spearly.getList).toBeTruthy()
    expect($.spearly.getContent).toBeTruthy()
    expect($.spearly.getContentPreview).toBeTruthy()
    expect($.spearly.getFormLatest).toBeTruthy()
    expect($.spearly.postFormAnswer).toBeTruthy()
    expect($.spearly.postMetric).toBeTruthy()
    expect($.spearly.pageView).toBeTruthy()
    expect($.spearly.conversion).toBeTruthy()
    expect($.spearly.distinctId).toBeTruthy()
    expect($.spearly.sessionId).toBeTruthy()
  })

  it('getList is a list of content_type can be obtained', async () => {
    $.ajax = jest.fn().mockImplementation(() => {
      return Promise.resolve(serverList)
    })

    const res = await $.spearly.getList('contentTypeID', { limit: 10 })
    expect(res).toEqual(list)
  })

  it('getContent can get a given content', async () => {
    $.ajax = jest.fn().mockImplementation(() => {
      return Promise.resolve({ data: serverContent })
    })

    const res = await $.spearly.getContent('contentTypeId', 'contentID')
    expect(res).toEqual(content)
  })

  it('getContent can get a given content', async () => {
    $.ajax = jest.fn().mockImplementation(() => {
      return Promise.resolve({ data: serverContent })
    })

    const res = await $.spearly.getContent('contentTypeId', 'contentID')
    expect(res).toEqual(content)
  })

  it('getContentPreview can get a given content preview', async () => {
    $.ajax = jest.fn().mockImplementation(() => {
      return Promise.resolve({ data: serverContent })
    })

    const res = await $.spearly.getContentPreview('contentTypeId', 'contentID', 'previewToken')
    expect(res).toEqual(content)
  })

  it('getFormLatest can get a given form latest', async () => {
    $.ajax = jest.fn().mockImplementation(() => {
      return Promise.resolve({ form: serverLatestForm })
    })

    const res = await $.spearly.getFormLatest('publicUid')
    expect(res).toEqual(latestForm)
  })

  it('pageView can post metric data', () => {
    $.ajax = jest.fn()

    $.spearly.pageView({ contentId: 'CONTENT_ID', patternName: 'b' })
    expect($.ajax).toHaveBeenCalled()
  })

  it('conversion can post metric data', () => {
    $.ajax = jest.fn()

    $.spearly.conversion({ contentId: 'CONTENT_ID', patternName: 'b' })
    expect($.ajax).toHaveBeenCalled()
  })

  describe('postFormAnswer', () => {
    beforeEach(() => {
      $.ajax = jest.fn().mockImplementation(() => {
        return Promise.resolve({ answer: serverFormAnswer })
      })
    })

    it('if correct, submit the form data', async () => {
      const res = await $.spearly.postFormAnswer(127, { foo: 'bar', _spearly_gotcha: '' })
      expect(res).toEqual(formAnswer)
    })

    it('throws an error if _spearly_gocha does not exist', async () => {
      const res = $.spearly.postFormAnswer(127, { foo: 'bar' })
      await expect(res).rejects.toThrow('Include "_spearly_gotcha" in the fields.')
    })
  })
})
