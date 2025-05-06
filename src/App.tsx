import { useState, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import './App.css';

function App() {
  const [clipboardContent, setClipboardContent] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unlistenClipboard: () => void;
    listen('clipboard-changed', (event) => {
      const content = event.payload as string;
      setClipboardContent(content);
      simulateAiResponse(content);
    }).then((fn) => { unlistenClipboard = fn; });

    return () => { unlistenClipboard && unlistenClipboard(); };
  }, []);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [aiResponse]);

  // Removed manual key listener; global shortcut handled in Rust

  const simulateAiResponse = (input: string) => {
    setIsLoading(true);
    setAiResponse('');
    setTimeout(() => {
      const full = `AI analysis of: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"\n\nResult: This seems like ${input.length < 20 ? 'a short phrase' : 'text content'}.`;
      let i = 0;
      const interval = setInterval(() => {
        setAiResponse(full.substring(0, i));
        i++;
        if (i > full.length) { clearInterval(interval); setIsLoading(false); }
      }, 15);
    }, 800);
  };

  return (
    <div className="overlay">
      <div className="overlay-content">
        <div className="header">
          <div className="status-indicator">
            <div className={`status-dot ${isLoading ? 'pulse' : 'ready'}`}></div>
            <span>{isLoading ? 'Processing' : 'Active'}</span>
          </div>
          <h1 className="app-title">AI Assistant</h1>
        </div>
        <div className="content-section">
          <div className="section-header">
            <span className="section-title">Clipboard</span>
            <span className="badge">Detected</span>
          </div>
          <div className="content-box">{clipboardContent || 'Waiting for clipboard...'}</div>
        </div>
        <div className="content-section">
          <div className="section-header">
            <span className="section-title">AI Response</span>
            {isLoading && <span className="badge loading">Processing</span>}
          </div>
          <div className="content-box" ref={responseRef}>{aiResponse || 'AI response...'}</div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => { setClipboardContent(''); setAiResponse(''); }}>Clear</button>
          <button className="btn btn-primary" onClick={() => aiResponse && navigator.clipboard.writeText(aiResponse)}>Copy</button>
        </div>
      </div>
    </div>
  );
}

export default App;
