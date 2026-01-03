import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { parseCSV } from './utils/csvHelper';
import type { ParsedOrder } from './types';

function App() {
  const [orders, setOrders] = useState<ParsedOrder[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const data = await parseCSV(file);
      setOrders(data);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      alert("Failed to parse CSV file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '800',
          background: 'linear-gradient(to right, #fff, #94a3b8)',
          color: 'transparent',
          WebkitBackgroundClip: 'text',
          margin: 0
        }}>
          Amazon Spend Analysis
        </h1>
        {orders && (
          <button
            className="glass-input hover:border-accent-color transition-colors text-sm font-bold flex items-center gap-2"
            onClick={() => setOrders(null)}
          >
            <span>Upload new file</span>
          </button>
        )}
      </header>

      <main>
        {!orders ? (
          <FileUpload onUpload={handleFileUpload} />
        ) : (
          <Dashboard orders={orders} />
        )}
      </main>

      {loading && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-panel p-8 text-xl font-bold flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            Parsing data...
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
