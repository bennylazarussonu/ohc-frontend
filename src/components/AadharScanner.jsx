import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { ungzip } from "pako";
import Tesseract from "tesseract.js";

/* ---------- helpers ---------- */

const toISO = (d) => {
  const m = d?.match(/(\d{2})[\/-](\d{2})[\/-](\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
};

const GENDER = { M: "MALE", F: "FEMALE", T: "OTHER" };

const clean = (o) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v && String(v).trim()));

// Secure QR (new cards): big decimal number -> bytes -> gzip -> fields split by 0xFF
function parseSecureQr(text) {
  if (!/^\d{200,}$/.test(text)) return null;
  try {
    let hex = BigInt(text).toString(16);
    if (hex.length % 2) hex = "0" + hex;
    const bytes = Uint8Array.from(hex.match(/../g).map((h) => parseInt(h, 16)));
    const data = ungzip(bytes);

    const dec = new TextDecoder("utf-8");
    const parts = [];
    let start = 0;
    for (let i = 0; i < data.length && parts.length < 18; i++) {
      if (data[i] === 255) {
        parts.push(dec.decode(data.slice(start, i)));
        start = i + 1;
      }
    }
    const o = /^V\d/.test(parts[0]) ? 1 : 0;
    const f = (n) => parts[o + n] || "";
    const co = f(5);

    const address = [f(8), f(13), f(7), f(9), f(15), f(11), f(14), f(6), f(12), f(10)]
      .filter(Boolean)
      .join(", ");

    return clean({
      name: f(2),
      dob: toISO(f(3)),
      gender: GENDER[f(4)?.[0]?.toUpperCase()] || (f(4) ? f(4).toUpperCase() : ""),
      fathers_name: /^(S|D)\/O/i.test(co) ? co.replace(/^(S|D)\/O:?\s*/i, "") : "",
      residence: address,
    });
  } catch {
    return null;
  }
}

// Old XML QR
function parseXmlQr(text) {
  if (!text.trim().startsWith("<")) return null;
  try {
    const el = new DOMParser()
      .parseFromString(text, "text/xml")
      .querySelector("PrintLetterBarcodeData");
    if (!el) return null;
    const a = (n) => el.getAttribute(n) || "";
    const co = a("co");
    return clean({
      aadhar_no: a("uid"),
      name: a("name"),
      gender: GENDER[a("gender")?.[0]?.toUpperCase()] || a("gender").toUpperCase(),
      dob: toISO(a("dob")) || (a("yob") ? `${a("yob")}-01-01` : ""),
      fathers_name: /^(S|D)\/O/i.test(co) ? co.replace(/^(S|D)\/O:?\s*/i, "") : "",
      residence: [a("house"), a("street"), a("lm"), a("loc"), a("vtc"), a("po"),
        a("subdist"), a("dist"), a("state"), a("pc")].filter(Boolean).join(", "),
    });
  } catch {
    return null;
  }
}

// OCR text (front and/or back)
function parseOcr(raw) {
  const text = raw.replace(/[|]/g, "I");
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const out = {};

  const uid = text.match(/\b(\d{4})\s(\d{4})\s(\d{4})\b/);
  if (uid) out.aadhar_no = `${uid[1]}${uid[2]}${uid[3]}`;

  const dob = text.match(/(\d{2}[\/-]\d{2}[\/-]\d{4})/);
  if (dob) out.dob = toISO(dob[1]);
  else {
    const yob = text.match(/(?:Year of Birth|YOB)\D{0,5}(\d{4})/i);
    if (yob) out.dob = `${yob[1]}-01-01`;
  }

  const g = text.match(/\b(MALE|FEMALE|TRANSGENDER)\b/i);
  if (g) out.gender = g[1].toUpperCase() === "TRANSGENDER" ? "OTHER" : g[1].toUpperCase();

  // Name: line just above the DOB line
  const dobIdx = lines.findIndex((l) =>
    /DOB|Date of Birth|Year of Birth|\d{2}[\/-]\d{2}[\/-]\d{4}/i.test(l)
  );
  if (dobIdx > 0) {
    for (let i = dobIdx - 1; i >= 0; i--) {
      const l = lines[i].replace(/[^A-Za-z .]/g, "").trim();
      if (l.length > 2 && !/government|india|aadhaar|authority/i.test(l)) {
        out.name = l;
        break;
      }
    }
  }

  // Back side
  const co = text.match(/\b(?:S|D)\/O:?\s*([A-Za-z .]+)/i);
  if (co) out.fathers_name = co[1].split(/[,\n]/)[0].trim();

  const addr = text.match(/Address:?\s*([\s\S]*?\b\d{6}\b)/i);
  if (addr) out.residence = addr[1].replace(/\s*\n\s*/g, ", ").replace(/\s+/g, " ").trim();

  return clean(out);
}

