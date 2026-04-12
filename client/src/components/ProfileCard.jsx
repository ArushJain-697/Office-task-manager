import React from 'react';

export default function ProfileCard({ profile, isTop, isFocused, zIndex, offsetIndex }) {
  return (
    <div className="profile-card-content">
      <div className="profile-header">
        <div className="profile-avatar"></div>
        <div className="profile-info">
          <h2>{profile.name}</h2>
          <p className="profile-role">{profile.role}</p>
        </div>
      </div>
      <div className="profile-body">
        <div className="stat-row">
          <span>Skill Level:</span>
          <span className="stat-val">{profile.skill}</span>
        </div>
        <div className="stat-row">
          <span>Success Rate:</span>
          <span className="stat-val">{profile.successRate}%</span>
        </div>
        <div className="stat-row">
          <span>Wanted By:</span>
          <span className="stat-val">{profile.wantedBy.join(', ')}</span>
        </div>
      </div>
      <div className="profile-footer">
        <p>{profile.bio}</p>
      </div>
    </div>
  );
}
