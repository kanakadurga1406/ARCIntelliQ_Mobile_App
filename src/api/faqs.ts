import type {FaqItem} from '../types/claimPortals';
import {apiRequest} from './client';

export function fetchFaqs(): Promise<FaqItem[]> {
  return apiRequest<FaqItem[]>('/faqs');
}
