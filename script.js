const baseSectorMap = {
  Healthcare: [
    "medical",
    "hospital",
    "patient",
    "healthcare",
    "clinical",
    "therapy",
    "pharmacy",
    "medication",
    "treatment",
    "care provider",
    "wellness",
    "clinical trial",
    "patient data",
    "patient safety",
    "coverage",
    "premium",
    "claim",
    "policy",
    "insurer",
    "insured",
    "underwriting",
    "risk",
    "beneficiary",
    "deductible",
    "liability insurance",
    "indemnify"
  ],
  Finance: [
    "payment",
    "invoice",
    "interest",
    "loan",
    "fee",
    "installment",
    "deposit",
    "amount",
    "due date",
    "compensation",
    "bank",
    "credit",
    "transaction",
    "finance",
    "financing",
    "revenue",
    "expense",
    "funding",
    "investment",
    "account"
  ],
  Legal: [
    "agreement",
    "jurisdiction",
    "law",
    "contract",
    "clause",
    "party",
    "liability",
    "indemnity",
    "obligation",
    "termination",
    "confidentiality",
    "warranty",
    "compliance",
    "legal",
    "settlement",
    "arbitration",
    "dispute",
    "breach"
  ],
  Technology: [
    "software",
    "technology",
    "data",
    "digital",
    "system",
    "platform",
    "application",
    "ai",
    "artificial intelligence",
    "software as a service",
    "cloud",
    "security",
    "server",
    "database",
    "integration",
    "network"
  ],
  Construction: [
    "site",
    "contractor",
    "material",
    "project",
    "building",
    "construction",
    "scope",
    "subcontractor",
    "architect",
    "permit",
    "builder",
    "structural",
    "engineering",
    "civil",
    "site work"
  ],
  RealEstate: [
    "lease",
    "tenant",
    "landlord",
    "property",
    "rent",
    "mortgage",
    "premises",
    "real estate",
    "commercial",
    "residential",
    "facility",
    "occupancy",
    "title",
    "deed"
  ],
  Employment: [
    "employee",
    "employer",
    "salary",
    "wages",
    "position",
    "employment",
    "benefits",
    "contractor",
    "hiring",
    "termination",
    "compensation",
    "workplace",
    "payroll",
    "leave"
  ],
  Manufacturing: [
    "supplier",
    "production",
    "manufacture",
    "quality",
    "delivery",
    "logistics",
    "assembly",
    "supply chain",
    "factory",
    "component",
    "inventory",
    "distribution"
  ],
  Retail: [
    "sale",
    "purchase",
    "order",
    "shipment",
    "consumer",
    "merchant",
    "distribution",
    "store",
    "inventory",
    "product",
    "retail",
    "wholesale",
    "point of sale"
  ],
  Energy: [
    "energy",
    "power",
    "electricity",
    "oil",
    "gas",
    "renewable",
    "utility",
    "grid",
    "utility service",
    "petroleum",
    "transportation fuel"
  ],
  Hospitality: [
    "hotel",
    "restaurant",
    "guest",
    "hospitality",
    "accommodation",
    "reservation",
    "service provider",
    "event",
    "travel",
    "lodging"
  ],
  Telecommunications: [
    "telecom",
    "telecommunications",
    "network",
    "mobile",
    "broadband",
    "wireless",
    "voice",
    "data service",
    "connectivity",
    "internet service"
  ],
  Education: [
    "school",
    "university",
    "student",
    "education",
    "training",
    "curriculum",
    "academic",
    "tutor",
    "learning",
    "course",
    "classroom"
  ],
  Logistics: [
    "transport",
    "shipping",
    "freight",
    "carrier",
    "delivery",
    "warehouse",
    "logistics",
    "distribution",
    "route",
    "shipment",
    "cargo"
  ]
};

