const API_BASE_URL = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }

  // Handle empty responses (e.g., DELETE)
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),

  // Auth
  login: (username, password) => request('/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  register: (username, email, password) => request('/users', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  }),

  // Submissions
  submitAnswer: (userId, questionId, answerText) => request('/submissions', {
    method: 'POST',
    body: JSON.stringify({ userId, questionId, answerText }),
  }),
  getSubmissions: (userId) => request(`/submissions/user/${userId}`),
  getSubmission: (id) => request(`/submissions/${id}`),

  // Progress
  getProgress: (userId) => request(`/progress/${userId}`),
};

export default api;
