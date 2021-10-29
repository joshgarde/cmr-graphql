import nock from 'nock'

import { draftMmtQuery } from '../draftMmtQuery'

describe('draftMmtQuery', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }

    process.env.draftMmtRootUrl = 'http://example.com'
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  test('queries draft mmt', async () => {
    const consoleMock = jest.spyOn(console, 'log').mockImplementation(() => jest.fn())

    nock(/example/)
      .get(/collection_draft_proposals/)
      .reply(200, {
        ShortName: 'Mock ShortName'
      })

    const response = await draftMmtQuery({
      conceptType: 'collectionDraftProposal',
      params: {
        id: 123
      },
      headers: { 'X-Request-Id': 'abcd-1234-efgh-5678' }
    })

    const { data, headers } = response

    const {
      'request-duration': requestDuration
    } = headers

    expect(data).toEqual({
      ShortName: 'Mock ShortName'
    })

    expect(consoleMock).toBeCalledWith(
      `Request abcd-1234-efgh-5678 to [concept: collectionDraftProposal] completed external request in [observed: ${requestDuration} ms]`
    )
  })

  describe('when provided a token via the Echo-Token header', () => {
    test('queries draft mmt using the Echo-Token header', async () => {
      nock(/example/, {
        reqheaders: {
          'X-Request-Id': 'abcd-1234-efgh-5678',
          'Echo-Token': 'test-token'
        }
      })
        .get(/collection_draft_proposals/)
        .reply(200, {
          ShortName: 'Mock ShortName'
        })

      const response = await draftMmtQuery({
        conceptType: 'collectionDraftProposal',
        params: {},
        headers: {
          'X-Request-Id': 'abcd-1234-efgh-5678',
          'Echo-Token': 'test-token'
        }
      })

      const { data } = response
      expect(data).toEqual({
        ShortName: 'Mock ShortName'
      })
    })
  })

  describe('when provided a token via the Authorization header', () => {
    test('queries draft mmt using the Authorization header', async () => {
      nock(/example/, {
        reqheaders: {
          'X-Request-Id': 'abcd-1234-efgh-5678',
          Authorization: 'test-token'
        }
      })
        .get(/collection_draft_proposals/)
        .reply(200, {
          ShortName: 'Mock ShortName'
        })

      const response = await draftMmtQuery({
        conceptType: 'collectionDraftProposal',
        params: {},
        headers: {
          'X-Request-Id': 'abcd-1234-efgh-5678',
          Authorization: 'test-token'
        }
      })

      const { data } = response
      expect(data).toEqual({
        ShortName: 'Mock ShortName'
      })
    })
  })

  describe('when provided a token via the Authorization header and the Echo-Token header', () => {
    test('queries draft mmt using the Authorization header', async () => {
      nock(/example/, {
        reqheaders: {
          'X-Request-Id': 'abcd-1234-efgh-5678',
          Authorization: 'authorization-token'
        }
      })
        .get(/collection_draft_proposals/)
        .reply(200, {
          ShortName: 'Mock ShortName'
        })

      const response = await draftMmtQuery({
        conceptType: 'collectionDraftProposal',
        params: {},
        headers: {
          'X-Request-Id': 'abcd-1234-efgh-5678',
          Authorization: 'authorization-token',
          'Echo-Token': 'echo-token'
        }
      })

      const { data } = response
      expect(data).toEqual({
        ShortName: 'Mock ShortName'
      })
    })
  })

  describe('when an error is returned', () => {
    test('throws an exception', async () => {
      nock(/example/)
        .get(/collection_draft_proposals/)
        .reply(500, {
          errors: ['HTTP Error']
        })

      const response = draftMmtQuery({
        conceptType: 'collectionDraftProposal',
        params: {},
        headers: {
          'X-Request-Id': 'abcd-1234-efgh-5678'
        }
      })

      await expect(response).rejects.toThrow()
    })
  })
})
