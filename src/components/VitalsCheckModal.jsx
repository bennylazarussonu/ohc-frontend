import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaXmark } from "react-icons/fa6";

function VitalsCheckModal({ vitals, worker, onClose }) {
  const emptyForm = {
  temperature: "",
  weight: "",
  height: "",
  bmi: "",
  pulse: "",
  respiratory_rate: "",
  spo2: "",
  body_surface_area: "",
  blood_pressure: { systolic: "", diastolic: "" },
  chest_circumference: { inspiration: "", expiration: "", expansion: "" }
};

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



  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: Number(value)}));
  };

  const handleNestedChange = (parent, key, value) => {
  setForm(prev => ({
    ...prev,
    [parent]: {
      ...prev[parent],
      [key]: value
    }
  }));
};


  const calculateBMI = () => {
    if (!form.weight || !form.height) return "";
    const h = form.height / 100;
    return (form.weight / (h * h)).toFixed(2);
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
  className="p-2 bg-gray-800 rounded col-span-3"
  value={form.height}
  onChange={e => handleChange("height", e.target.value)}
/>

<input
  type="number"
  placeholder="Weight (kg)"
  className="p-2 bg-gray-800 rounded col-span-3"
  value={form.weight}
  onChange={e => handleChange("weight", e.target.value)}
/>

            <input
  readOnly
  placeholder="BMI"
  className="p-2 bg-gray-700 rounded col-span-6"
  value={calculateBMI()}
/>

            <input
              key="temperature"
              type="number"
              placeholder="Temperature (°F)"
              className="p-2 bg-gray-800 rounded col-span-6 mb-3"
              value={form.temperature}
              onChange={e => handleChange("temperature", e.target.value)}
            />

            <p className="text-sm font-bold text-gray-400 col-span-6">Chest</p>
            <input
  type="number"
  placeholder="Inspiration"
  className="p-2 bg-gray-800 rounded col-span-3"
  value={form.chest_circumference.inspiration}
  onChange={e =>
    handleNestedChange("chest_circumference", "inspiration", e.target.value)
  }
/>

<input
  type="number"
  placeholder="Expiration"
  className="p-2 bg-gray-800 rounded col-span-3"
  value={form.chest_circumference.expiration}
  onChange={e =>
    handleNestedChange("chest_circumference", "expiration", e.target.value)
  }
/>

            <input
  readOnly
  placeholder="Expansion"
  className="p-2 bg-gray-700 rounded col-span-6"
  value={calculateChestExpansion()}
  // onChange={e => handleNestedChange("chest_circumference", "expansion", e.target.value)}
/>


            {/* <p className="font-bold text-sm col-span-6 text-gray-400">Respiration</p> */}
            <input
              key="respiratory_rate"
              type="number"
              placeholder="Respiratory Rate"
              className="p-2 bg-gray-800 rounded col-span-3 mb-3"
              value={form["respiratory_rate"]}
              onChange={e => handleChange("respiratory_rate", e.target.value)}
            />
            <input
              key="spo2"
              type="number"
              placeholder="SpO2"
              className="p-2 bg-gray-800 rounded col-span-3 mb-3"
              value={form["spo2"]}
              onChange={e => handleChange("spo2", e.target.value)}
            />

            <p className="font-bold text-sm col-span-6 text-gray-400">Heart</p>
            <input 
              key={"pulse"}
              type="number" 
              className="p-2 bg-gray-800 col-span-6 rounded"
              placeholder="Pulse"
              value={form["pulse"]}
              onChange={e => handleChange("pulse", e.target.value)}
            />
            <input
  type="number"
  placeholder="Systolic"
  className="p-2 bg-gray-800 col-span-3 rounded"
  value={form.blood_pressure.systolic}
  onChange={e =>
    handleNestedChange("blood_pressure", "systolic", e.target.value)
  }
/>

<input
  type="number"
  placeholder="Diastolic"
  className="p-2 bg-gray-800 col-span-3 rounded"
  value={form.blood_pressure.diastolic}
  onChange={e =>
    handleNestedChange("blood_pressure", "diastolic", e.target.value)
  }
/>


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
