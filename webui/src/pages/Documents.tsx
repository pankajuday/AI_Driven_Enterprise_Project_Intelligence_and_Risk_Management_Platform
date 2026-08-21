

import { useEffect, useState } from "react";
import axios from "axios";
import { Eye } from "lucide-react";

type DocumentItem = {
    filename: string;
    size_bytes: number;
};

export default function Documents() {
    const [docs, setDocs] = useState<DocumentItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

    const documentUrl = selectedDoc
        ? `http://127.0.0.1:3000
/v1/api/document/view/${encodeURIComponent(selectedDoc)}?download=false`
        : null;

    useEffect(() => {
        let mounted = true;
        axios
            .get<DocumentItem[]>("http://127.0.0.1:3000/v1/api/document/list", {
                headers: { accept: "application/json" },
            })
            .then((res) => {
                if (!mounted) return;
                setDocs(res.data);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err?.message ?? "Failed to load documents");
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const fmt = (b: number) => {
        if (b >= 1_000_000) return (b / 1_000_000).toFixed(2) + " MB";
        if (b >= 1_000) return (b / 1_000).toFixed(2) + " KB";
        return b + " B";
    };

    if (loading) return <div>Loading documents...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Documents</h2>
            {docs && docs.length > 0 ? (
                <div className="grid gap-3">
                    {docs.map((d) => (
                        <div
                            key={d.filename}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="font-semibold text-gray-900 truncate">
                                    {d.filename}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-sm text-gray-500">
                                    {fmt(d.size_bytes)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDoc(d.filename)}
                                    className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                >
                                    <Eye className="w-5 h-5 shrink-0" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                    No documents found.
                </div>
            )}

            {documentUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="relative h-[85vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                            <h3 className="truncate text-lg font-semibold text-gray-900">
                                {selectedDoc}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedDoc(null)}
                                className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            >
                                Close
                            </button>
                        </div>
                        <div className="h-[calc(85vh-57px)] bg-gray-100">
                            <iframe
                                title={selectedDoc ?? "Document viewer"}
                                src={documentUrl}
                                className="h-full w-full"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}