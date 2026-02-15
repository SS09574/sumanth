import React, { useState, useRef } from 'react';
import { UserPlus, Upload, Trash2, Search, X, ShieldCheck, ShieldAlert, CheckSquare, Square, FileSpreadsheet, AlertCircle, Download, Loader2, Users } from 'lucide-react';
import { Student } from '../types';
import * as XLSX from 'xlsx';

interface StudentManagerProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

const StudentManager: React.FC<StudentManagerProps> = ({ students, setStudents }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [importPreview, setImportPreview] = useState<Student[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '',
    phone: '',
    email: '',
    department: '',
    batch: '',
    hasOptedIn: true
  });

  const cleanPhone = (phone: any) => {
    if (!phone) return '';
    let cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.length === 10) cleaned = '91' + cleaned;
    return cleaned;
  };

  const validatePhone = (phone: string) => /^\d{11,13}$/.test(phone);

  const handleAdd = () => {
    if (newStudent.name && newStudent.phone) {
      const formatted = cleanPhone(newStudent.phone);
      setStudents([...students, { 
        ...newStudent, 
        phone: formatted, 
        id: `s-${Date.now()}`,
        isValidPhone: validatePhone(formatted),
        hasOptedIn: !!newStudent.hasOptedIn
      } as Student]);
      setNewStudent({ name: '', phone: '', email: '', department: '', batch: '', hasOptedIn: true });
      setIsModalOpen(false);
    }
  };

  const toggleOptIn = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, hasOptedIn: !s.hasOptedIn } : s));
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete registration for ${name}? This will remove them from the global student list.`)) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const processRowData = (data: any[]): Student[] => {
    return data.map((row: any, i: number) => {
      // Logic for both array (CSV/TSV) and object (Excel with headers)
      let name = '', phone = '', email = '', dept = '', batch = '';
      
      if (Array.isArray(row)) {
        [name, phone, email, dept, batch] = row.map(s => String(s || '').trim());
      } else {
        // Try to find keys case-insensitively for Excel
        const findVal = (terms: string[]) => {
          const key = Object.keys(row).find(k => terms.some(t => k.toLowerCase().includes(t.toLowerCase())));
          return key ? row[key] : '';
        };
        name = findVal(['name', 'student', 'full name']);
        phone = findVal(['phone', 'mobile', 'whatsapp', 'number']);
        email = findVal(['email', 'mail']);
        dept = findVal(['dept', 'department', 'branch']);
        batch = findVal(['batch', 'year', 'class']);
      }

      const formattedPhone = cleanPhone(phone);
      return { 
        id: `bulk-${Date.now()}-${i}`, 
        name: name || 'Unknown Student', 
        phone: formattedPhone, 
        email: email || '', 
        department: dept || '', 
        batch: batch || '',
        isValidPhone: validatePhone(formattedPhone),
        hasOptedIn: true
      } as Student;
    }).filter(s => s.name !== 'Unknown Student' || s.phone !== '');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            alert("The selected Excel file appears to be empty.");
          } else {
            setImportPreview(processRowData(jsonData));
          }
          setIsProcessing(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        // Fallback for CSV/Text
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          const lines = text.trim().split(/\r?\n/);
          const data = lines.map(line => line.split(/[,\t]/).map(s => s.trim()));
          setImportPreview(processRowData(data));
          setIsProcessing(false);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error(err);
      alert("Error processing file. Please ensure it is a valid Excel or CSV file.");
      setIsProcessing(false);
    }
  };

  const handleBulkInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setBulkInput(text);
    if (text.trim()) {
      const lines = text.trim().split(/\r?\n/);
      const data = lines.map(line => line.split(/[,\t]/).map(s => s.trim()));
      setImportPreview(processRowData(data));
    } else {
      setImportPreview([]);
    }
  };

  const handleFinalizeBulkImport = () => {
    if (importPreview.length === 0) return;
    setStudents([...students, ...importPreview]);
    setBulkInput('');
    setImportPreview([]);
    setIsModalOpen(false);
    alert(`Successfully imported ${importPreview.length} students!`);
  };

  const downloadTemplate = () => {
    const headers = [['Name', 'Phone', 'Email', 'Department', 'Batch']];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(headers);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Student_Registry_Template.xlsx");
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search student or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
        >
          <UserPlus className="w-4 h-4" />
          Bulk Registration
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-5">Student Details</th>
              <th className="px-6 py-5">Department / Batch</th>
              <th className="px-6 py-5">WhatsApp</th>
              <th className="px-6 py-5 text-center">Opt-In</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="text-sm hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{student.name}</div>
                  <div className="text-[11px] text-slate-400">{student.email}</div>
                </td>
                <td className="px-6 py-4 text-slate-500">
                   <div className="font-medium">{student.department || 'N/A'}</div>
                   <div className="text-[10px] text-slate-400 uppercase font-bold">{student.batch || 'No Batch'}</div>
                </td>
                <td className="px-6 py-4 font-mono font-medium text-slate-600">
                  {student.phone}
                </td>
                <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleOptIn(student.id)} className="transition-colors inline-block">
                        {student.hasOptedIn ? (
                            <CheckSquare className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                        )}
                    </button>
                </td>
                <td className="px-6 py-4">
                  {student.isValidPhone && student.hasOptedIn ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase">
                      <ShieldCheck className="w-3.5 h-3.5" /> Ready
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-600 text-[10px] font-bold uppercase">
                      <ShieldAlert className="w-3.5 h-3.5" /> Invalid/No Opt-in
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(student.id, student.name)}
                    className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete registration"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               {/* Fixed: Added Users to lucide-react imports to resolve the 'Cannot find name Users' error */}
               <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium">No registrations found in the registry.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  Bulk Student Registration
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Upload Excel, CSV, or paste from your spreadsheet.</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setImportPreview([]); setBulkInput(''); }} className="text-slate-400 hover:text-slate-900 transition-colors bg-white p-2 rounded-full border border-slate-100 shadow-sm"><X /></button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Method 1: File Upload */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Method 1: Excel/CSV Upload</h4>
                    <button 
                      onClick={downloadTemplate}
                      className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> Get Template
                    </button>
                  </div>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                  >
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {isProcessing ? <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /> : <Upload className="w-8 h-8 text-indigo-600" />}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">Drop Excel file here or click to browse</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">Supports .xlsx, .xls, .csv, and .txt</p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".xlsx,.xls,.csv,.txt" 
                      onChange={handleFileUpload}
                    />
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-2">
                      <AlertCircle className="w-4 h-4" />
                      Formatting Guide
                    </div>
                    <ul className="text-[10px] text-amber-700 space-y-1.5 list-disc pl-4 font-medium">
                      <li>Use headers: <b>Name, Phone, Email, Department, Batch</b>.</li>
                      <li>Phone numbers should include country code (e.g., 919876543210).</li>
                      <li>Invalid rows will be flagged in the preview.</li>
                    </ul>
                  </div>
                </div>

                {/* Method 2: Copy-Paste */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Method 2: Copy-Paste Data</h4>
                  <div className="space-y-3">
                    <textarea 
                      rows={8}
                      placeholder="Paste columns from Excel (TSV) or Comma-Separated Values:&#10;Rahul, 919876543210, rahul@edu.com, CS, 2024&#10;Priya, 919123456789, priya@edu.com, IT, 2025"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-[11px] font-mono leading-relaxed"
                      value={bulkInput}
                      onChange={handleBulkInputChange}
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1">
                      <span>Detected: {importPreview.length} entries</span>
                      <span>Format: Auto-Detecting</span>
                    </div>
                  </div>
                  
                  {/* Single entry sub-form */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Single Entry</h5>
                     <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="Name" 
                          className="p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" 
                          value={newStudent.name}
                          onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                        />
                        <input 
                          placeholder="Phone" 
                          className="p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-2 focus:ring-indigo-500" 
                          value={newStudent.phone}
                          onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
                        />
                        <button 
                          onClick={handleAdd}
                          disabled={!newStudent.name || !newStudent.phone}
                          className="col-span-2 py-3 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 disabled:opacity-50 transition-all"
                        >
                          Register Student
                        </button>
                     </div>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              {importPreview.length > 0 && (
                <div className="mt-12 space-y-4 animate-in fade-in slide-in-from-top-4">
                   <div className="flex items-center justify-between">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <CheckSquare className="w-4 h-4 text-emerald-500" />
                       Import Preview ({importPreview.length})
                     </h4>
                     <button onClick={() => setImportPreview([])} className="text-[10px] font-bold text-rose-500 hover:underline">Clear Preview</button>
                   </div>
                   <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                     <div className="max-h-60 overflow-y-auto custom-scrollbar">
                       <table className="w-full text-left">
                         <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider sticky top-0 border-b border-slate-100">
                           <tr>
                             <th className="px-4 py-3">Name</th>
                             <th className="px-4 py-3">Phone</th>
                             <th className="px-4 py-3">Department</th>
                             <th className="px-4 py-3">Status</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                           {importPreview.slice(0, 50).map((p, idx) => (
                             <tr key={idx} className="text-[11px] hover:bg-slate-50/50">
                               <td className="px-4 py-2.5 font-bold text-slate-700">{p.name}</td>
                               <td className="px-4 py-2.5 font-mono text-slate-500">{p.phone}</td>
                               <td className="px-4 py-2.5 text-slate-500">{p.department || '—'}</td>
                               <td className="px-4 py-2.5">
                                 {p.isValidPhone ? (
                                   <span className="text-emerald-600 font-bold">✓ Valid</span>
                                 ) : (
                                   <span className="text-rose-500 font-bold">⚠ Fix Phone</span>
                                 )}
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                       {importPreview.length > 50 && (
                         <div className="p-3 text-center bg-slate-50 text-[10px] text-slate-400 font-medium">
                            + {importPreview.length - 50} more entries hidden from preview.
                         </div>
                       )}
                     </div>
                   </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
               <button 
                  onClick={() => { setIsModalOpen(false); setImportPreview([]); setBulkInput(''); }}
                  className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
               >
                 Cancel
               </button>
               <button 
                  onClick={handleFinalizeBulkImport}
                  disabled={importPreview.length === 0}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
               >
                 <CheckSquare className="w-4 h-4" />
                 Finalize Import
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;