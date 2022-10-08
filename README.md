# Poll canister on the IC with web workers

Sample repo for upcoming blog post.

## How to

```
git clone https://github.com/peterpeterparker/icwebworker
cd icwebworker
npm ci
dfx start --background
dfx depploy
```

Once deployed, access your canister locally with `http://<canister-id>.localhost:8000/`.

### Note

Do not access this canister locally with query param `http://127.0.0.1:8000/?canisterId=<canister-id>`.

Using a param would lead to following issue in the browser:

> Uncaught NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'http://127.0.0.1:8000/vendors-node_modules_dfinity_auth-client_lib_esm_index_js.index.js' failed to load.