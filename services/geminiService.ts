
import { GoogleGenAI, Type } from "@google/genai";
import { RpmInputData, GeneratedRpmData } from "../types";

export const generateRpm = async (data: RpmInputData): Promise<GeneratedRpmData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const sessionsInfo = Object.entries(data.sessionPractices)
    .map(([num, practice]) => `Pertemuan ${num}: ${practice}`)
    .join('\n');

  const prompt = `
    Buatkan Perencanaan Pembelajaran Mendalam (RPM) Lengkap dalam Bahasa Indonesia.
    
    DATA INPUT:
    - Satuan Pendidikan: ${data.schoolName}
    - Mata Pelajaran: ${data.subject}
    - Jenjang: ${data.level}
    - Kelas: ${data.grade}
    - CP: ${data.learningOutcomes}
    - TP: ${data.learningObjectives}
    - Materi Utama: ${data.material}
    - Jumlah Pertemuan: ${data.sessionsCount}
    - Praktik Pedagogis per Pertemuan:
    ${sessionsInfo}
    - Dimensi Lulusan: ${data.dimensions.join(', ')}

    INSTRUKSI KHUSUS:
    1. Identifikasi Siswa: Harus generated otomatis menyesuaikan karakteristik psikososial jenjang ${data.level}.
    2. Lintas Disiplin: Generate kaitan materi ini dengan disiplin ilmu lain secara logis.
    3. Topik: Buat judul topik yang relevan dan menggugah rasa ingin tahu.
    4. Pengalaman Belajar:
       - Memahami (Awal): Langkah berkesadaran/bermakna untuk memulai kelas.
       - Mengaplikasi (Inti): Harus SANGAT DETAIL mengikuti sintaks dari Praktik Pedagogis yang dipilih (misal: Sintaks PjBL jika dipilih PjBL).
       - Refleksi (Penutup): Langkah evaluasi diri yang menggembirakan/bermakna.
    5. Setiap pertemuan harus memiliki 'tag' yang mendeskripsikan nuansanya (pilih salah satu: berkesadaran, bermakna, atau menggembirakan).
    6. Digital: Berikan 2-3 tools online spesifik (misal: Kahoot, PhET, Google Earth, Canva).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          identitas: {
            type: Type.OBJECT,
            properties: {
              schoolName: { type: Type.STRING },
              subject: { type: Type.STRING },
              gradeSemester: { type: Type.STRING },
              duration: { type: Type.STRING }
            },
            required: ["schoolName", "subject", "gradeSemester", "duration"]
          },
          identifikasi: {
            type: Type.OBJECT,
            properties: {
              siswa: { type: Type.STRING },
              materi: { type: Type.STRING },
              dimensi: { type: Type.STRING }
            },
            required: ["siswa", "materi", "dimensi"]
          },
          desain: {
            type: Type.OBJECT,
            properties: {
              cp: { type: Type.STRING },
              lintasDisiplin: { type: Type.STRING },
              tp: { type: Type.STRING },
              topik: { type: Type.STRING },
              pedagogis: { type: Type.STRING },
              kemitraan: { type: Type.STRING },
              lingkungan: { type: Type.STRING },
              digital: { type: Type.STRING }
            },
            required: ["cp", "lintasDisiplin", "tp", "topik", "pedagogis", "kemitraan", "lingkungan", "digital"]
          },
          pengalaman: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sessionNumber: { type: Type.NUMBER },
                pedagogicalPractice: { type: Type.STRING },
                tag: { type: Type.STRING },
                memahami: { type: Type.STRING },
                mengaplikasi: { type: Type.STRING },
                refleksi: { type: Type.STRING }
              },
              required: ["sessionNumber", "pedagogicalPractice", "tag", "memahami", "mengaplikasi", "refleksi"]
            }
          },
          asesmen: {
            type: Type.OBJECT,
            properties: {
              awal: { type: Type.STRING },
              proses: { type: Type.STRING },
              akhir: { type: Type.STRING }
            },
            required: ["awal", "proses", "akhir"]
          }
        },
        required: ["identitas", "identifikasi", "desain", "pengalaman", "asesmen"]
      }
    }
  });

  return JSON.parse(response.text);
};
