import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ===== Baseline CV API =====

export const uploadBaselineCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/cv/baseline', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const getBaselineCV = async () => {
    const response = await api.get('/api/cv/baseline');
    return response.data;
};

// ===== Projects API =====

export const getProjects = async () => {
    const response = await api.get('/api/projects');
    return response.data;
};

export const getProject = async (id) => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
};

export const createProject = async (projectData) => {
    const response = await api.post('/api/projects', projectData);
    return response.data;
};

export const updateProject = async (id, projectData) => {
    const response = await api.put(`/api/projects/${id}`, projectData);
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
};

export const importProjects = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/projects/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

// ===== CV Generation API =====

export const generateCV = async (jobDescription, company, position, maxItems = 5, customInstructions = '') => {
    const response = await api.post('/api/cv/generate', {
        job_description: {
            text: jobDescription,
            company,
            position,
        },
        max_items: maxItems,
        custom_instructions: customInstructions || null,
    });

    return response.data;
};

export const getCVHistory = async () => {
    const response = await api.get('/api/cv/history');
    return response.data;
};

export const downloadGeneratedCV = async (jobId) => {
    const response = await api.get(`/api/cv/generated/${jobId}`, {
        responseType: 'blob',
    });

    return response.data;
};

export const getGeneratedCVContent = async (jobId) => {
    const response = await api.get(`/api/cv/generated/${jobId}/content`);
    return response.data;
};

// ===== Portfolio Import =====

export const importFullPortfolio = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/portfolio/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

// ===== Personal Info API =====

export const getPersonalInfo = async () => {
    const response = await api.get('/api/personal-info');
    return response.data;
};

export const savePersonalInfo = async (personalInfo) => {
    const response = await api.post('/api/personal-info', personalInfo);
    return response.data;
};

// ===== Skills API =====

export const getSkills = async () => {
    const response = await api.get('/api/skills');
    return response.data;
};

export const saveSkills = async (skills) => {
    const response = await api.post('/api/skills', skills);
    return response.data;
};

