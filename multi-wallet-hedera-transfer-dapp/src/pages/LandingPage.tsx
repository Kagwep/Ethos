import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { Database, Brain, Shield, LucideIcon } from 'lucide-react';

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ProcessStepProps {
  step: string;
  title: string;
  description: string;
}

interface StepData {
  step: string;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ icon: Icon, title, description }) => (
  <div className="group h-full p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-blue-100">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-4 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
        <Icon className="w-8 h-8 text-blue-600/80 group-hover:text-blue-600 transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600 leading-relaxed">
      {description}
    </p>
  </div>
);

const ProcessStep: React.FC<ProcessStepProps> = ({ step, title, description }) => (
  <div className="group text-center">
    <div className="relative mb-4">
      <span className="block text-6xl font-bold text-blue-100 transition-colors duration-300 group-hover:text-blue-200">
        {step}
      </span>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-2xl font-bold text-blue-600">{step}</span>
      </div>
    </div>
    <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600 max-w-[80%] mx-auto leading-relaxed">
      {description}
    </p>
  </div>
);

const FEATURE_DATA: FeatureProps[] = [
  {
    icon: Database,
    title: "Data Provision",
    description: "Securely upload and manage your raw data with Hedera's decentralized storage solutions."
  },
  {
    icon: Brain,
    title: "AI Processing",
    description: "Transform unstructured data into actionable insights using advanced AI algorithms."
  },
  {
    icon: Shield,
    title: "Verified Results",
    description: "Ensure data integrity and traceability through Hedera's secure ledger."
  }
];

const PROCESS_STEPS: StepData[] = [
  { step: "1", title: "Connect Wallet", description: "Link your Hedera wallet to get started" },
  { step: "2", title: "Upload Data", description: "Provide your raw data through our secure interface" },
  { step: "3", title: "Process & Verify", description: "AI processes your data with verifiable results" },
  { step: "4", title: "Access Insights", description: "View and export your verified insights" }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { accountId } = useWalletInterface();

  const handleGetStarted = (): void => {
    navigate('/provision');
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50/80 to-white pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent leading-tight">
                Transform Data with AI on Hedera
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Secure, verifiable insights powered by AI and decentralized technology
              </p>
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </button>
            </div>
            <div>
              <img
                src="https://res.cloudinary.com/dydj8hnhz/image/upload/v1733658724/wptizmdd0v9w5bbdpa8y.webp"
                alt="Data Analytics"
                className="w-full rounded-2xl shadow-2xl transform transition-all duration-500
                         hover:shadow-blue-200/50 hover:-translate-y-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURE_DATA.map((feature, index) => (
              <Feature
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gray-50 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <ProcessStep
                key={index}
                step={step.step}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Ready to transform your data?
          </h2>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold 
                     hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;