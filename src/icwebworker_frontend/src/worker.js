import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../declarations/icwebworker_backend/icwebworker_backend.did.js";

let timer;

self.onmessage = async ({ data }) => {
  const { msg } = data;

  switch (msg) {
    case "start":
      start();
      break;
    case stop:
      stop();
  }
};

const stop = () => clearInterval(timer);

const start = () => (timer = setInterval(call, 2000));

const call = async () => {
  // Disable idle manager because web worker cannot access the window object / the UI
  const authClient = await AuthClient.create({
    idleOptions: {
      disableIdle: true,
      disableDefaultIdleCallback: true,
    },
  });

  const isAuthenticated = await authClient.isAuthenticated();

  if (!isAuthenticated) {
    // User is not authenticated
    return;
  }

  const identity = authClient.getIdentity();

  await query({ identity });
};

const query = async ({ identity }) => {
  const actor = createActor(canisterId, {
    agentOptions: { identity, host: `http://${canisterId}.localhost:8000/` },
  });
  const greeting = await actor.greet();

  postMessage({ msg: "result", greeting });
};

// Copied from auto-generated ../../declarations/icwebworker_backend/icwebworker_backend.did.js
//
// We have to copy canisterId and createActor from the declaration because the default (last line of the script):
// export const icwebworker_backend = createActor(canisterId);
// breaks in a web worker context

const canisterId = process.env.ICWEBWORKER_BACKEND_CANISTER_ID;

export const createActor = (canisterId, options) => {
  const agent = new HttpAgent(options ? { ...options.agentOptions } : {});

  // Fetch root key for certificate validation during development
  if (process.env.NODE_ENV !== "production") {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...(options ? options.actorOptions : {}),
  });
};
