import letterhead from "../assets/letterhead_banner.png";
import prescription_logo from "../assets/prescription_logo.png";

function OPDReport({ data }) {
    const { worker, opd, prescription, doctor} = data;
    function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return "";

  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  // If birthday hasn’t occurred yet this year
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}


    return (
        <div className=" print-area bg-white text-black p-8 w-[210mm] min-h-[297mm] mx-auto">
            <div className="text-center border-b pb-2 mb-4">
                <img src={letterhead} alt="Letterhead Banner" style={{ width: "100%" }} />
            </div>

            {/* PATIENT DETAILS */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <p><b>Name:</b> {worker.name}</p>
                {worker.employee_id && <p><b>Emp ID:</b> {worker.employee_id}</p>}
                {worker.designation && <p><b>Designation:</b> {worker.designation}</p>}
                {worker.dob && <p><b>Age:</b> {calculateAge(worker.dob)}</p>}
                {worker.gender && <p><b>Gender:</b> {worker.gender}</p>}
                {worker.fathers_name && <p><b>Father’s Name:</b> {worker.fathers_name}</p>}
                {worker.phone_no && <p><b>Contact:</b> {worker.phone_no}</p>}
            </div>

            <hr />
            {/* OPD DETAILS */}
            <div className="text-sm mb-4 mt-2">
                <div className=" mb-4">
                    {opd.presenting_complaint && (
                        <div className="flex">
                            <p className="w-48"><b>Presenting Complaint:</b></p>
                            <p className="text-wrap">{opd.presenting_complaint}</p>
                        </div>
                    )}
                    {opd.exam_findings_and_clinical_notes && (
                        <div className="flex">
                            <p className="w-48"><b>Exm. Findings & Clin. Notes:</b></p>
                            <p className="text-wrap">{opd.exam_findings_and_clinical_notes}</p>
                        </div>
                    )}
                </div>

                {(opd.presenting_complaint || opd.exam_findings_and_clinical_notes) && <hr />}

                <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
                    {opd.weight && (
                        <div className="flex">
                            <p className="w-48"><b>Weight:</b></p>
                            <p className="text-wrap">{opd.weight} Kg</p>
                        </div>
                    )}
                    {opd.temperature && (
                        <div className="flex">
                            <p className="w-48"><b>Temperature:</b></p>
                            <p className="text-wrap">{opd.temperature} F</p>
                        </div>
                    )}
                    {opd.heart_rate && (
                        <div className="flex">
                            <p className="w-48"><b>Heart Rate:</b></p>
                            <p className="text-wrap">{opd.heart_rate} BPM(beats per minute)</p>
                        </div>
                    )}
                    {opd.blood_pressure && (
                        <div className="flex">
                            <p className="w-48"><b>Blood Pressure:</b></p>
                            <p className="text-wrap">{opd.blood_pressure} mmHg</p>
                        </div>
                    )}
                    {opd.spo2 && (
                        <div className="flex">
                            <p className="w-48"><b>SpO2:</b></p>
                            <p className="text-wrap">{opd.spo2} %</p>
                        </div>
                    )}
                </div>
                
                {(opd.temperature || opd.heart_rate || opd.blood_pressure || opd.spo2) && <hr />}

                <div className="mt-2 mb-4">
                    {opd.diagnosis && (
                        <div className="flex">
                            <p className="w-48"><b>Diagnosis:</b></p>
                            <p className="text-wrap">{opd.diagnosis}</p>
                        </div>
                    )}
                    {opd.investigations_recommended && (
                        <div className="flex">
                            <p className="w-48"><b>Investigations Recomm.:</b></p>
                            <p className="text-wrap">{opd.investigations_recommended}</p>
                        </div>
                    )}
                </div>
                
                <div>
                    {opd.further_advice && (
                        <div className="flex">
                            <p className="w-48"><b>Further Advice:</b> </p>
                            <p className="text-wrap">{opd.further_advice}</p>
                        </div>
                    )}
                    {opd.referral_advice && (
                        <div className="flex">
                            <p className="w-48"><b>Referral Advice:</b> </p>
                            <p className="text-wrap">{opd.referral_advice}</p>
                        </div>
                    )}
                </div>
            </div>

            <img src={prescription_logo} alt="" style={{width: "2.5rem"}}/>
            <p className="font-bold text-sm">Treatment:</p>
            {/* PRESCRIPTION TABLE */}
            {prescription.length > 0 && (
                <table className="w-full border text-sm mt-2">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border p-1">S.No</th>
                            <th className="border p-1">Item</th>
                            <th className="border p-1">Brand</th>
                            <th className="border p-1">Route & Frequency</th>
                            <th className="border p-1">Days</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescription.map((p, i) => (
                            <tr key={i}>
                                <td className="border p-1">{i + 1}</td>
                                <td className="border p-1">{p.drug_name_and_dose}</td>
                                <td className="border p-1">{p.brand}</td>
                                <td className="border p-1">
                                    {p.route_of_administration} / {p.frequency}
                                </td>
                                <td className="border p-1">{p.days}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* SIGNATURE */}
            <div className="mt-12 text-right text-sm">
                <p><b>{doctor?.name}</b></p>
                <p>{doctor?.qualification}</p>
                <p>{doctor?.designation}</p>
                <p>Regn No: {doctor?.regn_no}</p>
                {/* <p>Mobile No: {doctor?.phone_no}</p> */}
            </div>

        </div>
    );
}

export default OPDReport;
