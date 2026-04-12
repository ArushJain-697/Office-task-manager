import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Typewriter.css';

let audioCtx = null;

const playSound = (type) => {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("AudioContext creation failed", e);
      return;
    }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t = audioCtx.currentTime;
  
  if (type === 'key') {
     const osc = audioCtx.createOscillator();
     const gain = audioCtx.createGain();
     osc.type = 'triangle';
     osc.frequency.setValueAtTime(150 + Math.random()*100, t);
     gain.gain.setValueAtTime(0.3, t);
     gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
     osc.connect(gain); gain.connect(audioCtx.destination);
     osc.start(t); osc.stop(t + 0.06);
     
     const bufSize = audioCtx.sampleRate * 0.05;
     const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
     const data = buf.getChannelData(0);
     for(let i=0; i<bufSize; i++) data[i] = Math.random() * 2 - 1;
     const noise = audioCtx.createBufferSource();
     noise.buffer = buf;
     const noiseGain = audioCtx.createGain();
     noiseGain.gain.setValueAtTime(0.1, t);
     noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
     noise.connect(noiseGain); noiseGain.connect(audioCtx.destination);
     noise.start(t);
  } else if (type === 'space') {
     const osc = audioCtx.createOscillator();
     const gain = audioCtx.createGain();
     osc.type = 'triangle';
     osc.frequency.setValueAtTime(80 + Math.random()*40, t);
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
     
     const bufSize = audioCtx.sampleRate * 0.25;
     const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
     const data = buf.getChannelData(0);
     for(let i=0; i<bufSize; i++) data[i] = Math.random() * 2 - 1;
     const noise = audioCtx.createBufferSource();
     noise.buffer = buf;
     
     const filter = audioCtx.createBiquadFilter();
     filter.type = 'bandpass';
     filter.frequency.setValueAtTime(400, t);
     filter.frequency.linearRampToValueAtTime(200, t + 0.25);
     
     const nGain = audioCtx.createGain();
     nGain.gain.setValueAtTime(0.3, t);
     nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
     
     noise.connect(filter); filter.connect(nGain); nGain.connect(audioCtx.destination);
     noise.start(t);
  }
};

const CARRIAGE_STEP_PX = 5.2;
const MAX_CARRIAGE_PX = 400;

