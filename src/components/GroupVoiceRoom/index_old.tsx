// src/components/GroupVoiceRoom/index.tsx

import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaPhone } from 'react-icons/fa';
import AgoraService from '../../services/AgoraService';
import './styles.css';

interface GroupVoiceRoomProps {
  voiceRoomId: number;
  onClose: () => void;
}

export const GroupVoiceRoom: React.FC<GroupVoiceRoomProps> = ({ voiceRoomId, onClose }) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<number[]>([]);

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
        setParticipants((prev) => [...prev, user.uid]);
      });

      AgoraService.on('user-left', (user) => {
        console.log('👋 User left:', user.uid);
        setParticipants((prev) => prev.filter((uid) => uid !== user.uid));
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

  if (isLoading) {
    return (
      <div className="voice-room loading">
        <div className="spinner"></div>
        <p>Connexion au salon vocal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="voice-room error">
        <p>{error}</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="voice-room">
      <div className="voice-room-header">
        <div className="status-indicator">
          <span className="dot pulse"></span>
          <span className="text">Voice room in progress</span>
        </div>
        <span className="participants-count">
          {participants.length + 1} participant{participants.length > 0 ? 's' : ''}
        </span>
      </div>

      {participants.length > 0 && (
        <div className="participants-list">
          {participants.map((uid) => (
            <div key={uid} className="participant">
              <div className="avatar">👤</div>
              <span className="name">User {uid}</span>
            </div>
          ))}
        </div>
      )}

      <div className="voice-controls">
        <button
          className={`control-btn ${isMuted ? 'muted' : ''}`}
          onClick={handleToggleMute}
        >
          <div className="icon-wrapper">
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </div>
          <span className="label">{isMuted ? 'Mic muted' : 'Mic active'}</span>
        </button>

        <button className="control-btn danger" onClick={handleLeave}>
          <div className="icon-wrapper">
            <FaPhone className="rotate-135" />
          </div>
          <span className="label">Leave</span>
        </button>
      </div>
    </div>
  );
};
