import { FormStructure } from "../config/type";
import SurveyBuilder from "./SurveyBuilder";

interface ModalProps {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    onSubmit?: (formData: FormStructure) => void;
  }
  
  export const SurveyBuilderModal: React.FC<ModalProps> = ({
    showModal,
    setShowModal,
    onSubmit
  }) => {
    const handleSubmit = (formData: FormStructure) => {
      onSubmit?.(formData);
      setShowModal(false);
    };
  
    if (!showModal) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <SurveyBuilder 
            onSubmit={handleSubmit}
            onClose={() => setShowModal(false)}
          />
        </div>
      </div>
    );
  };
  