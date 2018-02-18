import { ServerError } from 'alagarr'
import { decrypt as kmsDecrypt } from 'aws-kms-thingy'
import * as get from 'got'

const POEDITOR_API_BASE_URL = 'https://api.poeditor.com/v2'

// API Wrapper for https://poeditor.com/docs/api#overview
export default async function poeditorApiRequest(
  method: string,
  data: any = {},
  POEDITOR_TOKEN: string | undefined = process.env.POEDITOR_TOKEN
): Promise<any> {
  if (!POEDITOR_TOKEN || !POEDITOR_TOKEN.length) {
    throw new ServerError('POEDITOR_TOKEN environment variable is not set.')
  }

  try {
    const apiToken = await kmsDecrypt(POEDITOR_TOKEN)

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
      throw new ServerError(
        `Poeditor API error: ${response.body.response.message}`
      )
    }

    return response.body
  } catch (error) {
    throw new ServerError(error)
  }
}
