import { useState, useEffect } from 'react';

const FileAnalysisFeedback = ({ analysis, isAnalyzing, onComplete } : { analysis: any, isAnalyzing: any, onComplete: any }) => {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "Checking file integrity...",
    "Scanning for sensitive data...",
    "Analyzing data patterns...",
    "Validating data quality...",
    "Checking for anomalies..."
  ];
  
  useEffect(() => {
    if (isAnalyzing) {
      setShow(true);
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1000);
      return () => clearInterval(interval);
    } else if (analysis && analysis.isValid) {
      const timer = setTimeout(() => {
        setShow(false);
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, analysis, onComplete]);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0);
    }
  }, [isAnalyzing]);

  if (!show) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 my-4">
      {isAnalyzing ? (
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          
          <div className="space-y-1.5">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-2 ${
                  index <= currentStep ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {index <= currentStep ? (
                  <span className="text-blue-500">⦿</span>
                ) : (
                  <span>○</span>
                )}
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      ) : analysis ? (
        <div>
          {analysis.isValid ? (
            <div className="text-center space-y-2">
              <div className="text-green-500 text-xl">✓</div>
              <p className="text-gray-700">Analysis Complete!</p>
              {analysis.warnings?.length > 0 ? (
                <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                  Found {analysis.warnings.length} potential concern(s)
                </div>
              ) : (
                <p className="text-sm text-gray-500">No issues found</p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-red-500 text-xl">×</div>
              <p className="text-gray-700">Analysis Failed</p>
              <p className="text-sm text-red-600">{analysis.error}</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default FileAnalysisFeedback;