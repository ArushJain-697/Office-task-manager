import React, { useState, useEffect, useRef } from 'react';
import ProfileCard from './ProfileCard.jsx'
import '../styles/ApprovalInterface.css';

export default function ApprovalInterface({ initialProfiles = [], onDecision, onClose }) {
  const [profiles, setProfiles] = useState(() =>
    initialProfiles.map(p => ({
      ...p,
      // Random rotation between -4 and 4 for the stack effect
      stackRotation: (Math.random() * 8) - 4
    }))
  );
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animation states
  const [currentDecision, setCurrentDecision] = useState(null); // 'approve' | 'reject'
  const [stampAngle, setStampAngle] = useState(0);
  const [stampHit, setStampHit] = useState(false);
  const [exiting, setExiting] = useState(null); // 'right' | 'left'
  
  const [decisions, setDecisions] = useState({ approve: 0, reject: 0 });

  useEffect(() => {
    setProfiles(
      initialProfiles.map((p) => ({
        ...p,
        stackRotation: (Math.random() * 8) - 4,
      })),
    );
    setCurrentIndex(0);
    setIsReviewing(false);
    setButtonsVisible(false);
    setIsAnimating(false);
    setCurrentDecision(null);
    setStampHit(false);
    setExiting(null);
    setDecisions({ approve: 0, reject: 0 });
  }, [initialProfiles]);

  const handleCardClick = (index) => {
    if (index !== currentIndex || isReviewing || isAnimating) return;
    
    // Zoom focus
    setIsReviewing(true);
    setIsAnimating(true); // Disable interactions while zooming
    
    // Show buttons 300ms after zoom starts
    setTimeout(() => {
      setButtonsVisible(true);
    }, 300);
    
    // Re-enable interactions after zoom finishes (500ms)
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const handleDecision = async (decision) => {
    if (isAnimating) return;
    const currentProfile = profiles[currentIndex];
    const nextStatus = decision === "approve" ? "accepted" : "rejected";
    if (onDecision && currentProfile?.application_id) {
      try {
        await onDecision(currentProfile.application_id, nextStatus);
      } catch (err) {
        alert(err?.message || "Failed to update applicant status.");
        return;
      }
    }

    setIsAnimating(true);
    setButtonsVisible(false); // Hide buttons instantly or disabled
    
    setCurrentDecision(decision);
    
    // Set random stamp angle
    if (decision === 'approve') {
      setStampAngle((Math.random() * -4) - 8); // -12 to -8
    } else {
      setStampAngle((Math.random() * 4) + 8); // +8 to +12
    }

    // Step 2: Stamp descent (350ms) -> impact
    setTimeout(() => {
      setStampHit(true);
      
      // Step 3: Hold and Display (1000ms pause)
      setTimeout(() => {
        // Step 4: Card Exit (700ms)
        setExiting(decision === 'approve' ? 'right' : 'left');
        
        setTimeout(() => {
          // After exit finishes
          setDecisions(prev => ({
            ...prev,
            [decision]: prev[decision] + 1
          }));
          
          setCurrentIndex(prev => prev + 1);
          
          // Step 5: Next Card Auto-focus
          // Reset states for the new top card which will immediately inherit isReviewing
          setCurrentDecision(null);
          setStampHit(false);
          setExiting(null);
          
          if (currentIndex + 1 < profiles.length) {
            // New card comes into focus over 500ms
            setTimeout(() => {
              setButtonsVisible(true);
            }, 300);
            setTimeout(() => {
              setIsAnimating(false);
            }, 500);
          } else {
            // Finished
            setIsReviewing(false);
            setIsAnimating(false);
          }
          
        }, 700); // 700ms exit
      }, 1000); // 1000ms hold
    }, 350); // 350ms stamp descent
  };

  if (currentIndex >= profiles.length) {
    return (
      <div className="approval-interface-container">
        <div className="completion-screen">
          <h2>Review Complete</h2>
          <p>{decisions.approve} Approved, {decisions.reject} Rejected</p>
          {onClose ? (
            <button className="btn-reset" onClick={onClose}>
              Close
            </button>
          ) : (
            <button className="btn-reset" onClick={() => window.location.reload()}>
              Review Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const stackLength = profiles.length;

  return (
    <div className="approval-interface-container" style={{'--focus-offset-y': isReviewing && !exiting ? '20px' : '0px'}}>
      
      <div className="deck-container">
        {profiles.map((profile, index) => {
          // Only render cards equal to or below currentIndex
          if (index < currentIndex) return null;
          
          const isTop = index === currentIndex;
          const offsetIndex = index - currentIndex; // 0 for top, 1 for second...
          const zIndex = stackLength - index;
          
          // Determine state
          const isThisFocused = isTop && isReviewing;
          const isBlurred = !isTop && isReviewing;
          
          // Base transform stack
          let transformStr = `translateZ(0) translateY(${offsetIndex * 15}px) rotate(${profile.stackRotation}deg)`;
          
          if (isThisFocused) {
            // override transform if focused
            transformStr = `translateZ(0) translateY(20px) scale(1.4) rotate(0deg)`;
          }

          let classes = `card-wrapper`;
          if (isBlurred) classes += ' blurred';
          if (isTop && stampHit) classes += ' shake-animation';
          if (isTop && exiting === 'right') classes += ' card-exit-right';
          if (isTop && exiting === 'left') classes += ' card-exit-left';
          
          // The CSS handles transitions. 
          
          return (
            <div 
              key={profile.id}
              className={classes}
              style={{
                zIndex,
                transform: transformStr,
                opacity: offsetIndex > 3 && !isReviewing ? 0 : 1 - (offsetIndex * 0.25)
              }}
              onClick={() => handleCardClick(index)}
            >
              <ProfileCard 
                profile={profile} 
                isTop={isTop} 
                isFocused={isThisFocused}
                zIndex={zIndex}
                offsetIndex={offsetIndex}
              />
              <div className="card-overlay"></div>
              
              {/* Stamp injection */}
              {isTop && currentDecision && (
                <img 
                  src={`/assets/${currentDecision === 'approve' ? 'approved' : 'rejected'}.png`} 
                  alt={currentDecision}
                  className="stamp-image"
                  style={{ '--stamp-angle': `${stampAngle}deg` }}
                />
              )}
            </div>
          );
        })}
      </div>

      {isReviewing && currentIndex < profiles.length && (
        <div className="action-buttons">
          <button 
            className={`action-btn btn-reject ${buttonsVisible && !currentDecision ? 'slide-in-left' : ''} ${currentDecision ? 'slide-out-left' : ''}`}
            onClick={() => handleDecision('reject')}
            disabled={isAnimating}
            style={{ opacity: buttonsVisible ? 1 : 0 }}
          >
            ✗ REJECT
          </button>
          
          <button 
            className={`action-btn btn-approve ${buttonsVisible && !currentDecision ? 'slide-in-right' : ''} ${currentDecision ? 'slide-out-right' : ''}`}
            onClick={() => handleDecision('approve')}
            disabled={isAnimating}
            style={{ opacity: buttonsVisible ? 1 : 0 }}
          >
            ✓ APPROVE
          </button>
        </div>
      )}
    </div>
  );
}
