import React, { useEffect, useState } from 'react';
import { cattleAPI } from '../api/client';
import { 
  TrendingUp, 
  Activity, 
  Scale, 
  ShieldAlert, 
  Calendar, 
  Award,
  AlertTriangle,
  Plus,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

export default function Dashboard({ setActiveTab, onAddAnimal, setSelectedCattleId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await cattleAPI.getDashboardSummary();
      setSummary(data);
      
      // Cargar ganado en periodo de retiro para la sección de alertas
      const cattle = await cattleAPI.getAllCattle();
      const meds = JSON.parse(localStorage.getItem("ganado_medications")) || [];
      const today = new Date();
      
      const withdrawals = [];
      meds.forEach(med => {
        const adminDate = new Date(med.date);
        const endDate = new Date(adminDate);
        endDate.setDate(adminDate.getDate() + med.withdrawalDays);
        
        if (endDate > today) {
          const animal = cattle.find(c => c.id === med.cattleId);
          if (animal && (animal.status === 'Activo' || animal.status === 'Enfermo')) {
            const diffTime = Math.abs(endDate - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            withdrawals.push({
              medName: med.medicationName,
              animalId: animal.id,
              animalName: animal.name,
              reason: med.reason,
              daysLeft: diffDays,
              endDate: endDate.toISOString().split('T')[0]
            });
          }
        }
      });
      setRecentWithdrawals(withdrawals);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading || !summary) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid hsl(var(--primary-light))',
          borderTopColor: 'hsl(var(--primary))',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'hsl(var(--text-muted))', fontWeight: 500 }}>Cargando panel de control...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Preparar datos para el gráfico de razas
  const breeds = Object.keys(summary.breedDistribution);
  const breedCounts = Object.values(summary.breedDistribution);
  const totalBreedsCount = breedCounts.reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Encabezado */}
      <div className="flex-between mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Resumen del Rancho</h1>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Control de producción, salud y registros en tiempo real</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={loadDashboardData}
          >
            Actualizar Datos
          </button>
          <button 
            className="btn btn-primary"
            onClick={onAddAnimal}
          >
            <Plus size={16} /> Registrar Animal
          </button>
        </div>
      </div>

      {/* Grid de Métricas Clave */}
      <div className="dashboard-grid">
        {/* Total Ganado */}
        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'hsl(var(--primary-light))', color: 'hsl(var(--primary))' }}>
            <Activity size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{summary.totalCattle}</span>
            <span className="metric-label">Cabezas Registradas</span>
          </div>
        </div>

        {/* Peso Promedio */}
        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'hsl(35 50% 95%)', color: 'hsl(var(--secondary))' }}>
            <Scale size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{summary.avgWeight} kg</span>
            <span className="metric-label">Peso Promedio</span>
          </div>
        </div>

        {/* Estado de Salud */}
        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper" style={{ 
            backgroundColor: summary.sick > 0 ? 'hsl(38 92% 95%)' : 'hsl(142 76% 95%)', 
            color: summary.sick > 0 ? 'hsl(var(--warning))' : 'hsl(var(--success))' 
          }}>
            <Activity size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{summary.active} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'hsl(var(--text-muted))' }}>activos</span></span>
            <span className="metric-label">{summary.sick} bajo observación</span>
          </div>
        </div>

        {/* Alertas de Tiempo de Retiro (Inocuidad alimentaria) */}
        <div className="glass-card metric-card" style={{
          border: summary.animalsInWithdrawal > 0 ? '1px solid hsl(var(--danger) / 0.3)' : '1px solid hsl(var(--border-color) / 0.5)'
        }}>
          <div className="metric-icon-wrapper" style={{ 
            backgroundColor: summary.animalsInWithdrawal > 0 ? 'hsl(0 84% 95%)' : 'hsl(142 76% 95%)', 
            color: summary.animalsInWithdrawal > 0 ? 'hsl(var(--danger))' : 'hsl(var(--success))' 
          }}>
            <ShieldAlert size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-value" style={{ color: summary.animalsInWithdrawal > 0 ? 'hsl(var(--danger))' : 'inherit' }}>
              {summary.animalsInWithdrawal}
            </span>
            <span className="metric-label">En periodo de retiro</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {/* Columna Izquierda: Alertas y Eventos Recientes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Alertas Críticas de Tiempo de Retiro */}
          {recentWithdrawals.length > 0 && (
            <div className="glass-card" style={{ 
              borderColor: 'hsl(var(--danger) / 0.3)',
              background: 'linear-gradient(to bottom right, hsl(0 100% 99%), hsl(var(--bg-glass)))'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'hsl(var(--danger))' }}>
                <AlertTriangle size={20} />
                <h3 style={{ fontSize: '1.15rem', color: 'hsl(var(--danger))' }}>Alertas Críticas de Periodo de Retiro</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginBottom: '1rem' }}>
                Los siguientes animales han recibido medicamentos y <strong>no deben ser destinados a consumo humano (carne o leche)</strong> durante el periodo indicado.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentWithdrawals.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'white',
                    borderLeft: '4px solid hsl(var(--danger))',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'hsl(var(--text-main))' }}>
                        {item.animalName} ({item.animalId})
                      </span>
                      <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                        Tratamiento: {item.medName} | Causa: {item.reason}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-danger" style={{ fontWeight: 700 }}>
                        Faltan {item.daysLeft} días
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.15rem' }}>
                        Hasta {item.endDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tarjeta de Próximos Eventos */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Calendar size={20} style={{ color: 'hsl(var(--primary))' }} />
              <h3>Próximas Tareas Preventivas</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid hsl(var(--border-color))' }}>
                <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'hsl(var(--primary-light))', color: 'hsl(var(--primary))' }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Vacunación de Refuerzo General</h4>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Refuerzo semestral programado para Fiebre Aftosa en animales menores de 2 años.</p>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--primary))', fontWeight: 600, display: 'inline-block', marginTop: '0.25rem' }}>
                    {summary.upcomingVaccines} animales programados
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'hsl(35 50% 95%)', color: 'hsl(var(--secondary))' }}>
                  <Scale size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Pesaje General de Otoño</h4>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Control de peso global para calcular la ganancia diaria de peso (GMD) del lote.</p>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'inline-block', marginTop: '0.25rem' }}>
                    Recomendado cada 30 días
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Gráfico SVG de Razas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Award size={20} style={{ color: 'hsl(var(--primary))' }} />
              <h3>Distribución de Razas</h3>
            </div>

            {breeds.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '2rem' }}>No hay datos suficientes</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, justifyContent: 'center' }}>
                {breeds.map((breed, index) => {
                  const count = summary.breedDistribution[breed];
                  const percentage = Math.round((count / totalBreedsCount) * 100);
                  // Colores rotativos basados en verde y café orgánicos
                  const colors = [
                    'hsl(var(--primary))',
                    'hsl(var(--secondary))',
                    'hsl(142 55% 45%)',
                    'hsl(35 30% 60%)',
                    'hsl(200 70% 45%)'
                  ];
                  const currentColor = colors[index % colors.length];

                  return (
                    <div key={breed} style={{ fontSize: '0.9rem' }}>
                      <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{breed}</span>
                        <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 500 }}>
                          {count} {count === 1 ? 'cabeza' : 'cabezas'} ({percentage}%)
                        </span>
                      </div>
                      {/* Barra de Progreso SVG / HTML */}
                      <div style={{
                        width: '100%',
                        height: '10px',
                        backgroundColor: 'hsl(var(--bg-main))',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: currentColor,
                          borderRadius: '9999px',
                          transition: 'width 1s ease-out'
                        }} />
                      </div>
                    </div>
                  );
                })}
                
                {/* Gráfico circular simple en SVG */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                  <svg width="120" height="120" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="hsl(var(--bg-main))" strokeWidth="4" />
                    {(() => {
                      let accumulatedPercentage = 0;
                      return breeds.map((breed, index) => {
                        const count = summary.breedDistribution[breed];
                        const pct = (count / totalBreedsCount) * 100;
                        const colors = [
                          'hsl(var(--primary))',
                          'hsl(var(--secondary))',
                          'hsl(142 55% 45%)',
                          'hsl(35 30% 60%)',
                          'hsl(200 70% 45%)'
                        ];
                        const strokeColor = colors[index % colors.length];
                        const dashArray = `${pct} ${100 - pct}`;
                        const dashOffset = 100 - accumulatedPercentage + 25; // +25 para empezar arriba (12 en reloj)
                        accumulatedPercentage += pct;

                        return (
                          <circle
                            key={breed}
                            cx="21"
                            cy="21"
                            r="15.915"
                            fill="transparent"
                            stroke={strokeColor}
                            strokeWidth="4"
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                          />
                        );
                      });
                    })()}
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enlaces y Acciones Rápidas */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Accesos Rápidos</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setActiveTab('cattle-list')}
            style={{ justifyContent: 'space-between', padding: '1rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <ClipboardList size={18} style={{ color: 'hsl(var(--primary))' }} />
              Ver Inventario Completo
            </span>
            <ArrowRight size={16} />
          </button>

          <button 
            className="btn btn-secondary"
            onClick={async () => {
              // Coger el primer animal y abrir su perfil
              const list = await cattleAPI.getAllCattle();
              if (list && list.length > 0) {
                setSelectedCattleId(list[0].id);
                setActiveTab('cattle-profile');
              } else {
                setActiveTab('cattle-list');
              }
            }}
            style={{ justifyContent: 'space-between', padding: '1rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <TrendingUp size={18} style={{ color: 'hsl(var(--secondary))' }} />
              Monitorear Pesos
            </span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
