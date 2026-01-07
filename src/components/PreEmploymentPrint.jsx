import { useState, useEffect } from "react";
import api from "../api/axios";
import { FaX, FaPrint } from "react-icons/fa6";
import { useAuth } from '../context/AuthContext';

function PreEmploymentPrint({ data}) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [form, setForm] = useState(data);

  useEffect(() => {
    api.get("/api/doctors").then(res => setDoctors(res.data));
  }, []);

  const handleSave = async () => {
    // Save logic
    await api.post("/api/pre-employment/finalize", {
      preemployment_id: data.id,
      ...form
    });
    window.print();
    // onSuccess?.();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-start p-4 overflow-auto">
      <div className="print-area w-full max-w-4xl mx-auto bg-white text-black">
        {/* HEADER */}
        <table className="w-full border border-black">
          <tbody>
            <tr>
              <td className="text-center border border-black p-1">
                <div className="text-2xl font-bold uppercase tracking-wide">
                  MEGHA ENGINEERING & INFRASTRUCTURES LTD.
                </div>
                <div className="text-sm font-bold uppercase mt-1">
                  FORM XXXIX (See Rule 122)
                </div>
              </td>
            </tr>
            <tr>
              <td className="text-center border-t border-b border-black py-2">
                <div className="text-lg font-semibold uppercase">MEDICAL EXAMINATION REPORT</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* CANDIDATE DETAILS - 2x2 grid */}
        <table className="w-full border border-black mt-1">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-bold w-1/4">ID:</td>
              <td className="border border-black p-2">{form.id || ''}</td>
              <td className="border border-black p-2 font-bold w-1/4">DOB:</td>
              <td className="border border-black p-2">{form.dob ? new Date(form.dob).toLocaleDateString('en-GB') : ''}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold">NAME:</td>
              <td className="border border-black p-2" colSpan={3}>{form.name || ''}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold">AGE:</td>
              <td className="border border-black p-2">{form.dob ? new Date().getFullYear() - new Date(form.dob).getFullYear() : ''}</td>
              <td className="border border-black p-2 font-bold">SEX:</td>
              <td className="border border-black p-2">{form.gender || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* PRESENTATION */}
        <table className="w-full border border-black mt-1">
          <tbody>
            <tr><td className="border border-black p-3" colSpan={2}>{form.presentation || ''}</td></tr>
          </tbody>
        </table>

        {/* PHYSICAL EXAMINATION */}
        <table className="w-full border border-black mt-1">
          <tbody>
            <tr><td className="border border-black p-3 font-bold">PHYSICAL EXAMINATION:</td></tr>
            <tr><td className="border border-black p-3" colSpan={2}>{form.physical_examination || ''}</td></tr>
          </tbody>
        </table>

        {/* PHYSICAL PARAMETERS - Compact table */}
        <table className="w-full border border-black mt-1 text-xs">
          <thead>
            <tr><th className="border border-black p-1 font-bold" colSpan={4}>PHYSICAL PARAMETERS</th></tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1">Temp</td>
              <td className="border border-black p-1">{form.physical_parameters?.temperature || ''}</td>
              <td className="border border-black p-1">RR</td>
              <td className="border border-black p-1">{form.physical_parameters?.respiratory_rate || ''}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">Wt</td>
              <td className="border border-black p-1">{form.physical_parameters?.weight || ''}</td>
              <td className="border border-black p-1">Ht</td>
              <td className="border border-black p-1">{form.physical_parameters?.height || ''}</td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>

        {/* VISION TABLE - Exact match */}
        <table className="w-full border border-black mt-1 text-xs">
          <tbody>
            <tr><td className="border border-black p-2 font-bold" colSpan={6}>OPHTHALMIC EXAMINATION - VISUAL ACUITY</td></tr>
            <tr>
              <td className="border border-black p-1 font-bold"></td>
              <td className="border border-black p-1 font-bold">FAR VISION (20 ft)</td>
              <td className="border border-black p-1 font-bold" colSpan={2}>NEAR VISION (14-15")</td>
              <td rowSpan={3} className="border border-black p-2 font-bold" style={{writingMode: 'vertical-rl'}}>
                Without glasses
              </td>
              <td rowSpan={3} className="border border-black p-2 font-bold" style={{writingMode: 'vertical-rl'}}>
                With glasses
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-bold">R</td>
              <td className="border border-black p-1 font-bold">L</td>
              <td className="border border-black p-1 font-bold">R</td>
              <td className="border border-black p-1 font-bold">L</td>
              <td></td>
            </tr>
            <tr>
              <td className="border border-black p-1">{form.vision_far_right || ''}</td>
              <td className="border border-black p-1">{form.vision_far_left || ''}</td>
              <td className="border border-black p-1">{form.vision_near_right || ''}</td>
              <td className="border border-black p-1">{form.vision_near_left || ''}</td>
              <td className="border border-black p-2" rowSpan={2}>{form.vision_diagnosis || ''}</td>
              <td className="border border-black p-2" rowSpan={2}></td>
            </tr>
          </tbody>
        </table>

        {/* SYSTEMIC EXAMINATION */}
        <table className="w-full border border-black mt-1">
          <tbody>
            <tr><td className="border border-black p-2 font-bold">SYSTEMIC EXAMINATION:</td></tr>
            <tr>
              <td className="border border-black p-2">CVS:</td>
              <td className="border border-black p-2">{form.systemic_cvs || ''}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">RS:</td>
              <td className="border border-black p-2">{form.systemic_rs || ''}</td>
            </tr>
            {/* CNS, GIT, GUS sections */}
          </tbody>
        </table>

        {/* FINAL ASSESSMENT */}
        <table className="w-full border border-black mt-2">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-bold w-1/2">CLINICAL IMPRESSION:</td>
              <td className="border border-black p-2" rowSpan={3}>{form.clinical_impression || ''}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold">FITNESS:</td>
            </tr>
            <tr>
              <td className="p-4 text-right border-r border-black">
                <div className="font-bold uppercase">Dr. {user?.name}</div>
                <div className="text-sm uppercase">Regn. No: XXXXX</div>
                <div className="text-sm uppercase">Medical Examiner</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Print/Save buttons - hidden in print */}
      <div className="flex justify-end gap-4 mt-6 no-print">
        {/* <button onClick={onClose} className="p-2">
          <FaX size={20} />
        </button> */}
        <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded flex items-center gap-2 font-bold">
          <FaPrint size={16} /> Print Report
        </button>
      </div>
    </div>
  );
}

export default PreEmploymentPrint;
