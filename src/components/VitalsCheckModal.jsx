import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaXmark } from "react-icons/fa6";

function VitalsCheckModal({ vitals, worker, onClose }) {
  const emptyForm = {
    temperature: "98.6",
    weight: "",
    height: "",
    bmi: "",
    pulse: "",
    respiratory_rate: "",
    spo2: "98",
    body_surface_area: "",
    blood_pressure: { systolic: "", diastolic: "" },
    chest_circumference: { inspiration: "", expiration: "", expansion: "" }
  };
  const [temperatureDiagnosis, setTemperatureDiagnosis] = useState(["Normal Temperature", "text-green-400", "focus:border-2 focus:border-green-400"]);
  const [bmiDiagnosis, setBmiDiagnosis] = useState({ text: "", color: "text-green-400", border: "focus:border-2 focus:border-green-4" });
  const [respDiagnosis, setRespDiagnosis] = useState({
    text: "",
    color: "text-green-400",
    border: "focus:border-2 focus:border-green-400"
  });

  const [spo2Diagnosis, setSpo2Diagnosis] = useState({
    text: "Normal",
    color: "text-green-400",
    border: "focus:border-2 focus:border-green-400"
  });
  const [pulseDiagnosis, setPulseDiagnosis] = useState({
  text: "",
  color: "text-green-400",
  border: "focus:border-2 focus:border-green-400"
});

const [bpDiagnosis, setBpDiagnosis] = useState({
  text: "",
  color: "text-green-400",
  border: "focus:border-2 focus:border-green-400"
});



  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (vitals) {
      setForm(prev => ({
        ...prev,
        ...vitals,
        blood_pressure: {
          ...prev.blood_pressure,
          ...vitals.blood_pressure
        },
        chest_circumference: {
          ...prev.chest_circumference,
          ...vitals.chest_circumference
        }
      }));
    }
  }, [vitals]);

  useEffect(() => {
  const pulse = Number(form.pulse);
  if (!pulse) return;

  let text = "Normal Pulse";
  let color = "text-green-400";
  let border = "focus:border-2 focus:border-green-400";

  if (pulse < 50) {
    text = "Severe Bradycardia";
    color = "text-red-500";
    border = "focus:border-2 focus:border-red-500";
  } else if (pulse < 60) {
    text = "Mild Bradycardia";
    color = "text-orange-400";
    border = "focus:border-2 focus:border-orange-400";
  } else if (pulse <= 100) {
    // normal
  } else if (pulse <= 120) {
    text = "Mild Tachycardia";
    color = "text-yellow-400";
    border = "focus:border-2 focus:border-yellow-400";
  } else if (pulse <= 150) {
    text = "Moderate Tachycardia";
    color = "text-orange-400";
    border = "focus:border-2 focus:border-orange-400";
  } else {
    text = "Severe Tachycardia";
    color = "text-red-500";
    border = "focus:border-2 focus:border-red-500";
  }

  setPulseDiagnosis({ text, color, border });
}, [form.pulse]);


