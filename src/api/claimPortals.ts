import type {ClaimPortalsDashboard} from '../types/claimPortals';
import {USE_STUB_API} from './config';
import {apiRequest} from './client';
import {CLAIM_PORTALS_DASHBOARD} from './stubs/claimPortals';

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

async function stubClaimPortalsDashboard(): Promise<ClaimPortalsDashboard> {
  await wait(450);
  return CLAIM_PORTALS_DASHBOARD;
}

async function liveClaimPortalsDashboard(): Promise<ClaimPortalsDashboard> {
  return apiRequest<ClaimPortalsDashboard>('/claim-portals/dashboard');
}

export function fetchClaimPortalsDashboard(): Promise<ClaimPortalsDashboard> {
  if (USE_STUB_API) {
    return stubClaimPortalsDashboard();
  }

  return liveClaimPortalsDashboard();
}
