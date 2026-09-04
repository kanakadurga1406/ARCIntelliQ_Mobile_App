import type {
  SmartSearchApplyPayload,
  SmartSearchApplyResult,
  SmartSearchAskPayload,
  SmartSearchAskResult,
  SmartSearchConfig,
} from '../types/smartSearch';
import {USE_STUB_API} from './config';
import {apiRequest} from './client';
import {SMART_SEARCH_CONFIG} from './stubs/smartSearch';

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

async function stubConfig(): Promise<SmartSearchConfig> {
  await wait(280);
  return SMART_SEARCH_CONFIG;
}

async function liveConfig(): Promise<SmartSearchConfig> {
  return apiRequest<SmartSearchConfig>('/smart-search/config');
}

export function fetchSmartSearchConfig(): Promise<SmartSearchConfig> {
  if (USE_STUB_API) {
    return stubConfig();
  }

  return liveConfig();
}

async function stubApply(
  payload: SmartSearchApplyPayload,
): Promise<SmartSearchApplyResult> {
  await wait(400);
  const ready = payload.filters.filter(
    item => item.fieldId && item.operatorId,
  ).length;
  return {
    resultCount: ready,
    message:
      ready > 0
        ? `Search ready with ${ready} filter${ready === 1 ? '' : 's'}. Live results will connect next.`
        : 'Add at least one complete filter to search.',
  };
}

async function liveApply(
  payload: SmartSearchApplyPayload,
): Promise<SmartSearchApplyResult> {
  return apiRequest<SmartSearchApplyResult>('/smart-search/apply', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function applySmartSearch(
  payload: SmartSearchApplyPayload,
): Promise<SmartSearchApplyResult> {
  if (USE_STUB_API) {
    return stubApply(payload);
  }

  return liveApply(payload);
}

async function stubAsk(
  payload: SmartSearchAskPayload,
): Promise<SmartSearchAskResult> {
  await wait(500);
  return {
    reply: `I would search claims and funds for “${payload.message}”. Live AI search will connect when the backend is ready.`,
  };
}

async function liveAsk(
  payload: SmartSearchAskPayload,
): Promise<SmartSearchAskResult> {
  return apiRequest<SmartSearchAskResult>('/smart-search/ask', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function askSmartSearch(
  payload: SmartSearchAskPayload,
): Promise<SmartSearchAskResult> {
  if (USE_STUB_API) {
    return stubAsk(payload);
  }

  return liveAsk(payload);
}
