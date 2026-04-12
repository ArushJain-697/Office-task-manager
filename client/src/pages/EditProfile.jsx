import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import '../styles/Typewriter.css';
import CinematicPage from '../components/CinematicPage';

let audioCtx = null;

const playSound = (type) => {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return;
    }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t = audioCtx.currentTime;

  if (type === 'key') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150 + Math.random() * 100, t);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.06);
  } else if (type === 'space') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80 + Math.random() * 40, t);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.07);
  } else if (type === 'ding') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, t);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.2);
  } else if (type === 'return') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1900, t);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.25);
  }
};

const CARRIAGE_STEP_PX = 5.2;
const MAX_CARRIAGE_PX = 400;

const SKILL_OPTIONS = [
  'Hacker', 'Driver', 'Sniper', 'Safecracker', 'Locksmith',
  'Forger', 'Explosives', 'Enforcer', 'Surveillance', 'Pickpocket',
  'Demolitions', 'Freerunner', 'Pilot', 'Diver', 'Arsonist',
  'Smuggler', 'Interrogator', 'Disguise', 'Cryptographer', 'Electronics',
];

export default function EditProfile() {
  const navigate = useNavigate();
  const [dossierData, setDossierData] = useState({
    name: '', title: '', height: '', weight: '', blood_group: '',
    clearance_level: '', about: '', skills: [], languages: '', photoUrl: null, photoFile: null
  });

  const [currentFieldId, setCurrentFieldId] = useState('name');
  const [lockState, setLockState] = useState('idle');
  const [carriageOffsetPx, setCarriageOffsetPx] = useState(0);

  const hiddenInputRef = useRef(null);
  const viewportRef = useRef(null);
  const paperRef = useRef(null);
  const fieldRefs = useRef({});
  const imperfections = useRef({});
  const lastCursorYRef = useRef(0);
  const lastKeyEnterRef = useRef(false);

  const isMultiline = (id) => ['about'].includes(id);

  const getOrderedFieldList = () => {
    return ['name', 'title', 'height', 'weight', 'blood_group', 'clearance_level', 'skills', 'languages', 'about'];
  };

  const getFieldValue = (id) => {
    if (id === 'skills') return '';
    return String(dossierData[id] || '');
  };

  const toggleSkill = (skill) => {
    playSound('key');
    setDossierData((prev) => {
      const has = prev.skills.includes(skill);
      const skills = has ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const updateData = (field, value) => {
    setDossierData(prev => ({ ...prev, [field]: value }));
  };

  const getImp = (fieldId, index) => {
    if (!imperfections.current[fieldId]) imperfections.current[fieldId] = [];
    while (imperfections.current[fieldId].length <= index) {
      imperfections.current[fieldId].push({
        dy: (Math.random() - 0.5),
        dx: (Math.random() * 0.6 - 0.3),
        rot: (Math.random() * 0.6 - 0.3),
        op: 0.85 + Math.random() * 0.15,
        hue: Math.random() * 5 - 2.5,
        blur: Math.random() * 0.3
      });
    }
    return imperfections.current[fieldId][index];
  };

  useEffect(() => {
    if (lockState === 'idle') hiddenInputRef.current?.focus();
  }, [currentFieldId, lockState]);

  useEffect(() => {
    setCarriageOffsetPx(0);
  }, [currentFieldId]);

  useLayoutEffect(() => {
    if (!paperRef.current || lockState !== 'idle') return;
    paperRef.current.style.transition = 'transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    paperRef.current.style.transform = `translateX(${-carriageOffsetPx}px)`;
  }, [carriageOffsetPx, lockState]);

  useLayoutEffect(() => {
    if (lockState !== 'idle' || !paperRef.current || !viewportRef.current) return;
    let scrollAnimId;
    const smoothScrollTo = (target, duration) => {
      const start = viewportRef.current.scrollTop;
      const dist = target - start;
      if (Math.abs(dist) < 1) return;
      const startTime = performance.now();
      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        if (viewportRef.current) viewportRef.current.scrollTop = start + dist * ease;
        if (progress < 1) scrollAnimId = requestAnimationFrame(step);
      };
      cancelAnimationFrame(scrollAnimId);
      scrollAnimId = requestAnimationFrame(step);
    };

    requestAnimationFrame(() => {
      const fieldEl = fieldRefs.current[currentFieldId];
      if (!fieldEl) return;
      const cursorEl = fieldEl.querySelector('.type-cursor');
      let cursorY = fieldEl.offsetTop;

      if (cursorEl) {
        let y = 0; let node = cursorEl;
        while (node && node !== paperRef.current) {
          y += node.offsetTop;
          node = node.offsetParent;
        }
        cursorY = y;
      }

      if (lastCursorYRef.current !== 0) {
        const dy = cursorY - lastCursorYRef.current;
        if (dy > 10 && dy < 100) smoothScrollTo(cursorY, lastKeyEnterRef.current ? 300 : 150);
        else if (Math.abs(dy) > 100) smoothScrollTo(cursorY, 400);
        else viewportRef.current.scrollTop = cursorY;
      } else viewportRef.current.scrollTop = cursorY;

      lastCursorYRef.current = cursorY;
      lastKeyEnterRef.current = false;
    });
  }, [currentFieldId]);

  const handleKeyDown = (e) => {
    const val = getFieldValue(currentFieldId);
    if (e.key === 'Tab') {
      e.preventDefault();
      playSound('return');
      setCarriageOffsetPx(0);
      const list = getOrderedFieldList();
      let nextIndex = list.indexOf(currentFieldId) + (e.shiftKey ? -1 : 1);
      nextIndex = Math.max(0, Math.min(nextIndex, list.length - 1));
      setCurrentFieldId(list[nextIndex]);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      playSound('return');
      setCarriageOffsetPx(0);
      if (isMultiline(currentFieldId)) {
        lastKeyEnterRef.current = true;
        updateData(currentFieldId, val + '\n');
      } else {
        const list = getOrderedFieldList();
        const nextIndex = Math.min(list.indexOf(currentFieldId) + 1, list.length - 1);
        setCurrentFieldId(list[nextIndex]);
      }
    } else if (e.key === 'Backspace') {
      playSound('key');
    } else if (e.key === ' ') {
      playSound('space');
      if (val.length % 55 === 0 && val.length > 5) playSound('ding');
    } else if (e.key.length === 1) {
      playSound('key');
      if (val.length % 55 === 0 && val.length > 5) playSound('ding');
    } else {
      lastKeyEnterRef.current = false;
    }
  };

  const handlePublish = async () => {
    setLockState('exiting');

    if (paperRef.current) {
      paperRef.current.style.transition = 'transform 1.5s ease-in';
      paperRef.current.style.transform = `translateX(${-carriageOffsetPx}px) translateY(-250vh)`;
    }

    await new Promise(r => setTimeout(r, 1500));
    setLockState('slamming');
    await new Promise(r => setTimeout(r, 300));
    setLockState('loading');

    const formData = new FormData();
    if (dossierData.name) formData.append("name", dossierData.name);
    if (dossierData.title) formData.append("title", dossierData.title);
    if (dossierData.height) formData.append("height", dossierData.height);
    if (dossierData.weight) formData.append("weight", dossierData.weight);
    if (dossierData.blood_group) formData.append("blood_group", dossierData.blood_group);
    if (dossierData.clearance_level) formData.append("clearance_level", dossierData.clearance_level);
    if (dossierData.about) formData.append("about", dossierData.about);

    if (dossierData.skills.length > 0) {
      formData.append("skills", JSON.stringify(dossierData.skills));
    }

    if (dossierData.languages) {
      const langArr = dossierData.languages.split(',').map(s => s.trim()).filter(Boolean);
      formData.append("languages", JSON.stringify(langArr));
    }

    if (dossierData.photoFile) {
      formData.append("photo", dossierData.photoFile);
    }

    try {
      const response = await fetch("https://api.sicari.works/api/sicario/profile", {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to edit profile");
      }

      // Navigate out sequentially to newspaper/table
      navigate("/feed");
    } catch (e) {
      console.error(e);
      alert("Error updating profile. Please try again.");
      setLockState('idle');
    }
  };

  const renderText = (fieldId) => {
    const text = getFieldValue(fieldId);
    let charIndex = 0;
    const chunks = text.split(/([\s\n]+)/);

    return chunks.map((chunk, cIdx) => {
      const elements = chunk.split('').map((char) => {
        const cID = charIndex++;
        const imp = getImp(fieldId, cID);
        if (char === '\n') return <br key={cID} />;
        if (char === ' ') return <span key={cID} className="type-char">&nbsp;</span>;

        return (
          <span key={cID} className="type-char" style={{
            '--char-opacity': imp.op,
            transform: `translate(${imp.dx}px, ${imp.dy}px) rotate(${imp.rot}deg)`,
            filter: `hue-rotate(${imp.hue}deg) blur(${imp.blur}px)`,
            textShadow: `0.5px 0.5px 0px rgba(0,0,0,0.1), -0.5px -0.5px 0px rgba(0,0,0,0.05)`,
            animation: 'typeStrike 80ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          }}>
            {char}
          </span>
        );
      });
      return <span key={cIdx} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{elements}</span>;
    });
  };

  const Field = ({ id, label, block = false }) => {
    const isActive = currentFieldId === id;
    const isMulti = isMultiline(id);
    return (
      <div
        className="td-field"
        style={{ display: block || isMulti ? 'block' : 'inline-block', marginRight: '20px' }}
        onClick={(e) => { e.stopPropagation(); setCurrentFieldId(id); }}
        ref={el => fieldRefs.current[id] = el}
      >
        <span className="td-field-label">{label}</span>
        {isMulti && <br />}
        <span className="td-value">
          <span className="td-placeholder">
            {getFieldValue(id) ? '' : '___________'}
          </span>
          {renderText(id)}
          {isActive && <span className="type-cursor" />}
        </span>
      </div>
    );
  };

  return (
    <CinematicPage>
      <div className="td-wrapper fixed inset-0 w-screen h-screen flex flex-col">
        <div
          ref={viewportRef}
          className={`td-viewport flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide ${lockState === 'slamming' ? 'td-shaking' : ''}`}
          onClick={() => hiddenInputRef.current?.focus()}
        >
          <img
            src="/assets/platten.png"
            alt="Typewriter Platten"
            className="td-platten-image pointer-events-none"
            onError={(e) => e.target.style.display = 'none'}
          />

          <div className="td-paper-container">
            <div className="td-paper" ref={paperRef}>
              <div className="td-feed-holes" />
              <div className="td-margin-left" />
              <div className="td-margin-right" />
              <div className="td-feed-holes-right" />

              <div className="td-header">WANTED DOSSIER UPDATE REQUEST</div>
              <div className="td-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

              <div className="td-section">
                <div className="td-section-head">Fill exactly which variables you desire to update across local systems:</div>
                <br />
                <Field id="name" label="1. KNOWN ALIAS (NAME):" block />
                <Field id="title" label="2. CRIMINAL TITLE:" block />
                <Field id="height" label="3. HEIGHT:" block />
                <Field id="weight" label="4. WEIGHT:" block />
                <Field id="blood_group" label="5. BLOOD TYPE:" block />
                <Field id="clearance_level" label="6. CLEARANCE LEVEL:" block />
                <div
                  className="td-field"
                  style={{ display: 'block', marginBottom: '15px', cursor: 'default' }}
                  onClick={(e) => { e.stopPropagation(); setCurrentFieldId('skills'); }}
                  ref={(el) => { fieldRefs.current.skills = el; }}
                >
                  <span className="td-field-label">7. SKILL SET (SELECT ANY):</span>
                  <div
                    className="flex flex-wrap gap-2 mt-2 max-w-full relative z-[4]"
                    style={{ fontFamily: 'inherit' }}
                  >
                    {SKILL_OPTIONS.map((opt) => {
                      const on = dossierData.skills.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          className={
                            'text-sm px-2.5 py-1 border-2 border-[#1a1a1a] transition-colors ' +
                            (on ? 'bg-[#1a1a1a] text-[#f4f1e8]' : 'bg-transparent text-[#1a1a1a]')
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentFieldId('skills');
                            toggleSkill(opt);
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {currentFieldId === 'skills' && (
                    <span className="td-value inline-block mt-1">
                      <span className="type-cursor" />
                    </span>
                  )}
                </div>
                <Field id="languages" label="8. LANGUAGES (COMMA SEPARATED):" block />
                <br />
                <Field id="about" label="9. ABOUT ME:" block />

                <div className="td-photo mt-[50px] inline-block" onClick={() => document.getElementById('photoUpload').click()}>
                  <input id="photoUpload" type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDossierData(prev => ({ ...prev, photoFile: file, photoUrl: URL.createObjectURL(file) }));
                    }
                  }} />
                  {dossierData.photoUrl ? <img src={dossierData.photoUrl} alt="" className="max-w-[400px] border-[1px] border-black p-2 bg-[#eee4d1]" /> : <span>📎 ATTACH NEW PORTRAIT (OPTIONAL)</span>}
                </div>
              </div>
            </div>
          </div>

          {lockState === 'slamming' && <div className="td-slam-stamp" style={{ color: 'green', borderColor: 'green' }}>APPROVED</div>}
          {lockState === 'loading' && <LoadingTerminal />}
        </div>

        <div className="td-button-container flex justify-center items-center w-full py-4 z-[100] bg-transparent pointer-events-auto shrink-0">
          <button
            className="td-stamp-btn pointer-events-auto shadow-xl"
            disabled={lockState !== 'idle'}
            onClick={handlePublish}
          >
            📝 COMMIT PROFILE EDITS
          </button>
        </div>

        <textarea
          ref={hiddenInputRef}
          value={getFieldValue(currentFieldId)}
          readOnly={currentFieldId === 'skills'}
          onChange={(e) => {
            if (currentFieldId === 'skills') return;
            const newVal = e.target.value;
            updateData(currentFieldId, newVal);
            const lines = newVal.split('\n');
            const lastLineLength = lines[lines.length - 1].length;
            setCarriageOffsetPx(Math.min(lastLineLength * CARRIAGE_STEP_PX, MAX_CARRIAGE_PX));
          }}
          onKeyDown={handleKeyDown}
          style={{ position: 'fixed', top: '-9999px', opacity: 0, width: 0, height: 0 }}
          autoFocus
        />
      </div>
    </CinematicPage>
  );
}

const LoadingTerminal = () => {
  const [dots, setDots] = useState('.');
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 400);
    return () => clearInterval(id);
  }, []);
  return <div className="td-loading-term">TRANSMITTING OVER SECURE CHANNEL{dots}</div>;
};
