import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaXmark } from "react-icons/fa6";

function VisionCheckModal({ vision, worker, onClose }) {
  const emptyForm = {
  far_left_wo: 6,
  far_right_wo: 6,
  far_left_w: "",
  far_right_w: "",

  near_left_wo: 6,
  near_right_wo: 6,
  near_left_w: "",
  near_right_w: "",

  color_perception: "",
  without_glasses_diagnosis: "",
  with_glasses_diagnosis: ""
};


  const [form, setForm] = useState(emptyForm);

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



//   useEffect(() => {
//   if (!vision) return;

//   setForm({
//     far_left_wo: vision.far_vision?.without_glasses?.left || "",
//     far_right_wo: vision.far_vision?.without_glasses?.right || "",
//     far_left_w: vision.far_vision?.with_glasses?.left || "",
//     far_right_w: vision.far_vision?.with_glasses?.right || "",

//     near_left_wo: vision.near_vision?.without_glasses?.left || "",
//     near_right_wo: vision.near_vision?.without_glasses?.right || "",
//     near_left_w: vision.near_vision?.with_glasses?.left || "",
//     near_right_w: vision.near_vision?.with_glasses?.right || "",

//     color_perception: vision.color_perception || "",
//     without_glasses_diagnosis: vision.without_glasses_diagnosis || "",
//     with_glasses_diagnosis: vision.with_glasses_diagnosis || ""
//   });
// }, [vision]);

useEffect(() => {
  const inputs = {
    "Distant Right": {
      without: form.far_right_wo,
      with: form.far_right_w
    },
    "Distant Left": {
      without: form.far_left_wo,
      with: form.far_left_w
    },
    "Near Right": {
      without: form.near_right_wo,
      with: form.near_right_w
    },
    "Near Left": {
      without: form.near_left_wo,
      with: form.near_left_w
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

  // --- WITHOUT GLASSES ---
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

  // --- WITH GLASSES ---
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

  setForm(prev => ({
    ...prev,
    without_glasses_diagnosis,
    with_glasses_diagnosis
  }));

}, [
  form.far_left_wo,
  form.far_right_wo,
  form.near_left_wo,
  form.near_right_wo,
  form.far_left_w,
  form.far_right_w,
  form.near_left_w,
  form.near_right_w
]);




  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
  try {
    await api.put(`/api/pre-employment/${worker.id}/vision`, {
      far_vision: {
        without_glasses: {
          left: form.far_left_wo,
          right: form.far_right_wo
        },
        with_glasses: {
          left: form.far_left_w,
          right: form.far_right_w
        }
      },
      near_vision: {
        without_glasses: {
          left: form.near_left_wo,
          right: form.near_right_wo
        },
        with_glasses: {
          left: form.near_left_w,
          right: form.near_right_w
        }
      },
      color_perception: form.color_perception,
      without_glasses_diagnosis: form.without_glasses_diagnosis,
      with_glasses_diagnosis: form.with_glasses_diagnosis
    });

    alert("Vision examination saved");
    onClose();
  } catch (err) {
    console.error(err);
    alert("Failed to save vision exam");
  }
};


  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-gray-900 w-[800px] max-h-[90vh] overflow-y-auto rounded-xl p-6 text-white">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Vision Check – {worker.name}</h2>
          <button onClick={onClose}>
            <FaXmark />
          </button>
        </div>

        <div className="grid grid-cols-5 text-sm text-center">
          <div className="border border-gray-500 p-2"></div>
          <div className="col-span-2 col-start-2 font-bold border border-gray-500 p-2">
            (FAR POINT VISION) - 20FT
          </div>
          <div className="col-span-2 col-start-4 font-bold border border-gray-500 p-2">
            (NEAR POINT VISION) - 14-15IN
          </div>
          <div className="border border-gray-500 p-2"></div>
          <div className="col-start-2 text-gray-400 border font-bold border-gray-500 p-2">
            Without Glasses
          </div>
          <div className="col-start-3 text-gray-400 border font-bold border-gray-500 p-2">
            With Glasses
          </div>
          <div className="col-start-4 text-gray-400 border font-bold border-gray-500 p-2">
            Without Glasses
          </div>
          <div className="col-start-5 text-gray-400 border font-bold border-gray-500 p-2">
            With Glasses
          </div>
          <div className="border border-gray-500 p-2 font-bold">
            Left
          </div>
          {[
            ["far_left_wo", "Far Left (No Glasses)"],
            ["far_left_w", "Far Left (Glasses)"],
          ].map(([key, label]) => (
            <div className="border border-gray-500 p-2">
              <select
              key={key}
              placeholder={label}
              className="p-2 bg-gray-700 rounded w-full"
              value={form[key]}
              onChange={e => handleChange(key, e.target.value)}
            >
              {(key == "far_left_w") && (
                <option value=""></option>
              )}
              <option value="6">6/6</option>
              <option value="9">6/9</option>
              <option value="12">6/12</option>
              <option value="18">6/18</option>
              <option value="24">6/24</option>
              <option value="36">6/36</option>
              <option value="60">6/60</option>
              <option value="CF">Counting Fingers(CF)</option>
              <option value="HM">Hand Movements(HM)</option>
              <option value="PL">Perception of Light(PL)</option>
              <option value="NPL">No Perception of Light(NPL)</option>
            </select>
            </div>
          ))}
          {[
            ["near_left_wo", "Near Left (No Glasses)"],
            ["near_left_w", "Near Left (Glasses)"]
          ].map(([key, label]) => (
            <div className="border border-gray-500 p-2">
              <select
              key={key}
              placeholder={label}
              className="p-2 bg-gray-700 rounded w-full"
              value={form[key]}
              onChange={e => handleChange(key, e.target.value)}
            >
              {(key == "near_left_w") && (
                <option value=""></option>
              )}
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
          <div className="border border-gray-500 p-2 font-bold">
            Right
          </div>
          {[
            ["far_right_wo", "Far Right (No Glasses)"],
            ["far_right_w", "Far Right (Glasses)"],
          ].map(([key, label]) => (
            <div className="border border-gray-500 p-2">
              <select
              key={key}
              placeholder={label}
              className="p-2 bg-gray-700 rounded w-full"
              value={form[key]}
              onChange={e => handleChange(key, e.target.value)}
            >
              {(key == "far_right_w") && (
                <option value=""></option>
              )}
              <option value="6">6/6</option>
              <option value="9">6/9</option>
              <option value="12">6/12</option>
              <option value="18">6/18</option>
              <option value="24">6/24</option>
              <option value="36">6/36</option>
              <option value="60">6/60</option>
              <option value="CF">Counting Fingers(CF)</option>
              <option value="HM">Hand Movements(HM)</option>
              <option value="PL">Perception of Light(PL)</option>
              <option value="NPL">No Perception of Light(NPL)</option>
            </select>
            </div>
          ))}
          {[
            ["near_right_wo", "Near Right (No Glasses)"],
            ["near_right_w", "Near Right (Glasses)"]
          ].map(([key, label]) => (
            <div className="border border-gray-500 p-2">
              <select
              key={key}
              placeholder={label}
              className="p-2 bg-gray-700 rounded w-full"
              value={form[key]}
              onChange={e => handleChange(key, e.target.value)}
            >
              {(key == "near_right_w") && (
                <option value=""></option>
              )}
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
        <div className="grid grid-cols-2 gap-2 mt-3">
          <p className="col-span-2 text-gray-300 text-sm font-semibold">Diagnosis:</p>
          <textarea
            placeholder="Diagnosis (Without Glasses)"
            className="p-2 bg-gray-800 rounded text-sm no-scrollbar"
            rows={3}
            value={form.without_glasses_diagnosis}
            onChange={e => handleChange("without_glasses_diagnosis", e.target.value)}
          />

          <textarea
            placeholder="Diagnosis (With Glasses)"
            className="p-2 bg-gray-800 rounded text-sm no-scrollbar"
            rows={3}
            value={form.with_glasses_diagnosis}
            onChange={e => handleChange("with_glasses_diagnosis", e.target.value)}
          />

          <p className="col-span-2 text-gray-300 text-sm font-semibold">Color Perception:</p>
          <select
            placeholder="Color Perception"
            className="p-2 bg-gray-800 rounded col-span-2 text-sm"
            value={form.color_perception}
            onChange={e => handleChange("color_perception", e.target.value)}
          >
            <option value="NCB" selected>Not Color Blind</option>
            <option value="CBG">Color Blind to Green</option>
            <option value="CBR">Color Blind to Red</option>
            <option value="CBGR">Color Blind to both Green and Red</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Save Vision Exam
          </button>
        </div>
      </div>
    </div>
  );
}

export default VisionCheckModal;
