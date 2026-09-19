import axios from 'axios';

const API_BASE = '/api';

export async function checkBackendHealth() {
  try {
    const res = await axios.get(`${API_BASE}/test-pypi`, { timeout: 4000 });
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function auditRequirements(requirementsText) {
  const res = await axios.post(`${API_BASE}/audit`, {
    requirements: requirementsText
  });
  return res.data;
}

export async function auditLatexFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_BASE}/audit-latex`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}
