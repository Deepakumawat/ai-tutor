import React, { useState, useEffect } from 'react';

const ChatHistory = ({ studentId, isOpen, onClose, onSelectChat, apiUrl = 'http://localhost:5000' }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [, setLiveTime] = useState(new Date()); // Force re-render for live time updates

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[ChatHistory] Fetching for student:', studentId);
      console.log('[ChatHistory] API URL:', apiUrl);

      const response = await fetch(`${apiUrl}/api/chat-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId })
      });

      console.log('[ChatHistory] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[ChatHistory] Fetched data:', data);
        console.log('[ChatHistory] Number of chats:', data.chats?.length || 0);
        setChats(data.chats || []);
        if (data.chats && data.chats.length > 0) {
          console.log('[ChatHistory] First chat:', data.chats[0]);
        }
      } else {
        const errorText = await response.text();
        console.error('[ChatHistory] API error:', response.status, errorText);
        setError(`Failed to load chats (${response.status})`);
      }
    } catch (error) {
      console.error('[ChatHistory] Error fetching chat history:', error);
      setError(`Connection error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen, studentId]);

  // Live time updates - update every minute to show relative times
  useEffect(() => {
    if (!isOpen) return; // Only update when sidebar is open

    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 60000); // Update every 60 seconds (1 minute)

    return () => clearInterval(timer);
  }, [isOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Show relative time for recent chats
    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: 320,
      height: '100vh',
      background: 'var(--bg-primary)',
      borderRight: '1px solid var(--border-color)',
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: 16,
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white'
      }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>📋 Recent Chats</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: 20,
            cursor: 'pointer',
            padding: 0,
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 8
      }}>
        {error && (
          <div style={{ padding: 12, background: '#fee2e2', borderRadius: 8, margin: 8, color: '#991b1b', fontSize: 12 }}>
            ⚠️ {error}
          </div>
        )}
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No recent chats yet.</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
              Start learning and your last 7 chats will appear here!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chats.map((chat) => (
              <div
                key={chat.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  console.log('[ChatHistory] Clicked chat:', chat.id, 'topic:', chat.topic, 'content length:', chat.content?.length || 0);
                  onSelectChat(chat);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log('[ChatHistory] Keyboard selected chat:', chat.id);
                    onSelectChat(chat);
                  }
                }}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: 12,
                  borderRadius: 10,
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid var(--border-color)',
                  userSelect: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(57, 154, 255, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: 24, flexShrink: 0 }}>📚</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: 4
                  }}>
                    {chat.topic}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: 4
                  }}>
                    {chat.preview || chat.content?.substring(0, 80) || 'No preview'}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <span>{chat.grade_level}</span>
                    <span>•</span>
                    <span>{chat.subject}</span>
                    <span>•</span>
                    <span>{formatDate(chat.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
