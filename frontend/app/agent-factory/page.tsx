"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  role: string;
}

export default function AgentFactoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // Form states
  const [factoryType, setFactoryType] = useState('courseforge');
  const [task, setTask] = useState('');
  
  // CourseForge specific
  const [courseTopic, setCourseTopic] = useState('');
  const [courseLevel, setCourseLevel] = useState('intermediate');
  const [courseDuration, setCourseDuration] = useState('8 weeks');
  
  // Blog specific
  const [blogTopic, setBlogTopic] = useState('');
  const [blogStyle, setBlogStyle] = useState('engaging');
  const [blogWordCount, setBlogWordCount] = useState('1000');
  
  // Social Media specific
  const [socialPlatform, setSocialPlatform] = useState('twitter');
  const [socialTopic, setSocialTopic] = useState('');
  
  // Tech specific
  const [techProblem, setTechProblem] = useState('');
  const [techTechnology, setTechTechnology] = useState('Python');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
      } else {
        router.push('/auth/signin');
      }
    } catch (err) {
      router.push('/auth/signin');
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      let endpoint = '/api/agent/execute';
      let body: any = { factoryType, task };

      // Use specialized endpoints for specific factories
      if (factoryType === 'courseforge' && courseTopic) {
        endpoint = '/api/agent/courseforge';
        body = { topic: courseTopic, level: courseLevel, duration: courseDuration };
      } else if (factoryType === 'blog' && blogTopic) {
        endpoint = '/api/agent/blog';
        body = { topic: blogTopic, style: blogStyle, wordCount: blogWordCount };
      } else if (factoryType === 'social' && socialTopic) {
        endpoint = '/api/agent/social';
        body = { platform: socialPlatform, topic: socialTopic };
      } else if (factoryType === 'tech' && techProblem) {
        endpoint = '/api/agent/tech';
        body = { problem: techProblem, technology: techTechnology };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.result || data.courseOutline || data.blogPost || data.socialContent || data.solution || 'Task completed successfully');
      } else {
        setError(data.error || 'Failed to execute task');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">← Back to Dashboard</a>
              <h1 className="text-xl font-semibold text-gray-900">🏭 Ultimate Agent Workforce</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Factory Type Selection */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-bold mb-4">Select Factory Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: 'courseforge', label: '🎓 CourseForge', desc: 'Educational content' },
                { value: 'blog', label: '📝 Blog Factory', desc: 'Blog posts & articles' },
                { value: 'social', label: '📱 Social Media', desc: 'Social content' },
                { value: 'app', label: '💻 App Factory', desc: 'Application prototypes' },
                { value: 'bot', label: '🤖 Bot Factory', desc: 'Chatbot creation' },
                { value: 'content', label: '📅 Content Calendar', desc: 'Content planning' },
                { value: 'tech', label: '🔧 Tech Factory', desc: 'Technical solutions' },
              ].map((factory) => (
                <button
                  key={factory.value}
                  onClick={() => setFactoryType(factory.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    factoryType === factory.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold">{factory.label}</div>
                  <div className="text-sm text-gray-600">{factory.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Factory-Specific Forms */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Configure Task</h2>
            
            {factoryType === 'courseforge' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Topic</label>
                  <input
                    type="text"
                    value={courseTopic}
                    onChange={(e) => setCourseTopic(e.target.value)}
                    placeholder="e.g., Python Programming, Data Science, Web Development"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                    <select
                      value={courseLevel}
                      onChange={(e) => setCourseLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={courseDuration}
                      onChange={(e) => setCourseDuration(e.target.value)}
                      placeholder="e.g., 8 weeks, 3 months"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}

            {factoryType === 'blog' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blog Topic</label>
                  <input
                    type="text"
                    value={blogTopic}
                    onChange={(e) => setBlogTopic(e.target.value)}
                    placeholder="e.g., AI in Education, Future of Work, Sustainable Living"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                    <select
                      value={blogStyle}
                      onChange={(e) => setBlogStyle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="engaging">Engaging</option>
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Word Count</label>
                    <input
                      type="text"
                      value={blogWordCount}
                      onChange={(e) => setBlogWordCount(e.target.value)}
                      placeholder="e.g., 1000, 1500, 2000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}

            {factoryType === 'social' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                  <select
                    value={socialPlatform}
                    onChange={(e) => setSocialPlatform(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic/Campaign</label>
                  <input
                    type="text"
                    value={socialTopic}
                    onChange={(e) => setSocialTopic(e.target.value)}
                    placeholder="e.g., Product launch, Brand awareness, Event promotion"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}

            {factoryType === 'tech' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Problem Description</label>
                  <textarea
                    value={techProblem}
                    onChange={(e) => setTechProblem(e.target.value)}
                    placeholder="Describe the technical problem you need to solve..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Technology/Language</label>
                  <input
                    type="text"
                    value={techTechnology}
                    onChange={(e) => setTechTechnology(e.target.value)}
                    placeholder="e.g., Python, JavaScript, React, Node.js"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}

            {['app', 'bot', 'content'].includes(factoryType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Description</label>
                <textarea
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Describe what you want the agent to create..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}

            <button
              onClick={handleExecute}
              disabled={loading}
              className="mt-4 w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? '🔄 Processing...' : '🚀 Execute Task'}
            </button>
          </div>

          {/* Results */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">✅ Result</h2>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}