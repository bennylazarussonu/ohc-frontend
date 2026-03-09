// import { useState } from "react";
// import api from "../api/axios";
// import { FaPrint, FaX } from "react-icons/fa6";
// import malaria_top from "../assets/malaria_top.png";
// import malaria_bottom from "../assets/malaria_bottom.png";
// import malaria_table from "../assets/malaria_table.png";

// function MalariaModal({ worker, onClose }) {

//   const [form, setForm] = useState({
//     name: worker.name,
//     fathers_name: worker.fathers_name,
//     aadhar_no: worker.aadhar_no,
//     phone_no: worker.phone_no,
//     contractor_name: worker.contractor_name,
//     date_of_test: new Date().toISOString().split("T")[0],
//     tested_by: "BMC"
//   });

//   const handleSave = async () => {
//     try {

//       const res = await api.post("/api/malaria/create", {
//         worker_id: worker.id,
//         date_of_test: form.date_of_test,
//         tested_by: form.tested_by
//       });

//       alert("Malaria test saved");

//       setTimeout(() => {
//         const printArea = document.querySelector(".print-area");
//         printViaIframe(printArea);
//       }, 0);

//     } catch (err) {
//       console.error(err);
//       alert("Failed to save");
//     }
//   };

//   function printViaIframe(element) {
//     const iframe = document.createElement("iframe");

//     iframe.style.position = "fixed";
//     iframe.style.right = "0";
//     iframe.style.bottom = "0";
//     iframe.style.width = "0";
//     iframe.style.height = "0";

//     document.body.appendChild(iframe);

//     const iframeDoc = iframe.contentWindow.document;

//     const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
//       .map(node => node.outerHTML)
//       .join("\n");

//     iframeDoc.open();
//     iframeDoc.write(`
//       <html>
//         <head>
//             <style>
//             @page {
//             size: A4;
//             margin: 10mm;
//           }
//           body {
//             zoom: 0.65;
//             margin: 0;
//             -webkit-print-color-adjust: exact;
//             print-color-adjust: exact;
//           }
//             .screen-only { display: inline-block; }
//   .print-only { display: none; }

//   @media print {
//     .screen-only { display: none !important; }
//     .print-only { display: inline-block !important; }
//   }
//           /* 🔥 THIS IS THE MAGIC */
//   .print-wrapper {
//     width: 100%;
//     height: 100%;
//     /*margin: 0 auto;*/
//     transform: scale(0.98);    /* ← tweak this */
//     transform-origin: top center;
//   }

//   /* Neutralize screen styles */
//   .print-area {
//     width: 100% !important;
//     max-width: 100% !important;
//     box-shadow: none !important;
//     border-radius: 0 !important;
//   }

//   /* Prevent accidental page breaks */
//   .print-area,
//   .print-area * {
//     page-break-inside: avoid;
//   }
//             </style>
//         </head>
//         <body>
//           ${element.outerHTML}
//         </body>
//       </html>
//     `);

//     iframeDoc.close();

//     iframe.onload = () => {
//       iframe.contentWindow.print();
//     };
//   }

//   return (
//     <div className="fixed inset-0 bg-black/60 flex justify-center items-center">

//       <div className="bg-white text-black p-6 rounded w-[800px]">

//         <div className="flex justify-between mb-4">
//           <h2 className="text-lg font-bold">Malaria Test</h2>
//           <button onClick={onClose}><FaX/></button>
//         </div>

//         <div className="grid grid-cols-2 gap-3">

//           <input value={form.name}
//             onChange={e=>setForm({...form,name:e.target.value})}/>

//           <input value={form.fathers_name}
//             onChange={e=>setForm({...form,fathers_name:e.target.value})}/>

//           <input value={form.aadhar_no}
//             onChange={e=>setForm({...form,aadhar_no:e.target.value})}/>

//           <input value={form.phone_no}
//             onChange={e=>setForm({...form,phone_no:e.target.value})}/>

//           <input type="date"
//             value={form.date_of_test}
//             onChange={e=>setForm({...form,date_of_test:e.target.value})}/>

//           <select
//             value={form.tested_by}
//             onChange={e=>setForm({...form,tested_by:e.target.value})}
//           >
//             <option>BMC</option>
//             <option>Diagnostic Lab</option>
//           </select>

//         </div>

//         <button
//           onClick={handleSave}
//           className="mt-4 bg-green-600 text-white px-4 py-2 rounded flex gap-2"
//         >
//           <FaPrint/>
//           Save & Generate Report
//         </button>

