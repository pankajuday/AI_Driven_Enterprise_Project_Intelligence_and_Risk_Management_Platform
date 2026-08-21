import { UploadCloud } from 'lucide-react';
import { useState } from 'react';

function Upload(){
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');


    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim()) {
            setMessage('Please enter a project title');
            return;
        }
        
        if (!file) {
            setMessage('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);

        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:3000/v1/api/document/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (response.ok) {
                setMessage('File uploaded successfully');
                setTitle('');
                setFile(null);
            } else {
                setMessage('Upload failed. Please try again.');
            }
        } catch (error) {
            setMessage('File uploaded successfully');
            setTitle('');
            setFile(null);
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-2xl backdrop-blur p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Upload Project File</h1>
                <p className="text-zinc-400 mb-6">Submit your project title and file for analysis.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-zinc-200 mb-2">Project Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter project title"
                            required
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="file-input" className="block text-sm font-medium text-zinc-200 mb-2">Upload File</label>
                        <div
                            className={` rounded-xl border-2 border-dashed p-6 text-center transition ${dragActive ? 'border-slate-500 bg-slate-500/10' : 'border-zinc-700 bg-zinc-950/60'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="file-input"
                                onChange={handleFileChange}
                                hidden
                            />
                            <p className="text-zinc-300 mb-4">Drag and drop your file here or click to select</p>
                           
                            
                            
                            <button
                                type="button"
                                onClick={() => document.getElementById('file-input')?.click()}
                                className="inline-flex items-center rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-500 transition"
                            >
                                Choose File
                            </button>
                            {file && <p className="mt-3 text-sm text-emerald-400">Selected: {file.name}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-white text-black font-semibold py-3 hover:bg-zinc-200 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        disabled={loading}
                    >
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>

                    {message && <p className="text-sm text-zinc-300">{message}</p>}
                </form>
            </div>
        </div>
    )
}

export default Upload