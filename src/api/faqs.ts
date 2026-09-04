import type {FaqItem} from '../types/claimPortals';
import {USE_STUB_API} from './config';
import {apiRequest} from './client';
import {FAQS} from './stubs/faqs';

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

async function stubFaqs(): Promise<FaqItem[]> {
  await wait(250);
  return FAQS;
}

async function liveFaqs(): Promise<FaqItem[]> {
  return apiRequest<FaqItem[]>('/faqs');
}

export function fetchFaqs(): Promise<FaqItem[]> {
  if (USE_STUB_API) {
    return stubFaqs();
  }

  return liveFaqs();
}
