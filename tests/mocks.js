export const serverContent = {
  attributes: {
    contentAlias: 'content_1',
    createdAt: '2021-08-01 00:00:00',
    fields: {
      data: [
        {
          attributes: {
            identifier: 'title',
            inputType: 'text',
            value: 'title',
          },
          id: '1',
          type: 'field',
        },
        {
          attributes: {
            identifier: 'description',
            inputType: 'text',
            value: 'description',
          },
        },
      ],
    },
    publicUid: 'content_1',
    publishedAt: '2021-08-01 00:00:00',
    updatedAt: '2021-08-01 00:00:00',
  },
  values: {
    title: 'title',
    descritpion: 'description',
  },
}

export const serverList = {
  totalContentsCount: 50,
  matchingContentsCount: 10,
  limit: 10,
  offset: 0,
  next: 11,
  data: [serverContent],
}

export const content = {
  attributes: {
    contentAlias: 'content_1',
    createdAt: new Date('2021-08-01 00:00:00'),
    fields: {
      data: [
        {
          attributes: {
            identifier: 'title',
            inputType: 'text',
            value: 'title',
          },
          id: '1',
          type: 'field',
        },
        {
          attributes: {
            identifier: 'description',
            inputType: 'text',
            value: 'description',
          },
        },
      ],
    },
    publicUid: 'content_1',
    publishedAt: new Date('2021-08-01 00:00:00'),
    updatedAt: new Date('2021-08-01 00:00:00'),
  },
  values: {
    title: 'title',
    descritpion: 'description',
  },
}

export const list = {
  totalContentsCount: 50,
  matchingContentsCount: 10,
  limit: 10,
  offset: 0,
  next: 11,
  data: [content],
}

export const serverLatestForm = {
  id: 1,
  publicUid: '',
  identifier: '',
  name: '',
  description: '',
  thankYouMessage: '',
  fields: [
    {
      identifier: 'name',
      name: '名前',
      description: '',
      inputType: 'text',
      order: 0,
      required: true,
      options: [],
    },
  ],
  callbackUrl: '',
  startedAt: '2021-08-01 00:00:00',
  endedAt: '2021-08-01 00:00:00',
  createdAt: '2021-08-01 00:00:00',
}

export const latestForm = {
  id: 1,
  publicUid: '',
  identifier: '',
  name: '',
  description: '',
  thankYouMessage: '',
  fields: [
    {
      identifier: 'name',
      name: '名前',
      description: '',
      inputType: 'text',
      order: 0,
      required: true,
      options: [],
    },
  ],
  callbackUrl: '',
  startedAt: new Date('2021-08-01 00:00:00'),
  endedAt: new Date('2021-08-01 00:00:00'),
  createdAt: new Date('2021-08-01 00:00:00'),
}

export const serverFormAnswer = {
  formVersionId: 1,
  formPublicUid: 'form_id',
  data: {
    ipAddress: '127.0.0.1',
    userAgent: 'ua',
  },
  createdAt: '2021-08-01 00:00:00',
}

export const formAnswer = {
  formVersionId: 1,
  formPublicUid: 'form_id',
  data: {
    ipAddress: '127.0.0.1',
    userAgent: 'ua',
  },
  createdAt: new Date('2021-08-01 00:00:00'),
}
