export const queryKeys = {
  auth: {
    user: ['auth', 'user'],
    login: ['auth', 'login'],
  },
  tickets: {
    all: ['tickets'],
    detail: (id: number) => ['tickets', id],
    myTickets: ['tickets', 'mine'],
  },
  business: {
    nearby: ['business', 'nearby'],
    profile: (id: number) => ['business', id],
  },
} as const;
