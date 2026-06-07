import { useState } from "react";
import VisionCheckModal from "./VisionCheckModal";
import { FaX, FaFloppyDisk } from "react-icons/fa6";

function IdRenewalEditModal({
    renewal,
    onClose,
    onSave,
    worker
}) {
    const [openVision, setOpenVision] = useState(false);

    const [visionForm, setVisionForm] = useState(
        renewal?.opthalmic_examination || null
    );

    const [form, setForm] = useState({
        blood_group:
            renewal?.blood_group || "",

        general_condition:
            renewal?.general_condition || "",

        pulse:
            renewal?.pulse || "",

        systolic:
            renewal?.blood_pressure?.systolic || "",

        diastolic:
            renewal?.blood_pressure?.diastolic || "",

        spo2:
            renewal?.spo2 || "",

        height:
            renewal?.height || "",

        weight:
            renewal?.weight || "",

        remarks:
            renewal?.remarks || "",

        vertigo_test_passed:
            renewal?.vertigo_test_passed || "Passed",
    });

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center">
            <div className="bg-gray-900 rounded-lg p-6 w-[900px]">

                <div className="flex justify-between mb-4">
                    <h2 className="font-bold">
                        Edit ID Renewal
                    </h2>

                    <button onClick={onClose}>
                        <FaX />
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-3 gap-y-2">

                    <div>
                        <span className="text-gray-400 text-xs">General Condition</span>
                        <input
                            type="text"
                            placeholder="General Condition"
                            value={form.general_condition}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    general_condition: e.target.value
                                })
                            }
                            className="bg-gray-800 p-2 rounded w-full text-xs"
                        />
                    </div>

                    <div>
                        <span className="text-gray-400 text-xs">Pulse</span>
                        <input
                            type="number"
                            placeholder="Pulse"
                            value={form.pulse}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    pulse: e.target.value
                                })
                            }
                            className="bg-gray-800 p-2 rounded w-full text-xs"
                        />
                    </div>

                    <div>
                        <span className="text-gray-400 text-xs">Systolic</span>
                        <input
                            type="number"
                            placeholder="Systolic"
                            value={form.systolic}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    systolic: e.target.value
                                })
                            }
                            className="bg-gray-800 p-2 w-full rounded text-xs"
                        />
                    </div>

                    <div>
                        <span className="text-gray-400 text-xs">Diastolic</span>
                        <input
                            type="number"
                            placeholder="Diastolic"
                            value={form.diastolic}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    diastolic: e.target.value
                                })
                            }
                            className="bg-gray-800 p-2 w-full rounded text-xs"
                        />
                    </div>

                    <div>
                        <span className="text-gray-400 text-xs">SpO2</span>
                        <input
                            type="number"
                            placeholder="SpO2"
                            value={form.spo2}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    spo2: e.target.value
                                })
                            }
                            className="bg-gray-800 p-2 w-full rounded text-xs"
                        />
                    </div>

                    <div>
                        <span className="text-gray-400 text-xs">Height</span>
                        <input
                            type="number"
                            placeholder="Height"
                            value={form.height}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    height: e.target.value
                                })
                            }
                            className="bg-gray-800 p-2 w-full rounded text-xs"
                        />
                    </div>

                    <div>
                        <span className="text-gray-400 text-xs">Weight</span>
                        <input
                            type="number"
                            placeholder="Weight"
                            value={form.weight}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    weight: e.target.value
                                })
                            }
                            className="bg-gray-800 p-2 rounded w-full text-xs"
                        />
                    </div>

                    <div>
                        <span className="text-gray-400 text-xs">Blood Group</span>
                        <select
                            value={form.blood_group}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    blood_group: e.target.value
                                })
                            }
                            className="bg-gray-800 p-2 w-full rounded text-xs"
                        >
                            <option value="">Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    <div>
                        <span className="text-gray-400 text-xs">Remarks </span>

                        <input
                            type="text"
                            placeholder="Remarks"
                            value={form.remarks}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    remarks: e.target.value
                                })
                            }
                            className="bg-gray-800 w-full p-2 rounded text-xs"
                        />
                    </div>

                    <div>
                        <span className="text-gray-400 text-xs">Vision</span>
                        <button
                            className="border w-full border-blue-600 text-blue-400 px-4 py-2 rounded text-xs"
                            onClick={() => setOpenVision(true)}
                        >
                            Edit Vision
                        </button>
                    </div>


                </div>

                <div className="flex justify-end mt-5">

                    <button
                        className="bg-green-600 px-4 py-2 rounded flex items-center gap-2"
                        onClick={() =>
                            onSave({
                                ...form,
                                systolic: form.systolic,
                                diastolic: form.diastolic,
                                opthalmic_examination: visionForm
                            })
                        }
                    >
                        <FaFloppyDisk />
                        Save Changes
                    </button>
                </div>

            </div>
            {
                openVision && (
                    <VisionCheckModal
                        vision={visionForm}
                        worker={worker}
                        instance="id-renewal"
                        onClose={() => setOpenVision(false)}
                        onSave={(data) => {
                            setVisionForm(
                                data.opthalmic_examination
                            );

                            setOpenVision(false);
                        }}
                    />
                )
            }
        </div>
    );
}

export default IdRenewalEditModal;