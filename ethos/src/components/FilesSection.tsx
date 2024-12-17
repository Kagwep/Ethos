import React from 'react';

interface FileDisplay {
  name: string;
  type: string;
  url: string;
}

const FilePreview: React.FC<{ file: FileDisplay }> = ({ file }) => {
  // Helper function to determine if file is an image
  const isImage = (type: string) => type.startsWith('image/');
  
  // Helper function to determine if file is a video
  const isVideo = (type: string) => type.startsWith('video/');

  // Helper function to get file icon based on type
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'application/pdf':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'application/json':
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  if (isImage(file.type)) {
    return (
      <div className="relative group border rounded-lg overflow-hidden">
        <img 
          src={file.url} 
          alt={file.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm truncate">
          {file.name}
        </div>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 transition-opacity"
        >
          <span className="bg-white text-black px-3 py-1 rounded-full text-sm">View Full Size</span>
        </a>
      </div>
    );
  }

  if (isVideo(file.type)) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <video 
          controls 
          className="w-full"
          preload="metadata"
        >
          <source src={file.url} type={file.type} />
          Your browser does not support the video tag.
        </video>
        <div className="p-2 bg-gray-50">
          <p className="text-sm text-gray-600 truncate">{file.name}</p>
        </div>
      </div>
    );
  }

  // Default download button for other file types
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <a
        href={file.url}
        download={file.name}
        className="flex items-center space-x-3"
      >
        {getFileIcon(file.type)}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{file.type}</p>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </a>
    </div>
  );
};

// Usage in your FeedbackRespond component
const FilesSection: React.FC<{ files: FileDisplay[] }> = ({ files }) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-4">Related Files</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file, index) => (
          <FilePreview key={index} file={file} />
        ))}
      </div>
    </div>
  );
};

export default FilesSection;