export default function Typewriter({ onLockDossier }) {
  const [dossierData, setDossierData] = useState({
    operationName: '', place: '', target: '', introduction: '', quotes: '',
    phase1Name: '', phase1Description: '', phase1Photo: null,
    intelEndpoints: '', intelGuardRotations: '', intelSurveillanceHours: '', intelVulnerabilities: '',
    executionDescription: '', executionPhoto: null,
    timeline: Array(6).fill({ time: '', description: '' }),
    extractionPlan: '', extractionPhoto: null,
    crewCount: '', crew: []
  });

  const [currentFieldId, setCurrentFieldId] = useState('operationName');
  const [lockState, setLockState] = useState('idle');
  const [carriageOffsetPx, setCarriageOffsetPx] = useState(0);

  const hiddenInputRef = useRef(null);
  const viewportRef = useRef(null);
  const paperRef = useRef(null);
  const fieldRefs = useRef({});
  const imperfections = useRef({});
  const lastCursorYRef = useRef(0);
  const lastKeyEnterRef = useRef(false);

  const isMultiline = (id) => ['introduction', 'phase1Description', 'executionDescription', 'extractionPlan'].includes(id);

  const getOrderedFieldList = () => {
    const base = [
      'operationName', 'place', 'target', 'introduction', 'quotes', 
      'phase1Name', 'phase1Description', 
      'intelEndpoints', 'intelGuardRotations', 'intelSurveillanceHours', 'intelVulnerabilities', 
      'executionDescription', 
      'timeline_0_time', 'timeline_0_description', 
      'timeline_1_time', 'timeline_1_description', 
      'timeline_2_time', 'timeline_2_description', 
      'timeline_3_time', 'timeline_3_description', 
      'timeline_4_time', 'timeline_4_description', 
      'timeline_5_time', 'timeline_5_description', 
      'extractionPlan', 'crewCount'
    ];
    let count = parseInt(dossierData.crewCount) || 0;
    const crew = [];
    for (let i = 0; i < count; i++) {
        crew.push(`crew_${i}_title`, `crew_${i}_job`, `crew_${i}_requirements`, `crew_${i}_threatLevel`, `crew_${i}_moneyShare`);
    }
    return [...base, ...crew];
  };

  const getFieldValue = (id) => {
    if (id.startsWith('timeline_')) {
      const parts = id.split('_');
      return dossierData.timeline[parts[1]]?.[parts[2]] || '';
    }
    if (id.startsWith('crew_')) {
      const parts = id.split('_');
      return dossierData.crew[parts[1]]?.[parts[2]] || '';
    }
    return String(dossierData[id] || '');
  };

  const updateData = (field, value) => {
    setDossierData(prev => {
      const next = { ...prev };
      if (field.startsWith('timeline_')) {
        const parts = field.split('_');
        const idx = parseInt(parts[1]);
        next.timeline = [...next.timeline];
        next.timeline[idx] = { ...next.timeline[idx], [parts[2]]: value };
      } else if (field.startsWith('crew_')) {
        const parts = field.split('_');
        const idx = parseInt(parts[1]);
        next.crew = [...next.crew];
        if (!next.crew[idx]) next.crew[idx] = { title: '', job: '', requirements: '', threatLevel: '', moneyShare: '' };
        next.crew[idx] = { ...next.crew[idx], [parts[2]]: value };
      } else if (field === 'crewCount') {
        next.crewCount = value;
        const num = Math.min(12, Math.max(0, parseInt(value) || 0));
        next.crew = [...next.crew];
        while (next.crew.length < num) {
          next.crew.push({ title: '', job: '', requirements: '', threatLevel: '', moneyShare: '' });
        }
      } else {
        next[field] = value;
      }
      return next;
    });
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
    paperRef.current.style.transition =
      'transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
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
        
        if (viewportRef.current) {
           viewportRef.current.scrollTop = start + dist * ease;
        }
        
        if (progress < 1) {
          scrollAnimId = requestAnimationFrame(step);
        }
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
         if (dy > 10 && dy < 100) { 
            if (lastKeyEnterRef.current) {
               smoothScrollTo(cursorY, 300);
            } else {
               smoothScrollTo(cursorY, 150);
            }
         } else if (Math.abs(dy) > 100) {
            smoothScrollTo(cursorY, 400); // Tab navigation
         } else {
            viewportRef.current.scrollTop = cursorY; // Direct stamp
         }
      } else {
         viewportRef.current.scrollTop = cursorY;
      }
      
      lastCursorYRef.current = cursorY;
      lastKeyEnterRef.current = false;
    });
  });

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
      // onChange natively handles value update, we just play sound
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

  const handleLock = async () => {
    if (!dossierData.operationName) return;
    setLockState('exiting');
    
    if (paperRef.current) {
      paperRef.current.style.transition = 'transform 1.5s ease-in';
      paperRef.current.style.transform = `translateX(${-carriageOffsetPx}px) translateY(-250vh)`;
    }
    
    await new Promise(r => setTimeout(r, 1500));
    setLockState('slamming');
    await new Promise(r => setTimeout(r, 300));
    setLockState('loading');
    
    const prompt = `You are a dramatic heist movie narrator writing classified mission briefings. Take the following heist dossier data and rewrite each text field with cinematic, tense, dramatic language — like it is a real classified government document. Keep all factual details the same. Return valid JSON with the exact same structure and field names.\n\n${JSON.stringify(dossierData)}`;
    
    let enhancedData = dossierData;
    try {
      const sdkCall = globalThis.Antigravity?.askGemini || globalThis.AntigravitySDK?.generateContent || globalThis.Gemini?.generate;
      if (sdkCall) {
        const res = await sdkCall(prompt);
        enhancedData = JSON.parse(res);
      } else {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch(e) { }
    
    if (onLockDossier) onLockDossier(enhancedData);
  };

  const renderText = (fieldId) => {
    const text = getFieldValue(fieldId);
    let charIndex = 0;
    const chunks = text.split(/([\s\n]+)/); 
    
    return chunks.map((chunk, cIdx) => {
      const isWhitespace = /[\s\n]+/.test(chunk);
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
      return (
        <span key={cIdx} style={{ whiteSpace: isWhitespace ? 'normal' : 'nowrap' }}>
          {elements}
        </span>
      );
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

  const PhotoArea = ({ fieldId }) => {
    const photo = dossierData[fieldId];
    const inputRef = useRef();
    return (
      <div className="td-photo" onClick={() => inputRef.current.click()}>
         <input type="file" ref={inputRef} style={{ display:'none' }} accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const r = new FileReader();
              r.onload = ev => updateData(fieldId, ev.target.result);
              r.readAsDataURL(file);
            }
         }}/>
         {photo ? <img src={photo} alt="" /> : <span>📎 ATTACH PHOTO</span>}
      </div>
    );
  };

  return (
    <div className="td-wrapper">
      
      <div 
        ref={viewportRef}
        className={`td-viewport ${lockState === 'slamming' ? 'td-shaking' : ''}`}
        onClick={() => hiddenInputRef.current?.focus()}
      >
        <img 
          src="/assets/platten.png" 
          alt="Typewriter Platten"
          className="td-platten-image"
          onError={(e) => e.target.style.display = 'none'} 
        />
        
        <div className="td-paper-container">
          <div className="td-paper" ref={paperRef}>
            <div className="td-feed-holes" />
            <div className="td-margin-left" />
            <div className="td-margin-right" />
            <div className="td-feed-holes-right" />

            <div className="td-header">⚠ CLASSIFIED — EYES ONLY ⚠</div>
            <div className="td-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          
          <div className="td-section">
            <div className="td-section-head">SECTION A — MISSION OVERVIEW</div>
            <br />
            <Field id="operationName" label="1. OPERATION NAME:" block />
            <Field id="place" label="2. PLACE:" block />
            <Field id="target" label="3. TARGET:" block />
            <Field id="introduction" label="4. INTRODUCTION:" block />
            <Field id="quotes" label="5. ANY QUOTES? (OPTIONAL):" block />
          </div>

          <div className="td-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          
          <div className="td-section">
            <div className="td-section-head">SECTION B — PHASE 1: RECONNAISSANCE</div>
            <br />
            <Field id="phase1Name" label="6. PHASE 1 NAME:" block />
            <Field id="phase1Description" label="7. PHASE 1 DESCRIPTION:" block />
            <PhotoArea fieldId="phase1Photo" />
            <br />
            <div className="td-field-label" style={{marginBottom:'10px'}}>8. INTEL GATHERED:</div>
            <div style={{ paddingLeft: '20px' }}>
              <Field id="intelEndpoints" label="a) END POINTS MAPPED:" block />
              <Field id="intelGuardRotations" label="b) GUARD ROTATIONS:" block />
              <Field id="intelSurveillanceHours" label="c) SURVEILLANCE HOURS:" block />
              <Field id="intelVulnerabilities" label="d) VULNERABILITIES FOUND:" block />
            </div>
          </div>

          <div className="td-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

          <div className="td-section">
            <div className="td-section-head">SECTION C — EXECUTION</div>
            <br />
            <Field id="executionDescription" label="9. EXECUTION DESCRIPTION:" block />
            <PhotoArea fieldId="executionPhoto" />
            <br />
            <div className="td-field-label" style={{marginBottom:'10px'}}>10. OPERATION TIMELINE (6 STEPS):</div>
            <div style={{ paddingLeft: '20px' }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <Field id={`timeline_${i}_time`} label={`STEP ${i+1} — TIME:`} />
                  <Field id={`timeline_${i}_description`} label="DESC:" />
                </div>
              ))}
            </div>
          </div>

          <div className="td-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

          <div className="td-section">
            <div className="td-section-head">SECTION D — EXTRACTION</div>
            <br />
            <div style={{ fontSize: '0.85em', opacity: 0.6, marginBottom: '10px' }}>(How do you escape from being caught?)</div>
            <Field id="extractionPlan" label="11. EXTRACTION PLAN:" block />
            <PhotoArea fieldId="extractionPhoto" />
          </div>

          <div className="td-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

          <div className="td-section">
            <div className="td-section-head">SECTION E — CREW MANIFEST</div>
            <br />
            <Field id="crewCount" label="12. NUMBER OF CREW MEMBERS:" block />
            <br />
            
            <AnimatePresence>
              {dossierData.crew.slice(0, parseInt(dossierData.crewCount) || 0).map((cm, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } }}
                  className="td-crew-card"
                >
                  <div className="td-crew-card-title">CREW MEMBER #{i + 1}</div>
                  <Field id={`crew_${i}_title`} label="TITLE:" block />
                  <Field id={`crew_${i}_job`} label="JOB:" block />
                  <Field id={`crew_${i}_requirements`} label="REQUIREMENTS:" block />
                  <Field id={`crew_${i}_threatLevel`} label="THREAT LEVEL:" block />
                  <div style={{display:'flex', alignItems:'center'}}>
                    <Field id={`crew_${i}_moneyShare`} label="MONEY SHARE:" /> % <br/>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        </div>

        {lockState === 'slamming' && <div className="td-slam-stamp">CLASSIFIED</div>}
        {lockState === 'loading' && <LoadingTerminal />}
      </div>

      <div className="td-button-container">
        <button 
          className="td-stamp-btn" 
          disabled={!dossierData.operationName || lockState !== 'idle'}
          onClick={handleLock}
        >
          🔒 LOCK THE DOSSIER
        </button>
      </div>

      <input
        ref={hiddenInputRef}
        value={getFieldValue(currentFieldId)}
        onChange={(e) => {
          const newVal = e.target.value;
          const oldVal = getFieldValue(currentFieldId);
          const delta = newVal.length - oldVal.length;
          if (delta !== 0) {
            setCarriageOffsetPx((prev) => {
              if (delta > 0) {
                return Math.min(prev + delta * CARRIAGE_STEP_PX, MAX_CARRIAGE_PX);
              }
              return Math.max(0, prev + delta * CARRIAGE_STEP_PX);
            });
          }
          updateData(currentFieldId, newVal);
        }}
        onKeyDown={handleKeyDown}
        style={{ position: 'fixed', top: '-9999px', opacity: 0, width: 0, height: 0 }}
        autoFocus
      />
    </div>
  );
}

const LoadingTerminal = () => {
  const [dots, setDots] = useState('.');
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 400);
    return () => clearInterval(id);
  }, []);
  return <div className="td-loading-term">PROCESSING INTEL{dots}</div>;
};
