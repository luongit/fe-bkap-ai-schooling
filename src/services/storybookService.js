// src/services/storybookService.js
import api from "./apiToken";

/**
 * Storybook API Service
 * CHỈ gọi backend, không xử lý logic
 */

const BASE = "/storybooks";

const storybookService = {
  // CREATE DRAFT
  createDraft(data) {
    return api.post(BASE, data).then(res => res.data);
  },

  // GENERATE (ASYNC)
  generate(storybookId) {
    return api
      .post(`${BASE}/${storybookId}/generate`)
      .then(res => res.data);
  },

  // CHECK STATUS
  getStatus(storybookId) {
    return api
      .get(`${BASE}/${storybookId}/status`)
      .then(res => res.data);
  },

  // GET STORYBOOK DETAIL
  getById(storybookId) {
    return api
      .get(`${BASE}/${storybookId}`)
      .then(res => res.data);
  },

  // GET PAGES
  getPages(storybookId) {
    return api
      .get(`${BASE}/${storybookId}/pages`)
      .then(res => res.data);
  },

  // GET MY STORYBOOKS (sau này dùng)
  getMyStorybooks() {
    return api.get(`${BASE}/me`).then(res => res.data);
  },

  // EXPORT PDF
  exportPdf(storybookId) {
    return api
      .post(`${BASE}/${storybookId}/export/pdf`)
      .then(res => res.data); // BE trả string URL
  },
};

export default storybookService;
