import React from 'react';

function Home() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">CV</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">CVCraft</h1>
                        <p className="text-sm text-blue-600 font-medium">AI-Powered CV Tailoring</p>
                    </div>
                </div>
                <p className="text-lg text-gray-600">
                    Craft perfect, ATS-friendly CVs tailored to any job description using AI
                </p>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">How It Works</h2>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                            1
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Baseline CV</h3>
                            <p className="text-gray-600">
                                Upload your master LaTeX CV (.tex file). The AI automatically extracts your projects, experiences,
                                education, and certifications to build your initial library. This serves as the foundation for all generated CVs.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                            2
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Your Library</h3>
                            <p className="text-gray-600">
                                Your data is automatically extracted from the baseline CV. You can then add more items through the UI,
                                or bulk import your entire portfolio using JSON. Smart deduplication prevents duplicates when importing multiple sources.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                            3
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Tailored CV</h3>
                            <p className="text-gray-600">
                                Paste a job description, and our AI will analyze it to select the most relevant experiences
                                and generate an ATS-friendly, customized CV in LaTeX format.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                            4
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Track Your Applications</h3>
                            <p className="text-gray-600">
                                View your CV generation history, download previously generated CVs, and keep track of which
                                version you sent to each company.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Portfolio Upload */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Bulk Portfolio Upload</h2>

                <p className="text-gray-600 mb-4">
                    You can upload your entire portfolio at once using a JSON file. This is faster than adding items individually
                    and perfect for importing data from other systems or backing up your portfolio.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Complete Portfolio JSON Structure</h4>
                    <pre className="text-xs font-mono text-gray-700 overflow-x-auto">
                        {`{
  "personal_info": {
    "name": "John Doe",
    "title": "Full-Stack Developer",
    "email": "john@example.com",
    "phone": "+1 234 567 8900",
    "location": "San Francisco, CA",
    "bio": "Passionate developer with 5+ years experience",
    "website": "https://johndoe.com",
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  },
  "projects": [
    {
      "title": "E-commerce Platform",
      "description": "Full-stack web application",
      "technologies": ["React", "Node.js", "MongoDB"],
      "date_range": "Jan 2023 - Mar 2023",
      "category": "project",
      "bullets": [
        "Built responsive frontend using React",
        "Integrated payment processing with Stripe"
      ]
    }
  ],
  "experience": [
    {
      "title": "Senior Software Engineer",
      "description": "Tech Company Inc.",
      "technologies": ["Python", "Django", "AWS"],
      "date_range": "Jan 2021 - Present",
      "category": "experience",
      "bullets": [
        "Led team of 5 developers",
        "Reduced server costs by 40%"
      ]
    }
  ],
  "education": [
    {
      "title": "B.S. Computer Science",
      "description": "University of California",
      "technologies": [],
      "date_range": "2015 - 2019",
      "category": "education",
      "bullets": ["GPA: 3.8/4.0", "Dean's List"]
    }
  ],
  "certifications": [
    {
      "title": "AWS Certified Solutions Architect",
      "description": "Amazon Web Services",
      "technologies": ["AWS", "Cloud"],
      "date_range": "2022",
      "category": "certification",
      "bullets": []
    }
  ],
  "skills": ["JavaScript", "Python", "React", "Node.js"]
}`}
                    </pre>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex gap-3">
                        <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h5 className="font-medium text-amber-900 mb-1">Important</h5>
                            <p className="text-sm text-amber-800">
                                When uploading a JSON file, make sure it follows this exact structure. All items in the arrays
                                must include the required fields: title, description, technologies, date_range, category, and bullets.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Format Guide */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Individual Project Format</h2>

                <p className="text-gray-600 mb-6">
                    When adding projects individually through the UI, use the following structure:
                </p>

                <div className="space-y-4 mb-6">
                    <div className="border-l-4 border-gray-300 pl-4">
                        <h4 className="font-medium text-gray-900 mb-1">Title</h4>
                        <p className="text-sm text-gray-600">The name of your project or position</p>
                        <p className="text-sm text-gray-500 mt-1">Example: "Full-Stack E-commerce Platform" or "Senior Software Engineer"</p>
                    </div>

                    <div className="border-l-4 border-gray-300 pl-4">
                        <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                        <p className="text-sm text-gray-600">A brief overview of the project or role</p>
                        <p className="text-sm text-gray-500 mt-1">Example: "Developed a scalable e-commerce platform serving 10k+ users"</p>
                    </div>

                    <div className="border-l-4 border-gray-300 pl-4">
                        <h4 className="font-medium text-gray-900 mb-1">Technologies</h4>
                        <p className="text-sm text-gray-600">List of technologies, frameworks, and tools used</p>
                        <p className="text-sm text-gray-500 mt-1">Example: React, Node.js, PostgreSQL, AWS, Docker</p>
                    </div>

                    <div className="border-l-4 border-gray-300 pl-4">
                        <h4 className="font-medium text-gray-900 mb-1">Date Range</h4>
                        <p className="text-sm text-gray-600">When the project was active or the duration of employment</p>
                        <p className="text-sm text-gray-500 mt-1">Example: "Jan 2023 - Present" or "Summer 2022"</p>
                    </div>

                    <div className="border-l-4 border-gray-300 pl-4">
                        <h4 className="font-medium text-gray-900 mb-1">Category</h4>
                        <p className="text-sm text-gray-600">Type of entry: Project, Experience, Education, or Certification</p>
                    </div>

                    <div className="border-l-4 border-gray-300 pl-4">
                        <h4 className="font-medium text-gray-900 mb-1">Bullets</h4>
                        <p className="text-sm text-gray-600">Key achievements and responsibilities in bullet point format</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Example:<br />
                            • Implemented RESTful APIs reducing response time by 40%<br />
                            • Led team of 5 developers in agile environment
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">JSON Format Example</h4>
                    <pre className="text-xs font-mono text-gray-700 overflow-x-auto">
                        {`{
  "title": "E-commerce Platform",
  "description": "Full-stack web application with payment integration",
  "technologies": ["React", "Node.js", "MongoDB", "Stripe"],
  "date_range": "Jan 2023 - Mar 2023",
  "category": "project",
  "bullets": [
    "Built responsive frontend using React and Tailwind CSS",
    "Integrated Stripe payment processing with 99.9% uptime",
    "Implemented JWT authentication and role-based access control"
  ]
}`}
                    </pre>
                </div>
            </div>

            {/* Baseline CV Format */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Baseline CV Format</h2>

                <p className="text-gray-600 mb-4">
                    Your baseline CV should be a LaTeX (.tex) file. This file serves as the template structure and styling
                    for all generated CVs. The AI will use your baseline as a foundation and intelligently insert the most
                    relevant projects based on the job description.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Requirements</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Must be a valid LaTeX document (.tex extension)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Should include your personal information and contact details</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Can include your preferred CV styling and formatting</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Should be compilable with standard LaTeX distributions</span>
                        </li>
                    </ul>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-3">
                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h5 className="font-medium text-blue-900 mb-1">Pro Tip</h5>
                            <p className="text-sm text-blue-800">
                                The AI will preserve your baseline CV's structure and styling while inserting the most relevant
                                projects from your library. Make sure your baseline reflects your preferred professional style.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
