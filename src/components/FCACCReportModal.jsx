import { FaX, FaPrint } from "react-icons/fa6";
import letterhead from "../assets/preemp_banner.png";
import { formatDateDMY } from "../utils/date";

function FCACCReportModal({ data, onClose, onConfirm }) {
    console.log(data);
    const printReport = () => {
    const element = document.getElementById("print-area");

    const iframe = document.createElement("iframe");

    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;

    // 🔥 Copy ALL styles (Tailwind included)
    const styles = Array.from(
      document.querySelectorAll("link[rel='stylesheet'], style")
    )
      .map(node => node.outerHTML)
      .join("\n");

    iframeDoc.open();
    iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        ${styles}

        <style>
          @page {
            margin: 10mm;
          }

          body {
            zoom: 0.75;
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-wrapper {
            width: 100%;
            transform: scale(0.98);
            transform-origin: top center;
          }

          .print-area {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          .print-area,
          .print-area * {
            page-break-inside: avoid;
          }
        </style>
      </head>

      <body class="print-wrapper">
        <div class="print-area">
          ${element.outerHTML}
        </div>
      </body>
    </html>
  `);

    iframeDoc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      iframe.contentWindow.onafterprint = () => {
        document.body.removeChild(iframe);
      };
    };
  };
  const Show = ({ value, children }) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "Not Done"
    ) return null;

    return children;
  };
  const formatFar = (val) => {
    if (!val) return "";
    return `6/${val}`;
  };

  const formatNear = (val) => {
    if (!val) return "";
    return `N${val}`;
  };

  const formatBloodGroup = (bg) => {
    let symbol = bg[bg.length - 1];
    if (symbol === "+") {
      return bg.slice(0, -1) + " Positive";
    } else {
      return bg.slice(0, -1) + " Negative";
    }
  }

//   const calculateExpiredDate = (prevRenewalDate) => {
//     if (!prevRenewalDate) return "—";
//     const prev_renewal_date = new Date(prevRenewalDate);
//     return prev_renewal_date.setMonth(prev_renewal_date.getMonth() + 3);
//   }
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-start overflow-auto">
              <div className="w-[95%] max-w-5xl">
        
                {/* Actions */}
                <div className="flex justify-end gap-3 mb-3">
                  <button onClick={onClose}><FaX /></button>
                  <button
                    onClick={printReport}
                    className="bg-green-600 px-4 py-2 rounded flex items-center gap-2"
                  >
                    <FaPrint />
                    Print
                  </button>
                  <button
                    onClick={onConfirm}
                    className="bg-green-600 px-4 py-2 rounded"
                  >
                    Confirm & Save
                  </button>
                </div>
        
                {/* REPORT */}
                <div id="print-area" className="bg-white text-black p-6 rounded text-sm">
        
                  {/* HEADER */}
                  <div className="text-center">
                    <img src={letterhead} className="w-full mb-2" />
                    <h2 className="font-bold text-lg">FITNESS CLEARANCE AGAINST COMPETENCY CERTIFICATE</h2>
                    <hr className="border-black my-2" />
                  </div>
        
                  {/* PATIENT DETAILS */}
                  <div className="grid grid-cols-2 gap-2 mb-4 border-b border-gray-500 pb-4">
                    <Show value={data?.name}>
                      <p><b>Name:</b> {data.name}</p>
                    </Show>
        
                    <Show value={data?.employee_id}>
                      <p><b>Employee ID:</b> {data.employee_id}</p>
                    </Show>
        
                    <Show value={data?.designation}>
                      <p><b>Designation:</b> {data?.designation}</p>
                    </Show>
        
                    <Show value={data?.contractor_name}>
                      <p><b>Contractor Name:</b> {data?.contractor_name}</p>
                    </Show>
        
                    {/* <Show value={data?.blood_group}>
                      <p><b>Blood Group:</b> {formatBloodGroup(data.blood_group)}</p>
                    </Show> */}
        
                    <Show value={data?.fcaccForm?.date_of_issuance_of_certificate_for_competency_clearance}>
                      <p><b>Date:</b> {formatDateDMY(data.fcaccForm.date_of_issuance_of_certificate_for_competency_clearance)}</p>
                    </Show>
                  </div>
        
                  {/* VITALS */}
                  <h3 className="font-bold mb-2">EXAMINATION PARAMETERS</h3>
                  <div className="grid grid-cols-2 mb-4 border-b border-gray-500 pb-4">
                    <Show value={data?.fcaccForm?.general_examination}>
                      <p className="col-span-2"><b>General Examination:</b> {data.fcaccForm.general_examination}</p>
                    </Show>
        
                    <Show value={data?.fcaccForm?.pulse}>
                      <p><b>Pulse:</b> {data.fcaccForm.pulse} beats per minute</p>
                    </Show>
        
                    <Show value={data?.fcaccForm?.systolic && data?.fcaccForm?.diastolic}>
                      <p><b>BP:</b> {data.fcaccForm.systolic} / {data.fcaccForm.diastolic} mmHg</p>
                    </Show>
        
                    <Show value={data?.fcaccForm?.spo2}>
                      <p><b>SpO2:</b> {data.fcaccForm.spo2} %</p>
                    </Show>
        
                    <Show value={data?.fcaccForm?.height}>
                      <p><b>Height:</b> {data.fcaccForm.height} cm</p>
                    </Show>
        
                    <Show value={data?.fcaccForm?.weight}>
                      <p><b>Weight:</b> {data.fcaccForm.weight} kg</p>
                    </Show>
                  </div>
        
                  <div className="border-b border-gray-500 pb-4">
                    <p className="mt-2">
                      <b>VERTIGO TEST:</b>
                    </p>
                    <p>{data?.fcaccForm?.vertigo_test_passed}</p>
                  </div>
                  {/* VISION */}
                  {/* <div className="mb-4">
                    <h3 className="font-bold border-b mb-2">Vision Examination</h3>
        
                    <p><b>Status:</b> {data?.opthalmic_examination?.status}</p>
        
                    <p className="mt-2 font-semibold">Far Vision</p>
                    <p>
                      Without Glasses: L {data?.opthalmic_examination?.far_vision?.without_glasses?.left} /
                      R {data?.opthalmic_examination?.far_vision?.without_glasses?.right}
                    </p>
                    <p>
                      With Glasses: L {data?.opthalmic_examination?.far_vision?.with_glasses?.left} /
                      R {data?.opthalmic_examination?.far_vision?.with_glasses?.right}
                    </p>
        
                    <p className="mt-2 font-semibold">Near Vision</p>
                    <p>
                      Without Glasses: L {data?.opthalmic_examination?.near_vision?.without_glasses?.left} /
                      R {data?.opthalmic_examination?.near_vision?.without_glasses?.right}
                    </p>
                    <p>
                      With Glasses: L {data?.opthalmic_examination?.near_vision?.with_glasses?.left} /
                      R {data?.opthalmic_examination?.near_vision?.with_glasses?.right}
                    </p>
        
                    <p className="mt-2">
                      <b>Color Perception:</b> {data?.opthalmic_examination?.color_perception}
                    </p>
        
                    <p className="mt-2">
                      <b>Diagnosis (Without Glasses):</b><br/>
                      {data?.opthalmic_examination?.without_glasses_diagnosis}
                    </p>
        
                    <p className="mt-2">
                      <b>Diagnosis (With Glasses):</b><br/>
                      {data?.opthalmic_examination?.with_glasses_diagnosis}
                    </p>
                  </div> */}
                  <Show value={data?.opthalmic_examination}>
                    <div className="mt-4 mb-4 border-b border-gray-500 pb-4">
                      <h3 className="font-bold mb-2">ASSESSMENT OF VISION</h3>
        
                      <table className="w-full border text-sm text-center">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border p-1"></th>
                            <th className="border p-1">Far Vision (Without Glasses)</th>
                            <th className="border p-1">Far Vision (With Glasses)</th>
                            <th className="border p-1">Near Vision (Without Glasses)</th>
                            <th className="border p-1">Near Vision (With Glasses)</th>
                          </tr>
                        </thead>
        
                        <tbody>
                          <tr>
                            <td className="border p-1 font-semibold">Left</td>
                            <td className="border p-1">
                              {formatFar(data?.opthalmic_examination?.far_vision?.without_glasses?.left)}
                            </td>
        
                            <td className="border p-1">
                              {formatFar(data?.opthalmic_examination?.far_vision?.with_glasses?.left)}
                            </td>
        
                            <td className="border p-1">
                              {formatNear(data?.opthalmic_examination?.near_vision?.without_glasses?.left)}
                            </td>
        
                            <td className="border p-1">
                              {formatNear(data?.opthalmic_examination?.near_vision?.with_glasses?.left)}
                            </td>
                          </tr>
        
                          <tr>
                            <td className="border p-1 font-semibold">Right</td>
                            <td className="border p-1">
                              {formatFar(data?.opthalmic_examination?.far_vision?.without_glasses?.right)}
                            </td>
        
                            <td className="border p-1">
                              {formatFar(data?.opthalmic_examination?.far_vision?.with_glasses?.right)}
                            </td>
        
                            <td className="border p-1">
                              {formatNear(data?.opthalmic_examination?.near_vision?.without_glasses?.right)}
                            </td>
        
                            <td className="border p-1">
                              {formatNear(data?.opthalmic_examination?.near_vision?.with_glasses?.right)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
        
                      {/* Extra fields */}
                      <div className="mt-3 space-y-2 text-left">
        
                        <Show value={data?.opthalmic_examination?.color_perception}>
                          <p><b>Color Perception:</b> {data?.opthalmic_examination?.color_perception}</p>
                        </Show>
        
                        <Show value={data?.opthalmic_examination?.without_glasses_diagnosis}>
                          <p><b>Diagnosis (Without Glasses):</b><br />
                            {data?.opthalmic_examination?.without_glasses_diagnosis}
                          </p>
                        </Show>
        
                        <Show value={data?.opthalmic_examination?.with_glasses_diagnosis}>
                          <p><b>Diagnosis (With Glasses):</b><br />
                            {data?.opthalmic_examination?.with_glasses_diagnosis}
                          </p>
                        </Show>
        
                      </div>
                    </div>
                  </Show>
        
                  {/* OTHER */}
                  {/* <div className="border-b border-gray-500 pb-4">
                    <Show value={data?.remarks}>
                      <h3 className="font-bold">REMARKS</h3>
                      <p>{data?.remarks || "—"}</p>
                    </Show>
                    <p className="mt-3">
                      <b>Previous ID Expiry Date:</b> {formatDateDMY(calculateExpiredDate(data?.previous_renewal_date))}
                    </p>
                  </div> */}
        
                  <div className="mt-3 mb-4">
                    <h3 className="font-bold">CERTIFICATION</h3>
                    <textarea rows={3} className="no-scrollbar w-full p-1 border-none">
                      {`This is to certify that ${data?.name} ${data.employee_id ? `(Employee ID: ${data.employee_id})` : ""} ${data.designation ? `working as ${data.designation}` : ""} who has undergone Medical Examination on ${formatDateDMY(data?.fcaccForm?.date_of_issuance_of_certificate_for_competency_clearance)}, is declared Physically and Mentally Fit to continue the existing job / work. Consequently, He/She is herewith eligible for taking up Fitness Certificate against Competency Clearance.`}
                    </textarea>
                  </div>
        
                  <div className="flex mt-20 w-full justify-end">
                    <div className="w-1/5 text-center font-semibold">
                    <p>
                      DR P S SUNDAR RAJ
                    </p>
                    <p>CHIEF MEDICAL OFFICER</p>
                    <p>M.B.B.S, A.F.I.H, M.B.A</p>
                    <p>Regn No: 36928</p>
                    </div>
                  </div>
        
                </div>
              </div>
            </div>
    );
}

export default FCACCReportModal;