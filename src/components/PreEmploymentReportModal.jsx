import { useState, useEffect } from "react";
import api from "../api/axios";
import { FaX, FaPrint, FaXmark } from "react-icons/fa6";
import { useAuth } from '../context/AuthContext';
import letterhead from "../assets/preemp_banner.png"
import image from "../assets/image.png";

function PreEmploymentReportModal({ data, onClose, onSuccess }) {
  // const [form, setForm] = useState({
  //   presentation: data.presentation,
  //   physical_examination: data.physical_examination,
  //   general_examination: data.general_examination,
  //   clinical_impression: data.clinical_impression,
  //   final_recommendation: data.final_recommendation,
  //   medical_examiner: "",
  //   duty_fit: null // true / false
  // });
  const { user, loading } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const selectedDoctor = doctors.find(
    d => Number(d.id) === Number(selectedDoctorId)
  );
  const readOnly = data.status === "Declared Fit" || data.status === "Declared Unfit";

  const [form, setForm] = useState({
    ...data,
    physical_fitness: `I HEREBY CERTIFY THAT I HAVE PERSONALLY EXAMINED ${data.name} ${data.fathers_name ? (`SON OF ${data.fathers_name}`) : ("")} ${data.residence ? (`A RESIDENT OF ${data.residence}`) : ("")} WHO IS DESIROUS OF BEING EMPLOYED IN UNDERGROUND BUILDING & CONSTRUCTION PROJECT OF UNDERGROUND HIGH SPEED RAIL TERMINAL, OF NHSRCL, BKC, MUMBAI - 400071 (INCLUDING HEIGHTS) ${(data.dob) ? ("AND THAT HIS AGE AS NEARLY AS CAN BE ASCERTAINED BY MY EXAMINATION IS " + calculateAge(data.dob)) : ("")} AND THAT HE IS FIT FOR DUTY FOR EMPLOYMENT IN THIS PROJECT OF MUMBAI AHMEDABAD HIGHSPEED RAIL CORRIDOR (MAHSRC), AT BANDRA KURLA COMPLEX, MUMBAI, AS AN ADULT.`
  });

  const [visionForm, setVisionForm] = useState({
    far_left_wo: form.opthalmic_examination?.far_vision?.without_glasses?.left ?? 6,
    far_right_wo: form.opthalmic_examination?.far_vision?.without_glasses?.right ?? 6,
    far_left_w: form.opthalmic_examination?.far_vision?.with_glasses?.left ?? "",
    far_right_w: form.opthalmic_examination?.far_vision?.with_glasses?.right ?? "",

    near_left_wo: form.opthalmic_examination?.near_vision?.without_glasses?.left ?? 6,
    near_right_wo: form.opthalmic_examination?.near_vision?.without_glasses?.right ?? 6,
    near_left_w: form.opthalmic_examination?.near_vision?.with_glasses?.left ?? "",
    near_right_w: form.opthalmic_examination?.near_vision?.with_glasses?.right ?? "",

    color_perception: form.opthalmic_examination?.color_perception ?? "",
    without_glasses_diagnosis: form.opthalmic_examination?.without_glasses_diagnosis ?? "",
    with_glasses_diagnosis: form.opthalmic_examination?.with_glasses_diagnosis ?? ""
  });

  console.log("Form: ", form);
  console.log("Vision Form: ", visionForm);


  function formatISTDate(date) {
    return new Date(date).toLocaleDateString("en-GB", {
      timeZone: "Asia/Kolkata"
    });
  }

  function calculateAge(dob) {
    const today = new Date();
    dob = new Date(dob);

    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }

  function calculateBMIStatus(bmi) {
    if (bmi < 16) {
      return "Grossly Underweight";
    } else if (bmi >= 16 && bmi < 18.5) {
      return "Underweight";
    } else if (bmi >= 18.5 && bmi <= 25) {
      return "Normal";
    } else if (bmi > 25 && bmi <= 26) {
      return "Slightly Above Weight";
    } else if (bmi > 26 && bmi <= 30) {
      return "Mild Obesity (Class I)";
    } else if (bmi > 30 && bmi <= 33) {
      return "Moderately Obese (Class II)";
    } else if (bmi > 33) {
      return "Overweight";
    }
  }

  const diagnoseVision = (acuity) => {
    if (!acuity) return ["missing value", 6];

    const val = acuity.toString().trim().toUpperCase();

    switch (val) {
      case "6":
        return ["normal vision", 1];
      case "8":
      case "9":
      case "10":
      case "12":
        return ["mild visual impairment", 2];
      case "14":
      case "18":
      case "24":
        return ["moderate visual impairment", 3];
      case "36":
      case "60":
        return ["severe visual impairment", 4];
      case "PL":
      case "NPL":
      case "CF":
      case "HM":
        return ["profound vision loss or blindness", 5];
      default:
        return ["unrecognized or missing score", 6];
    }
  };


  const getFinalDiagnosis = (leftScore, rightScore) => {
    if (leftScore === 6 && rightScore === 6)
      return "values missing for both eyes";

    if (leftScore === 6)
      return "diagnosis based on right eye only";

    if (rightScore === 6)
      return "diagnosis based on left eye only";

    if (leftScore === 1 && rightScore === 1)
      return "normal visual acuity";

    if (leftScore === 2 && rightScore === 2)
      return "mild refractive error in both eyes";

    if (leftScore === 3 && rightScore === 3)
      return "moderate refractive error in both eyes";

    if (leftScore >= 4 && rightScore >= 4)
      return "significant refractive error in both eyes";

    return "asymmetrical refractive error between eyes";
  };

  const updateVision = (path, value) => {
    setForm(prev => {
      const updated = structuredClone(prev);
      let ref = updated.opthalmic_examination;

      for (let i = 0; i < path.length - 1; i++) {
        ref = ref[path[i]];
      }

      ref[path[path.length - 1]] = value;
      return updated;
    });

    // setTimeout(generateOphthalmicDiagnosis, 0);
  };

  const calculateBMI = () => {
    if (!form.weight || !form.height) return "";
    const h = form.height / 100;
    return (form.weight / (h * h)).toFixed(2);
  };


  useEffect(() => {
    setForm(prev => ({
      ...prev,
      ...data
    }));


    setVisionForm({
      far_left_wo: data.opthalmic_examination?.far_vision?.without_glasses?.left ?? 6,
      far_right_wo: data.opthalmic_examination?.far_vision?.without_glasses?.right ?? 6,
      far_left_w: data.opthalmic_examination?.far_vision?.with_glasses?.left ?? "",
      far_right_w: data.opthalmic_examination?.far_vision?.with_glasses?.right ?? "",
      near_left_wo: data.opthalmic_examination?.near_vision?.without_glasses?.left ?? 6,
      near_right_wo: data.opthalmic_examination?.near_vision?.without_glasses?.right ?? 6,
      near_left_w: data.opthalmic_examination?.near_vision?.with_glasses?.left ?? "",
      near_right_w: data.opthalmic_examination?.near_vision?.with_glasses?.right ?? "",
      color_perception: data.opthalmic_examination?.color_perception ?? "",
      without_glasses_diagnosis: data.opthalmic_examination?.without_glasses_diagnosis ?? "",
      with_glasses_diagnosis: data.opthalmic_examination?.with_glasses_diagnosis ?? ""
    });

    setSelectedDoctorId(data.medical_examiner_id ?? null);
  }, [data]);



  useEffect(() => {
    if (!user) return;

    api.get("/api/doctors").then(res => {
      setDoctors(res.data);

      // 🔒 If logged-in user is DOCTOR, auto-select themselves
      if (user.role === "DOCTOR") {
        const matchedDoctor = res.data.find(d =>
          d.name.toLowerCase().includes(user.userId.toLowerCase())
        );

        if (matchedDoctor) {
          setSelectedDoctorId(matchedDoctor.id);
        }
      }
    });
  }, [user]);

  // 1) useEffect to compute diagnoses from visionForm
  useEffect(() => {
    //   setForm(prev => ({
    //   ...prev,
    //   physical_fitness: `I HEREBY CERTIFY THAT I HAVE PERSONALLY EXAMINED ${form.name} ${form.fathers_name ? (`SON OF ${form.fathers_name}`): ("")} ${form.residence ? (`A RESIDENT OF ${form.residence}`) : ("")} WHO IS DESIROUS OF BEING EMPLOYED IN UNDERGROUND BUILDING & CONSTRUCTION PROJECT OF UNDERGROUND HIGH SPEED RAIL TERMINAL, OF NHSRCL, BKC, MUMBAI - 400071 (INCLUDING HEIGHTS) ${(form.dob) ? ("AND THAT HIS AGE AS NEARLY AS CAN BE ASCERTAINED BY MY EXAMINATION IS " + calculateAge(form.dob)): ("")} AND THAT HE IS FIT FOR DUTY FOR EMPLOYMENT IN THIS PROJECT OF MUMBAI AHMEDABAD HIGHSPEED RAIL CORRIDOR (MAHSRC), AT BANDRA KURLA COMPLEX, MUMBAI, AS AN ADULT.`
    // }));
    // setSelectedDoctorId(prev => prev ?? form?.medical_examiner_id);

    const inputs = {
      "Distant Right": {
        without: visionForm.far_right_wo,
        with: visionForm.far_right_w
      },
      "Distant Left": {
        without: visionForm.far_left_wo,
        with: visionForm.far_left_w
      },
      "Near Right": {
        without: visionForm.near_right_wo,
        with: visionForm.near_right_w
      },
      "Near Left": {
        without: visionForm.near_left_wo,
        with: visionForm.near_left_w
      }
    };

    const withoutResults = {};
    const withResults = {};
    const withoutScores = {};
    const withScores = {};

    Object.entries(inputs).forEach(([eye, values]) => {
      const [woDiag, woScore] = diagnoseVision(values.without);
      const [wDiag, wScore] = diagnoseVision(values.with);

      withoutResults[eye] = woDiag;
      withResults[eye] = wDiag;

      withoutScores[eye] = woScore;
      withScores[eye] = wScore;
    });

    const hasWithoutGlassesValues = Object.values(inputs).some(v => v.without);
    const hasWithGlassesValues = Object.values(inputs).some(v => v.with);

    const withoutDistantFinal = getFinalDiagnosis(
      withoutScores["Distant Left"],
      withoutScores["Distant Right"]
    );

    const withoutNearFinal = getFinalDiagnosis(
      withoutScores["Near Left"],
      withoutScores["Near Right"]
    );

    const withDistantFinal = getFinalDiagnosis(
      withScores["Distant Left"],
      withScores["Distant Right"]
    );

    const withNearFinal = getFinalDiagnosis(
      withScores["Near Left"],
      withScores["Near Right"]
    );

    let without_glasses_diagnosis = "";
    let with_glasses_diagnosis = "";

    if (!hasWithoutGlassesValues) {
      without_glasses_diagnosis =
        "Not Applicable- Not checked: for distant vision without glasses, and not checked: for near vision without glasses.";
    } else {
      without_glasses_diagnosis = "Without glasses, ";
      without_glasses_diagnosis +=
        `the right eye shows ${withoutResults["Distant Right"]} for distant vision and shows ${withoutResults["Near Right"]} for near vision.\n`;
      without_glasses_diagnosis +=
        `The left eye shows ${withoutResults["Distant Left"]} for distant vision and shows ${withoutResults["Near Left"]} for near vision.\n`;
      without_glasses_diagnosis +=
        `Overall, distant vision has ${withoutDistantFinal}, and near vision has ${withoutNearFinal}.`;
    }

    if (!hasWithGlassesValues) {
      with_glasses_diagnosis =
        "Not Applicable- Not checked: for distant vision with glasses, and not checked: for near vision with glasses.";
    } else {
      with_glasses_diagnosis = "With glasses, ";
      with_glasses_diagnosis +=
        `the right eye shows ${withResults["Distant Right"]} for distant vision and shows ${withResults["Near Right"]} for near vision.\n`;
      with_glasses_diagnosis +=
        `The left eye shows ${withResults["Distant Left"]} for distant vision and shows ${withResults["Near Left"]} for near vision.\n`;
      with_glasses_diagnosis +=
        `Overall, distant vision has ${withDistantFinal}, and near vision has ${withNearFinal}.`;
    }

    setVisionForm(prev => ({
      ...prev,
      without_glasses_diagnosis,
      with_glasses_diagnosis
    }));
  }, [
    visionForm.far_left_wo,
    visionForm.far_right_wo,
    visionForm.near_left_wo,
    visionForm.near_right_wo,
    visionForm.far_left_w,
    visionForm.far_right_w,
    visionForm.near_left_w,
    visionForm.near_right_w
  ]);


  useEffect(() => {
    setForm(prev => ({
      ...prev,
      opthalmic_examination: {
        far_vision: {
          without_glasses: {
            left: visionForm.far_left_wo,
            right: visionForm.far_right_wo
          },
          with_glasses: {
            left: visionForm.far_left_w,
            right: visionForm.far_right_w
          }
        },
        near_vision: {
          without_glasses: {
            left: visionForm.near_left_wo,
            right: visionForm.near_right_wo
          },
          with_glasses: {
            left: visionForm.near_left_w,
            right: visionForm.near_right_w
          }
        },
        color_perception: visionForm.color_perception,
        without_glasses_diagnosis: visionForm.without_glasses_diagnosis,
        with_glasses_diagnosis: visionForm.with_glasses_diagnosis
      }
    }));
  }, [visionForm]);


  const handleSave = async () => {
    if (form.duty_fit == null) {
      alert("Please select FIT or UNFIT for duty");
      return;
    }

    if (!selectedDoctorId) {
      alert("Please select a Medical Examiner");
      return;
    }

    if (form.physical_parameters.chest_circumference?.inspiration < form.physical_parameters.chest_circumference?.expiration) {
      alert("Chest Circumference on Expiration cannot be greater than Chest Circumference on Inspiration");
      return;
    }

    try {
      await api.post("/api/pre-employment/finalize", {
        preemployment_id: data.id,  // string ID like "PRE001"
        medical_examiner_id: selectedDoctorId,
        ...form
      });
      alert("Successfully saved");

      onSuccess();
      onClose();
      setTimeout(() => {
        window.print();
      }, 0);


      // const printArea = document.querySelector('.print-area');
      // const scale = 0.95; // Your perfect scale

      // // Apply 75% scale before print
      // printArea.style.transform = `scale(${scale})`;
      // printArea.style.transformOrigin = 'center';
      // printArea.style.width = `${100 / scale}%`;

      // Clone the entire print area
      // const printArea = document.querySelector('.print-area');
      // const clonedArea = printArea.cloneNode(true);

      // // Remove all no-print elements from clone
      // const noPrintElements = clonedArea.querySelectorAll('.no-print');
      // noPrintElements.forEach(el => el.remove());

      // // Get ALL CSS from the current document
      // const allStyles = [];

      // // Get all style tags
      // document.querySelectorAll('style').forEach(style => {
      //   allStyles.push(`<style>${style.innerHTML}</style>`);
      // });

      // // Get all stylesheet links
      // document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      //   allStyles.push(`<link rel="stylesheet" href="${link.href}">`);
      // });

      // // Create a new window
      // const printWindow = window.open('', '_blank');

      // // Build the HTML with exact same styles
      // printWindow.document.write(`
      //   <!DOCTYPE html>
      //   <html>
      //     <head>
      //       <title>Medical Report - ${data.name}</title>
      //       <meta charset="UTF-8">
      //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
      //       ${allStyles.join('\n')}
      //       <style>
      //         /* Print-specific overrides */
      //         @media print {
      //           body {
      //             margin: 0 !important;
      //             padding: 0 !important;
      //             background: white !important;
      //             -webkit-print-color-adjust: exact;
      //             print-color-adjust: exact;
      //           }

      //           .print-area {
      //             width: 100% !important;
      //             max-width: 100% !important;
      //             margin: 0 auto !important;
      //             padding: 0 !important;
      //             transform: none !important;
      //             box-shadow: none !important;
      //             border: none !important;
      //           }

      //           /* Ensure grid layout works in print */
      //           .grid {
      //             display: grid !important;
      //           }

      //           .grid-cols-4 {
      //             grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      //           }

      //           .grid-cols-2 {
      //             grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      //           }

      //           .grid-cols-5 {
      //             grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
      //           }

      //           .col-span-1 { grid-column: span 1 / span 1 !important; }
      //           .col-span-2 { grid-column: span 2 / span 2 !important; }
      //           .col-span-3 { grid-column: span 3 / span 3 !important; }
      //           .col-span-4 { grid-column: span 4 / span 4 !important; }

      //           /* Remove borders from form elements */
      //           textarea, input, select {
      //             border: none !important;
      //             background: transparent !important;
      //             outline: none !important;
      //             box-shadow: none !important;
      //           }

      //           select {
      //             appearance: none !important;
      //             -webkit-appearance: none !important;
      //             -moz-appearance: none !important;
      //           }

      //           /* Page setup */
      //           @page {
      //             margin: 15mm;
      //             size: A4;
      //           }

      //           /* Hide instruction page if not needed */
      //           .instruction-page {
      //             page-break-before: always;
      //           }

      //           /* Force no page breaks inside sections */
      //           .print-area > div,
      //           .print-area > section {
      //             page-break-inside: avoid;
      //           }
      //         }

      //         /* Non-print styles to ensure layout */
      //         body {
      //           font-family: system-ui, -apple-system, sans-serif;
      //           background: white;
      //           color: black;
      //         }

      //         .print-area {
      //           width: 210mm;
      //           min-height: 297mm;
      //           padding: 20px;
      //           margin: 0 auto;
      //           background: white;
      //         }

      //         /* Ensure all Tailwind utilities work */
      //         .bg-white { background-color: white !important; }
      //         .text-black { color: black !important; }
      //         .border { border-width: 1px !important; }
      //         .border-gray-700 { border-color: #374151 !important; }
      //         .border-gray-900 { border-color: #111827 !important; }
      //         .rounded { border-radius: 0.25rem !important; }
      //         .shadow-lg { box-shadow: none !important; }
      //         .p-6 { padding: 1.5rem !important; }
      //         .gap-x-15 { column-gap: 3.75rem !important; }
      //         .gap-x-1 { column-gap: 0.25rem !important; }
      //         .gap-x-2 { column-gap: 0.5rem !important; }
      //         .mb-1 { margin-bottom: 0.25rem !important; }
      //         .mb-2 { margin-bottom: 0.5rem !important; }
      //         .mb-4 { margin-bottom: 1rem !important; }
      //         .mt-2 { margin-top: 0.5rem !important; }
      //         .mt-3 { margin-top: 0.75rem !important; }
      //         .mt-4 { margin-top: 1rem !important; }
      //         .my-2 { margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; }
      //         .my-4 { margin-top: 1rem !important; margin-bottom: 1rem !important; }
      //         .text-sm { font-size: 0.875rem !important; }
      //         .text-sm\\/3 { font-size: 0.875rem !important; line-height: 1.3 !important; }
      //         .text-sm\\/4 { font-size: 0.875rem !important; line-height: 1.4 !important; }
      //         .text-sm\\/5 { font-size: 0.875rem !important; line-height: 1.5 !important; }
      //         .text-xs { font-size: 0.75rem !important; }
      //         .text-base\\/3 { font-size: 1rem !important; line-height: 1.3 !important; }
      //         .font-semibold { font-weight: 600 !important; }
      //         .font-bold { font-weight: 700 !important; }
      //         .text-center { text-align: center !important; }
      //         .text-left { text-align: left !important; }
      //         .text-right { text-align: right !important; }
      //         .w-full { width: 100% !important; }
      //         .w-3\\/4 { width: 75% !important; }
      //         .w-1\\/4 { width: 25% !important; }
      //         .w-2\\/8 { width: 25% !important; }
      //         .flex { display: flex !important; }
      //         .justify-between { justify-content: space-between !important; }
      //         .justify-center { justify-content: center !important; }
      //         .justify-end { justify-content: flex-end !important; }
      //         .items-center { align-items: center !important; }
      //         .items-start { align-items: flex-start !important; }
      //         .gap-1 { gap: 0.25rem !important; }
      //         .gap-2 { gap: 0.5rem !important; }
      //         .gap-4 { gap: 1rem !important; }
      //         .gap-6 { gap: 1.5rem !important; }
      //         .leading-tight { line-height: 1.25 !important; }
      //         .uppercase { text-transform: uppercase !important; }
      //         .resize-none { resize: none !important; }
      //         .no-scrollbar::-webkit-scrollbar { display: none !important; }
      //         .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      //         .whitespace-nowrap { white-space: nowrap !important; }
      //       </style>
      //     </head>
      //     <body class="bg-white">
      //       ${clonedArea.outerHTML}
      //       <script>
      //         // Wait for all styles to load
      //         window.addEventListener('load', function() {
      //           // Small delay to ensure rendering
      //           setTimeout(function() {
      //             window.print();
      //             // Close after printing
      //             window.onafterprint = function() {
      //               window.close();
      //             };
      //           }, 300);
      //         });
      //       </script>
      //     </body>
      //   </html>
      // `);
      // printWindow.document.close();

      // Reset
      // setTimeout(() => {
      //   printArea.style.transform = '';
      //   printArea.style.height = '';
      //   printArea.style.transformOrigin = '';
      // }, 1000);
      //   onSuccess();
      //   onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save report");
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black/70 z-50 flex justify-center items-start overflow-auto">
      <div className="w-[95%] max-w-6xl">
        {/* Actions */}
        <div className="flex justify-end gap-4 mb-4 no-print">
          <button onClick={onClose}>
            <FaX />
          </button>
          {(user?.role === "ADMIN" || !readOnly) && (
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FaPrint />
              Save & Print Report
            </button>
          )}
        </div>
        <div className="print-area bg-white text-black w-[95vw] max-w-6xl top-0 left-0 p-6 rounded shadow-lg text-sm/3">

          {/* Header */}
          {/* <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">PRE-EMPLOYMENT MEDICAL REPORT</h2>
          </div> */}
          <div className="w-full flex justify-center items-center flex-col">
            <img src={letterhead} alt="Letterhead Banner" style={{ width: "100%", height: "100%" }} />
            {/* <h1 className="text-[32px]/10 font-bold m-0 p-0">MEGHA ENGINEERING & INFRASTRUCTURES LTD.</h1> */}
            <p className="text-base/3 font-bold mb-[2px]">FORM XXXIX (See Rule 122)</p>
          </div>
          <hr className="border-t border-[2px] bg-gray-900 border-gray-900" />
          <p className="text-sm/3 font-semibold my-[1px] text-center">Medical Examination Report</p>
          <hr className="border-t border-[2px] bg-gray-900 border-gray-900 mb-2" />

          {/* Candidate Details */}
          <section className="grid grid-cols-4 gap-x-15 text-sm">
            {form.id && (
              <div className="grid col-span-2 grid-cols-2 font-semibold mb-0">
                <p>
                  Certrificate ID
                </p>
                <p className="text-left text-sm/4">: {form.id}</p>
              </div>
            )}
            <div className="grid col-span-2 row-span-2 grid-cols-2 font-semibold">
              <p>Project</p>
              <p className="text-sm/3">: MAHSRC, UG-HSR TERMINAL, BKC, MUMBAI - 400051 (PROJECT NO. 3264 - PKG. C-1)
              </p>
            </div>
            {form.contractor_name && (
              <div className="grid col-span-2 grid-cols-2 gap-x-1 font-semibold">
                <div className="flex justify-between">
                  <p>Contractor Name</p>
                  :
                </div>
                <input type="text"
                  className="bg-transparent text-sm/4 focus:outline-none p-0 m-0 w-full"
                  value={form.contractor_name}
                  onChange={e => setForm(prev => ({
                    ...prev,
                    contractor_name: e.target.value
                  }))}
                  />
              </div>
            )}
            <div className="grid grid-cols-2 col-span-2 font-semibold">
              <p>Date of Examination</p>
              <p className="">: {formatISTDate(form.date_of_examination)}</p>
            </div>
            <div className="col-span-2"></div>
            <div className="col-span-4 border-b border-gray-900"></div>
            {form.name && (
              <div className="grid col-span-4 grid-cols-4 gap-x-1 font-semibold p-0">
                <div className="flex justify-between">
                  <p>Name</p>
                  :
                </div>
                {/* <p className="text-sm/4 col-span-3">: {form.name}</p> */}
                <input type="text"
                  className="bg-transparent text-sm/4 focus:outline-none p-0 m-0 w-full"
                  value={form.name}
                  onChange={e => setForm(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </div>
            )}
            <div className="col-span-4 grid grid-cols-2">
              <div>
                <div className={`grid col-span-2 grid-cols-2 gap-x-1 font-semibold p-0 ${!form.fathers_name ? ("no-print") : ("")}`}>
                  <div className="flex justify-between">
                    <p>Father's Name</p>
                    :
                  </div>
                  <input type="text"
                    className="bg-transparent text-sm/4 focus:outline-none p-0 m-0 w-full"
                    value={form.fathers_name}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      fathers_name: e.target.value
                    }))}
                  />
                </div>
                {form.gender && (
                  <div className="grid col-span-2 grid-cols-2 gap-x-1 font-semibold">
                    <div className="flex justify-between">
                      <p>Gender</p>
                      :
                    </div>
                    <select
                      style={{ appearance: "none", "-webkit-appearance": "none", "-moz-appearance": "none" }}
                      className="bg-transparent text-sm/4e focus:outline-none"
                      value={form.gender}
                      onChange={e =>
                        setForm(prev => ({ ...prev, gender: e.target.value }))
                      }
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                )}
                <div className={`grid col-span-2 grid-cols-2 gap-x-1 font-semibold ${!form.dob ? ("no-print") : ("")}`}>
                  <div className="flex justify-between">
                    <p>Age</p>
                    :
                  </div>
                  <p className="text-left text-sm/4"> {calculateAge(form.dob)} Years</p>
                </div>
              </div>
              <div>
                <div className={`grid col-span-2 grid-cols-2 gap-x-1 font-semibold ${!form.dob ? ("no-print") : ("")}`}>
                  <div className="flex justify-between">
                    <p>Date of Birth</p>
                    :
                  </div>
                  <input type="date"
                    className="bg-transparent text-sm/4 focus:outline-none p-0 m-0 w-full"
                    value={form.dob ? form.dob.split("T")[0] : ""}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      dob: e.target.value
                    }))}
                  />
                </div>
                <div className={`grid col-span-2 grid-cols-2 gap-x-1 font-semibold ${!form.aadhar_no ? ("no-print") : ("")}`}>
                  <div className="flex justify-between">
                    <p>Aadhar</p>
                    :
                  </div>
                  <input type="text"
                    className="bg-transparent text-sm/4 focus:outline-none p-0 m-0 w-full"
                    value={form.aadhar_no}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      aadhar_no: e.target.value
                    }))}
                  />
                </div>
                <div className={`grid col-span-2 grid-cols-2 gap-x-1 font-semibold ${!form.phone_no ? ("no-print") : ("")}`}>
                  <div className="flex justify-between">
                    <p>Phone No</p>
                    :
                  </div>
                  <input type="text"
                    className="bg-transparent text-sm/4 focus:outline-none p-0 m-0 w-full"
                    value={form.phone_no}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      phone_no: e.target.value
                    }))}
                  />
                </div>
              </div>
            </div>
            {(form.identification_marks.length > 0) && (
              <div className="grid col-span-4 grid-cols-4 font-semibold gap-x-1 p-0">
                <div className="flex justify-between">
                  <p>ID Marks</p>
                  :
                </div>
                <input type="text"
                  className="bg-transparent text-sm/4 col-span-3 focus:outline-none p-0 m-0 w-full"
                  value={form.identification_marks?.join(", ") || ""}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      identification_marks: e.target.value
                        .split(",")
                        .map(s => s.trim())
                    }))
                  }
                />
              </div>
            )}
            <div className={`col-span-4 font-semibold gap-x-1 ${!form.residence ? ("no-print") : ("")}`}>
              <div className="grid grid-cols-4">
                <div className="flex justify-between">
                  <p>Address</p>
                  :
                </div>
                <input type="text"
                  className="bg-transparent text-sm/4 col-span-3 focus:outline-none p-0 m-0 w-full"
                  value={form.residence}
                  onChange={e => setForm(prev => ({
                    ...prev,
                    residence: e.target.value
                  }))}
                />
              </div>
            </div>
            {/* {form.date_of_examination && (
            <div className="grid col-span-2 grid-cols-2 font-semibold p-0">
              <p>Date of Examination</p>
              <p className="text-sm/4">: {formatISTDate(form.date_of_examination)}</p>
            </div>
          )} */}
          </section>

          <hr className="border-t bg-gray-900 border-gray-900 mb-1" />
          {[
            ["PRESENTATION", "presentation"],
          ].map(([label, key]) => (
            <>
              <div key={key} className="grid grid-cols-4 gap-x-1 mb-2">
                <div className="flex justify-between">
                  <p className="font-semibold col-span-1">{label}</p>
                  <p>:</p>
                </div>
                <textarea
                  value={form[key]}
                  rows={3}
                  className="w-full text-sm/4 rounded p-0 col-span-3 resize-none no-scrollbar"
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
              <hr className="border-t bg-gray-900 border-gray-900 mb-1" />
            </>
          ))}
          {/* Editable Sections */}
          {[
            ["PHYSICAL EXAMINATION (Including HEENT[Head, Eyes, Ears, Nose, Throat & Teeth])", "physical_examination"],
            ["GENERAL EXAMINATION", "general_examination"],

          ].map(([label, key]) => (
            <div key={key} className="grid grid-cols-4 gap-x-1 mb-1">
              <div className="flex justify-between">
                <p className="font-semibold col-span-1">{label}</p>
                <p>:</p>
              </div>
              <textarea
                value={form[key]}
                rows={(Math.ceil(form[key].length / 100))}
                className="w-full text-sm/4 rounded pb-[0.5px] col-span-3 no-scrollbar resize-none"
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
          {/* ["Clinical Impression", "clinical_impression"],
          ["Final Recommendation", "final_recommendation"] */}

          {/* Physical Parameters */}
          <div className="grid grid-cols-4 text-sm/4">
            <p className="col-span-4 font-semibold mb-1">PHYSICAL PARAMETERS</p>

            <div className="col-span-2">
              {[
                ["TEMPERATURE", "temperature", "°F"],
                ["WEIGHT", "weight", "Kg"],
                ["HEIGHT", "height", "cm"],
                ["HEART RATE (PULSE)", "pulse", "beats/min"],
              ].map(([label, key, unit]) => {
                const value =
                  ["inspiration", "expiration"].includes(key)
                    ? form.physical_parameters.chest_circumference?.[key] ?? ""
                    : form.physical_parameters[key] ?? "";
                return (
                  <div key={key} className={`grid col-span-2 grid-cols-2 gap-x-1 mb-[1px] ${value ? "" : "no-print"}`}>
                    <div className="flex justify-between items-center">
                      <div><p>{label}</p></div>
                      <div>:</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        className="bg-transparent text-sm/4 focus:outline-none p-0 m-0 min-w-[15px] max-w-[26px]"
                        value={value}
                        onChange={e => {
                          const v = e.target.value;
                          setForm(prev => {
                            const height = key === "height" ? v : prev.physical_parameters.height;
                            const weight = key === "weight" ? v : prev.physical_parameters.weight;
                            let bmi = prev.physical_parameters.bmi;
                            if (height && weight) {
                              const hm = height / 100;
                              bmi = Number((weight / (hm * hm)).toFixed(2));
                            }
                            return {
                              ...prev,
                              physical_parameters: {
                                ...prev.physical_parameters,
                                ...(key === "inspiration" || key === "expiration"
                                  ? {
                                    chest_circumference: {
                                      ...prev.physical_parameters.chest_circumference,
                                      [key]: Number(v)
                                    }
                                  }
                                  : { [key]: Number(v) }),
                                bmi
                              }
                            };
                          });
                        }}
                      />
                      {unit && <span className="text-xs whitespace-nowrap">{unit}</span>}
                    </div>

                  </div>
                );

              })}
              {[
                ["BLOOD PRESSURE", "blood_pressure", "mmHg"]
              ].map(([label, key, units]) => {
                const systolic = (form.physical_parameters?.blood_pressure?.systolic);
                const diastolic = form.physical_parameters?.blood_pressure?.diastolic;

                return (
                  <div key={key} className={`grid col-span-2 grid-cols-2 gap-x-1 mb-[1px] ${systolic && diastolic ? ("") : "no-print"}`}>
                    <div className="flex justify-between items-center">
                      <div><p>{label}</p></div>
                      <div>:</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        className="bg-transparent text-sm/4 focus:outline-none p-0 m-0 min-w-[15px] max-w-[26px]"
                        value={systolic}
                        onChange={e => {
                          setForm(prev => ({
                            ...prev,
                            physical_parameters: {
                              ...prev.physical_parameters,
                              blood_pressure: {
                                ...prev.physical_parameters.blood_pressure,
                                systolic: Number(e.target.value)
                              }
                            }
                          }))
                        }}
                      />/
                      <input
                        type="text"
                        className="bg-transparent text-sm/4 focus:outline-none p-0 m-0 min-w-[15px] max-w-[26px]"
                        value={diastolic}
                        onChange={e => {
                          setForm(prev => ({
                            ...prev,
                            physical_parameters: {
                              ...prev.physical_parameters,
                              blood_pressure: {
                                ...prev.physical_parameters.blood_pressure,
                                diastolic: Number(e.target.value)
                              }
                            }
                          }))
                        }}
                      />
                      {units && <span className="text-xs whitespace-nowrap">{units}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="col-span-2">
              {[
                ["RESPIRATORY RATE", "respiratory_rate", "breaths/min"],
                ["SpO2", "spo2", "%"],
                ["FULL INSPIRATION", "inspiration", "cm"],
                ["FULL EXPIRATION", "expiration", "cm"],
                ["BODY SURFACE AREA", "body_surface_area", "Sq. m."]
              ].map(([label, key, unit]) => {
                const value =
                  ["inspiration", "expiration"].includes(key)
                    ? form.physical_parameters.chest_circumference?.[key] ?? ""
                    : form.physical_parameters[key] ?? "";
                return (
                  <div key={key} className={`grid col-span-2 grid-cols-2 gap-x-1 mb-[1px] ${value ? "" : "no-print"}`}>
                    <div className="flex justify-between items-center">
                      <div><p>{label}</p></div>
                      <div>:</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        className="bg-transparent text-sm/4 focus:outline-none p-0 m-0 min-w-[15px] max-w-[26px]"
                        value={value}
                        onChange={e => {
                          const v = e.target.value;
                          setForm(prev => {
                            const inspiration = key === "inspiration" ? v : prev.physical_parameters.chest_circumference?.inspiration;
                            const expiration = key === "expiration" ? v : prev.physical_parameters.chest_circumference?.expiration;
                            const expansion = inspiration && expiration ? inspiration - expiration : prev.physical_parameters.chest_circumference.expansion;
                            return {
                              ...prev,
                              physical_parameters: {
                                ...prev.physical_parameters,
                                ...(key === "inspiration" || key === "expiration"
                                  ? {
                                    chest_circumference: {
                                      ...prev.physical_parameters.chest_circumference,
                                      [key]: Number(v),
                                      expansion
                                    }
                                  }
                                  : { [key]: Number(v) })
                              }
                            };
                          });
                        }}
                      />
                      {unit && <span className="text-xs whitespace-nowrap">{unit}</span>}
                    </div>

                  </div>
                );

              })}
            </div>


            {/* BMI (auto) */}
            {form.physical_parameters.weight &&
              form.physical_parameters.height && (
                <div className="grid col-span-2 grid-cols-2 gap-x-1 mb-[1px]">
                  <div className="flex justify-between items-center">
                    <p>BMI (BODY MASS INDEX)</p>:
                  </div>
                  <p>
                    {form.physical_parameters.weight &&
                      form.physical_parameters.height
                      ? (
                        form.physical_parameters.weight /
                        ((form.physical_parameters.height / 100) ** 2)
                      ).toFixed(2)
                      : null}
                  </p>
                  <div className="grid col-span-2 grid-cols-2 gap-x-1 mb-[1px]">
                    <div className="flex justify-between items-center">
                      <p>BMI STATUS</p>:
                    </div>
                    <p>{calculateBMIStatus(form.physical_parameters.bmi)}</p>
                  </div>
                </div>
              )}

            {/* BMI Status (auto) */}
            {/* {form.physical_parameters.bmi && (
              
            )} */}

            {/* Chest Expansion (auto) */}
            {(form.physical_parameters.chest_circumference?.inspiration &&
              form.physical_parameters.chest_circumference?.expiration) ? (
              <div className={`grid col-span-2 grid-cols-2 gap-x-1 mb-[1px] ${(form.physical_parameters.chest_circumference?.inspiration && form.physical_parameters.chest_circumference?.expiration) ? ("") : ("no-print")}`}>
                <div className="flex justify-between items-center">
                  <p>CHEST EXPANSION</p>:
                </div>
                <p className="flex items-center justify-between">
                  {form.physical_parameters.chest_circumference.inspiration -
                    form.physical_parameters.chest_circumference.expiration}{" "}
                  cm
                </p>
              </div>
            ) : ("")}
          </div>

          {/* Systemic Examination */}
          <div className="grid grid-cols-4 text-sm/3 mt-3">
            <p className="col-span-4 font-semibold mb-2">SYSTEMIC EXAMINATION</p>
          </div>
          {[
            ["CENTRAL NERVOUS SYSTEM", "central_nervous_system"],
            ["CARDIOVASCULAR SYSTEM", "cardiovascular_system"],
            ["RESPIRATORY SYSTEM", "respiratory_system"],
            ["GASTROINTESTINAL SYSTEM", "gastrointestinal_system"],
            ["GENITOURINARY SYSTEM", "genitourinary_system"],
            ["MUSCULOSKELETAL SYSTEM", "musculoskeletal_system"]
          ].map(([label, key]) => (
            <div key={key} className="grid grid-cols-4 gap-x-1 mb-1">
              <div className="flex justify-between">
                <p>{label}</p>
                <p>:</p>
              </div>

              <textarea
                value={form.systemic_examination[key] || ""}
                rows={(form.systemic_examination[key].length < 100) ? (1) : (Math.ceil(form.systemic_examination[key].length / 100))}
                className="w-full text-sm/4 rounded p-0 col-span-3 no-scrollbar resize-none"
                onChange={e => setForm(prev => ({
                  ...prev,
                  systemic_examination: {
                    ...prev.systemic_examination,
                    [key]: e.target.value
                  }
                }))}
              />
            </div>
          ))}

          {/* OPHTHALMIC EXAMINATION */}
          <div className="grid grid-cols-4 text-sm text-center mt-2 gap-x-2">
            <div className="col-span-4 font-semibold text-left mb-2">
              OPHTHALMIC EXAMINATION
            </div>

            <div className="flex justify-between">
              <p className="font-semibold">VISUAL ACUITY</p>
              :
            </div>
            <div className="col-span-3 grid grid-cols-5">


              <div className="border border-gray-700"></div>
              <div className="col-span-2 font-bold border border-gray-700">(FAR POINT VISION) – 20 FT</div>
              <div className="col-span-2 font-bold border border-gray-700">(NEAR POINT VISION) – 14–15 IN</div>

              <div className="border border-gray-700 p-2"></div>
              <div className="border border-gray-700 font-bold">Without Glasses</div>
              <div className="border border-gray-700 font-bold">With Glasses</div>
              <div className="border border-gray-700 font-bold">Without Glasses</div>
              <div className="border border-gray-700 font-bold">With Glasses</div>

              {/* LEFT */}
              <div className="border border-gray-700 font-bold">Left</div>
              {[
                ["far_left_wo"],
                ["far_left_w"],
              ].map((key, i) => (
                <div key={i} className="border border-gray-700">
                  <select
                    className="w-full border border-white text-center"
                    value={visionForm[key]}
                    onChange={e => setVisionForm(prev => ({
                      ...prev,
                      [key]: e.target.value
                    }))}
                  >
                    <option value=""></option>
                    <option value="6">6/6</option>
                    <option value="9">6/9</option>
                    <option value="12">6/12</option>
                    <option value="18">6/18</option>
                    <option value="24">6/24</option>
                    <option value="36">6/36</option>
                    <option value="60">6/60</option>
                    <option value="CF">CF</option>
                    <option value="HM">HM</option>
                    <option value="PL">PL</option>
                    <option value="NPL">NPL</option>
                  </select>
                </div>
              ))}
              {[
                ["near_left_wo"],
                ["near_left_w"]
              ].map((key, i) => (
                <div key={i} className="border border-gray-700">
                  <select
                    className="w-full bg-transparent border border-white text-center"
                    value={visionForm[key]}
                    onChange={e => setVisionForm(prev => ({
                      ...prev,
                      [key]: e.target.value
                    }))}
                  >
                    <option value=""></option>
                    <option value="6">N6</option>
                    <option value="8">N8</option>
                    <option value="10">N10</option>
                    <option value="12">N12</option>
                    <option value="18">N18</option>
                    <option value="24">N24</option>
                    <option value="36">N36</option>
                    <option value="48">N48</option>
                  </select>
                </div>
              ))}


              {/* RIGHT */}
              <div className="border border-gray-700 font-bold">Right</div>
              {[
                ["far_right_wo"],
                ["far_right_w"],
              ].map((key, i) => (
                <div key={i} className="border border-gray-700">
                  <select
                    className="w-full bg-transparent border border-white text-center"
                    value={visionForm[key]}
                    onChange={e => setVisionForm(prev => ({
                      ...prev,
                      [key]: e.target.value
                    }))}
                  >
                    <option value=""></option>
                    <option value="6">6/6</option>
                    <option value="9">6/9</option>
                    <option value="12">6/12</option>
                    <option value="18">6/18</option>
                    <option value="24">6/24</option>
                    <option value="36">6/36</option>
                    <option value="60">6/60</option>
                    <option value="CF">CF</option>
                    <option value="HM">HM</option>
                    <option value="PL">PL</option>
                    <option value="NPL">NPL</option>
                  </select>
                </div>
              ))}
              {[
                ["near_right_wo"],
                ["near_right_w"]
              ].map((key, i) => (
                <div key={i} className="border border-gray-700">
                  <select
                    className="w-full bg-transparent border border-white text-center"
                    value={visionForm[key]}
                    onChange={e => setVisionForm(prev => ({
                      ...prev,
                      [key]: e.target.value
                    }))}
                  >
                    <option value=""></option>
                    <option value="6">N6</option>
                    <option value="8">N8</option>
                    <option value="10">N10</option>
                    <option value="12">N12</option>
                    <option value="18">N18</option>
                    <option value="24">N24</option>
                    <option value="36">N36</option>
                    <option value="48">N48</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis */}
          <div className="grid grid-cols-4 gap-2 mt-3 text-sm">
            <div className="flex justify-between">
              <p>Without Glasses</p>
              :
            </div>
            <textarea
              rows={(visionForm.without_glasses_diagnosis.length < 100) ? (2) : (Math.ceil(visionForm.without_glasses_diagnosis.length / 100))}
              className="bg-transparent col-span-3 resize-none no-scrollbar"
              placeholder="Diagnosis (Without Glasses)"
              value={visionForm.without_glasses_diagnosis || ""}
              readOnly
            />
            <div className="flex justify-between">
              <p>With Glasses</p>
              :
            </div>
            <textarea
              rows={(visionForm.with_glasses_diagnosis.length < 100) ? (2) : (Math.ceil(visionForm.with_glasses_diagnosis.length / 100))}
              className="bg-transparent col-span-3 resize-none"
              placeholder="Diagnosis (With Glasses)"
              value={visionForm.with_glasses_diagnosis || ""}
              readOnly
            />
            <div className="flex justify-between">
              <p>Color Perception</p>
              :
            </div>
            <select
              id="col-perc"
              className="col-span-3 bg-transparent border border-white "
              value={visionForm.color_perception || ""}
              onChange={e => {
                const value = e.target.value;
                // 1) update local visionForm
                setVisionForm(prev => ({
                  ...prev,
                  color_perception: value
                }));
                // 2) also update nested form.opthalmic_examination if you still need it
                // setForm(prev => ({
                //   ...prev,
                //   opthalmic_examination: {
                //     ...prev.opthalmic_examination,
                //     color_perception: value
                //   }
                // }));
              }}
            >

              <option value="NCB">Normal Color Perception - Not Color Blind</option>
              <option value="CBG">Color Blind – Green</option>
              <option value="CBR">Color Blind – Red</option>
              <option value="CBGR">Color Blind – Red & Green</option>
            </select>
          </div>

          <hr className="border-t border-gray-900 bg-gray-900 my-2" />

          <div className="grid grid-cols-4">
            <div className="col-span-4 mb-2">
              <p className="font-semibold">CLINICAL IMPRESSION: </p>
            </div>
            <div className="col-span-4">
              <textarea
                value={form?.clinical_impression}
                className="w-full text-sm/4 rounded p-0 col-span-3 no-scrollbar resize-none"
                onChange={e => setForm(prev => ({ ...prev, ["clinical_impression"]: e.target.value }))}></textarea>
            </div>
            <div className="col-span-4 mb-2">
              <p className="font-semibold">FINAL RECOMMENDATION: </p>
            </div>
            <div className="col-span-4">
              <textarea
                value={form?.final_recommendation}
                className="w-full text-sm/4 rounded p-0 col-span-3 no-scrollbar resize-none"
                onChange={e => setForm(prev => ({ ...prev, ["final_recommendation"]: e.target.value }))}></textarea>
            </div>

          </div>

          <div className="flex w-full">
            <div className="w-3/4">
              <div className="col-span-4 mb-2">
                <p className="font-semibold">PHYSICAL FITNESS: </p>
              </div>
              <div className="col-span-4">
                <textarea
                  rows={6}
                  value={form?.physical_fitness}
                  className="w-full text-sm/4 rounded p-0 col-span-3 no-scrollbar resize-none"
                  onChange={e => setForm(prev => ({ ...prev, ["physical_fitness"]: e.target.value }))}
                ></textarea>
              </div>
            </div>
            <div className="w-1/4">
              {selectedDoctor && (
                <div className="mt-4 flex justify-end">
                  <div className="text-right leading-tight">
                    <p className="font-semibold uppercase">
                      DR. {selectedDoctor.name}
                    </p>
                    <p className="uppercase">
                      {selectedDoctor.qualification}
                    </p>
                    <p className="uppercase">
                      REGN. NO. {selectedDoctor.regn_no}
                    </p>
                    {selectedDoctor.designation && (
                      <p className="uppercase">
                        {selectedDoctor.designation}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="text-sm/5">
            <p className="font-semibold">Reason for:</p>
            (i) Refusal of Certificate:
            <input
              value={form.reason_for_certificate_refusal}
              className="border border-none p-0 pl-1 w-3/4"
              onChange={e => setForm(prev => ({ ...prev, ["reason_for_certificate_refusal"]: e.target.value }))} />
            <br />
            (ii) Certificate being revoked:
            <input
              value={form.reason_for_certificate_revoke}
              className="border border-none p-0 pl-1 w-3/4"
              onChange={e => setForm(prev => ({ ...prev, ["reason_for_certificate_revoke"]: e.target.value }))}
            />
          </div>



          {/* Fit / Unfit (MANDATORY) */}
          <div className="my-4 flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.duty_fit === true}
                onChange={() => setForm(prev => ({ ...prev, duty_fit: true }))}
              />
              <b>FIT FOR DUTY</b>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.duty_fit === false}
                onChange={() => setForm(prev => ({ ...prev, duty_fit: false }))}
              />
              <b>UNFIT FOR DUTY</b>
            </label>
          </div>

          {/* Medical Examiner */}
          <p className="font-semibold no-print">Medical Examiner:</p>
          <select
            className="w-2/8 rounded text-[12.5px] border no-print"
            value={selectedDoctorId || ""}
            disabled={user?.role === "DOCTOR" || readOnly}
            onChange={e => setSelectedDoctorId(Number(e.target.value))}
          >
            <option value="">Select Treating Doctor</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} – {d.qualification}
              </option>
            ))}
          </select>

          {/* ===== PAGE BREAK ===== */}
          <div className="page-break" style={{
            pageBreakAfter: 'always',
            breakAfter: 'page',
            display: 'block',
            height: 0
          }}></div>

          {/* ===== INSTRUCTION PAGE ===== */}
          <div className="hidden instruction-page">
            <img
              src={image}
              alt="Health Instructions"
              className="instruction-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreEmploymentReportModal;