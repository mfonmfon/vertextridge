import { request } from './api';

export const onboardingService = {
  submit: async (onboardingData) => {
    return request('/onboarding/submit', {
      method: 'POST',
      body: onboardingData,
    });
  },

  getProfile: async (userId) => {
    return request(`/onboarding/profile/${userId}`, {
      method: 'GET',
    });
  },
};
