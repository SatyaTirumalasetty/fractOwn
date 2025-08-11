import { createRoot } from "react-dom/client";

console.log('Starting React application...');

// Minimal inline component without external dependencies
function TestComponent() {
  console.log('TestComponent rendering');
  return (
    <div style={{ 
      padding: '20px', 
      fontSize: '24px', 
      color: 'red',
      backgroundColor: 'white',
      border: '2px solid blue' 
    }}>
      <h1>✓ React is Working!</h1>
      <p>
        fract <span style={{ 
          backgroundColor: '#1E3A8A', 
          color: '#FF6B35', 
          padding: '4px', 
          borderRadius: '4px' 
        }}>OWN</span>
      </p>
      <p style={{ color: 'green' }}>Test successful - Application loading</p>
    </div>
  );
}

const rootElement = document.getElementById("root");
console.log('Root element found:', rootElement);

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    console.log('React root created successfully');
    root.render(<TestComponent />);
    console.log('React component rendered');
  } catch (error) {
    console.error('Error creating React root or rendering:', error);
  }
} else {
  console.error('Root element not found!');
}
