# poeditor-sync-service-3000

AWS Lambda/API Gateway service to sync project translations from the
[POEditor](https://poeditor.com/) [API](https://poeditor.com/docs/api) and stick
them into AWS S3.

# Contents

1. [Installation / Setup](#installation--setup)
   1. [POEditor Setup](#poeditor-setup)
1. [Local Development](#local-development)
1. [Testing](#testing)
1. [Encrypting Secrets](#encrypting-secrets)
1. [Deployment](#deployment)
   1. [Staging](#staging)
   1. [Prerelease](#prerelease)
   1. [Production](#production)

## Installation / Setup

```sh
yarn install
```

### POEditor Setup

POEditor project's should be named according to the following naming convention:

* ProjectName - Variation - Normative (default)
  e.g. App - Residential - Informal (default)
* ProjectName - Variation - Normative
  e.g. App - Residential - Informal
* ProjectName - Variation
  e.g. App - Residential
* ProjectName
  e.g. App

## Local Development

Best practice is to develop locally using a TDD approach.

Start the development environment with:

```sh
yarn dev
```

Try out the webhook with `curl`:

```sh
curl -s \
  http://localhost:3000/projectName/variation/normative | \
  jq
```

## Testing

```sh
yarn test
```

or

```sh
yarn watch:test
```

## Encrypting Secrets

In production, encrypt sensitive environment variables or other secret strings
with KMS:

```sh
yarn encrypt-string "super secret string"
```

To deploy secrets as part of an environment variable, add it to `serverless.yml`
like so:

```yaml
service:
  name: ${self:custom.package.name}
  awsKmsKeyArn: ${self:custom.package.config.awsKmsKeyArn} # use a custom kms key, defined in package.json

provider:
  name: aws
  environment:
    SUPER_SECRET: AQECAHj6Y8swFFZ8sg2A5LDTngYQ4IY...YtXTBbxtG0Z0wAQG7HuQ==
```

## Deployment

Make sure to set/export env variables appropriately:

* **POEDITOR_TOKEN**: a POEditor Token encrypted with the KMS key specified by _AWS_KMS_KEY_ARN_
* **AWS_KMS_KEY_ARN**: ARN of the AWS KMS key which will be used by AWS Lambda to decrypt secrets (e.g. POEDITOR_TOKEN)
* **AWS_ACCOUNT_ID**: AWS Account ID

### Staging

```sh
yarn deploy
```

### Prerelease

```sh
npm version prerelease
```

### Production

```sh
npm version [major|minor|patch]
```
