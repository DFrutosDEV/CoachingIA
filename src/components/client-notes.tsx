"use client";

import React from 'react';

interface Note {
  id: string | number;
  content: string;
  timestamp: string | Date; // O un objeto Date
}

interface ClientNotesProps {
  notes: Note[];
}

const ClientNotes: React.FC<ClientNotesProps> = ({ notes }) => {
  const formatDate = (date: string | Date) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleString(); // Formato básico de fecha
    }
    return date.toLocaleString();
  };

  return (
    <div className="client-notes-container">
      <h2>Notas del Coach</h2>
      {notes.length === 0 ? (
        <p>No hay notas del coach por ahora.</p>
      ) : (
        <ul className="notes-list">
          {notes.map((note) => (
            <li key={note.id} className="note-card">
              <p className="note-content">{note.content}</p>
              <small className="note-timestamp">{formatDate(note.timestamp)}</small>
            </li>
          ))}
        </ul>
      )}
      {/* Estilos básicos */}
      <style jsx>{`
        .client-notes-container {
          font-family: sans-serif;
          padding: 1rem;
          border: 1px solid #eee; /* Borde más suave */
          border-radius: 8px;
          margin-top: 1.5rem;
          background-color: #f9f9f9; /* Fondo ligero */
        }
        h2 {
            margin-bottom: 1rem;
            color: #333;
        }
        .notes-list {
          list-style: none;
          padding: 0;
          margin: 0; /* Asegura que la lista no tenga margen extra */
          display: grid; /* Opcional: usar grid para layout */
          gap: 1rem; /* Espacio entre tarjetas */
        }
        .note-card {
          background-color: #fff; /* Fondo blanco para la tarjeta */
          border: 1px solid #ddd; /* Borde de la tarjeta */
          border-radius: 6px; /* Esquinas redondeadas */
          padding: 1rem; /* Espaciado interno */
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* Sombra sutil */
          display: flex; /* Opcional: Para mejor control del contenido interno */
          flex-direction: column; /* Alinear contenido verticalmente */
          justify-content: space-between; /* Empujar timestamp al fondo si se usa flex */
        }
        .note-content {
          margin: 0 0 0.5rem 0; /* Espacio debajo del contenido */
          color: #333; /* Color de texto principal */
          line-height: 1.5; /* Mejor legibilidad */
        }
        .note-timestamp {
          color: #666; /* Color del timestamp */
          font-size: 0.85em; /* Tamaño más pequeño */
          align-self: flex-end; /* Alinear a la derecha si se usa flex */
        }
      `}</style>
    </div>
  );
};

export default ClientNotes;
