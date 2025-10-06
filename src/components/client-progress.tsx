'use client';

import React from 'react';

interface Objective {
  id: string | number;
  name: string;
  progress: number; // Percentage value from 0 to 100
}

interface ClientProgressProps {
  objectives: Objective[];
}

const ClientProgress: React.FC<ClientProgressProps> = ({ objectives }) => {
  return (
    <div className="client-progress-container">
      <h2
        style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}
      >
        Progreso de Objetivos
      </h2>
      {objectives.length === 0 ? (
        <p>No hay objetivos definidos.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {objectives.map(objective => (
            <li key={objective.id} style={{ marginBottom: '1rem' }}>
              <span>{objective.name}</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    marginRight: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      width: `${objective.progress}%`,
                      backgroundColor: '#4caf50', // Or any color you prefer
                      height: '10px',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease-in-out',
                    }}
                  />
                </div>
                <span>{objective.progress}%</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Basic styling for demonstration */}
      <style jsx>{`
        .client-progress-container {
          font-family: sans-serif;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default ClientProgress;
