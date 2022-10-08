import {
  IdbStorage,
  KEY_STORAGE_DELEGATION,
  KEY_STORAGE_KEY,
} from "@dfinity/auth-client";
import { isDelegationValid } from "@dfinity/authentication";
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity";
import {Actor, HttpAgent} from "@dfinity/agent";
import { idlFactory } from '../../declarations/icwebworker_backend/icwebworker_backend.did.js';

let timer;

self.onmessage = async ({data}) => {
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

const start = () => (timer = setInterval(call, 5000));

const call = async () => {
  const identity = await loadIdentity();

  if (!identity) {
    return;
  }

  await query({ identity });
};

const query = async ({ identity }) => {
  const actor = createActor(canisterId, {
    agentOptions: { identity, host: "http://127.0.0.1:8080/" },
  });
  const greeting = await actor.greet();

  postMessage({msg: 'result', greeting});
};

const loadIdentity = async () => {
  const idbStorage = new IdbStorage();
  const [delegationChain, identityKey] = await Promise.all([
    idbStorage.get(KEY_STORAGE_DELEGATION),
    idbStorage.get(KEY_STORAGE_KEY),
  ]);

  // No identity key or delegation key for the worker found.
  // User has not signed in.
  if (!identityKey || !delegationChain) {
    return undefined;
  }

  if (!isDelegationValid(DelegationChain.fromJSON(delegationChain))) {
    throw new Error("Internet identity has expired. Please login again.");
  }

  const initIdentity = ({ identityKey, delegationChain }) => {
    const chain = DelegationChain.fromJSON(delegationChain);
    const key = Ed25519KeyIdentity.fromJSON(identityKey);

    return DelegationIdentity.fromDelegation(key, chain);
  };

  return initIdentity({ identityKey, delegationChain });
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
    agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
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