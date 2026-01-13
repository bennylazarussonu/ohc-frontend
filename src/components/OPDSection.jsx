import { FaFileMedical, FaFileWaveform, FaHeartPulse, FaUserDoctor, FaUserInjured, FaFileCircleQuestion, FaHandHoldingMedical } from "react-icons/fa6";
import { useState } from "react";
import api from "../api/axios";

function OPDSection({ opd, setOpd, onTemplateSelect }) {
    const [complaintSuggestions, setComplaintSuggestions] = useState([]);
    const [diagnosisSuggestions, setDiagnosisSuggestions] = useState([]);
    const [activeField, setActiveField] = useState(null);


    const fetchSuggestions = async (type, value) => {
        if (!value || value.length < 2) return;

        const res = await api.get("/api/opds/suggestions", {
            params: { type, q: value }
        });

        if (type === "complaint") setComplaintSuggestions(res.data);
        else setDiagnosisSuggestions(res.data);
    };

    return (
        <div className="bg-gray-800 p-3 w-full rounded-xl mt-2 h-80 overflow-auto no-scrollbar">
            <div className="flex items-center gap-2">
                <FaFileMedical className="text-[16px] mb-2" />
                <h2 className="text-[16px] font-bold mb-2">OPD</h2>
            </div>

            <div className="flex items-center gap-1 text-[13px]">
                <FaFileCircleQuestion />
                Complaint and Findings:
            </div>
            <div className="grid grid-cols-2 gap-2">
                <textarea
                    placeholder="presenting_complaint"
                    value={opd.presenting_complaint || ""}
                    className="w-full p-1 text-[12.5px] bg-gray-700 rounded mb-2"
                    rows={3}
                    onFocus={() => setActiveField("complaint")}
                    onBlur={() => {
                        // delay so click on dropdown still works
                        setTimeout(() => setActiveField(null), 150);
                    }}
                    onChange={(e) => {
                        const val = e.target.value;
                        setOpd({ ...opd, presenting_complaint: val });
                        fetchSuggestions("complaint", val);
                    }}
                />

                {activeField === "complaint" && complaintSuggestions.length > 0 && (
                    <div className="bg-gray-900 border rounded absolute z-20 mt-16 w-1/2">
                        {complaintSuggestions.map((c, i) => (
                            <div
                                key={i}
                                className="p-1 hover:bg-gray-700 cursor-pointer"
                                onClick={() => {
                                    // setOpd({ ...opd, presenting_complaint: c });
                                    onTemplateSelect("complaint", c);
                                    setComplaintSuggestions([]);
                                    setActiveField(null);
                                }}
                            >
                                {c}
                            </div>
                        ))}
                    </div>
                )}

                {[
                    "exam_findings_and_clinical_notes",
                ].map(field => (
                    <textarea
                        key={field}
                        placeholder={field}
                        className="w-full p-1 text-[12.5px] bg-gray-700 rounded mb-2"
                        rows={3}
                        value={opd[field] || ""}
                        onChange={e =>
                            setOpd({ ...opd, [field]: e.target.value })
                        }
                    />
                ))}
            </div>

            <div className="flex items-center gap-1 text-[13px]">
                <FaHeartPulse />Observations:
            </div>
            <div className="grid grid-cols-5 gap-2">
                {[
                    "weight",
                    "temperature",
                    "heart_rate",
                    "blood_pressure",
                    "spo2"
                ].map(field => (
                    <input
                        key={field}
                        placeholder={field}
                        className="w-full text-[12.5px] p-1 bg-gray-700 rounded mb-2"
                        value={opd[field] || ""}
                        onChange={e =>
                            setOpd({ ...opd, [field]: e.target.value })
                        }
                    />
                ))}
            </div>
            <div className="flex items-center gap-1 text-[13px]">
                <FaHandHoldingMedical /> Diagnosis:
            </div>

            <div className="">
                <textarea
                    placeholder="diagnosis"
                    value={opd.diagnosis || ""}
                    className="w-full p-1 text-[12.5px] bg-gray-700 rounded mb-2"
                    rows={3}
                    onFocus={() => setActiveField("diagnosis")}
                    onBlur={() => {
                        setTimeout(() => setActiveField(null), 150);
                    }}
                    onChange={(e) => {
                        const val = e.target.value;
                        setOpd({ ...opd, diagnosis: val });
                        fetchSuggestions("diagnosis", val);
                    }}
                />
                {activeField === "diagnosis" && diagnosisSuggestions.length > 0 && (
                    <div className="bg-gray-900 border rounded absolute z-20 mt-1 w-1/2">
                        {diagnosisSuggestions.map((d, i) => (
                            <div
                                key={i}
                                className="p-1 hover:bg-gray-700 cursor-pointer"
                                onClick={() => {
                                    // setOpd({ ...opd, diagnosis: d });
                                    onTemplateSelect("diagnosis", d);
                                    setDiagnosisSuggestions([]);
                                    setActiveField(null);
                                }}
                            >
                                {d}
                            </div>
                        ))}
                    </div>
                )}

                {[
                    "investigations_recommended"
                ].map(field => (
                    <textarea
                        key={field}
                        placeholder={field}
                        className="w-full text-[12.5px] p-1 bg-gray-700 rounded mb-2"
                        rows={3}
                        value={opd[field] || ""}
                        onChange={e =>
                            setOpd({ ...opd, [field]: e.target.value })
                        }
                    />
                ))}
            </div>
            <div className="flex items-center gap-1 text-[13px]">
                <FaFileWaveform /> Advice:
            </div>
            <div className="grid grid-cols-2 gap-2">
                {["further_advice",
                    "referral_advice"].map(field => (
                        <textarea
                            key={field}
                            placeholder={field}
                            className="w-full p-1 text-[12.5px] bg-gray-700 rounded mb-2"
                            rows={3}
                            value={opd[field] || ""}
                            onChange={e =>
                                setOpd({ ...opd, [field]: e.target.value })
                            }
                        />
                    ))}
            </div>

        </div>
    );
}

export default OPDSection;
