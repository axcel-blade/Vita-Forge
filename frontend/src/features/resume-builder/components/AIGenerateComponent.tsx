/**
 * Component for AI-powered Resume Summary Generation
 */

import React, { useState } from 'react';
import { generateResumeSummary } from '../../../services/ai';

export const AIGenerateComponent: React.FC<{ profileData: any }> = ({ profileData }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetRole] = useState('');

  const handleGenerate = async () => {
    if (!profileData || Object.keys(profileData).length === 0) {
      setError('Please fill in your profile data first');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await generateResumeSummary(profileData, targetRole || undefined);
      
      if (response.success) {
        setResult(response.content ?? null);
      } else {
        setError(response.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '10px' }}>
      <h3>Generate AI Resume Summary</h3>
      <p>Target Role (Optional): {targetRole || 'N/A'}</p>
      
      <button 
        onClick={handleGenerate} 
        disabled={loading} 
        style={{ padding: '10px 20px', cursor: 'pointer' }}
      >
        {loading ? 'Generating...' : 'Generate Summary'}
      </button>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h4>Generated Summary:</h4>
          <pre>{result}</pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#ffe6e6', border: '1px solid #ffcccc' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
};