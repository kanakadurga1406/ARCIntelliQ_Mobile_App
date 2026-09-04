import {USE_STUB_API} from './config';
import {apiRequest} from './client';
import {CLAIM_HANDLER_USERS} from './stubs/claimHandlers';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title,
  };
}

async function stubClaimHandlerLogin({email, password}) {
  await wait(700);

  const normalizedEmail = email.trim().toLowerCase();
  const user = CLAIM_HANDLER_USERS.find(
    item => item.email.toLowerCase() === normalizedEmail,
  );

  if (!user || user.password !== password) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  return {
    token: `stub-token-${user.id}`,
    user: toPublicUser(user),
  };
}

async function liveClaimHandlerLogin({email, password}) {
  return apiRequest('/auth/claim-handler/login', {
    method: 'POST',
    body: JSON.stringify({email, password}),
  });
}

export function loginClaimHandler(credentials) {
  if (USE_STUB_API) {
    return stubClaimHandlerLogin(credentials);
  }

  return liveClaimHandlerLogin(credentials);
}
