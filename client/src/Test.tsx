import React from 'react';

export default function Test() {
  console.log('Test component is rendering');
  
  React.useEffect(() => {
    console.log('Test component mounted successfully');
  }, []);

  return (
    <div style={{ padding: '20px', fontSize: '24px', color: 'red' }}>
      <h1>Test Component - React is Working!</h1>
      <div>
        fract <span style={{ backgroundColor: '#1E3A8A', color: '#FF6B35', padding: '4px', borderRadius: '4px' }}>OWN</span>
      </div>
    </div>
  );
}