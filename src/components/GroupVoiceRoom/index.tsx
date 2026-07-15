// src/components/GroupVoiceRoom/index.tsx - REDESIGNED VERSION

import React, { useState, useEffect, useCallback } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaPhone } from 'react-icons/fa';
import AgoraService from '../../services/AgoraService';
import { CommentsList } from './CommentsList';
import { CommentInput } from './CommentInput';
import { RecordingControls } from './RecordingControls';
import { ParticipantsList } from './ParticipantsList';
import { useSocket } from '../../contexts/SocketContext';
import './styles.css';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  picture?: string;
}

interface VoiceRoomData {
  id: number;
  name: string;
  description: string;
  creator: User;
  participants: User[];
  activeParticipantIds: number[];
  isRecording: boolean;
}

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

interface Participant {
  uid: number | string;
  isSpeaking?: boolean;
}

interface GroupVoiceRoomProps {
  voiceRoomId: number;
  onClose: () => void;
}

export const GroupVoiceRoom: React.FC<GroupVoiceRoomProps> = ({ voiceRoomId, onClose }) => {
  const { socket } = useSocket();
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [voiceRoomData, setVoiceRoomData] = useState<VoiceRoomData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Fetch voice room data and comments
  const fetchVoiceRoomData = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4005/api/v1';

      const response = await fetch(`${apiUrl}/app/voice-rooms/${voiceRoomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setVoiceRoomData(data.payload);
      }
    } catch (err) {
      console.error('Error fetching voice room data:', err);
    }
  }, [voiceRoomId]);

  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4005/api/v1';

      const response = await fetch(`${apiUrl}/app/voice-rooms/${voiceRoomId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setComments(data.payload);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  }, [voiceRoomId]);

  // Get current user ID from JWT token
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id || payload.userId);
      } catch (err) {
        console.error('Error parsing token:', err);
      }
    }
  }, []);

  useEffect(() => {
    fetchVoiceRoomData();
    fetchComments();
  }, [fetchVoiceRoomData, fetchComments]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleCommentAdded = (data: { voiceRoomId: number; comment: Comment }) => {
      if (data.voiceRoomId === voiceRoomId) {
        setComments((prev) => [...prev, data.comment]);
      }
    };

    const handleRecordingStarted = (data: { voiceRoomId: number }) => {
      if (data.voiceRoomId === voiceRoomId) {
        setVoiceRoomData((prev) => prev ? { ...prev, isRecording: true } : null);
      }
    };

    const handleRecordingStopped = (data: { voiceRoomId: number }) => {
      if (data.voiceRoomId === voiceRoomId) {
        setVoiceRoomData((prev) => prev ? { ...prev, isRecording: false } : null);
      }
    };

    const handleUserJoined = (data: { voiceRoomId: number; activeParticipantIds: number[] }) => {
      if (data.voiceRoomId === voiceRoomId) {
        setVoiceRoomData((prev) => prev ? { ...prev, activeParticipantIds: data.activeParticipantIds } : null);
      }
    };

    const handleUserLeft = (data: { voiceRoomId: number; activeParticipantIds: number[] }) => {
      if (data.voiceRoomId === voiceRoomId) {
        setVoiceRoomData((prev) => prev ? { ...prev, activeParticipantIds: data.activeParticipantIds } : null);
      }
    };

    socket.on('voice_room:comment_added', handleCommentAdded);
    socket.on('voice_room:recording_started', handleRecordingStarted);
    socket.on('voice_room:recording_stopped', handleRecordingStopped);
    socket.on('voice_room:recording_ready', handleRecordingStarted);
    socket.on('voice_room:user_joined', handleUserJoined);
    socket.on('voice_room:user_left', handleUserLeft);

    return () => {
      socket.off('voice_room:comment_added', handleCommentAdded);
      socket.off('voice_room:recording_started', handleRecordingStarted);
      socket.off('voice_room:recording_stopped', handleRecordingStopped);
      socket.off('voice_room:recording_ready', handleRecordingStarted);
      socket.off('voice_room:user_joined', handleUserJoined);
      socket.off('voice_room:user_left', handleUserLeft);
    };
  }, [socket, voiceRoomId]);

  useEffect(() => {
    initializeVoiceRoom();
    return () => {
      handleLeave();
    };
  }, [voiceRoomId]);

  const initializeVoiceRoom = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tokenData = await generateToken();
      AgoraService.initialize();

      AgoraService.on('user-joined', (user) => {
        console.log('👤 User joined:', user.uid);
        setParticipants((prev) => [...prev, { uid: user.uid }]);
      });

      AgoraService.on('user-left', (user) => {
        console.log('👋 User left:', user.uid);
        setParticipants((prev) => prev.filter((p) => p.uid !== user.uid));
      });

      await AgoraService.join(
        tokenData.appId,
        tokenData.channelName,
        tokenData.token,
        tokenData.uid
      );

      setIsJoined(true);
      setIsLoading(false);
      await notifyJoinRoom();
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Unable to join the voice room');
      setIsLoading(false);
    }
  };

  const generateToken = async () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    const apiUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4005/api/v1';

    const response = await fetch(`${apiUrl}/app/voice-rooms/${voiceRoomId}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!data.success) throw new Error('Token generation failed');
    return data.payload;
  };

  const notifyJoinRoom = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4005/api/v1';
      await fetch(`${apiUrl}/app/voice-rooms/${voiceRoomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('⚠️ Error notifying join:', err);
    }
  };

  const notifyLeaveRoom = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4005/api/v1';
      await fetch(`${apiUrl}/app/voice-rooms/${voiceRoomId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('⚠️ Error notifying leave:', err);
    }
  };

  const handleToggleMute = async () => {
    const newState = await AgoraService.toggleMute();
    setIsMuted(!newState);
  };

  const handleLeave = async () => {
    await AgoraService.leave();
    await notifyLeaveRoom();
    onClose();
  };

  const handleSendComment = async (content: string) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4005/api/v1';

      const response = await fetch(`${apiUrl}/app/voice-rooms/${voiceRoomId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error('Failed to send comment');
      }
    } catch (err) {
      console.error('Error sending comment:', err);
      throw err;
    }
  };

  const handleStartRecording = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4005/api/v1';

      const response = await fetch(`${apiUrl}/app/voice-rooms/${voiceRoomId}/recording/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to start recording');
      }
    } catch (err: any) {
      console.error('Error starting recording:', err);
      alert(err.message || 'Unable to start recording');
      throw err;
    }
  };

  const handleStopRecording = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4005/api/v1';

      const response = await fetch(`${apiUrl}/app/voice-rooms/${voiceRoomId}/recording/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to stop recording');
      }
    } catch (err: any) {
      console.error('Error stopping recording:', err);
      alert(err.message || 'Unable to stop recording');
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="voice-room-redesigned loading">
        <div className="spinner"></div>
        <p>Connexion au salon vocal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="voice-room-redesigned error">
        <div className="error-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>{error}</p>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    );
  }

  const isCreator = voiceRoomData && currentUserId ? voiceRoomData.creator.id === currentUserId : false;
  const activeCount = voiceRoomData?.activeParticipantIds.length || 0;

  return (
    <div className="voice-room-redesigned">
      {/* Header */}
      <div className="voice-room-header-redesigned">
        <div className="header-top">
          <div className="status-container">
            <div className="status-indicator">
              <span className="dot pulse"></span>
              <span className="text">En cours</span>
            </div>
            {voiceRoomData?.isRecording && (
              <div className="recording-badge">
                <span className="recording-dot pulse"></span>
                <span>Enregistrement</span>
              </div>
            )}
          </div>
          <span className="participants-count">
            {activeCount} participant{activeCount > 1 ? 's' : ''}
          </span>
        </div>
        {voiceRoomData && (
          <div className="room-title">
            <h2>{voiceRoomData.name}</h2>
            {voiceRoomData.description && <p className="room-description">{voiceRoomData.description}</p>}
          </div>
        )}
      </div>

      {/* Main Content - Two Sided Layout */}
      <div className="voice-room-main-content">
        {/* Left Side - Participants */}
        <div className="participants-side">
          {voiceRoomData && (
            <ParticipantsList
              participants={voiceRoomData.participants || []}
              activeParticipantIds={voiceRoomData.activeParticipantIds}
              creator={voiceRoomData.creator}
            />
          )}
        </div>

        {/* Right Side - Comments */}
        <div className="comments-side">
          <div className="comments-section">
            <div className="comments-header">
              <h3>Messages</h3>
            </div>
            <CommentsList comments={comments} isLoading={commentsLoading} />
            <CommentInput onSendComment={handleSendComment} disabled={!isJoined} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="voice-controls-redesigned">
        <div className="main-controls">
          <button
            className={`control-btn-redesigned ${isMuted ? 'muted' : ''}`}
            onClick={handleToggleMute}
            title={isMuted ? 'Activer le micro' : 'Couper le micro'}
          >
            <div className="icon-wrapper">
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </div>
            <span className="label">{isMuted ? 'Mic muted' : 'Mic active'}</span>
          </button>

          <button
            className="control-btn-redesigned danger"
            onClick={handleLeave}
            title="Leave the room"
          >
            <div className="icon-wrapper">
              <FaPhone className="rotate-135" />
            </div>
            <span className="label">Leave</span>
          </button>
        </div>
{/* 
        <RecordingControls
          isCreator={isCreator}
          isRecording={voiceRoomData?.isRecording || false}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        /> */}
      </div>
    </div>
  );
};
