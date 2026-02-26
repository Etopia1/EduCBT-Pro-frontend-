import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { Upload, FileSpreadsheet, Trash2, Download, CheckCircle, AlertTriangle, Settings, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const { token } = useSelector(state => state.auth);
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => { fetchTemplate(); }, []);

    const fetchTemplate = async () => {
        try {
            const res = await axios.get('http://localhost:2000/result-template', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTemplate(res.data);
        } catch {
            setTemplate(null);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file) => {
        if (!file) return;
        const allowed = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        if (!allowed.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            toast.error('Please upload an Excel (.xlsx, .xls) or CSV file only.');
            return;
        }

        const formData = new FormData();
        formData.append('template', file);
        setUploading(true);
        const t = toast.loading('Uploading result template...');
        try {
            const res = await axios.post('http://localhost:2000/result-template/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Result template uploaded successfully!', { id: t });
            setTemplate(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed. Please try again.', { id: t });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete the result template? This cannot be undone.')) return;
        try {
            await axios.delete('http://localhost:2000/result-template', {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Template deleted.');
            setTemplate(null);
        } catch {
            toast.error('Delete failed.');
        }
    };

    const handleDownload = async () => {
        const t = toast.loading('Downloading template...');
        try {
            const res = await axios.get('http://localhost:2000/result-template/download', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = template?.templateName || 'result_template.xlsx';
            a.click();
            toast.success('Downloaded!', { id: t });
        } catch {
            toast.error('Download failed.', { id: t });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 bg-gold-50 border border-[#D4AF37]/20 rounded-full px-4 py-1.5">
                        <Settings size={14} className="text-[#D4AF37]" />
                        <span className="text-[#996515] text-[10px] font-black uppercase tracking-widest">Configuration</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tight">
                        Admin <span className="gold-text-gradient">Settings</span>
                    </h1>
                    <p className="text-slate-500 text-sm">Manage your school's result template and system configurations.</p>
                </div>

                {/* Result Template Card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#1A120B] rounded-2xl flex items-center justify-center border border-[#D4AF37]/20">
                                <FileSpreadsheet size={22} className="text-[#D4AF37]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 uppercase italic">Result Template</h2>
                                <p className="text-sm text-slate-400">Upload your Excel result sheet template. Placeholders like <code className="text-xs bg-slate-100 px-1 rounded">{"{{STUDENT_NAME}}"}</code> will be replaced with real data.</p>
                            </div>
                        </div>
                        <button onClick={fetchTemplate} className="p-2 text-slate-400 hover:text-[#D4AF37] transition-colors" title="Refresh">
                            <RefreshCcw size={18} />
                        </button>
                    </div>

                    {/* Current Template Status */}
                    {loading ? (
                        <div className="h-20 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                        </div>
                    ) : template ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                                <div>
                                    <p className="font-black text-emerald-800 text-sm">{template.templateName || 'Result Template'}</p>
                                    <p className="text-emerald-600 text-xs mt-0.5">
                                        {template.detectedPlaceholders?.length > 0
                                            ? `${template.detectedPlaceholders.length} placeholders detected: ${template.detectedPlaceholders.slice(0, 3).join(', ')}${template.detectedPlaceholders.length > 3 ? '...' : ''}`
                                            : 'Template uploaded successfully'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                                    <Download size={14} /> Download
                                </button>
                                <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                            <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                            <p className="text-amber-700 text-sm font-medium">No result template uploaded yet. Upload one below to enable result generation.</p>
                        </div>
                    )}

                    {/* Upload Area */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
                            ${dragOver ? 'border-[#D4AF37] bg-gold-50/50' : 'border-slate-200 hover:border-[#D4AF37]/50 hover:bg-slate-50/50'}`}
                    >
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={(e) => handleUpload(e.target.files[0])}
                        />
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            {uploading
                                ? <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                                : <Upload size={24} className="text-slate-400" />
                            }
                        </div>
                        <p className="font-black text-slate-700 text-sm italic mb-1">
                            {uploading ? 'Uploading...' : template ? 'Replace Template' : 'Upload Result Template'}
                        </p>
                        <p className="text-slate-400 text-xs">Drag and drop or click to browse — Excel (.xlsx, .xls) or CSV files only</p>
                    </div>

                    {/* Instructions */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                        <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">How to Use Result Templates</h4>
                        <ol className="space-y-2 text-xs text-slate-500 list-decimal list-inside leading-relaxed">
                            <li>Create an Excel file with your result sheet design</li>
                            <li>Add placeholders like <code className="bg-white border border-slate-200 px-1 rounded">{"{{STUDENT_NAME}}"}</code>, <code className="bg-white border border-slate-200 px-1 rounded">{"{{MATH_SCORE}}"}</code> where data should appear</li>
                            <li>Upload the file here</li>
                            <li>Go to <strong>Student Records</strong> → select students → click <strong>Generate Result</strong> to fill the template with real data</li>
                        </ol>
                    </div>
                </div>

                {/* Future Settings Placeholder */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm opacity-60">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                            <Settings size={20} className="text-slate-300" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-400 uppercase italic">More Settings</h2>
                            <p className="text-sm text-slate-300">Additional configuration options coming soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
