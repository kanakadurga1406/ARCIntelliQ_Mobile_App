import type {FaqItem} from '../../types/claimPortals';

export const FAQS: FaqItem[] = [
  {
    id: 'sign-in',
    question: 'How do I sign in as a Claim Handler?',
    answer:
      'From the portal select screen, choose Claim Handler and sign in with the email and password issued by your administrator. Use Remember me on a trusted device so you do not have to enter your email every time.',
  },
  {
    id: 'portals',
    question: 'What are Claim Portals?',
    answer:
      'Claim Portals are the businesses you manage. Each card shows the fields returned by the API, such as status, linked businesses, documents, and assigned users. Open a card to view the actions the server sent for that portal.',
  },
  {
    id: 'search-filter',
    question: 'How do I find a specific portal?',
    answer:
      'On the Claim Portals tab, use the search field to match a portal name or business ID. Status chips and sort options come from the API, so new filters appear automatically when the backend adds them.',
  },
  {
    id: 'add-claim',
    question: 'How do I add a claim?',
    answer:
      'Tap the plus button on the bottom bar or choose Add Claim from the side menu. Select a portal, enter the claim title, and save. Live submit to the server will be connected when the backend is ready.',
  },
  {
    id: 'users',
    question: 'Where do I manage users?',
    answer:
      'Open a claim portal, then open the side menu and choose Users. Users is listed in the claim history menu, not on the Claim Portals hub. Search, filter by business, add a user, or create a business from an existing user from that screen.',
  },
  {
    id: 'profile',
    question: 'How do I sign out?',
    answer:
      'Open Profile from the avatar, the bottom tab, or the side menu, then tap Sign out. This clears your local session and returns you to portal selection.',
  },
];
