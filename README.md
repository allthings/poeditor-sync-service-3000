# poeditor-sync-service-3000

AWS Lambda/API Gateway service to sync project translations from the
[POEditor](https://poeditor.com/) [API](https://poeditor.com/docs/api) and stick them into AWS S3.

# Contents

1. [Installation / Setup](#installation--setup)
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

## Local Development

Best practice is to develop locally using a TDD approach. The boilerplate includes sample tests on
which you can build, including example of how to mock AWS services.

Start the development environment with:

```sh
yarn dev
```

Try out the webhook with `curl`:

```sh
curl -s \
  -X POST \
  -H "content-type: application/json" \
  -d '{"id":"s1d2f34","foo":"bar"}' \
  http://localhost:3000/webhook | \
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

In production, encrypt sensitive environment variables or other secret strings with KMS:

```sh
yarn encrypt-string "super secret string"
```

To deploy secrets as part of an environment variable, add it to `serverless.yml` like so:

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
