import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './components/Home';
import BaselineCV from './components/BaselineCV';
import ProjectsLibrary from './components/ProjectsLibrary';
import GenerateCV from './components/GenerateCV';
import History from './components/History';

function Navigation() {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/baseline', label: 'Baseline CV' },
        { path: '/projects', label: 'Projects Library' },
        { path: '/generate', label: 'Generate CV' },
        { path: '/history', label: 'History' },
    ];

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">CV</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">CVCraft</h1>
                    </div>

                    <div className="flex space-x-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${location.pathname === item.path
                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Navigation />

                <main className="container mx-auto px-6 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/baseline" element={<BaselineCV />} />
                        <Route path="/projects" element={<ProjectsLibrary />} />
                        <Route path="/generate" element={<GenerateCV />} />
                        <Route path="/history" element={<History />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
