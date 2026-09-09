import type {
  SmartSearchApplyPayload,
  SmartSearchApplyResult,
  SmartSearchAskPayload,
  SmartSearchAskResult,
  SmartSearchConfig,
} from '../types/smartSearch';
import {apiRequest} from './client';

export function fetchSmartSearchConfig(): Promise<SmartSearchConfig> {
  return apiRequest<SmartSearchConfig>('/smart-search/config');
}

export function applySmartSearch(
  payload: SmartSearchApplyPayload,
): Promise<SmartSearchApplyResult> {
  return apiRequest<SmartSearchApplyResult>('/smart-search/apply', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function askSmartSearch(
  payload: SmartSearchAskPayload,
): Promise<SmartSearchAskResult> {
  return apiRequest<SmartSearchAskResult>('/smart-search/ask', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
