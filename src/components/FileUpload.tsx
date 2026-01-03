import React, { useRef, useState } from 'react';
import { Upload, FileType } from 'lucide-react';

interface FileUploadProps {
    onUpload: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onUpload(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div
            className="glass-panel flex flex-col items-center justify-center text-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
                minHeight: '400px',
                border: '2px dashed',
                borderColor: isDragging ? 'var(--accent-color)' : 'var(--glass-border)',
                backgroundColor: isDragging ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                ref={fileInputRef}
                hidden
            />

            <div className="icon-circle">
                <Upload size={48} color="var(--accent-color)" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Upload your Amazon History</h2>
            <p className="text-muted mb-6" style={{ maxWidth: '400px' }}>
                Drag and drop your <span className="text-accent font-bold">Retail.OrderHistory.csv</span> file here,
                or click to browse.
            </p>

            <button className="primary-btn flex items-center gap-2">
                <FileType size={18} />
                Select CSV File
            </button>

            <p className="text-muted" style={{ marginTop: '2rem', fontSize: '0.8rem' }}>
                Your data stays locally in your browser.
            </p>
        </div>
    );
};
