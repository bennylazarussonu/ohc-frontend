import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaCirclePlus, FaFilePrescription, FaPills } from "react-icons/fa6";

function PrescriptionSection({ prescription, setPrescription }) {
  const [medicines, setMedicines] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);

  useEffect(() => {
    api.get("/api/medicines").then(res => setMedicines(res.data));
  }, []);

  const addRow = () => {
    setPrescription([...prescription, {}]);
  };
  const removeRow = (index) => {
    const updated = prescription.filter((_, i) => i !== index);
    setPrescription(updated);
  };


  const updateRow = (i, med) => {
    const updated = [...prescription];
    updated[i] = {
      ...updated[i],
      drug_name_and_dose: med.drug_name_and_dose,
      brands: med.brands || [],
      brand: med.brands?.[0] || "",
      route_of_administration: med.route_of_administration,
      frequency: med.frequency,
      medicine_id: med.id
    };
    setPrescription(updated);
  };

  return (
    <div className="bg-gray-800 p-3 w-full rounded-xl mt-2 h-80 overflow-auto no-scrollbar">
      <div className="flex items-center gap-2">
        <FaFilePrescription className="mb-2 text-[16px]" />
        <h2 className="font-bold mb-2 text-[16px]">PRESCRIPTION</h2>
      </div>

      <div className=" overflow-auto no-scrollbar max-h-56">
        <table className="w-full text-[12.5px]">
        <colgroup>
          {/* <col className="w-[3%]" /> */}
          <col className="w-[30%]" />
          <col className="w-[20%]" />
          <col className="w-[25%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[5%]" />
        </colgroup>
        <thead>
          <tr>
            {/* <th className="p-2 border">S.No</th> */}
            <th className="p-2 border">Item</th>
            <th className="p-2 border">Brand</th>
            <th className="p-2 border">Route</th>
            <th className="p-2 border">Frequency</th>
            <th className="p-2 border">Days</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {prescription.map((row, i) => (
            <tr key={i}>
              {/* <td className="p-2 border">{i + 1}</td> */}
              <td className="p-2 border">
                <input
                  type="text"
                  value={
                    activeRow === i
                      ? searchText
                      : row.drug_name_and_dose || ""
                  }
                  placeholder="Search medicine"
                  className="w-full p-1 bg-gray-700 rounded"
                  onFocus={() => {
                    setActiveRow(i);
                    setSearchText("");
                  }}
                  onChange={(e) => setSearchText(e.target.value)}
                />

                {activeRow === i && searchText && (
                  <div className="absolute z-10 bg-gray-900 border border-gray-700 max-h-40 overflow-auto w-full rounded">
                    {medicines
                      .filter(m =>
                        m.drug_name_and_dose
                          ?.toLowerCase()
                          .includes(searchText.toLowerCase()) ||
                        m.brands?.some(b =>
                          b.toLowerCase().includes(searchText.toLowerCase())
                        )
                      )
                      .slice(0, 10)
                      .map((m, idx) => (
                        <div
                          key={idx}
                          className="p-1 hover:bg-gray-700 cursor-pointer"
                          onClick={() => {
                            updateRow(i, m);
                            setSearchText("");
                            setActiveRow(null);
                            setTimeout(() => {
                              document.activeElement.blur();
                            }, 0);

                          }}
                        >
                          <div className="font-semibold">
                            {m.drug_name_and_dose}
                          </div>
                          <div className="text-xs text-gray-400">
                            {m.brands?.join(", ")}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

              </td>
              <td className="p-2 border">
                {row.brands && row.brands.length > 0 ? (
                  <select
                    className="w-full p-1 bg-gray-700 rounded"
                    value={row.brand}
                    onChange={(e) => {
                      const updated = [...prescription];
                      updated[i].brand = e.target.value;
                      setPrescription(updated);
                    }}
                  >
                    {row.brands.map((b, idx) => (
                      <option key={idx} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>

              <td className="p-2 border">
                {row.route_of_administration ? (
                  <select
                    className="w-full p-1 bg-gray-700 rounded"
                    value={row.route_of_administration}
                    onChange={(e) => {
                      const updated = [...prescription];
                      updated[i].route_of_administration = e.target.value;
                      setPrescription(updated);
                    }}
                  >
                    {['Oral', 'External Usage', 'Gargle', 'Inhalation', 'Injection', 'Injection/Infusion', 'Instillation', 'Local', 'Mouthwall', 'Nasal', 'Per Rectal', 'Per Vaginum', 'Rectal/Vaginal', 'Topical', 'Transdermal'].map((r, idx) => (
                      <option key={idx} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <></>
                )}
              </td>
              <td className="p-2 border">
                {row.frequency ? (
                  <select
                    className="w-full p-1 bg-gray-700 rounded"
                    value={row.frequency}
                    onChange={(e) => {
                      const updated = [...prescription];
                      updated[i].frequency = e.target.value;
                      setPrescription(updated);
                    }}
                  >
                    {["OD", "BID", "stat", "As directed", "TID"].map((freq, idx) => (
                      <option key={idx} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </select>
                ) : (
                  <></>
                )}
              </td>
              <td className="p-2 border">
                <input
                  type="text"
                  className="w-full p-1 bg-gray-700 rounded"
                  onChange={e => {
                    const updated = [...prescription];
                    updated[i].days = e.target.value;
                    setPrescription(updated);
                  }}
                />
              </td>
              <td className="border text-center">
                <button
                  onClick={() => removeRow(i)}
                  className="bg-red-600 hover:bg-red-700 p-1  rounded text-white"
                >
                  ❌
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
      </div>
      

      <button
        onClick={addRow}
        className="mt-2 bg-blue-600 px-2 py-1 rounded"
      >
        <span className="flex items-center gap-2 text-[13.5px]">
          <FaCirclePlus /> Add Medicine
        </span>
      </button>
    </div>
  );
}

export default PrescriptionSection;