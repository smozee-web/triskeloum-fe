import React from 'react';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  picture?: string;
}

interface ParticipantsListProps {
  participants: User[];
  activeParticipantIds: number[];
  creator: User;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  activeParticipantIds,
  creator,
}) => {
  // Combine creator and participants
  const allParticipants: Array<User & { isCreator: boolean; isActive: boolean }> = [];

  // Add creator first
  allParticipants.push({
    ...creator,
    isCreator: true,
    isActive: activeParticipantIds.includes(creator.id),
  });

  // Add other participants
  participants.forEach((participant) => {
    if (participant.id !== creator.id) {
      allParticipants.push({
        ...participant,
        isCreator: false,
        isActive: activeParticipantIds.includes(participant.id),
      });
    }
  });

  // Sort: active first, then by name
  allParticipants.sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }
    return a.firstname.localeCompare(b.firstname);
  });

  return (
    <div className="participants-list-container">
      <div className="participants-list-header">
        <div className="header-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Participants</h3>
        </div>
        <span className="participants-badge">{activeParticipantIds.length}</span>
      </div>

      <div className="participants-list-content">
        {allParticipants.map((participant) => (
          <div
            key={participant.id}
            className={`participant-item ${participant.isActive ? 'active' : 'inactive'}`}
          >
            <div className="participant-avatar-container">
              {participant.picture ? (
                <img
                  src={participant.picture}
                  alt={`${participant.firstname} ${participant.lastname}`}
                  className="participant-avatar-img"
                />
              ) : (
                <div className={`participant-avatar-placeholder ${participant.isCreator ? 'creator' : ''}`}>
                  {participant.firstname[0].toUpperCase()}
                </div>
              )}
              {participant.isActive && <div className="active-indicator" />}
            </div>

            <div className="participant-info">
              <div className="participant-name-row">
                <span className="participant-name">
                  {participant.firstname} {participant.lastname}
                </span>
                {participant.isCreator && (
                  <span className="creator-badge">ADMIN</span>
                )}
              </div>
              <span className="participant-status">
                {participant.isActive ? 'Online' : 'Offline'}
              </span>
            </div>

            {participant.isActive && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mic-icon">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="19" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="23" x2="16" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
