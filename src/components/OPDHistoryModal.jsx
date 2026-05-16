import { formatDateDMY } from "../utils/date";

function OPDHistoryModal({ isOpen, onClose, opdHistory, selectedWorker }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-gray-900 w-[800px] max-h-[90vh] overflow-y-auto rounded-xl no-scrollbar p-6 text-white">
                <h2 className="text-xl font-bold mb-4">OPD History - {selectedWorker?.name || "Unknown"}</h2>
                <div className="space-y-4 overflow-scroll h-[70vh] no-scrollbar pr-2">
                    {opdHistory.length > 0 ? (
                        opdHistory.map((opd) => (
                            <div key={opd.id} className="bg-gray-800 p-4 rounded-lg">

                            <p className="text-lg font-semibold">
                                {opd.presenting_complaint}
                            </p>

                            <p className="text-sm text-gray-300 mt-1">
                                Diagnosis: {opd.diagnosis || "N/A"}
                            </p>

                            <p className="text-sm text-gray-400 mt-1">
                                {formatDateDMY(opd.created_at)}
                            </p>

                            {/* PRESCRIPTIONS */}
                            {opd.prescriptions?.length > 0 && (
                                <div className="mt-3 border-t border-gray-700 pt-3">
                                    <p className="font-semibold text-sm mb-2 text-blue-400">
                                        Prescriptions
                                    </p>

                                    <div className="space-y-2">
                                        {opd.prescriptions.map((prescription) => (
                                            <div
                                                key={prescription.id}
                                                className="bg-gray-900 rounded p-2 text-sm"
                                            >
                                                <p className="font-medium">
                                                    {prescription.drug_name_and_dose}
                                                </p>

                                                <p className="text-gray-400 text-xs">
                                                    {prescription.frequency} • {prescription.days} days
                                                </p>

                                                <p className="text-gray-500 text-xs">
                                                    {prescription.route_of_administration}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    ))) : (
                        <p className="text-gray-400">No OPD history.</p>
                    )}
                </div>
                <div className="flex justify-end mt-3">
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OPDHistoryModal;