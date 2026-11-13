import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import { FaFloppyDisk } from "react-icons/fa6";
import { createWorker } from "tesseract.js";
import { FaCamera } from "react-icons/fa6";

const preprocessImage = (sourceCanvas) => {
  const scale = 2;

  const createVariant = (mode) => {
    const canvas = document.createElement("canvas");

    canvas.width = sourceCanvas.width * scale;
    canvas.height = sourceCanvas.height * scale;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      sourceCanvas,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const gray =
        0.299 * pixels[i] +
        0.587 * pixels[i + 1] +
        0.114 * pixels[i + 2];

      let value;

      if (mode === "gray") {
        value = Math.max(
          0,
          Math.min(255, (gray - 128) * 1.7 + 128)
        );
      } else {
        value = gray > 155 ? 255 : 0;
      }

      pixels[i] = value;
      pixels[i + 1] = value;
      pixels[i + 2] = value;
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas;
  };

  return [
    sourceCanvas,
    createVariant("gray"),
    createVariant("binary"),
  ];
};

const extractAadhaarData = (text, side) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const result = {};

  // Normalize common OCR digit mistakes in date candidates
  const normalizedText = text
    .replace(/[Oo]/g, "0")
    .replace(/[Il|]/g, "1");

  // Aadhaar number: accept spaces and hyphens
  const numberMatch = text.match(
    /(?:^|\D)((?:\d[\s-]*){11}\d)(?!\d)/
  );

  if (numberMatch) {
    const number = numberMatch[1].replace(/\D/g, "");

    if (number.length === 12) {
      result.aadhar_no = number;
    }
  }

  if (side === "front") {
    // Gender
    if (/\bFEMALE\b/i.test(text)) {
      result.gender = "FEMALE";
    } else if (/\bMALE\b/i.test(text)) {
      result.gender = "MALE";
    }

    // DOB
    const dobMatch = normalizedText.match(
      /\b(\d{1,2})\s*[\/.-]\s*(\d{1,2})\s*[\/.-]\s*(\d{4})\b/
    );

    if (dobMatch) {
      const [, day, month, year] = dobMatch;

      const d = Number(day);
      const m = Number(month);
      const y = Number(year);

      const date = new Date(y, m - 1, d);

      if (
        date.getFullYear() === y &&
        date.getMonth() === m - 1 &&
        date.getDate() === d
      ) {
        result.dob = [
          String(y),
          String(m).padStart(2, "0"),
          String(d).padStart(2, "0"),
        ].join("-");
      }
    }

    // Name: find the English text immediately before DOB
    const dobIndex = lines.findIndex((line) =>
      /\d{1,2}\s*[\/.-]\s*\d{1,2}\s*[\/.-]\s*\d{4}/.test(
        line.replace(/[Oo]/g, "0")
      )
    );

    if (dobIndex > 0) {
      const candidates = lines
        .slice(Math.max(0, dobIndex - 3), dobIndex)
        .filter(
          (line) =>
            /[A-Za-z]{2,}/.test(line) &&
            !/government|india|authority|aadhaar|unique identification/i.test(
              line
            ) &&
            !/\d/.test(line)
        );

      if (candidates.length) {
        result.name = candidates[candidates.length - 1]
          .replace(/[^A-Za-z .'-]/g, "")
          .replace(/\s+/g, " ")
          .trim();
      }
    }
  }

  if (side === "back") {
    // Address extraction
    const addressMatch = text.match(
      /Address\s*:?\s*([\s\S]*?)(?=Aadhaar|www\.|help@|VID|Unique Identification|Government of India|$)/i
    );

    if (addressMatch) {
      const address = addressMatch[1]
        .replace(/\s+/g, " ")
        .replace(/[|_]+/g, " ")
        .trim();

      if (address.length > 10) {
        result.residence = address;
      }
    }
  }

  return result;
};

function DataEntry({ form, setForm }) {
  const dobRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [dobFocus, setDobFocus] = useState(false);
  const [dojFocus, setDojFocus] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [scanError, setScanError] = useState("");

  const [scanSide, setScanSide] = useState("front");
  const [frontScanDone, setFrontScanDone] = useState(false);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
  if (scannerOpen && videoRef.current && streamRef.current) {
    videoRef.current.srcObject = streamRef.current;

    videoRef.current.play().catch((err) => {
      console.error("Video playback error:", err);
    });
  }
}, [scannerOpen]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Age -> DOB
    if (name === "age") {
      const age = parseInt(value);

      if (!isNaN(age)) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - age;

        setForm((prev) => ({
          ...prev,
          age: value,
          dob: `${birthYear}-01-01`,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          age: value,
          dob: "",
        }));
      }

      return;
    }

    // DOB -> Age
    if (name === "dob") {
      let age = "";

      if (value) {
        const birthDate = new Date(value);
        const today = new Date();

        age = today.getFullYear() - birthDate.getFullYear();

        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
      }

      setForm((prev) => ({
        ...prev,
        dob: value,
        age: age >= 0 ? age.toString() : "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ageNumber = Number(form.age);
  const isAgeInvalid =
    form.age !== "" && (ageNumber < 18 || ageNumber > 60);

  const handleSubmit = async () => {
    if (!form.name) {
      alert("Name is required");
      return;
    }

    if (!form.designation) {
      alert("Designation is required");
      return;
    }

    if (!form.identification_marks) {
      alert("Identification Mark is required");
      return;
    }

    if (!form.age) {
      alert("Age is required");
      return;
    }

    if (isAgeInvalid) {
      alert("Age must be between 18 and 60 years");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        identification_marks: form.identification_marks
          ? form.identification_marks.split(",").map(s => s.trim())
          : []
      };

      await api.post("/api/pre-employment/add", payload);

      alert("Pre-employment record created (Status: On-Going)");

      // reset form
      setForm({
        name: "",
        employee_id: "",
        fathers_name: "",
        aadhar_no: "",
        gender: "MALE",
        dob: "",
        age: "",
        phone_no: "",
        designation: "",
        contractor_name: "",
        date_of_joining: "",
        identification_marks: "",
        residence: ""
      });

    } catch (err) {
      console.error(err);
      alert("Failed to save worker data");
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      setScanError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setScannerOpen(true);

      setScanSide("front");
      setFrontScanDone(false);

      // Wait for the video element to render
      // setTimeout(() => {
      //   if (videoRef.current) {
      //     videoRef.current.srcObject = stream;
      //     videoRef.current.play();
      //   }
      // }, 100);

    } catch (error) {
      console.error(error);
      setScanError(
        "Unable to access camera. Please allow camera permissions."
      );
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setScannerOpen(false);
  };

  const captureAndRead = async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      ocrLoading
    ) return;

    let worker;

    try {
      setOcrLoading(true);
      setScanError("");

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video.videoWidth || !video.videoHeight) {
        throw new Error("Camera is not ready");
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const variants = preprocessImage(canvas);

      worker = await createWorker("eng");

      const results = [];

      for (const variant of variants) {
        await worker.setParameters({
          tessedit_pageseg_mode: "11",
          preserve_interword_spaces: "1",
        });

        const { data } = await worker.recognize(variant);

        results.push(data.text);
      }

      // Combine OCR results from all three images
      const combinedText = results.join("\n");

      console.log(
        "OCR completed. Number of image variants:",
        results.length
      );

      const extracted = extractAadhaarData(
        combinedText,
        scanSide
      );

      if (scanSide === "front") {
        if (
          !extracted.name &&
          !extracted.dob &&
          !extracted.gender &&
          !extracted.aadhar_no
        ) {
          setScanError(
            "Could not read the front side. Adjust focus and lighting, then retry."
          );
          return;
        }

        // Calculate age
        if (extracted.dob) {
          const birthDate = new Date(
            `${extracted.dob}T00:00:00`
          );

          const today = new Date();

          let age =
            today.getFullYear() - birthDate.getFullYear();

          if (
            today.getMonth() < birthDate.getMonth() ||
            (
              today.getMonth() === birthDate.getMonth() &&
              today.getDate() < birthDate.getDate()
            )
          ) {
            age--;
          }

          extracted.age = age >= 0 ? String(age) : "";
        }

        setForm((prev) => ({
          ...prev,
          ...extracted,
        }));

        setFrontScanDone(true);
        setScanSide("back");

        setScanError("");

      } else {
        if (!extracted.residence && !extracted.aadhar_no) {
          setScanError(
            "Could not read the back side. Adjust the card and retry."
          );
          return;
        }

        setForm((prev) => ({
          ...prev,
          ...extracted,
        }));

        stopScanner();

        setScanSide("front");
        setFrontScanDone(false);
      }

    } catch (error) {
      console.error("OCR Error:", error);
      setScanError("Scanning failed. Please try again.");
    } finally {
      if (worker) {
        await worker.terminate();
      }

      setOcrLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-800 p-6 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-bold">
          CANDIDATE DATA ENTRY
        </h2>

        <button
          type="button"
          onClick={startScanner}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-xs font-semibold flex items-center gap-2"
        >
          <FaCamera />
          Scan Aadhaar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <input
          name="name"
          placeholder="Name *"
          className="p-2 bg-gray-900 rounded"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="employee_id"
          placeholder="Employee ID"
          className="p-2 bg-gray-900 rounded"
          value={form.employee_id}
          onChange={handleChange}
        />

        <input
          name="fathers_name"
          placeholder="Father's Name"
          className="p-2 bg-gray-900 rounded"
          value={form.fathers_name}
          onChange={handleChange}
        />

        <input
          name="aadhar_no"
          placeholder="Aadhar No"
          className="p-2 bg-gray-900 rounded"
          value={form.aadhar_no}
          onChange={handleChange}
        />

        <select
          name="gender"
          className="p-2 bg-gray-900 rounded"
          value={form.gender}
          onChange={handleChange}
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>

        <div>
          <input
            name="age"
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            className={`w-full p-2 bg-gray-900 rounded ${isAgeInvalid
              ? "border-2 border-red-500 focus:border-red-500"
              : "border border-transparent"
              }`}
          />

          {isAgeInvalid && (
            <p className="text-red-400 text-[10px] mt-1">
              Age must be between 18 and 60 years
            </p>
          )}
        </div>

        <input
          type={dobFocus ? "date" : "text"}
          name="dob"
          placeholder="Date of Birth"
          className="p-2 bg-gray-900 rounded text-white"
          value={form.dob}
          onFocus={() => setDobFocus(true)}
          onChange={handleChange}
        />


        <input
          name="phone_no"
          placeholder="Phone No"
          className="p-2 bg-gray-900 rounded"
          value={form.phone_no}
          onChange={handleChange}
        />

        <input
          name="designation"
          placeholder="Designation"
          className="p-2 bg-gray-900 rounded"
          value={form.designation}
          onChange={handleChange}
        />

        <input
          name="contractor_name"
          placeholder="Contractor Name"
          className="p-2 bg-gray-900 rounded"
          value={form.contractor_name}
          onChange={handleChange}
        />

        <input
          type={dojFocus ? "date" : "text"}
          name="date_of_joining"
          placeholder="Date of Joining"
          className="p-2 bg-gray-900 rounded"
          value={form.date_of_joining}
          onFocus={() => setDojFocus(true)}
          // onBlur={() => setDojFocus(false)}
          onChange={handleChange}
        />

        <input
          name="residence"
          placeholder="Residence"
          type="text"
          className="p-2 bg-gray-900 rounded"
          value={form.residence}
          onChange={handleChange}
        />

        <input
          name="identification_marks"
          placeholder="Identification Marks (comma separated)"
          className="p-2 bg-gray-900 rounded col-span-3"
          value={form.identification_marks}
          onChange={handleChange}
        />
      </div>

      {scannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">

          <div className="bg-gray-800 rounded-xl p-5 w-full max-w-2xl space-y-4">

            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">
                Aadhaar Scanner
              </h3>

              <div className="flex gap-2 text-xs">
                <div
                  className={`flex-1 p-2 rounded text-center ${scanSide === "front"
                      ? "bg-blue-600"
                      : frontScanDone
                        ? "bg-green-700"
                        : "bg-gray-700"
                    }`}
                >
                  {frontScanDone ? "✓ " : ""}
                  Front Side
                </div>

                <div
                  className={`flex-1 p-2 rounded text-center ${scanSide === "back"
                      ? "bg-blue-600"
                      : "bg-gray-700"
                    }`}
                >
                  Back Side
                </div>
              </div>

              <p className="text-xs text-gray-300">
                {scanSide === "front"
                  ? "Position the FRONT side of Aadhaar in the camera and capture it."
                  : "Front side captured. Turn the card over and capture the BACK side."}
              </p>
            </div>

            <p className="text-xs text-gray-400">
              Position the Aadhaar card clearly within the camera
              view. Ensure adequate lighting and avoid reflections.
            </p>

            <div className="bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-h-[400px] object-contain"
              />
            </div>

            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {scanError && (
              <p className="text-red-400 text-xs">
                {scanError}
              </p>
            )}

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={stopScanner}
                className="px-4 py-2 bg-gray-600 rounded text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={captureAndRead}
                disabled={ocrLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold disabled:opacity-50"
              >
                {ocrLoading
                  ? "Reading..."
                  : scanSide === "front"
                    ? "Capture Front"
                    : "Capture Back"}
              </button>

            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || isAgeInvalid}
        className="mt-4 font-semibold bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaFloppyDisk />
        {loading ? "Saving..." : "Save & Start Examination"}
      </button>

      <p className="text-xs text-gray-400">
        Status will be set to <b>On-Going</b> automatically.
      </p>
    </div>
  );
}

export default DataEntry;