//       </div>

//       {/* PRINT AREA */}

//       <div className="instruction-page print-area hidden">

//         {/* PAGE 3 */}

//         <img src={malaria_top} className="instruction-image w-full"/>

//         <div className="grid grid-cols-8 w-full gap-y-10 gap-x-3 text-xl">

//               <div className="col-span-4 grid grid-cols-4 items-center">
//                 <p className="text-lg">विभाग</p>
//                 <div className="col-span-3 border-b border-gray-800 p-1">
//                   <p className="font-bold">SAFETY HEALTH ENVIRONMENT (SHE), MEIL-HCC JV</p>
//                 </div>
//               </div>
//               <div className="col-span-4 grid grid-cols-4 items-center">
//                 <p className="text-lg">सांकेतिक क्र.</p>
//                 <div className="col-span-3 border-b border-gray-800 p-1">
//                   <p className="font-bold">{form.id ? form.id : ""}</p>
//                 </div>
//               </div>

//               <div className="col-span-8 grid grid-cols-8 items-center">
//                 <div className="col-span-3">
//                   <p className="text-lg">कंत्राटदाराचे नाव/ कार्यस्थळ पत्ता/ संपर्क क्र.</p>
//                 </div>
//                 <div className="col-span-5">
//                   <div className="border-b border-gray-800 p-1">
//                     <p className="font-bold">{form.contractor_name ? form.contractor_name : ""}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="col-span-8 grid grid-cols-8 items-center">
//                 <div className="col-span-2">
//                   <p className="text-lg">कामगराचे नाव</p>
//                 </div>
//                 <div className="col-span-6">
//                   <div className="border-b border-gray-800 p-1">
//                     <p className="font-bold">{form.name ? form.name : ""}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="col-span-8 grid grid-cols-8 gap-x-5 items-center">
//                 <div className="col-span-1">
//                   <p className="text-lg">वय</p>
//                 </div>
//                 <div className="col-span-3">
//                   <div className="border-b border-gray-900 p-1">
//                     <p className="font-bold">{form.dob ? (calculateAge(form.dob) + " YRS") : ("")}</p>
//                   </div>
//                 </div>
//                 <div className="col-span-1">
//                   <p className="text-lg">पुरुष /  स्त्री</p>
//                 </div>
//                 <div className="col-span-3">
//                   <div className="border-b border-gray-900 p-1">
//                     <p className="font-bold">{form.gender ? form.gender : ""}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="col-span-8 grid grid-cols-8 items-center">
//                 <div className="col-span-3">
//                   <p className="text-lg">विकासकाचे नाव/ कार्यस्थळ पत्ता/ संपर्क क्र.</p>
//                 </div>
//                 <div className="col-span-5">
//                   <div className="border-b border-gray-900 p-1">
//                     <p className="font-bold">PROJECT OFFICE, BLOCK G, U.G. TERMINAL CONSTRUCTION PROJ.</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-span-8 grid grid-cols-8 items-center">
//                 <div className="col-span-8">
//                   <div className="border-b border-gray-900 p-1">
//                     <p className="font-bold">MUMBAI-AHMEDABAD HIGH-SPEED RAIL CORRIDOR, NEAR MMRDA GROUNDS, BANDRA (EAST),</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-span-8 grid grid-cols-8 items-center">
//                 <div className="col-span-8">
//                   <div className="border-b border-gray-900 p-1">
//                     <p className="font-bold">BANDRA KURLA COMPLEX, MUMBAI -400071</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//         <img src={malaria_bottom} className="instruction-image w-full"/>

//         {/* PAGE 4 */}

//         <img src={malaria_table} className="w-full"/>

//       </div>

//     </div>
//   );
// }

// export default MalariaModal;

import { useState } from "react";
import api from "../api/axios";
import { FaPrint, FaX } from "react-icons/fa6";
import malaria_top from "../assets/malaria_top.png";
import malaria_bottom from "../assets/malaria_bottom.png";
import malaria_table from "../assets/malaria_table.png";

