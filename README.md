# RapiPOX Server

First implementation of RapiPOX Server

- [x] Project startup
- [x] Typescript
- [x] Linters
- [x] Relay connection
- [x] Http request
- [x] Get actions from files
- [ ] Whitelist protection
- [ ] Tests
- [ ] Dockerfile

## Getting started

### Setup environment

Set proper nvm version

```bash
nvm use
```

Install dependencies

```bash
pnpm i
```

Copy .env.example to .env

```bash
cp .env.example .env
```

Edit .env file with proper values

### Run in developer mode

```
pnpm dev
```

## How to use it?

### Make a request

Just publish a nostr event to the same relay server that the RapiPOX server is connected to.

```json
{
    "id": "GENERATED_REQUEST_EVENT_ID",
    "kind": 20001,
    "content": "{\"url\": \"https://lawallet.ar/.well-known/lnurlp/pos\"}",
    "tags": [
        "p": "RAPIPOX_SERVER_PUBLIC_KEY",
        "action": "http",
    ],
    ...
}
```

The `action` tag should contain a valid action, in this case we are using `http` that takes JSON content and uses the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options) to make a request to the given URL.

### Receive response

The server will respond publishing a nostr event with the same `id` and `kind` but with the `content` containing the response from the request.

```json
{
    ...
    "kind": 20001,
    "content": "{\"status\": 200, \"body\": \"<html>...</html>\"}",
    "tags": [
        "p": "YOUR_PUBLIC_KEY",
        "e": "GENERATED_REQUEST_EVENT_ID",
    ],
    ...
}
```
