import type {ClaimHandlerAccount} from '../../types/auth';

export const CLAIM_HANDLER_USERS: ClaimHandlerAccount[] = [
  {
    id: 'ch-1001',
    name: 'Alex Rivera',
    email: 'handler@arcintelliq.com',
    password: 'Password123',
    role: 'claim-handler',
    title: 'Senior Claim Adjuster',
  },
  {
    id: 'ch-1002',
    name: 'Jordan Blake',
    email: 'adjuster@arcintelliq.com',
    password: 'Claims2026',
    role: 'claim-handler',
    title: 'Claims Administrator',
  },
  {
    id: 'ch-1003',
    name: 'Morgan Lee',
    email: 'admin@arcintelliq.com',
    password: 'Admin@123',
    role: 'claim-handler',
    title: 'Claims Team Lead',
  },
];