function escapeRegex(text) {
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function normalizeStoredSector(sector) {
  if (sector === "Insurance") return "Healthcare";
  return sector;
}

function loadSectorDatabase() {
  try {
    const stored = localStorage.getItem("sectorDatabase");
    if (!stored) return baseSectorMap;

    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return baseSectorMap;

    const merged = { ...baseSectorMap };
    Object.entries(parsed).forEach(([sector, terms]) => {
      const normalizedSector = normalizeStoredSector(sector);
      if (!Object.prototype.hasOwnProperty.call(baseSectorMap, normalizedSector)) return;
      if (!Array.isArray(terms)) return;

      merged[normalizedSector] = Array.from(
        new Set([
          ...(merged[normalizedSector] || []),
          ...terms.filter((term) => typeof term === "string" && term.trim())
        ])
      );
    });

    return merged;
  } catch (err) {
    console.warn("Unable to load saved sector database", err);
    return baseSectorMap;
  }
}

function saveSectorMatchToDatabase(sector, matchedTerms) {
  if (!sector || !Array.isArray(matchedTerms) || matchedTerms.length === 0) return;

  const normalizedSector = normalizeStoredSector(sector);
  if (!Object.prototype.hasOwnProperty.call(baseSectorMap, normalizedSector)) return;

  try {
    const stored = localStorage.getItem("sectorDatabase");
    const existing = stored ? JSON.parse(stored) : {};
    const updated = existing && typeof existing === "object" ? { ...existing } : {};
    const normalizedTerms = matchedTerms
      .map((term) => term.toLowerCase().trim())
      .filter(Boolean);

    updated[normalizedSector] = Array.from(
      new Set([...(updated[normalizedSector] || []), ...normalizedTerms])
    );

    delete updated.Insurance;
    delete updated.General;

    localStorage.setItem("sectorDatabase", JSON.stringify(updated));
  } catch (err) {
    console.warn("Unable to save sector database", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const submitBtn = document.getElementById("submitBtn");
  const progressBox = document.getElementById("progressBox");
  const progressBar = document.getElementById("progressBar");
  const form = document.getElementById("contractForm");
  const statusText = document.getElementById("analyzeStatus");
  const statusIcon = document.getElementById("statusIcon");

  if (!fileInput || !form || !submitBtn || !progressBox || !progressBar) return;

  function setStatus(icon, message) {
    if (statusIcon) statusIcon.textContent = icon;
    if (statusText) statusText.textContent = message;
  }

  function resetSubmitState() {
    submitBtn.disabled = false;
    submitBtn.textContent = "Analyze Contract";
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    submitBtn.disabled = !file;
    submitBtn.classList.toggle("disabled", !file);
    progressBox.classList.add("hidden");
    progressBar.style.width = "0%";

    if (!file) {
      setStatus("", "Select a contract image to begin.");
      return;
    }

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("FILE", "PDF loaded. Ready to render and analyze page 1.");
    } else {
      setStatus("FILE", "Contract image loaded. Ready to begin analysis.");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
      progressBox.classList.add("hidden");
      progressBar.style.width = "0%";
      resetSubmitState();
      setStatus("", "Please choose a contract file before continuing.");
      return;
    }

    const sound = document.getElementById("processingSound");
    if (sound) {
      sound.volume = 0.25;
      sound.play().catch(() => {});
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Analyzing...";
    setStatus("...", "Performing OCR and extracting contract intelligence...");
    progressBox.classList.remove("hidden");
    progressBar.style.width = "5%";

    try {
      let extractedText = "";

      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const pdfLib = await ensurePdfLib();
        if (!pdfLib) {
          throw new Error("PDF support is not loaded.");
        }

        setStatus("...", "Rendering PDF pages for OCR...");
        const canvases = await loadPdfPagesAsImages(file, pdfLib);

        for (let pageIndex = 0; pageIndex < canvases.length; pageIndex += 1) {
          setStatus("...", `Performing OCR on page ${pageIndex + 1} of ${canvases.length}...`);
          const { data } = await Tesseract.recognize(canvases[pageIndex], "eng", {
            logger: (m) => {
              if (!m.progress) return;
              const percent = Math.min(100, Math.floor(m.progress * 100));
              progressBar.style.width = `${percent}%`;
              setStatus("...", `Analyzing page ${pageIndex + 1} of ${canvases.length} - ${percent}% complete.`);
            }
          });
          extractedText += `${data.text}\n\n`;
        }
      } else {
        const { data } = await Tesseract.recognize(file, "eng", {
          logger: (m) => {
            if (!m.progress) return;
            const percent = Math.min(100, Math.floor(m.progress * 100));
            progressBar.style.width = `${percent}%`;
            setStatus("...", `Analyzing - ${percent}% complete.`);
          }
        });
        extractedText = data.text;
      }

      const result = analyzeText(extractedText);
      sessionStorage.setItem("analysisResult", JSON.stringify(result));
      progressBar.style.width = "100%";
      setStatus("OK", "Analysis complete. Redirecting to report...");

      setTimeout(() => {
        window.location.href = "result.html";
      }, 350);
    } catch (error) {
      console.error("Analysis error:", error);
      const message = error && error.message ? error.message : "Unable to analyze the document.";
      alert(`Unable to analyze the contract. ${message}`);
      progressBox.classList.add("hidden");
      progressBar.style.width = "0%";
      resetSubmitState();
      setStatus("X", `Analysis failed: ${message}`);
    } finally {
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    }
  });

  function findPdfLibGlobal() {
    const candidate =
      window.pdfjsLib ||
      window["pdfjs-dist/build/pdf"] ||
      window.pdfjsDist ||
      window.pdfjsDistBuildPdf ||
      window.pdfjsDistBuildPdfjs ||
      null;

    if (candidate && typeof candidate.getDocument === "function") {
      return candidate;
    }

    if (candidate && candidate.default && typeof candidate.default.getDocument === "function") {
      return candidate.default;
    }

    return null;
  }

  function loadPdfJsScript(url) {
    return new Promise((resolve, reject) => {
      const existing = Array.from(document.scripts).find((script) => script.src === url);

      if (existing) {
        if (findPdfLibGlobal()) {
          resolve();
          return;
        }

        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error(`Unable to load PDF.js from ${url}`)),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src = url;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Unable to load PDF.js from ${url}`));
      document.head.appendChild(script);
    });
  }

  async function ensurePdfLib() {
    const existingLib = findPdfLibGlobal();
    if (existingLib) return existingLib;

    const urls = [
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.105/pdf.min.js",
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.105/build/pdf.min.js"
    ];

    for (const url of urls) {
      try {
        await loadPdfJsScript(url);
        const loadedLib = findPdfLibGlobal();
        if (loadedLib) return loadedLib;
      } catch (err) {
        console.warn(err.message);
      }
    }

    return null;
  }

  async function loadPdfPagesAsImages(file, pdfLib) {
    pdfLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.105/pdf.worker.min.js";

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const canvases = [];

    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to create canvas context for PDF rendering.");
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderTask = page.render({ canvasContext: context, viewport });
      await renderTask.promise;
      canvases.push(canvas);
    }

    return canvases;
  }

  function analyzeText(text) {
    const normalized = (text || "")
      .replace(/\r\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const lowercase = normalized.toLowerCase();
    const sectorsMap = loadSectorDatabase();
    const matchedTermsBySector = {};

    const sectorCounts = Object.fromEntries(
      Object.entries(sectorsMap).map(([sector, terms]) => {
        const normalizedTerms = Array.isArray(terms) ? terms : [];
        let count = 0;
        const matched = [];

        normalizedTerms.forEach((term) => {
          const safeTerm = escapeRegex(term);
          if (!safeTerm) return;

          const matches = lowercase.match(new RegExp(`\\b${safeTerm}\\b`, "g"));
          if (!matches) return;

          count += matches.length;
          matched.push(term.toLowerCase());
        });

        matchedTermsBySector[sector] = Array.from(new Set(matched));
        return [sector, count];
      })
    );

    const primarySectorEntry =
      Object.entries(sectorCounts).sort(([aKey, aCount], [bKey, bCount]) => {
        if (bCount !== aCount) return bCount - aCount;
        return aKey.localeCompare(bKey);
      })[0] || [null, 0];

    const sector = primarySectorEntry[1] > 0 ? primarySectorEntry[0] : "Not detected";
    const matchedTerms = matchedTermsBySector[sector] || [];
    saveSectorMatchToDatabase(sector, matchedTerms);

    const riskWords = [
      "penalty",
      "terminate",
      "liability",
      "fine",
      "breach",
      "indemnity",
      "default",
      "damages",
      "termination",
      "late fee",
      "dispute"
    ];

    const riskScore = riskWords.reduce((score, word) => {
      return score + (lowercase.includes(word) ? 1 : 0);
    }, 0);

    const risk = riskScore >= 3 ? "High" : riskScore === 2 ? "Medium" : "Low";
    const riskMeter = Math.min(100, riskScore * 30 + (riskScore > 0 ? 10 : 0));
    const parties = extractParties(normalized);
    const payment = extractPaymentInfo(normalized);
    const complexTerms = generateComplexTerms(lowercase);
    const summary = createShortSummary(normalized);
    const agreementOverview = createAgreementOverview(parties, payment);
    const keyPoints = extractKeyPoints(normalized);

    return {
      sector,
      risk,
      riskMeter,
      parties,
      paymentSummary: payment.summary,
      paymentAmounts: payment.amounts,
      summary,
      agreementOverview,
      complexTerms,
      keyPoints
    };
  }

  function extractParties(text) {
    const commonPatterns = [
      /by and between\s+(.{6,140}?)\s+(?:and|&|\/)\s+(.{6,140}?)(?=[\.,;])/i,
      /agreement is made between\s+(.{6,140}?)\s+(?:and|&|\/)\s+(.{6,140}?)(?=[\.,;])/i,
      /this agreement\s+is\s+between\s+(.{6,140}?)\s+(?:and|&|\/)\s+(.{6,140}?)(?=[\.,;])/i,
      /between\s+(.{6,140}?)\s+(?:and|&|\/)\s+(.{6,140}?)(?=[\.,;])/i
    ];

    for (const pattern of commonPatterns) {
      const match = text.match(pattern);
      if (match) {
        return `${match[1].trim()} and ${match[2].trim()}`;
      }
    }

    const partyPattern =
      /(party one|party a|first party|seller|buyer|licensor|lessor|applicant)\b[\s\S]{1,140}?\b(party two|party b|second party|purchaser|licensee|lessee|recipient)/i;
    const partyMatch = text.match(partyPattern);

    if (partyMatch) {
      return `${partyMatch[1].trim()} ... ${partyMatch[2].trim()}`;
    }

    return "Not detected from document.";
  }

  function extractPaymentInfo(text) {
    const currencyPattern = /(?:\$|usd|rs|inr|eur|gbp|aed)\s?\d+(?:[,\s]\d{3})*(?:\.\d{1,2})?/gi;
    const amountsRaw = Array.from(new Set(text.match(currencyPattern) || []));
    const amounts = amountsRaw.join(", ");
    const paymentTerms =
      /\b(payment|installment|fee|deposit|due date|due amount|compensation|invoice|remuneration|salary|charge|premium|reimbursement|amount)\b/gi;
    const termsFound = text.match(paymentTerms);
    const hasPayment = Array.isArray(termsFound) && termsFound.length > 0;

    const summary = hasPayment
      ? amounts
        ? `Payment-related obligations detected: ${amounts}.`
        : "Payment-related obligations detected, amount not explicitly listed."
      : "No payment obligations detected.";

    return {
      summary,
      amounts: amounts || "None detected"
    };
  }

  function generateComplexTerms(text) {
    const dictionary = {
      termination: "Ending the agreement",
      liability: "Legal responsibility",
      jurisdiction: "Court or location that handles disputes",
      indemnity: "A promise to cover losses or damages",
      penalty: "A fine or charge for breaking terms",
      confidential: "Must be kept secret",
      obligation: "A duty or commitment",
      breach: "Breaking the agreement",
      compensation: "Money paid for loss or service",
      compliance: "Following the rules",
      arbitration: "A process to resolve disputes outside court",
      warranty: "A guarantee about the condition or performance",
      assignment: "Transfer rights or duties to another party",
      renewal: "Continuing the agreement for another period",
      notarized: "Officially certified by a public officer",
      escrow: "Assets held by a third party until conditions are met"
    };

    const found = new Set();
    Object.keys(dictionary).forEach((term) => {
      if (text.includes(term)) {
        found.add(`${term.charAt(0).toUpperCase() + term.slice(1)} -> ${dictionary[term]}`);
      }
    });

    if (!found.size) {
      found.add("No complex terms were identified.");
    }

    return Array.from(found);
  }

  function createShortSummary(text) {
    const sentences = text.split(/[\.\?\!]+\s*/).filter((sentence) => sentence.length > 25);

    if (sentences.length === 0) {
      return "This document appears to be a contract agreement with key terms and obligations to review.";
    }

    return sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "." : "");
  }

  function createAgreementOverview(parties, payment) {
    const partyPhrase =
      parties && parties !== "Not detected from document."
        ? `between ${parties}`
        : "between the parties";
    const obligationPhrase =
      payment && payment.summary
        ? payment.summary
            .toLowerCase()
            .replace(/^payment-related obligations detected:\s*/i, "")
            .replace(/\.$/, "")
        : "contract obligations";

    return `This agreement establishes the relationship ${partyPhrase} and outlines ${obligationPhrase}.`;
  }

  function extractKeyPoints(text) {
    const sentences = text
      .split(/[\.\?\!]+\s*/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 30);

    return sentences.slice(0, 8);
  }
});

