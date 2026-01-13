
import React, { useState, useRef, useEffect } from 'react';
import { 
  EducationLevel, 
  RpmInputData, 
  GeneratedRpmData, 
  PedagogicalPractice, 
  GraduateDimension 
} from './types';
import { 
  EDUCATION_LEVELS, 
  GRADE_OPTIONS, 
  PEDAGOGICAL_PRACTICES, 
  GRADUATE_DIMENSIONS 
} from './constants';
import { generateRpm } from './services/geminiService';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RpmInputData>({
    schoolName: '',
    teacherName: '',
    teacherNip: '',
    principalName: '',
    principalNip: '',
    level: EducationLevel.SD,
    grade: GRADE_OPTIONS[EducationLevel.SD][0],
    subject: '',
    learningOutcomes: '',
    learningObjectives: '',
    material: '',
    sessionsCount: 1,
    durationPerSession: '',
    sessionPractices: { 1: PedagogicalPractice.Inquiry },
    dimensions: [],
  });

  const [generatedData, setGeneratedData] = useState<GeneratedRpmData | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Sync sessionPractices when sessionsCount changes
  useEffect(() => {
    setFormData(prev => {
      const newPractices = { ...prev.sessionPractices };
      // Add missing sessions
      for (let i = 1; i <= prev.sessionsCount; i++) {
        if (!newPractices[i]) newPractices[i] = PedagogicalPractice.Inquiry;
      }
      // Remove extra sessions
      Object.keys(newPractices).forEach(key => {
        if (parseInt(key) > prev.sessionsCount) delete newPractices[parseInt(key)];
      });
      return { ...prev, sessionPractices: newPractices };
    });
  }, [formData.sessionsCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.dimensions.length === 0) {
      alert('Pilih minimal satu dimensi lulusan.');
      return;
    }

    setLoading(true);
    try {
      const result = await generateRpm(formData);
      setGeneratedData(result);
    } catch (error) {
      console.error(error);
      alert('Gagal menghasilkan RPM. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: name === 'sessionsCount' ? parseInt(value) || 1 : value };
      if (name === 'level') {
        newData.grade = GRADE_OPTIONS[value as EducationLevel][0];
      }
      return newData;
    });
  };

  const handleSessionPracticeChange = (sessionNum: number, practice: PedagogicalPractice) => {
    setFormData(prev => ({
      ...prev,
      sessionPractices: { ...prev.sessionPractices, [sessionNum]: practice }
    }));
  };

  const toggleDimension = (dim: GraduateDimension) => {
    setFormData(prev => {
      const exists = prev.dimensions.includes(dim);
      return {
        ...prev,
        dimensions: exists 
          ? prev.dimensions.filter(d => d !== dim)
          : [...prev.dimensions, dim]
      };
    });
  };

  const handleCopyAndOpenDocs = async () => {
    if (!outputRef.current) return;
    try {
      const type = 'text/html';
      const blob = new Blob([outputRef.current.innerHTML], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      await navigator.clipboard.write(data);
      alert('Berhasil disalin! Silakan paste (Ctrl+V) di Google Dokumen.');
      window.open('https://docs.google.com/document/create', '_blank');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Gagal menyalin secara otomatis.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl font-sans">
      <header className="text-center mb-10 bg-blue-900 text-white py-12 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
        <h1 className="text-5xl font-black mb-2 flex items-center justify-center gap-4">
          <i className="fas fa-graduation-cap"></i> Generator RPM
        </h1>
        <p className="text-blue-200 text-lg uppercase tracking-widest font-semibold">Perencanaan Pembelajaran Mendalam</p>
      </header>

      <div className="bg-white shadow-2xl rounded-3xl p-8 mb-12 border border-gray-100">
        <div className="flex items-center gap-3 mb-8 border-b border-blue-100 pb-4">
          <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">1</div>
          <h2 className="text-2xl font-bold text-gray-800">Input Informasi Pembelajaran</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="font-bold text-blue-800 border-l-4 border-blue-600 pl-3">Data Satuan & Guru</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Satuan Pendidikan *</label>
                <input required type="text" name="schoolName" value={formData.schoolName} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 transition-all bg-gray-50" placeholder="e.g. SMA Negeri 10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Guru *</label>
                  <input required type="text" name="teacherName" value={formData.teacherName} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">NIP Guru *</label>
                  <input required type="text" name="teacherNip" value={formData.teacherNip} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 bg-gray-50" />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="font-bold text-blue-800 border-l-4 border-blue-600 pl-3">Pejabat Pengesah</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Kepala Sekolah *</label>
                <input required type="text" name="principalName" value={formData.principalName} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">NIP Kepala Sekolah *</label>
                <input required type="text" name="principalNip" value={formData.principalNip} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 bg-gray-50" />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="font-bold text-blue-800 border-l-4 border-blue-600 pl-3">Konfigurasi Kurikulum</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Jenjang Pendidikan</label>
                <select name="level" value={formData.level} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 bg-gray-50">
                  {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Kelas</label>
                <select name="grade" value={formData.grade} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 bg-gray-50">
                  {GRADE_OPTIONS[formData.level].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mata Pelajaran</label>
                <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 bg-gray-50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Capaian Pembelajaran (CP) *</label>
                <textarea required name="learningOutcomes" value={formData.learningOutcomes} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 h-32 bg-gray-50"></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tujuan Pembelajaran (TP) *</label>
                <textarea required name="learningObjectives" value={formData.learningObjectives} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 h-32 bg-gray-50"></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">Materi Utama *</label>
                <input required type="text" name="material" value={formData.material} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Jumlah Pertemuan</label>
                <input required type="number" name="sessionsCount" value={formData.sessionsCount} onChange={handleInputChange} min="1" max="10" className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Durasi (e.g. 2 x 45 menit)</label>
                <input required type="text" name="durationPerSession" value={formData.durationPerSession} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 bg-gray-50" />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="font-bold text-blue-800 border-l-4 border-blue-600 pl-3">Praktik Pedagogis per Pertemuan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-blue-50 p-6 rounded-2xl">
              {Array.from({ length: formData.sessionsCount }, (_, i) => i + 1).map(num => (
                <div key={num} className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-xs font-black text-blue-600 uppercase mb-2">Pertemuan {num}</label>
                  <select
                    value={formData.sessionPractices[num] || PedagogicalPractice.Inquiry}
                    onChange={(e) => handleSessionPracticeChange(num, e.target.value as PedagogicalPractice)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {PEDAGOGICAL_PRACTICES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-bold text-blue-800 border-l-4 border-blue-600 pl-3">Dimensi Lulusan</h3>
            <div className="flex flex-wrap gap-2">
              {GRADUATE_DIMENSIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDimension(d)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                    formData.dimensions.includes(d)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                      : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'
                  }`}
                >
                  {formData.dimensions.includes(d) && <i className="fas fa-check mr-2"></i>}
                  {d}
                </button>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl text-white font-black text-xl shadow-2xl transition-all ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 active:scale-95'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <i className="fas fa-circle-notch fa-spin"></i> Sedang Menyusun Rancangan Pembelajaran...
              </span>
            ) : (
              'HASILKAN RPM SEKARANG'
            )}
          </button>
        </form>
      </div>

      {generatedData && (
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200 mb-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="p-6 bg-gray-800 text-white flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <i className="fas fa-file-pdf text-red-400 text-2xl"></i>
              <h3 className="text-xl font-bold tracking-tight">HASIL DOKUMEN RPM BERHASIL DISUSUN</h3>
            </div>
            <button
              onClick={handleCopyAndOpenDocs}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-3 transition-all shadow-lg ring-4 ring-blue-400/30"
            >
              <i className="fas fa-external-link-alt"></i> SALIN & BUKA GOOGLE DOKUMEN
            </button>
          </div>
          
          <div ref={outputRef} className="p-12 text-sm text-black leading-relaxed" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            {/* Header Formil */}
            <div className="text-center mb-10 border-b-4 border-double border-black pb-4">
              <h1 className="font-bold text-2xl uppercase underline decoration-2 underline-offset-4">PERENCANAAN PEMBELAJARAN MENDALAM (RPM)</h1>
              <p className="mt-2 text-lg font-bold">{formData.schoolName}</p>
            </div>
            
            {/* Section 1: Identitas */}
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">I. IDENTITAS</h2>
            <table className="w-full border-2 border-black border-collapse mb-8 table-fixed">
              <tbody>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100 w-1/3">Satuan Pendidikan</td>
                  <td className="border border-black p-3 text-justify">{formData.schoolName}</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100">Mata Pelajaran</td>
                  <td className="border border-black p-3 text-justify">{formData.subject}</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100">Kelas / Semester</td>
                  <td className="border border-black p-3 text-justify">{formData.grade} / Ganjil</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100">Durasi Pertemuan</td>
                  <td className="border border-black p-3 text-justify">{formData.durationPerSession}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 2: Identifikasi */}
            <h2 className="font-bold text-lg mb-2">II. IDENTIFIKASI</h2>
            <table className="w-full border-2 border-black border-collapse mb-8 table-fixed">
              <tbody>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100 w-1/3">Profil & Karakteristik Siswa</td>
                  <td className="border border-black p-3 text-justify">{generatedData.identifikasi.siswa}</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100">Cakupan Materi Pembelajaran</td>
                  <td className="border border-black p-3 text-justify">{formData.material}</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100">Capaian Dimensi Lulusan</td>
                  <td className="border border-black p-3 text-justify">{formData.dimensions.join(', ')}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 3: Desain Pembelajaran */}
            <h2 className="font-bold text-lg mb-2">III. DESAIN PEMBELAJARAN</h2>
            <table className="w-full border-2 border-black border-collapse mb-8 table-fixed">
              <tbody>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100 w-1/3">Capaian Pembelajaran (CP)</td>
                  <td className="border border-black p-3 text-justify">{formData.learningOutcomes}</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100">Link Lintas Disiplin Ilmu</td>
                  <td className="border border-black p-3 text-justify">{generatedData.desain.lintasDisiplin}</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100">Tujuan Pembelajaran (TP)</td>
                  <td className="border border-black p-3 text-justify">{formData.learningObjectives}</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100">Topik Utama Pembelajaran</td>
                  <td className="border border-black p-3 text-justify">{generatedData.desain.topik}</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100">Pemanfaatan Tools Digital</td>
                  <td className="border border-black p-3 text-justify italic">{generatedData.desain.digital}</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100">Lingkungan Belajar</td>
                  <td className="border border-black p-3 text-justify">{generatedData.desain.lingkungan}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 4: Pengalaman Belajar */}
            <h2 className="font-bold text-lg mb-2">IV. PENGALAMAN BELAJAR (Langkah Kegiatan)</h2>
            <table className="w-full border-2 border-black border-collapse mb-8">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-2 text-center w-12">No</th>
                  <th className="border border-black p-2 text-center w-40">Tahapan / Sintaks</th>
                  <th className="border border-black p-2 text-center">Deskripsi Rencana Aktivitas</th>
                </tr>
              </thead>
              <tbody>
                {generatedData.pengalaman.map((session, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="bg-gray-100">
                      <td colSpan={3} className="border border-black p-3 font-bold text-center italic">
                        Pertemuan {session.sessionNumber}: {session.pedagogicalPractice} ({session.tag})
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-center">1</td>
                      <td className="border border-black p-3 font-bold bg-gray-50">Memahami (Kegiatan Awal)</td>
                      <td className="border border-black p-3 text-justify">{session.memahami}</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-center">2</td>
                      <td className="border border-black p-3 font-bold bg-gray-50">Mengaplikasi (Kegiatan Inti)</td>
                      <td className="border border-black p-3 text-justify">{session.mengaplikasi}</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-center">3</td>
                      <td className="border border-black p-3 font-bold bg-gray-50">Refleksi (Kegiatan Penutup)</td>
                      <td className="border border-black p-3 text-justify">{session.refleksi}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Section 5: Asesmen */}
            <h2 className="font-bold text-lg mb-2">V. ASESMEN PEMBELAJARAN</h2>
            <table className="w-full border-2 border-black border-collapse mb-16 table-fixed">
              <tbody>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100 w-1/3">Asesmen Awal (Diagnostik)</td>
                  <td className="border border-black p-3 text-justify">{generatedData.asesmen.awal}</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100">Asesmen Proses (Formatif)</td>
                  <td className="border border-black p-3 text-justify">{generatedData.asesmen.proses}</td>
                </tr>
                <tr>
                  <td className="border border-black p-3 font-bold bg-gray-100">Asesmen Akhir (Sumatif)</td>
                  <td className="border border-black p-3 text-justify">{generatedData.asesmen.akhir}</td>
                </tr>
              </tbody>
            </table>

            {/* Signature Section */}
            <div className="grid grid-cols-2 gap-20 mt-20">
              <div className="text-left">
                <p className="mb-1">Mengetahui,</p>
                <p className="mb-20 font-bold">Kepala Sekolah {formData.schoolName}</p>
                <p className="font-bold underline decoration-1 underline-offset-2">{formData.principalName}</p>
                <p>NIP. {formData.principalNip}</p>
              </div>
              <div className="text-center">
                <p className="mb-1">Jakarta, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="mb-20 font-bold">Guru Mata Pelajaran</p>
                <p className="font-bold underline decoration-1 underline-offset-2">{formData.teacherName}</p>
                <p>NIP. {formData.teacherNip}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer className="pb-12 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Generator RPM AI &bull; Deep Learning Innovation
      </footer>
    </div>
  );
}
