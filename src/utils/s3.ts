import { S3 } from 'aws-sdk'

const s3 = new S3()

export function head(Key: string, Bucket = process.env.AWS_S3_BUCKET || ''): Promise<any> {
  const params: S3.Types.HeadObjectRequest = {
    Bucket,
    Key,
  }

  return s3.headObject(params).promise()
}

export async function exists(
  Key: string,
  Bucket = process.env.AWS_S3_BUCKET || ''
): Promise<boolean> {
  try {
    return !!await head(Key, Bucket)
  } catch {
    return false
  }
}

export async function put(
  Key: string,
  Body: any,
  options: any = {},
  Bucket = process.env.AWS_S3_BUCKET || ''
): Promise<boolean> {
  const params: S3.Types.PutObjectRequest = {
    Body,
    Bucket,
    Key,
    ...options,
  }

  try {
    return !!await s3.putObject(params).promise()
  } catch {
    return false
  }
}

export async function remove(
  oneOrMoreKeys: string | ReadonlyArray<string>,
  Bucket = process.env.AWS_S3_BUCKET || ''
): Promise<boolean> {
  const params: S3.Types.DeleteObjectsRequest = {
    Bucket,
    Delete: {
      Objects:
        typeof oneOrMoreKeys === 'string'
          ? [{ Key: oneOrMoreKeys }]
          : oneOrMoreKeys.map((Key: string) => ({ Key })),
    },
  }

  try {
    return !!await s3.deleteObjects(params).promise()
  } catch {
    return false
  }
}
