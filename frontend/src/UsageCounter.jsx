import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';

const UsageCounter = forwardRef(({ studentId, lessonType, onLimitExceeded, apiUrl = 'http://localhost:5000' }, ref) => {
  const [usage, setUsage] = useState({ usage_count: 0, limit: 50, remaining: 50, exceeded: false });
  const [loading, setLoading] = useState(false);

  const checkUsage = useCallback(async () => {
    console.log('[UsageCounter] checkUsage called with:', { studentId, lessonType, apiUrl });
    if (!studentId || !lessonType) {
      console.warn('[UsageCounter] Missing studentId or lessonType');
      return;
    }

    try {
      setLoading(true);
      console.log('[UsageCounter] Fetching from:', `${apiUrl}/api/check-usage`);
      const response = await fetch(`${apiUrl}/api/check-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, lesson_type: lessonType })
      });

      console.log('[UsageCounter] Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('[UsageCounter] Updated usage data:', data);
        setUsage(data);
      } else {
        console.error('[UsageCounter] API returned status:', response.status);
      }
    } catch (error) {
      console.error('[UsageCounter] Error checking usage:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId, lessonType, apiUrl]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      console.log('[UsageCounter] refresh() method called');
      checkUsage();
    }
  }), [checkUsage]);

  useEffect(() => {
    console.log('[UsageCounter] useEffect triggered with:', { studentId, lessonType });
    checkUsage();
  }, [studentId, lessonType, checkUsage]);

  const exceeded = usage.usage_count > usage.limit;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 12px',
      borderRadius: 8,
      background: exceeded ? '#fecaca' : '#dbeafe',
      border: `1px solid ${exceeded ? '#fca5a5' : '#93c5fd'}`,
      fontSize: 13,
      fontWeight: 600,
      color: exceeded ? '#7f1d1d' : '#1e40af'
    }}>
      {loading ? '...' : `${usage.usage_count}/${usage.limit}`}
    </div>
  );
});

UsageCounter.displayName = 'UsageCounter';
export default UsageCounter;
