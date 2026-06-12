import React, { useEffect, useState } from 'react';
import { cattleAPI } from '../api/client';
import { 
  ArrowLeft, 
  Scale, 
  ShieldCheck, 
  Activity, 
  Calendar, 
  Edit, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';
import { 
  AddWeightModal, 
  AddVaccineModal, 
  AddMedicationModal, 
  EditCattleModal 
} from './Forms';

export default function CattleProfile({ cattleId, onBack, onRefreshList }) {
  const [animal, setAnimal] = useState(null);
  const [weights, setWeights] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pestaña activa: 'general', 'weights', 'vaccines', 'meds'
  const [activeSubTab, setActiveSubTab] = useState('general');

  // Estados de Modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const data = await cattleAPI.getCattleById(cattleId);
      if (!data) {
        setAnimal(null);
        return;
      }
      setAnimal(data);
      
      const wList = await cattleAPI.getWeightsByCattleId(cattleId);
      setWeights(wList);

      const vList = await cattleAPI.getVaccinesByCattleId(cattleId);
      setVaccines(vList);

      const mList = await cattleAPI.getMedicationsByCattleId(cattleId);
      setMedications(mList);
    } catch (error) {
      console.error("Error al cargar la ficha del animal:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cattleId) {
      loadProfileData();
    }
  }, [cattleId]);

  const handleDeleteWeight = async (id) => {
    if (window.confirm("¿Deseas eliminar este registro de peso?")) {
      await cattleAPI.deleteWeightRecord(id);
      loadProfileData();
      if (onRefreshList) onRefreshList();
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid hsl(var(--primary-light))',
          borderTopColor: 'hsl(var(--primary))',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem auto'
        }} />
        <span style={{ color: 'hsl(var(--text-muted))' }}>Cargando ficha del animal...</span>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ fontWeight: 600, color: 'hsl(var(--danger))' }}>El animal no existe o fue eliminado.</p>
        <button className="btn btn-secondary mt-4" onClick={onBack}>
          <ArrowLeft size={16} /> Volver al Inventario
        </button>
      </div>
    );
  }

  // Calcular edad
  const calculateAge = (dobString) => {
    if (!dobString) return 'S/D';
    const dob = new Date(dobString);
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
      years--;
      months += 12;
    }
    if (years === 0) return `${months} m`;
    return `${years} a y ${months} m`;
  };

  // Cálculo de alerta de periodo de retiro activo
  const getWithdrawalStatus = (med) => {
    const today = new Date();
    const adminDate = new Date(med.date);
    const endDate = new Date(adminDate);
    endDate.setDate(adminDate.getDate() + med.withdrawalDays);
    
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      isActive: endDate > today,
      daysLeft: diffDays > 0 ? diffDays : 0,
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // --- RENDERIZADO DEL GRÁFICO SVG DE PESO ---
  const renderWeightChart = () => {
    if (weights.length < 2) {
      return (
        <div style={{
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'hsl(var(--bg-main))',
          borderRadius: 'var(--radius-md)',
          color: 'hsl(var(--text-muted))',
          fontSize: '0.85rem',
          border: '1px dashed hsl(var(--border-color))'
        }}>
          Registra al menos 2 pesajes para visualizar la curva de crecimiento.
        </div>
      );
    }

    const width = 500;
    const height = 180;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 25;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Calcular límites
    const wValues = weights.map(d => d.weight);
    const minW = Math.min(...wValues) * 0.95; // 5% holgura inferior
    const maxW = Math.max(...wValues) * 1.05; // 5% holgura superior
    const rangeW = maxW - minW || 1;

    // Generar coordenadas de puntos
    const points = weights.map((record, index) => {
      const x = paddingLeft + (index / (weights.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((record.weight - minW) / rangeW) * chartHeight;
      return { x, y, weight: record.weight, date: record.date };
    });

    // Construir string para el path del gráfico de línea
    let dPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      dPath += ` L ${points[i].x} ${points[i].y}`;
    }

    // Construir string para el sombreado del área debajo de la línea
    const dArea = `${dPath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '400px', height: 'auto', background: 'white', overflow: 'visible' }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.00"/>
            </linearGradient>
          </defs>

          {/* Grilla horizontal */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + ratio * chartHeight;
            const labelValue = Math.round(maxW - ratio * rangeW);
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="hsl(var(--border-color))" strokeWidth="1" strokeDasharray="4 4" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="10" fill="hsl(var(--text-muted))" fontWeight="500">
                  {labelValue}
                </text>
              </g>
            );
          })}

          {/* Área sombreada */}
          <path d={dArea} fill="url(#areaGradient)" />

          {/* Línea del gráfico */}
          <path d={dPath} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Puntos y etiquetas de peso */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle cx={pt.x} cy={pt.y} r="5" fill="white" stroke="hsl(var(--primary))" strokeWidth="3" />
              {/* Valor encima del punto */}
              <text x={pt.x} y={pt.y - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="hsl(var(--text-main))">
                {pt.weight}k
              </text>
              {/* Fecha abajo del eje */}
              <text x={pt.x} y={height - 8} textAnchor="middle" fontSize="9" fontWeight="500" fill="hsl(var(--text-muted))">
                {pt.date.split('-').slice(1).join('/') /* MM/DD */}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Activo': return 'badge-success';
      case 'Enfermo': return 'badge-warning';
      case 'Vendido': return 'badge-secondary';
      case 'Muerto': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div>
      {/* Botón de retroceso y Editar */}
      <div className="flex-between mb-4">
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Volver al Inventario
        </button>
        <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>
          <Edit size={16} /> Editar Ficha
        </button>
      </div>

      {/* Cabecera de Ficha de Animal */}
      <div className="glass-card mb-4" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        background: 'linear-gradient(135deg, hsl(var(--primary-light) / 0.4) 0%, hsl(var(--bg-glass)) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '65px',
            height: '65px',
            borderRadius: 'var(--radius-md)',
            background: 'hsl(var(--primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.5rem',
            fontFamily: 'Outfit',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {animal.gender === 'Macho' ? '♂' : '♀'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{animal.name || 'Sin Nombre'}</h2>
              <span className={`badge ${getStatusBadgeClass(animal.status)}`}>{animal.status}</span>
            </div>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.2rem' }}>
              Arete: <strong style={{ color: 'hsl(var(--primary))' }}>{animal.id}</strong> | Raza: <strong>{animal.breed}</strong> | Edad: <strong>{calculateAge(animal.dob)}</strong>
            </p>
          </div>
        </div>

        {/* Peso más reciente flotante en cabecera */}
        {weights.length > 0 && (
          <div style={{
            background: 'white',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid hsl(var(--border-color))',
            textAlign: 'right'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase' }}>Peso Actual</span>
            <h3 style={{ fontSize: '1.5rem', color: 'hsl(var(--primary))', fontWeight: 700, lineHeight: 1 }}>
              {weights[weights.length - 1].weight} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>kg</span>
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Control del {weights[weights.length - 1].date}</span>
          </div>
        )}
      </div>

      {/* Tabs de Detalle */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid hsl(var(--border-color))',
        marginBottom: '1.5rem',
        gap: '0.5rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'general', label: 'Ficha Técnica', icon: Info },
          { id: 'weights', label: 'Historial Peso', icon: Scale },
          { id: 'vaccines', label: 'Vacunas', icon: Calendar },
          { id: 'meds', label: 'Tratamientos Médicos', icon: Activity },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '3px solid hsl(var(--primary))' : '3px solid transparent',
                color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                fontSize: '0.925rem',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido de Tabs */}
      <div className="glass-card" style={{ minHeight: '300px' }}>
        
        {/* TAB 1: FICHA GENERAL */}
        {activeSubTab === 'general' && (
          <div>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.15rem' }}>Información Básica del Animal</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Código de Identificación (Arete)</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.2rem' }}>{animal.id}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Nombre / Apodo</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.2rem' }}>{animal.name || 'Sin Nombre'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Raza</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.2rem' }}>{animal.breed}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Sexo</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.2rem' }}>{animal.gender}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Fecha de Nacimiento</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.2rem' }}>{animal.dob || 'No registrada'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Edad Actual</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.2rem' }}>{calculateAge(animal.dob)}</p>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid hsl(var(--border-color))', paddingTop: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Observaciones / Notas</span>
              <p style={{ fontSize: '0.95rem', marginTop: '0.4rem', lineHeight: 1.5, background: 'hsl(var(--bg-main))', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                {animal.notes || 'No se han registrado observaciones de este animal.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORIAL DE PESOS */}
        {activeSubTab === 'weights' && (
          <div>
            <div className="flex-between mb-4">
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Control y Curva de Crecimiento</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Gráfico y registros históricos de peso del animal en kilogramos</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowWeightModal(true)}>
                <Plus size={16} /> Registrar Peso
              </button>
            </div>

            {/* Fila del Gráfico */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: weights.length >= 2 ? '1.5fr 1fr' : '1fr',
              gap: '1.5rem',
              alignItems: 'start',
              marginBottom: '2rem'
            }}>
              <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-color))' }}>
                {renderWeightChart()}
              </div>

              {weights.length >= 2 && (
                <div style={{
                  background: 'hsl(var(--primary-light) / 0.3)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed hsl(var(--primary) / 0.2)'
                }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'hsl(var(--primary))', marginBottom: '0.75rem' }}>Análisis de Crecimiento</h4>
                  {(() => {
                    const first = weights[0];
                    const last = weights[weights.length - 1];
                    const totalGain = last.weight - first.weight;
                    
                    const days = Math.round((new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24)) || 1;
                    const dailyGain = (totalGain / days) * 1000; // En gramos

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                        <div>
                          <strong>Ganancia Total:</strong> +{totalGain} kg en {days} días.
                        </div>
                        <div>
                          <strong>Ganancia Diaria Promedio (GMD):</strong> {Math.round(dailyGain)} g/día.
                        </div>
                        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.775rem', marginTop: '0.25rem' }}>
                          El objetivo de desarrollo óptimo para razas de carne ronda los 800g a 1.2kg diarios según suplementación alimentaria.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Tabla de Registros */}
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Listado de Pesajes</h4>
            {weights.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>No hay registros de peso.</p>
            ) : (
              <div className="table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Fecha de Control</th>
                      <th>Peso Registrado</th>
                      <th>Incremento</th>
                      <th>Notas / Evento</th>
                      <th style={{ textAlign: 'right' }}>Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weights.slice().reverse().map((w, idx, arr) => {
                      // Calcular diferencia respecto al anterior en el array cronológico (original weights)
                      const origIndex = weights.findIndex(x => x.id === w.id);
                      let diffText = '—';
                      let diffColor = 'inherit';

                      if (origIndex > 0) {
                        const prevW = weights[origIndex - 1].weight;
                        const diff = w.weight - prevW;
                        if (diff > 0) {
                          diffText = `+${diff} kg`;
                          diffColor = 'hsl(var(--success))';
                        } else if (diff < 0) {
                          diffText = `${diff} kg`;
                          diffColor = 'hsl(var(--danger))';
                        } else {
                          diffText = '0 kg';
                        }
                      }

                      return (
                        <tr key={w.id}>
                          <td style={{ fontWeight: 600 }}>{w.date}</td>
                          <td style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>{w.weight} kg</td>
                          <td style={{ color: diffColor, fontWeight: 600 }}>{diffText}</td>
                          <td style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>{w.notes || 'Control de rutina'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteWeight(w.id)}
                              className="btn btn-danger"
                              style={{ padding: '0.3rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HISTORIAL DE VACUNACIÓN */}
        {activeSubTab === 'vaccines' && (
          <div>
            <div className="flex-between mb-4">
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Registro de Vacunación Preventiva</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Control de inmunidad, dosis y refuerzos aplicados</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowVaccineModal(true)}>
                <Plus size={16} /> Registrar Vacuna
              </button>
            </div>

            {vaccines.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', textAlign: 'center', padding: '3rem' }}>
                No se han registrado vacunas aplicadas a este animal.
              </p>
            ) : (
              <div className="table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Fecha de Aplicación</th>
                      <th>Vacuna / Biológico</th>
                      <th>Dosis</th>
                      <th>Lote</th>
                      <th>Próximo Refuerzo</th>
                      <th>Veterinario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaccines.map(v => (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 600 }}>{v.date}</td>
                        <td style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>{v.vaccineName}</td>
                        <td>{v.dosage}</td>
                        <td><code style={{ background: 'hsl(var(--bg-main))', padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-sm)' }}>{v.batch || 'S/L'}</code></td>
                        <td>
                          {v.nextDoseDate ? (
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.25rem',
                              fontWeight: 600,
                              color: new Date(v.nextDoseDate) < new Date() ? 'hsl(var(--danger))' : 'hsl(var(--success))'
                            }}>
                              <Calendar size={14} />
                              {v.nextDoseDate} {new Date(v.nextDoseDate) < new Date() && '(Vencido)'}
                            </span>
                          ) : 'No requiere'}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>{v.vet || 'No asignado'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: HISTORIAL DE MEDICAMENTOS */}
        {activeSubTab === 'meds' && (
          <div>
            <div className="flex-between mb-4">
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Tratamientos Veterinarios y Clínicos</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Monitoreo de fármacos y alertas de inocuidad alimentaria</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowMedicationModal(true)}>
                <Plus size={16} /> Registrar Tratamiento
              </button>
            </div>

            {medications.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', textAlign: 'center', padding: '3rem' }}>
                No se han registrado tratamientos médicos en este animal.
              </p>
            ) : (
              <div className="table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Fecha Adm.</th>
                      <th>Medicamento</th>
                      <th>Dosis y Duración</th>
                      <th>Diagnóstico/Causa</th>
                      <th>Tiempo Retiro</th>
                      <th>Estado de Retiro</th>
                      <th>Veterinario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map(m => {
                      const stat = getWithdrawalStatus(m);
                      return (
                        <tr key={m.id} style={{
                          backgroundColor: stat.isActive ? 'hsl(0 100% 99%)' : 'inherit'
                        }}>
                          <td style={{ fontWeight: 600 }}>{m.date}</td>
                          <td style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>{m.medicationName}</td>
                          <td>
                            {m.dosage} <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>por {m.durationDays} {m.durationDays === 1 ? 'día' : 'días'}</div>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{m.reason}</td>
                          <td style={{ fontWeight: 600 }}>{m.withdrawalDays} días</td>
                          <td>
                            {stat.isActive ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <span className="badge badge-danger" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                                  <Clock size={12} /> RETIRO ACTIVO
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--danger))', fontWeight: 600 }}>
                                  Faltan {stat.daysLeft} días (Hasta {stat.endDate})
                                </span>
                              </div>
                            ) : (
                              <span className="badge badge-success" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                                <ShieldCheck size={12} /> LIBRE PARA CONSUMO
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>{m.vet || 'No asignado'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- RENDERIZACIÓN DE MODALES LOCALES --- */}
      {showEditModal && (
        <EditCattleModal 
          cattle={animal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadProfileData();
            if (onRefreshList) onRefreshList();
          }}
        />
      )}

      {showWeightModal && (
        <AddWeightModal 
          cattleId={animal.id}
          onClose={() => setShowWeightModal(false)}
          onSuccess={() => {
            setShowWeightModal(false);
            loadProfileData();
            if (onRefreshList) onRefreshList();
          }}
        />
      )}

      {showVaccineModal && (
        <AddVaccineModal 
          cattleId={animal.id}
          onClose={() => setShowVaccineModal(false)}
          onSuccess={() => {
            setShowVaccineModal(false);
            loadProfileData();
            if (onRefreshList) onRefreshList();
          }}
        />
      )}

      {showMedicationModal && (
        <AddMedicationModal 
          cattleId={animal.id}
          onClose={() => setShowMedicationModal(false)}
          onSuccess={() => {
            setShowMedicationModal(false);
            loadProfileData();
            if (onRefreshList) onRefreshList();
          }}
        />
      )}
    </div>
  );
}
