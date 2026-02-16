import React from 'react';
import { Story } from '../../types/stories';
import { StatusBadge } from '../ui/status-badge';
import { formatDuration } from '../../utils/format-duration';

interface StoryCardProps {
  story: Story;
  onClick?: (story: Story) => void;
  className?: string;
}

export function StoryCard({ story, onClick, className = '' }: StoryCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(story);
    }
  };

  return (
    <div
      className={`p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{story.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{story.description}</p>
        </div>
        <StatusBadge status={story.status} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>ID: {story.id}</span>
          {story.estimatedHours && (
            <span>
              ⏱️ {formatDuration(story.estimatedHours * 60)}
            </span>
          )}
        </div>

        {story.assignee && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>👤 {story.assignee}</span>
          </div>
        )}
      </div>
    </div>
  );
}
