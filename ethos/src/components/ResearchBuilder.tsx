import React, { useState, ChangeEvent } from 'react';

interface ResearchStructure {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  compensation: string;
  eligibility: string;
  researcher: {
    name: string;
    email: string;
  };
  phases: Phase[];
  requiredDocs: string[];
}

interface Phase {
  id: string;
  name: string;
  duration: string;
  description: string;
}

interface NewPhase {
  name: string;
  duration: string;
  description: string;
}

const ResearchBuilder: React.FC = () => {
  const [researchStructure, setResearchStructure] = useState<ResearchStructure>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    compensation: '',
    eligibility: '',
    researcher: {
      name: '',
      email: ''
    },
    phases: [],
    requiredDocs: []
  });

  const [newPhase, setNewPhase] = useState<NewPhase>({
    name: '',
    duration: '',
    description: ''
  });

  const [tempDocs, setTempDocs] = useState('');

  const handleBasicInfoChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('researcher.')) {
      const field = name.split('.')[1];
      setResearchStructure(prev => ({
        ...prev,
        researcher: {
          ...prev.researcher,
          [field]: value
        }
      }));
    } else {
      setResearchStructure(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addPhase = (): void => {
    if (!newPhase.name || !newPhase.duration) {
      alert('Please fill in all phase details');
      return;
    }

    setResearchStructure(prev => ({
      ...prev,
      phases: [...prev.phases, { 
        ...newPhase, 
        id: `phase_${Date.now()}` 
      }]
    }));

    setNewPhase({
      name: '',
      duration: '',
      description: ''
    });
  };

  const removePhase = (index: number): void => {
    setResearchStructure(prev => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index)
    }));
  };

  const handleDocsChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setTempDocs(e.target.value);
  };

  const handleDocsBlur = () => {
    setResearchStructure(prev => ({
      ...prev,
      requiredDocs: tempDocs.split('\n').filter(Boolean)
    }));
  };

  const generateJSON = (): void => {
    console.log('Research Structure:', researchStructure);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Research Study Builder</h2>
      </div>

      {/* Basic Information */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Study Title
          </label>
          <input
            type="text"
            name="title"
            value={researchStructure.title}
            onChange={handleBasicInfoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter study title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Study Description
          </label>
          <textarea
            name="description"
            value={researchStructure.description}
            onChange={handleBasicInfoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
            placeholder="Enter study description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={researchStructure.startDate}
              onChange={handleBasicInfoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={researchStructure.endDate}
              onChange={handleBasicInfoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Compensation Details
          </label>
          <input
            type="text"
            name="compensation"
            value={researchStructure.compensation}
            onChange={handleBasicInfoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., $50 per session, up to $300 total"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Eligibility Criteria
          </label>
          <textarea
            name="eligibility"
            value={researchStructure.eligibility}
            onChange={handleBasicInfoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
            placeholder="Enter eligibility requirements"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Researcher Name
            </label>
            <input
              type="text"
              name="researcher.name"
              value={researchStructure.researcher.name}
              onChange={handleBasicInfoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter researcher name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Researcher Email
            </label>
            <input
              type="email"
              name="researcher.email"
              value={researchStructure.researcher.email}
              onChange={handleBasicInfoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter researcher email"
            />
          </div>
        </div>
      </div>

      {/* Study Phases */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Study Phases</h3>
        <div className="space-y-2 mb-4">
          {researchStructure.phases.map((phase, index) => (
            <div 
              key={phase.id} 
              className="flex justify-between items-center p-3 bg-gray-50 border rounded-md"
            >
              <div>
                <span className="font-medium">{phase.name}</span>
                <span className="ml-2 text-sm text-gray-500">({phase.duration})</span>
              </div>
              <button
                onClick={() => removePhase(index)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Add New Phase */}
        <div className="border rounded-md p-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Phase</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phase Name
              </label>
              <input
                type="text"
                value={newPhase.name}
                onChange={(e) => setNewPhase(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Initial Assessment"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={newPhase.duration}
                onChange={(e) => setNewPhase(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 2 hours"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phase Description
              </label>
              <textarea
                value={newPhase.description}
                onChange={(e) => setNewPhase(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe what happens in this phase"
              />
            </div>
            <button
              onClick={addPhase}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add Phase
            </button>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Required Documents (one per line)
        </label>
        <textarea
          value={tempDocs}
          onChange={handleDocsChange}
          onBlur={handleDocsBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
          placeholder="Enter each required document on a new line"
        />
      </div>

      {/* Generate JSON Button */}
      <button
        onClick={generateJSON}
        className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Generate Study JSON
      </button>
    </div>
  );
};

export default ResearchBuilder;