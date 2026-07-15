// src/components/CourseSections.tsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Section } from '../utils/typeDef';
import { getImageUrl } from '../utils/imageUtils';

interface CourseSectionsProps {
  sections: Section[];
}

const CourseSections: React.FC<CourseSectionsProps> = ({ sections }) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0]) // First section open by default
  );
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const togglePart = (sectionIndex: number, partIndex: number) => {
    const key = `${sectionIndex}-${partIndex}`;
    setExpandedParts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-bg-secondary rounded-lg border border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-text-tertiary">No section available for this course.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6"
        style={{
          background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
        Course content
      </h2>

      {sections.map((section, sectionIndex) => {
        const isSectionExpanded = expandedSections.has(sectionIndex);

        return (
          <div
            key={section.id}
            className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-bg-secondary transition-all duration-200 hover:shadow-md hover:border-amber-500 dark:hover:border-amber-500"
          >
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggleSection(sectionIndex)}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10 dark:from-[#D4AF37]/20 dark:to-[#FFD700]/20 hover:from-[#D4AF37]/20 hover:to-[#FFD700]/20 dark:hover:from-[#D4AF37]/30 dark:hover:to-[#FFD700]/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                    {sectionIndex + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary text-left">
                    {section.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  {section.content?.parts && (
                    <span className="text-xs bg-gradient-to-r from-[#D4AF37]/20 to-[#FFD700]/20 dark:from-[#D4AF37]/30 dark:to-[#FFD700]/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full font-medium border border-[#D4AF37]/30 dark:border-[#D4AF37]/50">
                      {section.content.parts.length} part{section.content.parts.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {isSectionExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-600 dark:text-text-secondary" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-600 dark:text-text-secondary" />
                  )}
                </div>
              </div>
            </button>

            {/* Section content */}
            {isSectionExpanded && (
              <div className="p-6 animate-in">
                {/* Cover image */}
                {section.content?.cover && (
                  <div className="mb-6 rounded-lg overflow-hidden shadow-md">
                    <img
                      src={getImageUrl(section.content.cover)}
                      alt={section.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Summary */}
                {section.content?.summary && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-[#D4AF37]/5 to-[#FFD700]/5 dark:from-[#D4AF37]/10 dark:to-[#FFD700]/10 rounded-lg border-l-4 border-[#D4AF37]">
                    <h4 className="text-sm font-semibold mb-3 flex items-center"
                      style={{
                        background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                      <span className="w-6 h-6 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black rounded-full flex items-center justify-center text-xs mr-2">
                        i
                      </span>
                      Summary
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-text-secondary">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {section.content.summary}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Media Files */}
                {section.content?.media && section.content.media.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-text-primary mb-3">
                      Media Content
                    </h4>
                    {section.content.media.map((media, mediaIndex) => (
                      <div key={mediaIndex} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-bg-tertiary p-4">
                        {media.type === 'VIDEO' ? (
                          <video 
                            controls 
                            className="w-full rounded-lg bg-black"
                            controlsList="nodownload"
                          >
                            <source src={media.url} type="video/mp4" />
                            Your browser does not support video playback
                          </video>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 mb-2">Audio file</p>
                              <audio 
                                controls 
                                className="w-full"
                                controlsList="nodownload"
                              >
                                <source src={media.url} type="audio/mpeg" />
                                Your browser does not support audio playback
                              </audio>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Parts */}
                {section.content?.parts && section.content.parts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-text-primary mb-3">
                      Detailed content
                    </h4>
                    {section.content.parts.map((part, partIndex) => {
                      const partKey = `${sectionIndex}-${partIndex}`;
                      const isPartExpanded = expandedParts.has(partKey);

                      return (
                        <div
                          key={partIndex}
                          className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-sm transition-shadow duration-200"
                        >
                          {/* Part header */}
                          <button
                            type="button"
                            onClick={() => togglePart(sectionIndex, partIndex)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-bg-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#D4AF37]/20 to-[#FFD700]/20 dark:from-[#D4AF37]/30 dark:to-[#FFD700]/30 text-amber-700 dark:text-amber-400 rounded-full flex items-center justify-center text-xs font-bold border border-[#D4AF37]/30 dark:border-[#D4AF37]/50">
                                  {partIndex + 1}
                                </span>
                                <h5 className="font-medium text-gray-900 dark:text-text-primary text-left">
                                  {part.title}
                                </h5>
                              </div>
                              {isPartExpanded ? (
                                <ChevronUpIcon className="w-4 h-4 text-gray-600 dark:text-text-secondary flex-shrink-0" />
                              ) : (
                                <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-text-secondary flex-shrink-0" />
                              )}
                            </div>
                          </button>

                          {/* Part content */}
                          {isPartExpanded && part.content && (
                            <div className="p-4 bg-white dark:bg-bg-secondary border-t border-gray-100 dark:border-gray-800 animate-in">
                              <div className="prose prose-sm max-w-none text-gray-700 dark:text-text-secondary dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {part.content}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CourseSections;