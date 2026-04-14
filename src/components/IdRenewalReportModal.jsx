import { FaX, FaPrint } from "react-icons/fa6";
import letterhead from "../assets/preemp_banner.png";
import { formatDateDMY } from "../utils/date";

function IdRenewalReportModal({ data, onClose, onConfirm }) {

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
        </div>

        {/* REPORT */}
        <div id="print-area" className="bg-white text-black p-6 rounded text-sm">

          {/* HEADER */}
          <div className="text-center">
            <img src={letterhead} className="w-full mb-2" />
            <h2 className="font-bold text-lg">ID RENEWAL MEDICAL REPORT</h2>
            <hr className="border-black my-2"/>
          </div>

          {/* PATIENT DETAILS */}
          <div className="grid grid-cols-2 gap-2 mb-4 border-b border-gray-500 pb-4">
  <Show value={data?.name}>
    <p><b>Name:</b> {data.name}</p>
  </Show>

  <Show value={data?.worker_id}>
    <p><b>ID:</b> {data.worker_id}</p>
  </Show>

  <Show value={data?.blood_group}>
    <p><b>Blood Group:</b> {data.blood_group}</p>
  </Show>

  <Show value={data?.date_of_renewal}>
    <p><b>Date:</b> {formatDateDMY(data.date_of_renewal)}</p>
  </Show>
</div>

          {/* VITALS */}
          <h3 className="font-bold mb-2">VITALS</h3>
          <div className="grid grid-cols-2 mb-4 border-b border-gray-500 pb-4">

  <Show value={data?.pulse}>
    <p><b>Pulse:</b> {data.pulse}</p>
  </Show>

  <Show value={data?.blood_pressure?.systolic && data?.blood_pressure?.diastolic}>
    <p><b>BP:</b> {data.blood_pressure?.systolic}/{data.blood_pressure?.diastolic}</p>
  </Show>

  <Show value={data?.spo2}>
    <p><b>SpO2:</b> {data.spo2}</p>
  </Show>

  <Show value={data?.height}>
    <p><b>Height:</b> {data.height} cm</p>
  </Show>

  <Show value={data?.weight}>
    <p><b>Weight:</b> {data.weight} kg</p>
  </Show>
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
  <div className="mb-4 border-b border-gray-500 pb-4">
    <h3 className="font-bold mb-2">VISION EXAMINATION</h3>

    <table className="w-full border text-sm text-center">
      <thead>
        <tr className="bg-gray-200">
          <th className="border p-1"></th>
          <th className="border p-1">Far (Without)</th>
          <th className="border p-1">Far (With)</th>
          <th className="border p-1">Near (Without)</th>
          <th className="border p-1">Near (With)</th>
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
        <p><b>Diagnosis (Without Glasses):</b><br/>
          {data?.opthalmic_examination?.without_glasses_diagnosis}
        </p>
      </Show>

      <Show value={data?.opthalmic_examination?.with_glasses_diagnosis}>
        <p><b>Diagnosis (With Glasses):</b><br/>
          {data?.opthalmic_examination?.with_glasses_diagnosis}
        </p>
      </Show>

    </div>
  </div>
</Show>

          {/* OTHER */}
          <div>
            <Show value={data?.remarks}>
              <h3 className="font-bold mb-2">REMARKS</h3>
              <p>{data?.remarks || "—"}</p>
            </Show>

            <p className="mt-2">
              <b>Vertigo Test:</b> {data?.vertigo_test_passed ? "Passed" : "Failed"}
            </p>
          </div>

        </div>
        <button
  onClick={onConfirm}
  className="bg-green-700 px-4 py-2 rounded"
>
  Confirm & Save
</button>
      </div>
    </div>
  );
}

export default IdRenewalReportModal;