/* ---------- component ---------- */

const FIELDS = [
  ["name", "Name"],
  ["aadhar_no", "Aadhar No"],
  ["dob", "Date of Birth"],
  ["gender", "Gender"],
  ["fathers_name", "Father's Name"],
  ["residence", "Address"],
];

function AadharScanner({ onClose, onApply }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const [data, setData] = useState({});
  const [status, setStatus] = useState("Starting camera...");
  const [ocrBusy, setOcrBusy] = useState(false);

  // camera
  useEffect(() => {
    let stream;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("Show the QR code (front or back) / the card clearly");
      } catch {
        setStatus("Cannot access camera. Allow permission (needs HTTPS or localhost).");
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const grabFrame = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(v, 0, 0);
    return { c, ctx };
  };

  // live QR scan
  useEffect(() => {
    const id = setInterval(() => {
      const f = grabFrame();
      if (!f) return;
      const img = f.ctx.getImageData(0, 0, f.c.width, f.c.height);
      const qr = jsQR(img.data, img.width, img.height, {
        inversionAttempts: "attemptBoth",
      });
      if (!qr?.data) return;
      const parsed = parseSecureQr(qr.data) || parseXmlQr(qr.data);
      if (parsed) {
        setData((prev) => ({ ...prev, ...parsed })); // QR wins
        setStatus("QR read ✓ — capture the front of the card for the Aadhar number if missing");
      }
    }, 400);
    return () => clearInterval(id);
  }, []);

  // OCR on demand
  const captureOcr = async () => {
    const f = grabFrame();
    if (!f) return;
    setOcrBusy(true);
    setStatus("Reading card text...");
    try {
      const { data: res } = await Tesseract.recognize(f.c, "eng");
      const parsed = parseOcr(res.text);
      setData((prev) => ({ ...parsed, ...prev })); // existing (QR) values win
      setStatus(
        Object.keys(parsed).length
          ? "Text read ✓ — flip the card and capture again if needed"
          : "Couldn't read. Improve light / hold steady and retry"
      );
    } catch {
      setStatus("OCR failed, try again");
    } finally {
      setOcrBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl p-5 w-[720px] max-w-[95vw] space-y-3 text-xs">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm">SCAN AADHAR CARD</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full rounded bg-black max-h-[320px] object-contain"
        />
        <p className="text-gray-300">{status}</p>

        <div className="grid grid-cols-2 gap-1 bg-gray-900 rounded p-3">
          {FIELDS.map(([k, label]) => (
            <div key={k} className={k === "residence" ? "col-span-2" : ""}>
              <span className={data[k] ? "text-green-400" : "text-gray-500"}>
                {data[k] ? "✓" : "○"} {label}:
              </span>{" "}
              <span>{data[k] || "—"}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={captureOcr}
            disabled={ocrBusy}
            className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {ocrBusy ? "Reading..." : "Capture & Read Text"}
          </button>
          <button
            onClick={() => {
              onApply(data);
              onClose();
            }}
            disabled={!Object.keys(data).length}
            className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            Fill Form
          </button>
        </div>
      </div>
    </div>
  );
}

export default AadharScanner;