useEffect(() => {
  const s = Number(form.blood_pressure.systolic);
  const d = Number(form.blood_pressure.diastolic);
  if (!s || !d) return;

  let text = "Normal Blood Pressure";
  let color = "text-green-400";
  let border = "focus:border-2 focus:border-green-400";

  // Hypotension
  if (s < 90 || d < 60) {
    text = "Hypotension";
    color = "text-orange-400";
    border = "focus:border-2 focus:border-orange-400";

  // Normal
  } else if (s < 120 && d < 80) {
    text = "Normal Blood Pressure";
    color = "text-green-400";
    border = "focus:border-2 focus:border-green-400";

  // Elevated BP (THIS captures 120/80 correctly)
  } else if (s >= 120 && s < 130 && d < 80) {
    text = "Elevated Blood Pressure";
    color = "text-yellow-400";
    border = "focus:border-2 focus:border-yellow-400";

  // Stage 1 Hypertension
  } else if (
    (s >= 130 && s < 140) ||
    (d >= 80 && d < 90 && s >= 130)
  ) {
    text = "Hypertension – Stage 1";
    color = "text-orange-400";
    border = "focus:border-2 focus:border-orange-400";

  // Stage 2 Hypertension
  } else if (
    (s >= 140 && s < 180) ||
    (d >= 90 && d < 120)
  ) {
    text = "Hypertension – Stage 2";
    color = "text-red-400";
    border = "focus:border-2 focus:border-red-400";

  // Crisis
  } else if (s >= 180 || d >= 120) {
    text = "Hypertensive Crisis";
    color = "text-red-500";
    border = "focus:border-2 focus:border-red-500";
  }

  setBpDiagnosis({ text, color, border });
}, [
  form.blood_pressure.systolic,
  form.blood_pressure.diastolic
]);



  useEffect(() => {
    const bmi = calculateBMI();
    if (!bmi) return;

    if (!form.height || !form.weight) return;
    let val1 = (((form.weight * form.height) / 3600) ** 0.5).toFixed(2);// body surface area
    let val2 = (form.weight / ((form.height / 100) ** 2)).toFixed(2); // bmi

    let factor = 0;

    if (val2 >= 13.0 && val2 < 18) {
      factor = 3.2;
    } else if (val2 >= 18 && val2 < 20) {
      factor = 2.55;
    } else if (val2 >= 20 && val2 < 24) {
      factor = 2.35;
    } else if (val2 >= 24 && val2 < 25) {
      factor = 2.1;
    } else if (val2 >= 25 && val2 < 29) {
      factor = 1.9;
    } else if (val2 >= 29 && val2 < 31) {
      factor = 1.6;
    } else if (val2 >= 31) {
      factor = 1.55;
    }

    let chestExpiration = Math.ceil((val1 * val2 * factor)).toFixed(0);
    let chestInspiration = parseInt(chestExpiration) + 4;

    let chestExpansion = chestInspiration - chestExpiration;

    const respiratory_rate_options = [15, 16, 17];
    const randomIndex = Math.floor(Math.random() * respiratory_rate_options.length);


    setForm(prev => ({
      ...prev,
      chest_circumference: {
        ...prev.chest_circumference,
        expiration: chestExpiration,
        inspiration: chestInspiration,
        expansion: chestExpansion
      },
      body_surface_area: val1,
      respiratory_rate: respiratory_rate_options[randomIndex]
    }));

    let text = "Normal";
    let color = "text-green-400";
    let border = "focus:border-2 focus:border-green-400";

    if (bmi < 16) {
      text = "Grossly Underweight";
      color = "text-red-400";
      border = "focus:border-2 focus:border-red-400";
    } else if (bmi < 18.5) {
      text = "Underweight";
      color = "text-orange-400";
      border = "focus:border-2 focus:border-orange-400";
    } else if (bmi <= 25) {
      text = "Normal";
      color = "text-green-400";
      border = "focus:border-2 focus:border-green-400";
    } else if (bmi <= 26) {
      text = "Slightly Above Weight";
      color = "text-yellow-400";
      border = "focus:border-2 focus:border-yellow-400";
    } else if (bmi <= 30) {
      text = "Mild Obesity (Class I)";
      color = "text-orange-400";
      border = "focus:border-2 focus:border-orange-400";
    } else if (bmi <= 33) {
      text = "Moderately Obese (Class II)";
      color = "text-red-400";
      border = "focus:border-2 focus:border-red-400";
    } else {
      text = "Overweight";
      color = "text-red-500";
      border = "focus:border-2 focus:border-red-500";
    }

    setBmiDiagnosis({ text, color, border });
  }, [form.weight, form.height]);

  useEffect(() => {
    const rr = Number(form.respiratory_rate);
    if (!rr) return;

    let text = "Normal Respiratory Rate";
    let color = "text-green-400";
    let border = "focus:border-2 focus:border-green-400";

    if (rr < 12) {
      text = "Bradypnea (Low Respiratory Rate)";
      color = "text-red-400";
      border = "focus:border-2 focus:border-red-400";
    } else if (rr <= 20) {
      // normal
    } else if (rr <= 24) {
      text = "Mild Tachypnea";
      color = "text-yellow-400";
      border = "focus:border-2 focus:border-yellow-400";
    } else if (rr <= 30) {
      text = "Moderate Respiratory Distress";
      color = "text-orange-400";
      border = "focus:border-2 focus:border-orange-400";
    } else {
      text = "Severe Respiratory Distress";
      color = "text-red-500";
      border = "focus:border-2 focus:border-red-500";
    }

    setRespDiagnosis({ text, color, border });
  }, [form.respiratory_rate]);

  useEffect(() => {
    const spo2 = Number(form.spo2);
    if (!spo2) return;

    let text = "Normal Oxygen Saturation";
    let color = "text-green-400";
    let border = "focus:border-2 focus:border-green-400";

    if (spo2 >= 95) {
      // normal
    } else if (spo2 >= 90) {
      text = "Mild Hypoxia";
      color = "text-yellow-400";
      border = "focus:border-2 focus:border-yellow-400";
    } else if (spo2 >= 85) {
      text = "Moderate Hypoxia";
      color = "text-orange-400";
      border = "focus:border-2 focus:border-orange-400";
    } else {
      text = "Severe Hypoxia";
      color = "text-red-500";
      border = "focus:border-2 focus:border-red-500";
    }

    setSpo2Diagnosis({ text, color, border });
  }, [form.spo2]);

  useEffect(() => {
    const { inspiration, expiration } = form.chest_circumference;
    if (!inspiration || !expiration) return;

    setForm(prev => ({
      ...prev,
      chest_circumference: {
        ...prev.chest_circumference,
        expansion: inspiration - expiration
      }
    }));
  }, [
    form.chest_circumference.inspiration,
    form.chest_circumference.expiration
  ]);






  const handleChange = (key, value) => {
    if (key === "temperature") {
      if (value > 99.0) {
        setTemperatureDiagnosis(["Above Normal Temperature", "text-red-400", "focus:border-2 focus:border-red-400"])
      } else if (value < 97.0) {
        setTemperatureDiagnosis(["Below Normal Temperature", "text-orange-400", "focus:border-2 focus:border-orange-400"])
      } else {
        setTemperatureDiagnosis(["Normal Temperature", "text-green-400", "focus:border-2 focus:border-green-400"])
      }
    } else if (key === "height" || key === "weight") {
      // if(form.weight && form.height){

      // }
    }
    setForm(prev => ({ ...prev, [key]: Number(value) }));

  };

  const handleNestedChange = (parent, key, value) => {
    setForm(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: Number(value)
      }
    }));
  };


  const calculateBMI = () => {
    if (!form.weight || !form.height) return "";

    const h = form.height / 100;
    return Number((form.weight / (h * h)).toFixed(2));
  };


  const calculateChestExpansion = () => {
    if (!form.chest_circumference.inspiration || !form.chest_circumference.expiration) return "";
    const expansion = form.chest_circumference.inspiration - form.chest_circumference.expiration;
    return expansion;
  }

  const handleSubmit = async () => {
    try {
      await api.put(`/api/pre-employment/${worker.id}/vitals`, {
        ...form,
        bmi: Number(calculateBMI()),
        chest_circumference: {
          ...form.chest_circumference,
          expansion: Number(calculateChestExpansion())
        }
      });

      alert("Vitals saved successfully");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save vitals");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-gray-900 w-[600px] max-h-[90vh] overflow-scroll no-scrollbar rounded-xl p-6 text-white">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Vitals Check – {worker.name}</h2>
          <button onClick={onClose}>
            <FaXmark />
          </button>
        </div>

        <div className="grid grid-cols-6 gap-2 text-sm overflow-scroll no-scrollbar h-[400px] ">
          {/* {[
            ["temperature", "Temperature (°F)"],
            ["weight", "Weight (kg)"],
            ["height", "Height (cm)"],
            ["pulse", "Pulse (/min)"],
            ["respiratory_rate", "Resp. Rate"],
            ["spo2", "SpO₂ (%)"],
            ["systolic", "BP Systolic"],
            ["diastolic", "BP Diastolic"],
            ["chest_inspiration", "Chest Insp."],
            ["chest_expiration", "Chest Exp."],
            ["chest_expansion", "Chest Expand"],
            ["body_surface_area", "BSA"]
          ].map(([key, label]) => (
            <input
              key={key}
              type="number"
              placeholder={label}
              className="p-2 bg-gray-700 rounded"
              value={form[key]}
              onChange={e => handleChange(key, e.target.value)}
            />
          ))} */}
          <p className="text-sm col-span-6 text-gray-400 font-bold m-0">Basic Details</p>
          <input
            type="number"
            placeholder="Height (cm)"
            className="p-2 bg-gray-800 rounded col-span-3 focus:outline-none"
            value={form.height}
            onChange={e => handleChange("height", e.target.value)}
          />

          <input
            type="number"
            placeholder="Weight (kg)"
            className="p-2 bg-gray-800 rounded col-span-3 focus:outline-none"
            value={form.weight}
            onChange={e => handleChange("weight", e.target.value)}
          />

          <div className="col-span-6">
            <input
              readOnly
              placeholder="BMI"
              className={`p-2 bg-gray-700 rounded col-span-6 w-full focus:outline-none ${bmiDiagnosis.border}`}
              value={calculateBMI()}
            />
            <span className={`text-xs w-full col-span-6 ${bmiDiagnosis.color}`}>{bmiDiagnosis.text}</span>
          </div>

          <div className="col-span-6">
            <input
              type="number"
              placeholder="Temperature (°F)"
              className={`p-2 bg-gray-800 rounded focus:outline-none w-full col-span-6 mb-0 ${temperatureDiagnosis[2]}`}
              value={form.temperature}
              onChange={e => handleChange("temperature", e.target.value)}
            />
            <span className={`text-xs mb-3 w-full col-span-6 ${temperatureDiagnosis[1]}`}><p className="w-full">{temperatureDiagnosis[0]}</p></span>
          </div>


          <p className="text-sm font-bold text-gray-400 col-span-6">Chest</p>
          <input
            type="number"
            placeholder="Inspiration"
            className="p-2 bg-gray-800 rounded col-span-3 focus:outline-none"
            value={form.chest_circumference.inspiration}
            onChange={e =>
              handleNestedChange("chest_circumference", "inspiration", e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Expiration"
            className="p-2 bg-gray-800 rounded col-span-3 focus:outline-none"
            value={form.chest_circumference.expiration}
            onChange={e =>
              handleNestedChange("chest_circumference", "expiration", e.target.value)
            }
          />

          <input
            readOnly
            placeholder="Expansion"
            className="p-2 bg-gray-700 rounded col-span-6 focus:outline-none"
            value={calculateChestExpansion()}
          />

          <div className="col-span-3">
            <input
              key="respiratory_rate"
              type="number"
              placeholder="Respiratory Rate"
              className={`p-2 bg-gray-800 rounded w-full ${respDiagnosis.border} focus:outline-none`}
              value={form.respiratory_rate}
              onChange={e => handleChange("respiratory_rate", e.target.value)}
            />
            <span className={`text-xs mb-3 ${respDiagnosis.color}`}>
              {respDiagnosis.text}
            </span>
          </div>

          <div className="col-span-3">
            <input
              key="spo2"
              type="number"
              placeholder="SpO2"
              className={`p-2 bg-gray-800 rounded w-full ${spo2Diagnosis.border} focus:outline-none`}
              value={form.spo2}
              onChange={e => handleChange("spo2", e.target.value)}
            />
            <span className={`text-xs mb-3 ${spo2Diagnosis.color}`}>{spo2Diagnosis.text}</span>
          </div>

          <p className="font-bold text-sm col-span-6 text-gray-400">Heart</p>
          <div className="col-span-6">
            <input
            key={"pulse"}
            type="number"
            className={`p-2 bg-gray-800 w-full rounded`}
            placeholder="Pulse"
            value={form.pulse}
            onChange={e => handleChange("pulse", e.target.value)}
          />
          <span className={`text-xs ${pulseDiagnosis.color}`}>
  {pulseDiagnosis.text}
</span>
          </div>

              <input
            type="number"
            placeholder="Systolic"
            className={`p-2 bg-gray-800 col-span-3 rounded ${bpDiagnosis.border}`}
            value={form.blood_pressure.systolic}
            onChange={e =>
              handleNestedChange("blood_pressure", "systolic", e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Diastolic"
            className={`p-2 bg-gray-800 col-span-3 rounded ${bpDiagnosis.border}`}
            value={form.blood_pressure.diastolic}
            onChange={e =>
              handleNestedChange("blood_pressure", "diastolic", e.target.value)
            }
          />
          <span className={`text-xs col-span-6 ${bpDiagnosis.color}`}>
  {bpDiagnosis.text}
</span>
          <br />
          <input
            key={"body_surface_area"}
            type="number"
            className="p-2 bg-gray-800 col-span-6 rounded mb-3"
            placeholder="Body Surface Area"
            value={form['body_surface_area']}
            onChange={e => handleChange("body_surface_area", e.target.value)}
          />


          {/* <input
            readOnly
            value={calculateBMI()}
            placeholder="BMI (auto)"
            className="p-2 bg-gray-600 rounded col-span-4"
          /> */}
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
            Save Vitals
          </button>
        </div>
      </div>
    </div>
  );
}

export default VitalsCheckModal;
