const API_BASE = "http://localhost:5000";

const API_ENDPOINTS = {
	LOGIN: `${API_BASE}/auth/login`,
	REGISTER: `${API_BASE}/auth/register`,
	PROBLEM: `${API_BASE}/problems/?id=`,
	PROBLEMS: `${API_BASE}/problems`,
	SUBMIT: `${API_BASE}/submissions/submit`,
	EXECUTE: `${API_BASE}/execute/`,
};

export { API_BASE, API_ENDPOINTS };
