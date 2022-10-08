import { AuthClient } from "@dfinity/auth-client";

const signIn = async () => {
  const authClient = await AuthClient.create();
  await authClient.login({
    onSuccess: async () => console.log(await authClient.isAuthenticated()),
    onError: (err) => console.log(err),
    identityProvider: `http://r7inp-6aaaa-aaaaa-aaabq-cai.localhost:8000?#authorize`,
  });
};

const initSignInButton = () => {
  const button = document.querySelector("button");
  button.addEventListener("click", signIn, { passive: true });
};

const startWorker = () => {
  const worker = new Worker(new URL('./worker.js', import.meta.url));

  worker.onmessage = ({data}) => {
    const {msg, greeting} = data;

    switch (msg) {
      case 'result':
        document.querySelector("textarea").value += `${greeting}\n`;
    }
  };

  worker.postMessage({msg: 'start'});
};

const init = () => {
  startWorker();
  initSignInButton();
};

document.addEventListener("DOMContentLoaded", init);
