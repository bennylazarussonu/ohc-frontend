import { useState } from "react";
import VisionCheckModal from "./VisionCheckModal";

function FCACCEditModal({
    fcacc,
    onClose,
    onSave,
    worker
}) {
    const [form, setForm] = useState({
        competency_assessment_by:
            fcacc?.competency_assessment_by || "",

        general_examination:
            fcacc?.examination_findings?.general_examination || "",

        pulse:
            fcacc?.examination_findings?.pulse || "",

        systolic:
            fcacc?.examination_findings?.blood_pressure?.systolic || "",

        diastolic:
            fcacc?.examination_findings?.blood_pressure?.diastolic || "",

        spo2:
            fcacc?.examination_findings?.spo2 || "",

        height:
            fcacc?.examination_findings?.height || "",

        weight:
            fcacc?.examination_findings?.weight || "",

        vertigo_test_passed:
            fcacc?.examination_findings?.vertigo_test_passed || "Passed",
    });

    const [openVision, setOpenVision] = useState(false);

    const [visionForm, setVisionForm] = useState(
    fcacc?.opthalmic_examination ||
    fcacc?.examination_findings?.opthalmic_examination ||
    null
);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded w-1/2">
                <h2 className="text-lg font-bold mb-4">
                    Edit FCACC Record
                </h2>

                <div className="grid grid-cols-2 gap-4">

                    <div>
                        <label className="text-xs text-gray-400">
                            Competency Assessment By
                        </label>

                        <input
                            value={form.competency_assessment_by}
                            className="p-2 rounded bg-gray-800 w-full"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    competency_assessment_by: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">
                            General Examination
                        </label>

                        <input
                            value={form.general_examination}
                            className="p-2 rounded bg-gray-800 w-full"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    general_examination: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">
                            Pulse
                        </label>

                        <input
                            value={form.pulse}
                            className="p-2 rounded bg-gray-800 w-full"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    pulse: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">
                            SpO₂
                        </label>

                        <input
                            value={form.spo2}
                            className="p-2 rounded bg-gray-800 w-full"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    spo2: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">
                            Systolic BP
                        </label>

                        <input
                            value={form.systolic}
                            className="p-2 rounded bg-gray-800 w-full"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    systolic: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">
                            Diastolic BP
                        </label>

                        <input
                            value={form.diastolic}
                            className="p-2 rounded bg-gray-800 w-full"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    diastolic: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">
                            Height (cm)
                        </label>

                        <input
                            value={form.height}
                            className="p-2 rounded bg-gray-800 w-full"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    height: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">
                            Weight (kg)
                        </label>

                        <input
                            value={form.weight}
                            className="p-2 rounded bg-gray-800 w-full"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    weight: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">
                            Vision Examination
                        </label>

                        <button
                            className="w-full border border-blue-600 text-blue-400 p-2 rounded"
                            onClick={() => setOpenVision(true)}
                        >
                            Edit Vision
                        </button>
                    </div>

                    <div className="col-span-2">
                        <label className="text-xs text-gray-400">
                            Vertigo Test
                        </label>

                        <div className="flex gap-4 mt-1">

                            <label>
                                <input
                                    type="radio"
                                    checked={
                                        form.vertigo_test_passed === "Passed"
                                    }
                                    onChange={() =>
                                        setForm({
                                            ...form,
                                            vertigo_test_passed: "Passed"
                                        })
                                    }
                                />
                                {" "}Passed
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    checked={
                                        form.vertigo_test_passed === "Failed"
                                    }
                                    onChange={() =>
                                        setForm({
                                            ...form,
                                            vertigo_test_passed: "Failed"
                                        })
                                    }
                                />
                                {" "}Failed
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    checked={
                                        form.vertigo_test_passed === "Not Done"
                                    }
                                    onChange={() =>
                                        setForm({
                                            ...form,
                                            vertigo_test_passed: "Not Done"
                                        })
                                    }
                                />
                                {" "}Not Done
                            </label>

                        </div>
                    </div>

                </div>

                <div className="flex justify-end gap-2 mt-6">

                    <button
                        className="bg-gray-600 px-4 py-2 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="bg-blue-600 px-4 py-2 rounded"
                        onClick={() =>
                            onSave({
                                ...form,
                                opthalmic_examination:
                                    visionForm
                            })
                        }
                    >
                        Save Changes
                    </button>

                </div>
            </div>

            {openVision && (
                <VisionCheckModal
                    vision={visionForm}
                    worker={worker}
                    instance="fcacc"
                    onClose={() => setOpenVision(false)}
                    onSave={(data) => {
                        setVisionForm(
                            data.opthalmic_examination
                        );

                        setOpenVision(false);
                    }}
                />
            )}
        </div>
    );
}

export default FCACCEditModal;