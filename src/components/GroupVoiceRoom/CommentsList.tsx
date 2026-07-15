import React, { useEffect, useRef } from 'react';

interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    picture?: string;
  };
  isSystemMessage: boolean;
  metadata?: {
    type?: string;
    recordingUrl?: string;
    fileName?: string;
    duration?: number;
  };
  createdAt: string;
}

interface CommentsListProps {
  comments: Comment[];
  isLoading: boolean;
}

export const CommentsList: React.FC<CommentsListProps> = ({ comments, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="comments-list loading">
        <div className="spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="comments-list">
      {comments.length === 0 ? (
        <div className="no-comments">
          <p>No messages yet</p>
          <span>Be the first to send a message!</span>
        </div>
      ) : (
        <>
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`comment ${comment.isSystemMessage ? 'system' : ''}`}
            >
              {!comment.isSystemMessage && (
                <div className="comment-avatar">
                  {comment.user.picture ? (
                    <img src={comment.user.picture} alt={`${comment.user.firstname} ${comment.user.lastname}`} />
                  ) : (
                    <div className="avatar-placeholder">
                      {comment.user.firstname.charAt(0)}
                      {comment.user.lastname.charAt(0)}
                    </div>
                  )}
                </div>
              )}
              <div className="comment-content">
                {!comment.isSystemMessage && (
                  <div className="comment-header">
                    <span className="author-name">
                      {comment.user.firstname} {comment.user.lastname}
                    </span>
                    <span className="comment-time">{formatTime(comment.createdAt)}</span>
                  </div>
                )}
                <div className="comment-text">{comment.content}</div>

                {comment.metadata?.type === 'recording_ready' && comment.metadata.recordingUrl && (
                  <div className="recording-link">
                    <a
                      href={comment.metadata.recordingUrl}
                      download={comment.metadata.fileName}
                      className="download-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Download</span>
                      {comment.metadata.duration && (
                        <span className="duration">({formatDuration(comment.metadata.duration)})</span>
                      )}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
