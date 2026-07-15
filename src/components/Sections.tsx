// src/components/CourseForm/Sections.tsx
import React, { useState } from 'react';
import SectionItem from './SectionItem';
import toast from 'react-hot-toast';


interface SectionsProps {
  sections: any[];
  setSections: (sections: any[] | ((prev: any[]) => any[])) => void;
  sectionCoverPreviews: { [key: number]: string };
  setSectionCoverPreviews: (previews: { [key: number]: string } | ((prev: { [key: number]: string }) => { [key: number]: string })) => void;
  sectionCoverFiles: { [key: number]: File };
  setSectionCoverFiles: (files: { [key: number]: File } | ((prev: { [key: number]: File }) => { [key: number]: File })) => void;
}

const Sections: React.FC<SectionsProps> = ({
  sections,
  setSections,
  sectionCoverPreviews,
  setSectionCoverPreviews,
  sectionCoverFiles,
  setSectionCoverFiles
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  const handleAddSection = () => {
    const newSection = {
      id: Date.now(),
      title: 'New section',
      order: sections.length,
      content: {
        cover: '',
        summary: '',
        parts: [
          {
            title: 'Introduction',
            content: ''
          }
        ]
      }
    };
    
    setSections([...sections, newSection]);
    toast.success('Section added');
  };

  const handleRemoveSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    newSections.forEach((section, idx) => {
      section.order = idx;
    });
    setSections(newSections);
    
    // Clean up states
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    
    setSectionCoverPreviews((prev: any) => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
    
    setSectionCoverFiles((prev: any) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
  };

  const handleSectionChange = (index: number, field: string, value: any) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const handleSectionContentChange = (index: number, field: string, value: any) => {
    const newSections = [...sections];
    newSections[index].content[field] = value;
    setSections(newSections);
  };

  const toggleSection = (index: number) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-text-primary">Course sections</h3>
        <button
          type="button"
          onClick={handleAddSection}
          className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-md hover:from-[#B8860B] hover:to-[#D4AF37] transition-colors"
        >
          Add a section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-gray-800 rounded-md p-6 text-center">
          <p className="text-gray-600 dark:text-text-secondary">
            No section added. Click "Add a section" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <SectionItem
              key={section.id || sectionIndex}
              section={section}
              sectionIndex={sectionIndex}
              isCollapsed={collapsedSections.has(sectionIndex)}
              coverPreview={sectionCoverPreviews[sectionIndex]}
              onToggle={() => toggleSection(sectionIndex)}
              onRemove={() => handleRemoveSection(sectionIndex)}
              onChange={(field, value) => handleSectionChange(sectionIndex, field, value)}
              onContentChange={(field, value) => handleSectionContentChange(sectionIndex, field, value)}
              onCoverChange={(file, preview) => {
                setSectionCoverFiles((prev: any) => ({ ...prev, [sectionIndex]: file }));
                setSectionCoverPreviews((prev: any) => ({ ...prev, [sectionIndex]: preview }));
              }}
              onCoverRemove={() => {
                setSectionCoverFiles((prev: any) => {
                  const newFiles = { ...prev };
                  delete newFiles[sectionIndex];
                  return newFiles;
                });
                setSectionCoverPreviews((prev: any) => {
                  const newPreviews = { ...prev };
                  delete newPreviews[sectionIndex];
                  return newPreviews;
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Sections;