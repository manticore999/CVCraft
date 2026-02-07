import React, { useState, useEffect } from 'react';
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    importProjects,
    importFullPortfolio
} from '../services/api';

function ProjectsLibrary() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        technologies: '',
        date_range: '',
        category: 'project',
        bullets: ''
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const data = await getProjects();
            setProjects(data);
        } catch (error) {
            console.error('Error loading projects:', error);
            setMessage({ type: 'error', text: 'Failed to load projects' });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const response = await importProjects(file);
            setMessage({ type: 'success', text: response.message });
            await loadProjects();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to import projects'
            });
        }
    };

    const handlePortfolioImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const response = await importFullPortfolio(file);
            setMessage({ type: 'success', text: response.message });
            await loadProjects();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to import portfolio'
            });
        }
    };

    const openModal = (project = null) => {
        if (project) {
            setEditingProject(project);
            setFormData({
                title: project.title,
                description: project.description,
                technologies: project.technologies.join(', '),
                date_range: project.date_range,
                category: project.category,
                bullets: project.bullets.join('\n')
            });
        } else {
            setEditingProject(null);
            setFormData({
                title: '',
                description: '',
                technologies: '',
                date_range: '',
                category: 'project',
                bullets: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const projectData = {
            title: formData.title,
            description: formData.description,
            technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
            date_range: formData.date_range,
            category: formData.category,
            bullets: formData.bullets.split('\n').filter(Boolean)
        };

        try {
            if (editingProject) {
                await updateProject(editingProject.id, projectData);
                setMessage({ type: 'success', text: 'Project updated successfully' });
            } else {
                await createProject(projectData);
                setMessage({ type: 'success', text: 'Project created successfully' });
            }

            setShowModal(false);
            await loadProjects();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to save project'
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            await deleteProject(id);
            setMessage({ type: 'success', text: 'Project deleted successfully' });
            await loadProjects();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to delete project'
            });
        }
    };

    const categoryColors = {
        project: 'bg-blue-50 text-blue-700 border-blue-200',
        experience: 'bg-green-50 text-green-700 border-green-200',
        education: 'bg-purple-50 text-purple-700 border-purple-200',
        certification: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-semibold text-gray-800 mb-2">Projects Library</h2>
                    <p className="text-gray-600">
                        Manage your projects, experiences, education, and certifications
                    </p>
                </div>

                <div className="flex space-x-3">
                    <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition-colors border border-gray-300">
                        <input
                            type="file"
                            className="hidden"
                            accept=".json"
                            onChange={handlePortfolioImport}
                        />
                        Import Portfolio
                    </label>

                    <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition-colors border border-gray-300">
                        <input
                            type="file"
                            className="hidden"
                            accept=".json"
                            onChange={handleImport}
                        />
                        Import Items
                    </label>

                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
                    >
                        Add New
                    </button>
                </div>
            </div>

            {message.text && (
                <div
                    className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
                </div>
            ) : projects.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects yet</h3>
                    <p className="text-gray-600 mb-6">
                        Add your first project or import from a JSON file
                    </p>
                    <button
                        onClick={() => openModal()}
                        className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
                    >
                        Add Your First Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">{project.title}</h3>
                                    <p className="text-sm text-gray-500">{project.date_range}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-md text-xs font-medium border ${categoryColors[project.category]}`}>
                                    {project.category}
                                </span>
                            </div>

                            <p className="text-gray-600 mb-3">{project.description}</p>

                            {project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {project.technologies.map((tech, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-300"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {project.bullets.length > 0 && (
                                <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
                                    {project.bullets.map((bullet, idx) => (
                                        <li key={idx}>{bullet}</li>
                                    ))}
                                </ul>
                            )}

                            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                                <button
                                    onClick={() => openModal(project)}
                                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(project.id)}
                                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                            {editingProject ? 'Edit Project' : 'Add New Project'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                                    >
                                        <option value="project">Project</option>
                                        <option value="experience">Experience</option>
                                        <option value="education">Education</option>
                                        <option value="certification">Certification</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date Range *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., Jan 2024 - Mar 2024"
                                        value={formData.date_range}
                                        onChange={(e) => setFormData({ ...formData, date_range: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Technologies (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="React, Node.js, MongoDB"
                                    value={formData.technologies}
                                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bullet Points (one per line)
                                </label>
                                <textarea
                                    rows="4"
                                    placeholder="Built RESTful APIs&#10;Implemented authentication&#10;Optimized database queries"
                                    value={formData.bullets}
                                    onChange={(e) => setFormData({ ...formData, bullets: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
                                >
                                    {editingProject ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectsLibrary;