function MalariaModal({ worker, onClose }) {

    const [form, setForm] = useState({
        name: worker.name,
        fathers_name: worker.fathers_name,
        aadhar_no: worker.aadhar_no,
        phone_no: worker.phone_no,
        contractor_name: worker.contractor_name,
        gender: worker.gender,
        dob: worker.dob,
        date_of_test: new Date().toISOString().split("T")[0],
        tested_by: "BMC"
    });
    console.log(form.dob);
    const [testsList, setTestsList] = useState([]);

    function calculateAge(dob) {
        if (!dob) return "";
        const today = new Date();
        const birth = new Date(dob);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    }

    const handleSave = async () => {
        try {

            await api.post("/api/malaria/create", {
                worker_id: worker.id,
                date_of_test: form.date_of_test,
                tested_by: form.tested_by
            });

            const worker_tests_list = await api.get(`/api/malaria/worker/${worker.id}`);
            const data = worker_tests_list.data;
            setTestsList(data);

            setTimeout(() => {
                const printArea = document.querySelector(".print-area");
                printViaIframe(printArea);
            }, 100);

        } catch (err) {
            console.error(err);
            alert("Failed to save");
        }
    };

    function printViaIframe(element) {

        const iframe = document.createElement("iframe");

        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";

        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow.document;

        const styles = Array.from(
            document.querySelectorAll("link[rel='stylesheet'],style")
        ).map(node => node.outerHTML).join("\n");

        iframeDoc.open();
        iframeDoc.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
${styles}
<style>

@page{
size:A4;
margin:0;
}

body{
margin:0;
-webkit-print-color-adjust:exact;
print-color-adjust:exact;
}

.hidden {
  display: block !important;
}

.page{
width:794px;
height:1123px;
page-break-after:always;
position:relative;
}

</style>
</head>
<body>

${element.outerHTML}

</body>
</html>
`);
        iframeDoc.close();

        iframe.onload = () => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        };

    }

    return (

        <div className="fixed inset-0 bg-black/60 flex justify-center items-center">

            <div className="bg-white text-black p-6 rounded w-[800px]">

                <div className="flex justify-between mb-4">
                    <h2 className="text-lg font-bold">Malaria Test</h2>
                    <button onClick={onClose}><FaX /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">

                    <input value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })} />

                    <input value={form.fathers_name}
                        onChange={e => setForm({ ...form, fathers_name: e.target.value })} />

                    <input value={form.aadhar_no}
                        onChange={e => setForm({ ...form, aadhar_no: e.target.value })} />

                    <input value={form.phone_no}
                        onChange={e => setForm({ ...form, phone_no: e.target.value })} />

                    <input type="date"
                        value={form.date_of_test}
                        onChange={e => setForm({ ...form, date_of_test: e.target.value })} />

                    <select
                        value={form.tested_by}
                        onChange={e => setForm({ ...form, tested_by: e.target.value })}
                    >
                        <option>BMC</option>
                        <option>Diagnostic Lab</option>
                    </select>

                </div>

                <button
                    onClick={handleSave}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded flex gap-2"
                >
                    <FaPrint />
                    Save & Generate Report
                </button>

            </div>


            {/* PRINT AREA */}

            <div className="print-area hidden">

                {/* PAGE 1 */}

                <div className="page">

                    <img
                        src={malaria_top}
                        className="absolute w-full"
                    />
                    <div className="grid grid-cols-8 w-full mx-3 px-2 gap-y-10 gap-x-1 text-sm">

                        <div className="col-span-4 grid grid-cols-4 items-center">
                            <p className="text-lg">विभाग</p>
                            <div className="col-span-3 border-b border-gray-800 p-1">
                                <p className="font-bold">SAFETY HEALTH ENVIRONMENT (SHE), MEIL-HCC JV</p>
                            </div>
                        </div>
                        <div className="col-span-4 grid grid-cols-4 items-center">
                            <p className="text-lg">सांकेतिक क्र.</p>
                            <div className="col-span-3 border-b border-gray-800 p-1">
                                <p className="font-bold">{form.id ? form.id : ""}</p>
                            </div>
                        </div>

                        <div className="col-span-8 grid grid-cols-8 items-center">
                            <div className="col-span-3">
                                <p className="text-lg">कंत्राटदाराचे नाव/ कार्यस्थळ पत्ता/ संपर्क क्र.</p>
                            </div>
                            <div className="col-span-5">
                                <div className="border-b border-gray-800 p-1">
                                    <p className="font-bold">{form.contractor_name ? form.contractor_name : ""}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-8 grid grid-cols-8 items-center">
                            <div className="col-span-2">
                                <p className="text-lg">कामगराचे नाव</p>
                            </div>
                            <div className="col-span-6">
                                <div className="border-b border-gray-800 p-1">
                                    <p className="font-bold">{form.name ? form.name : ""}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-8 grid grid-cols-8 gap-x-5 items-center">
                            <div className="col-span-1">
                                <p className="text-lg">वय</p>
                            </div>
                            <div className="col-span-3">
                                <div className="border-b border-gray-900 p-1">
                                    <p className="font-bold">{form.dob ? (calculateAge(form.dob) + " YRS") : ("")}</p>
                                </div>
                            </div>
                            <div className="col-span-1">
                                <p className="text-lg">पुरुष /  स्त्री</p>
                            </div>
                            <div className="col-span-3">
                                <div className="border-b border-gray-900 p-1">
                                    <p className="font-bold">{form.gender ? form.gender : ""}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-8 grid grid-cols-8 items-center">
                            <div className="col-span-3">
                                <p className="text-lg">विकासकाचे नाव/ कार्यस्थळ पत्ता/ संपर्क क्र.</p>
                            </div>
                            <div className="col-span-5">
                                <div className="border-b border-gray-900 p-1">
                                    <p className="font-bold">PROJECT OFFICE, BLOCK G, U.G. TERMINAL CONSTRUCTION PROJ.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-8 grid grid-cols-8 items-center">
                            <div className="col-span-8">
                                <div className="border-b border-gray-900 p-1">
                                    <p className="font-bold">MUMBAI-AHMEDABAD HIGH-SPEED RAIL CORRIDOR, NEAR MMRDA GROUNDS, BANDRA (EAST),</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-8 grid grid-cols-8 items-center">
                            <div className="col-span-8">
                                <div className="border-b border-gray-900 p-1">
                                    <p className="font-bold">BANDRA KURLA COMPLEX, MUMBAI -400071</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />

                    {/* Department

<div
className="absolute text-[18px] font-semibold"
style={{top:"215px",left:"210px"}}
>
SAFETY HEALTH ENVIRONMENT (SHE), MEIL-HCC JV
</div>



<div
className="absolute text-[18px] font-semibold"
style={{top:"215px",left:"610px"}}
>
{worker.id}
</div>


<div
className="absolute text-[18px] font-semibold"
style={{top:"285px",left:"260px"}}
>
{form.contractor_name}
</div>


<div
className="absolute text-[18px] font-semibold"
style={{top:"335px",left:"260px"}}
>
{form.name}
</div>


<div
className="absolute text-[18px] font-semibold"
style={{top:"380px",left:"150px"}}
>
{calculateAge(form.dob)} YRS
</div>


<div
className="absolute text-[18px] font-semibold"
style={{top:"380px",left:"430px"}}
>
{form.gender}
</div> */}

                    <img
                        src={malaria_bottom}
                        className="absolute bottom-0 w-full"
                    />

                </div>


                {/* PAGE 2 */}

                <div className="page">

                    <img
                        src={malaria_table}
                        className="absolute inset-0 w-full h-full"
                    />

                    {testsList.map((test, index) => (
  <div
    key={index}
    className="absolute w-full font-semibold text-[16px] z-100"
    style={{ top: 170 + index * 35 }}
  >

    <div className="absolute" style={{ left: "90px" }}>
      {new Date(test.date_of_test).toLocaleString("en-IN", { month: "long" })}
    </div>

    <div className="absolute" style={{ left: "160px" }}>
      {new Date(test.date_of_test).toLocaleDateString("en-GB")}
    </div>

    <div className="absolute w-full" style={{ left: "270px", width: "100%"}}>
      MP SMEAR TEST IS __________________
    </div>

  </div>
))}

                    {/* Month */}

                    {/* <div
                        className="absolute text-[16px] font-semibold"
                        style={{ top: "170px", left: "90px" }}
                    >
                        {new Date(form.date_of_test).toLocaleString("en-IN", { month: "long" })}
                    </div> */}

                    {/* Date */}

                    {/* <div
                        className="absolute text-[16px] font-semibold"
                        style={{ top: "170px", left: "160px" }}
                    >
                        {new Date(form.date_of_test).toLocaleDateString("en-GB")}
                    </div> */}

                    {/* Result */}

                    {/* <div
                        className="absolute text-[16px] font-semibold"
                        style={{ top: "170px", left: "270px" }}
                    >
                        MP SMEAR TEST IS __________________
                    </div> */}

                </div>

            </div>

        </div>

    );
}

export default MalariaModal;