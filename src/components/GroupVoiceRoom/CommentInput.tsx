import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

interface CommentInputProps {
  onSendComment: (content: string) => Promise<void>;
  disabled?: boolean;
}

export const CommentInput: React.FC<CommentInputProps> = ({ onSendComment, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending || disabled) return;

    try {
      setIsSending(true);
      await onSendComment(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending comment:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="comment-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Write a message..."
        disabled={disabled || isSending}
        maxLength={500}
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled || isSending}
        className="send-btn"
      >
        {isSending ? (
          <div className="spinner-small"></div>
        ) : (
          <FaPaperPlane />
        )}
      </button>
    </form>
  );
};
