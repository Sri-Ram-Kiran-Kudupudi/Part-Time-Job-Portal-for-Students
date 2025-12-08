// src/service/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
});

// Attach Authorization Token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const loginUser = (email, password) =>
  API.post("/api/auth/login", { email, password });

export const registerUser = (formData) =>
  API.post("/api/auth/register", formData);

// ⭐ UPDATE USER (all roles)
export const updateUser = (id, data) =>
  API.put(`/api/user/${id}`, data);

// ⭐ UPDATE APPLICANT (seeker only)
export const updateApplicant = (id, data) =>
  API.put(`/api/applicant/${id}`, data);

// PROVIDER JOB CRUD
export const createJob = (jobData) => API.post("/api/provider/jobs", jobData);
export const getProviderJobs = () => API.get("/api/provider/jobs");
export const getProviderJobById = (jobId) => API.get(`/api/provider/job/${jobId}`);
export const updateProviderJob = (jobId, jobData) => API.put(`/api/provider/job/${jobId}`, jobData);
export const deleteProviderJob = (jobId) => API.delete(`/api/provider/job/${jobId}`);



// APPLICANT
export const getApplicantById = (id) => API.get(`/api/applicant/${id}`);

// JOBS FOR SEEKER
export const getAllJobs = (params) => API.get("/api/jobs", { params });
export const getJobById = (jobId) => API.get(`/api/jobs/${jobId}`);

// APPLY
export const applyJob = (jobId, data) =>
  API.post(`/api/jobs/${jobId}/apply`, data);

// APPLIED JOBS
export const getAppliedJobs = () => API.get("/api/jobs/applied");
export const deleteApplication = (id) =>
  API.delete(`/api/jobs/applications/${id}`);

// SAVE / UNSAVE JOB
export const saveJob = (jobId) => API.post(`/api/jobs/${jobId}/save`);
export const unsaveJob = (jobId) => API.delete(`/api/jobs/${jobId}/save`);

// PROVIDER ACCEPT / REJECT
export const providerAccept = (id) =>
  API.put(`/api/jobs/applications/${id}/accept`);
export const providerReject = (id) =>
  API.put(`/api/jobs/applications/${id}/reject`);

// ADMIN — SEEKERS
export const getAllSeekers = () => API.get("/api/admin/seekers");
export const deleteSeeker = (id) => API.delete(`/api/admin/seekers/${id}`);

// ADMIN — PROVIDERS
export const getAllProviders = () => API.get("/api/admin/providers");
export const deleteProvider = (id) => API.delete(`/api/admin/providers/${id}`);

// ADMIN — APPLICATION RECORDS
export const getAllApplicationRecords = () =>
  API.get("/api/admin/applications");



export default API;
