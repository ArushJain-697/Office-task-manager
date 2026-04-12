import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DossierView from "../components/DossierView";
import { heistApiToDossierForm } from "../utils/heistToDossierData";
import "../styles/HeistDossier.css";

function stripUiFields(h) {
  if (!h || typeof h !== "object") return h;
  const {
    uniqueIndex: _u,
    _title: _t,
    _hashtags: _h,
    description: _d,
    ...rest
  } = h;
  return rest;
}

function idsMatch(a, b) {
  return (
    a != null &&
    b != null &&
    (a === b || Number(a) === Number(b) || String(a) === String(b))
  );
}

export default function HeistDescription() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const stateHeist = location.state?.heist;

  const heistId =
    id != null
      ? Number(id)
      : stateHeist?.id != null
        ? Number(stateHeist.id)
        : null;

  const [heist, setHeist] = useState(() =>
    stateHeist && idsMatch(stateHeist.id, heistId) ? stripUiFields(stateHeist) : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (heistId == null || Number.isNaN(heistId)) {
      setLoading(false);
      setError("missing-id");
      return;
    }

    let cancelled = false;

    fetch("https://api.sicari.works/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((authData) => {
        const userRole = authData?.user?.role || "sicario";
        const url =
          userRole === "fixer"
            ? "https://api.sicari.works/api/fixer/heists"
            : "https://api.sicari.works/api/sicario/heists";
        return fetch(url, { credentials: "include" });
      })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const arr = Array.isArray(data) ? data : data.heists || data.data || [];
        const found = arr.find((h) => idsMatch(h.id, heistId));
        if (found) {
          setHeist(found);
          setError(null);
        } else if (stateHeist && idsMatch(stateHeist.id, heistId)) {
          setHeist(stripUiFields(stateHeist));
          setError(null);
        } else {
          setHeist(null);
          setError("not-found");
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (stateHeist && idsMatch(stateHeist.id, heistId)) {
          setHeist(stripUiFields(stateHeist));
          setError(null);
        } else {
          setError("fetch-failed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [heistId, stateHeist?.id]);

  const formData = useMemo(() => (heist ? heistApiToDossierForm(heist) : null), [heist]);

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center text-[#e8dcc8]"
        style={{ background: "#0c0b09", fontFamily: "'Special Elite', monospace" }}
      >
        Loading dossier…
      </div>
    );
  }

  if (error === "missing-id" || !formData) {
    return (
      <div
        className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-6 text-[#e8dcc8]"
        style={{ background: "#0c0b09", fontFamily: "'Special Elite', monospace" }}
      >
        <p>{error === "missing-id" ? "No heist selected." : "Could not load this heist."}</p>
        <button
          type="button"
          className="border-2 border-[#c9a84c] px-6 py-2 uppercase tracking-widest text-[#c9a84c]"
          onClick={() => navigate("/Heists")}
        >
          Back to wall
        </button>
      </div>
    );
  }

  return (
    <DossierView
      formData={formData}
      resetLabel="← Back to heists"
      onReset={() => navigate("/Heists")}
    />
  );
}
