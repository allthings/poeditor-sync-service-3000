import * as get from 'got'
import kmsDecrypt from '../utils/kms'

const POEDITOR_API_BASE_URL = 'https://api.poeditor.com/v2'

export default async function poeditorApiRequest(
  method: string,
  data: any = {},
  POEDITOR_TOKEN: string | undefined = process.env.POEDITOR_TOKEN
): Promise<any> {
  const apiToken = await kmsDecrypt(POEDITOR_TOKEN || '')

  if (!apiToken.length) {
    // @TODO: use ApiError()
    throw new Error('POEDITOR_TOKEN environment variable is not set.')
  }

  try {
    const response = await get(`${POEDITOR_API_BASE_URL}/${method}`, {
      body: { api_token: apiToken, ...data },
      form: true,
      headers: {
        'user-agent':
          'poets/1.0 (https://github.com/allthings/poeditor-sync-service-3000)',
      },
      json: true,
      method: 'POST',
    })

    if (Number(response.body.response.code) !== 200) {
      throw new Error(`Poeditor API error: ${response.body.response.message}`)
    }

    return response.body
  } catch (error) {
    // @TODO: use ApiError
    throw error
  }
}
