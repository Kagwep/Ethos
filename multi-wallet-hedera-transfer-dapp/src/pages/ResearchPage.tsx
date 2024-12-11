import React, { useState } from 'react';
import { PlusCircle, Pencil, Trash2, Users, ArrowRight, Clock, FileText, Calendar, Mail, Download, Upload, CheckCircle2 } from 'lucide-react';

interface Study {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  compensation: string;
  eligibility: string;
  phases: {
    name: string;
    status: 'upcoming' | 'active' | 'completed';
    duration: string;
  }[];
  requiredDocs: string[];
  researcher: {
    name: string;
    email: string;
  };
  isActive: boolean;
}

const ResearchPage = () => {
  const [activeTab, setActiveTab] = useState('participate');
  const [showModal, setShowModal] = useState(false);
  const [studies, setStudies] = useState<Study[]>([
    {
      id: 1,
      title: "Impact of Sleep Patterns on Cognitive Performance",
      description: "A 3-month study examining how different sleep patterns affect cognitive abilities and decision-making processes.",
      startDate: "2024-03-01",
      endDate: "2024-06-01",
      participantCount: 45,
      compensation: "$50 per session, up to $300 total",
      eligibility: "Adults 25-45, no sleep disorders, regular work schedule",
      phases: [
        { name: "Initial Assessment", status: 'completed', duration: "2 hours" },
        { name: "Sleep Monitoring", status: 'active', duration: "8 weeks" },
        { name: "Final Evaluation", status: 'upcoming', duration: "2 hours" }
      ],
      requiredDocs: ["Consent Form", "Medical History", "Sleep Log Template"],
      researcher: {
        name: "Dr. Sarah Chen",
        email: "s.chen@research.org"
      },
      isActive: true
    },
    {
      id: 2,
      title: "Remote Work Productivity Analysis",
      description: "Investigating the impact of remote work environments on team collaboration and individual productivity.",
      startDate: "2024-04-01",
      endDate: "2024-08-01",
      participantCount: 120,
      compensation: "$200 upon completion",
      eligibility: "Full-time remote workers, minimum 1 year experience",
      phases: [
        { name: "Survey", status: 'active', duration: "30 minutes" },
        { name: "Activity Tracking", status: 'upcoming', duration: "4 weeks" },
        { name: "Follow-up Interview", status: 'upcoming', duration: "1 hour" }
      ],
      requiredDocs: ["Participant Agreement", "Work Pattern Questionnaire"],
      researcher: {
        name: "Prof. James Wilson",
        email: "j.wilson@research.org"
      },
      isActive: true
    }
  ]);

  const handleDelete = (id: number) => {
    setStudies(studies.filter(study => study.id !== id));
  };

  console.log(showModal)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'upcoming': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const AdminView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Research Studies</h1>
          <p className="text-gray-600">Manage your research studies and participants</p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Study
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {studies.map((study) => (
          <div key={study.id} className="border rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold">{study.title}</h3>
              <p className="text-gray-600 mt-1">{study.description}</p>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Timeline</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(study.startDate).toLocaleDateString()} - 
                    {new Date(study.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Participants</h4>
                  <p className="text-sm text-gray-600">{study.participantCount} enrolled</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Study Phases</h4>
                <div className="space-y-2">
                  {study.phases.map((phase, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{phase.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(phase.status)}`}>
                        {phase.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50">
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button 
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
                onClick={() => handleDelete(study.id)}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ParticipantView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-700">Available Studies</h1>
        <p className="text-green-600">Participate in ongoing research studies</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {studies.filter(study => study.isActive).map((study) => (
          <div key={study.id} className="border border-green-200 rounded-lg shadow-sm overflow-hidden transition-colors hover:border-green-400">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-green-700">{study.title}</h3>
              <p className="text-gray-600 mt-1">{study.description}</p>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Timeline</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(study.startDate).toLocaleDateString()} - 
                      {new Date(study.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Required Documents</h4>
                    <p className="text-sm text-gray-600">
                      {study.requiredDocs.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Time Commitment</h4>
                    <p className="text-sm text-gray-600">
                      {study.phases.map(phase => phase.duration).join(" + ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Contact Researcher</h4>
                    <p className="text-sm text-gray-600">
                      {study.researcher.name} - {study.researcher.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Eligibility</h4>
                    <p className="text-sm text-gray-600">{study.eligibility}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Compensation</h4>
                    <p className="text-sm text-green-600 font-medium">{study.compensation}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-green-100 space-y-3">
              <div className="flex gap-2">
                <button className="flex-1 py-2 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Forms
                </button>
                <button className="flex-1 py-2 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  Submit Forms
                </button>
              </div>
              <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                Express Interest
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('participate')}
              className={`px-4 py-2 -mb-px font-medium ${
                activeTab === 'participate'
                  ? 'border-b-2 border-green-600 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Participate
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 -mb-px font-medium ${
                activeTab === 'manage'
                  ? 'border-b-2 border-green-600 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Studies
            </button>
          </div>
        </div>

        {activeTab === 'participate' ? <ParticipantView /> : <AdminView />}
      </div>
      </div>
    </div>
  );
};

export default ResearchPage;