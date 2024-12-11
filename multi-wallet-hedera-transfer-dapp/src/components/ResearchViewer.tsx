import React, { useState, FormEvent } from 'react';

interface ResearchStudy {
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
  phases: {
    id: string;
    name: string;
    duration: string;
    description: string;
  }[];
  requiredDocs: string[];
}

interface ResearchViewerProps {
  studyStructure: ResearchStudy;
  onApply: (application: ResearchApplication) => void;
}

interface ResearchApplication {
  studyId: string;
  applicant: {
    name: string;
    email: string;
    phone: string;
  };
  eligibilityResponses: { [key: string]: boolean };
  availabilityNotes: string;
  submitDate: string;
}

const ResearchViewer: React.FC<ResearchViewerProps> = ({ studyStructure, onApply }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [application, setApplication] = useState<Partial<ResearchApplication>>({
    applicant: {
      name: '',
      email: '',
      phone: ''
    },
    eligibilityResponses: {},
    availabilityNotes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleApply = (e: FormEvent) => {
    e.preventDefault();
    
    const formattedApplication: ResearchApplication = {
      studyId: studyStructure.title.toLowerCase().replace(/\s+/g, '-'),
      applicant: application.applicant!,
      eligibilityResponses: application.eligibilityResponses!,
      availabilityNotes: application.availabilityNotes!,
      submitDate: new Date().toISOString()
    };

    onApply(formattedApplication);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-green-50 rounded-lg">
        <h3 className="text-xl font-medium text-green-800 mb-2">Application Submitted!</h3>
        <p className="text-green-700">Thank you for your interest. The research team will contact you soon.</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setIsApplying(false);
          }}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Back to Study Details
        </button>
      </div>
    );
  }

  if (isApplying) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply for Research Study</h2>
        <p className="text-gray-600 mb-6">{studyStructure.title}</p>

        <form onSubmit={handleApply} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={application.applicant?.name || ''}
                onChange={(e) => setApplication(prev => ({
                  ...prev,
                  applicant: { ...prev.applicant!, name: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={application.applicant?.email || ''}
                onChange={(e) => setApplication(prev => ({
                  ...prev,
                  applicant: { ...prev.applicant!, email: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={application.applicant?.phone || ''}
                onChange={(e) => setApplication(prev => ({
                  ...prev,
                  applicant: { ...prev.applicant!, phone: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Eligibility Confirmation</h3>
            <div className="space-y-2">
              {studyStructure.eligibility.split('\n').map((criterion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id={`eligibility-${index}`}
                    checked={application.eligibilityResponses?.[`criterion-${index}`] || false}
                    onChange={(e) => setApplication(prev => ({
                      ...prev,
                      eligibilityResponses: {
                        ...prev.eligibilityResponses,
                        [`criterion-${index}`]: e.target.checked
                      }
                    }))}
                    className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                  <label 
                    htmlFor={`eligibility-${index}`}
                    className="text-sm text-gray-700"
                  >
                    I confirm that: {criterion}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability Notes
            </label>
            <textarea
              value={application.availabilityNotes || ''}
              onChange={(e) => setApplication(prev => ({
                ...prev,
                availabilityNotes: e.target.value
              }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Please share your general availability for participating in this study..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsApplying(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{studyStructure.title}</h2>
      <p className="text-gray-600 mb-6">{studyStructure.description}</p>

      <div className="space-y-6">
        {/* Timeline */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Study Timeline</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{new Date(studyStructure.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{new Date(studyStructure.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Phases */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Study Phases</h3>
          <div className="space-y-3">
            {studyStructure.phases.map((phase, index) => (
              <div key={phase.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Phase {index + 1}: {phase.name}</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    {phase.duration}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Required Documents */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Required Documents</h3>
          <ul className="list-disc list-inside space-y-1">
            {studyStructure.requiredDocs.map((doc, index) => (
              <li key={index} className="text-gray-600">{doc}</li>
            ))}
          </ul>
        </div>

        {/* Eligibility */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Eligibility Criteria</h3>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-line">{studyStructure.eligibility}</p>
          </div>
        </div>

        {/* Compensation */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Compensation</h3>
          <p className="text-green-600 font-medium">{studyStructure.compensation}</p>
        </div>

        {/* Researcher Info */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Research Team</h3>
          <div className="flex items-center gap-4">
            <div>
              <p className="font-medium">{studyStructure.researcher.name}</p>
              <p className="text-gray-600">{studyStructure.researcher.email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsApplying(true)}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 mt-6"
        >
          Apply for This Study
        </button>
      </div>
    </div>
  );
};

export default ResearchViewer;