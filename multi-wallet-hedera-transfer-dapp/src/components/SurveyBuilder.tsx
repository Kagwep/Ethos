// SurveyBuilder.tsx
import React, { useState, ChangeEvent } from 'react';
import { FormStructure, FormField, NewField, FieldType } from '../config/type';

interface SurveyBuilderProps {
  onSubmit?: (formData: FormStructure) => void;
  onClose?: () => void;
}

const SurveyBuilder:  React.FC<SurveyBuilderProps> = ({ onSubmit, onClose }) => {
  const [formStructure, setFormStructure] = useState<FormStructure>({
    title: '',
    description: '',
    fields: []
  });

  const [newField, setNewField] = useState<NewField>({
    type: 'text',
    label: '',
    required: false,
    options: [],
    accept: ''
  });


  const [tempOptions, setTempOptions] = useState(newField.options ? newField.options.join('\n') : '');


  const addField = (): void => {
    if (!newField.label) {
      alert('Please add a label for the field');
      return;
    }

    setFormStructure((prev: { fields: any; }) => ({
      ...prev,
      fields: [...prev.fields, { 
        ...newField, 
        id: `field_${Date.now()}` 
      }]
    } as any));

    setNewField({
      type: 'text',
      label: '',
      required: false,
      options: []
    });
  };

  const removeField = (index: number): void => {
    setFormStructure((prev: { fields: any[]; }) => ({
      ...prev,
      fields: prev.fields.filter((_: any, i: number) => i !== index)
    } as any));
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormStructure((prev: any) => ({
      ...prev,
      title: e.target.value
    }));
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setFormStructure((prev: any) => ({
      ...prev,
      description: e.target.value
    }));
  };

  const handleFieldTypeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const type = e.target.value as FieldType;
    setNewField((prev: { options: any; }) => ({
      ...prev,
      type,
      options: type === 'text' ? [] : prev.options,
      accept: type === 'imageFile' ? 'image/*' : undefined
    } as any));
  };

  const handleFieldLabelChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewField((prev: any) => ({
      ...prev,
      label: e.target.value
    }));
  };

  const handleOptionsChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setTempOptions(e.target.value); // Track what the user is typing locally
  };
  
  const handleOptionsBlur = () => {
    setNewField(prev => ({
      ...prev,
      options: tempOptions.split('\n').filter(Boolean), // Update the actual state only on blur
    }));
  };
  
  const handleRequiredChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewField((prev: any) => ({
      ...prev,
      required: e.target.checked
    }));
  };



  const generateJSON = (): void => {
    console.log('Form Structure:', formStructure);
  };

  const handleSubmit = (): void => {
    if (!formStructure.title) {
      alert('Please add a title for the survey');
      return;
    }

    if (formStructure.fields.length === 0) {
      alert('Please add at least one field to the survey');
      return;
    }

    // Generate JSON and call onSubmit
    console.log('Form Structure:', formStructure);
    onSubmit?.(formStructure);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Survey Builder</h2>
      </div>

      {/* Form Title & Description */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Survey Title
          </label>
          <input
            type="text"
            value={formStructure.title}
            onChange={handleTitleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter survey title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Survey Description
          </label>
          <textarea
            value={formStructure.description}
            onChange={handleDescriptionChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
            placeholder="Enter survey description"
            
          />
        </div>
      </div>

      {/* Existing Fields */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Survey Fields</h3>
        <div className="space-y-2">
          {formStructure.fields.map((field: any, index: any) => (
            <div 
              key={field.id} 
              className="flex justify-between items-center p-3 bg-gray-50 border rounded-md"
            >
              <div>
                <span className="font-medium">{field.label}</span>
                <span className="ml-2 text-sm text-gray-500">({field.type})</span>
                {field.required && <span className="ml-2 text-red-500">*</span>}
              </div>
              <button
                onClick={() => removeField(index)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Field */}
      <div className="border rounded-md p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Field</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Type
            </label>
            <select
              value={newField.type}
              onChange={handleFieldTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Short Text</option>
              <option value="textarea">Long Text</option>
              <option value="number">Number</option>
              <option value="radio">Multiple Choice</option>
              <option value="checkbox">Checkboxes</option>
              <option value="select">Dropdown</option>
              <option value="imageFile">Image File</option>
            </select>
          </div>

          {newField.type === 'imageFile' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accepted File Types
                </label>
                <select
                  value={newField.accept || 'image/*'}
                  onChange={(e) => setNewField(prev => ({
                    ...prev,
                    accept: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="image/*">All Images</option>
                  <option value="image/jpeg,image/png">JPEG and PNG only</option>
                  <option value="image/png">PNG only</option>
                  <option value="image/jpeg">JPEG only</option>
                </select>
              </div>
            )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Label
            </label>
            <input
              type="text"
              value={newField.label}
              onChange={handleFieldLabelChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter field label"
            />
          </div>

          {['radio', 'checkbox', 'select'].includes(newField.type) && (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line)
                </label>
                <textarea
                value={tempOptions}  // Use local state for textarea input
                onChange={handleOptionsChange}  // Update local state while typing
                onBlur={handleOptionsBlur}  // Update the actual field state when the user finishes
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Enter each option on a new line"
                rows={4}
                />
            </div>
            )}


          <div className="flex items-center">
            <input
              type="checkbox"
              id="required-field"
              checked={newField.required}
              onChange={handleRequiredChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label 
              htmlFor="required-field" 
              className="ml-2 text-sm text-gray-700"
            >
              Required field
            </label>
          </div>

          <button
            onClick={addField}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Field
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Create Survey
        </button>
      </div>
    </div>
  );
};

export default SurveyBuilder;