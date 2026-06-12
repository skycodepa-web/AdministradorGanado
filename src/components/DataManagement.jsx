import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Database, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export default function DataManagement({ onRefreshList }) {
  const [stats, setStats] = useState({
    cattle: 0,
    weights: 0,
    vaccines: 0,
    medications: 0
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const loadStats = () => {
    const c = JSON.parse(localStorage.getItem("ganado_cattle")) || [];
    const w = JSON.parse(localStorage.getItem("ganado_weights")) || [];
    const v = JSON.parse(localStorage.getItem("ganado_vaccines")) || [];
    const m = JSON.parse(localStorage.getItem("ganado_medications")) || [];
    
    setStats({
      cattle: c.length,
      weights: w.length,
      vaccines: v.length,
      medications: m.length
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  // --- EXPORTAR RESPALDO JSON ---
  const handleExportJSON = () => {
    try {
      setLoading(true);
      const backupData = {
        ganado_cattle: JSON.parse(localStorage.getItem("ganado_cattle")) || [],
        ganado_weights: JSON.parse(localStorage.getItem("ganado_weights")) || [],
        ganado_vaccines: JSON.parse(localStorage.getItem("ganado_vaccines")) || [],
        ganado_medications: JSON.parse(localStorage.getItem("ganado_medications")) || []
      };
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `respaldo_rancho_ganado_${today}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Copia de seguridad (JSON) exportada con éxito.' });
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al exportar respaldo: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- IMPORTAR RESPALDO JSON ---
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm("¡ATENCIÓN! Los datos que contenga este archivo SOBREESCRIBIRÁN los datos locales correspondientes. ¿Deseas continuar?")) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setLoading(true);
        const data = JSON.parse(event.target.result);

        // Validar que al menos uno de los campos exista
        const hasAnyData = data.ganado_cattle || data.ganado_weights ||
                           data.ganado_vaccines || data.ganado_medications;
        if (!hasAnyData) {
          throw new Error("El archivo no tiene un formato de respaldo reconocido.");
        }

        // Resumen de lo que se importó para el mensaje
        const imported = [];

        if (data.ganado_cattle !== undefined) {
          localStorage.setItem("ganado_cattle", JSON.stringify(data.ganado_cattle));
          imported.push(`${data.ganado_cattle.length} animales`);
        }
        if (data.ganado_weights !== undefined) {
          localStorage.setItem("ganado_weights", JSON.stringify(data.ganado_weights));
          imported.push(`${data.ganado_weights.length} pesos`);
        }
        if (data.ganado_vaccines !== undefined) {
          localStorage.setItem("ganado_vaccines", JSON.stringify(data.ganado_vaccines));
          imported.push(`${data.ganado_vaccines.length} vacunas`);
        }
        if (data.ganado_medications !== undefined) {
          localStorage.setItem("ganado_medications", JSON.stringify(data.ganado_medications));
          imported.push(`${data.ganado_medications.length} medicamentos`);
        }

        loadStats();
        if (onRefreshList) onRefreshList();

        setMessage({
          type: 'success',
          text: `Importación exitosa. Se cargaron: ${imported.join(', ')}.`
        });
      } catch (err) {
        setMessage({ type: 'danger', text: 'Error al importar archivo: ' + err.message });
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // --- EXPORTAR REPORTES EN EXCEL (CSV) ---
  const handleExportCSV = () => {
    try {
      setLoading(true);
      const cattle = JSON.parse(localStorage.getItem("ganado_cattle")) || [];
      const weights = JSON.parse(localStorage.getItem("ganado_weights")) || [];
      const meds = JSON.parse(localStorage.getItem("ganado_medications")) || [];
      const today = new Date();

      const calculateAge = (dobString) => {
        if (!dobString) return 'S/D';
        const dob = new Date(dobString);
        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
          years--;
          months += 12;
        }
        if (years === 0) return `${months} meses`;
        return `${years} años y ${months} meses`;
      };

      const headers = [
        "Arete / ID",
        "Nombre",
        "Raza",
        "Sexo",
        "Fecha Nacimiento",
        "Edad",
        "Estado",
        "Ultimo Peso (kg)",
        "En Periodo de Retiro",
        "Dias de Retiro Restantes",
        "Observaciones"
      ];

      const rows = cattle.map(animal => {
        const animalWeights = weights.filter(w => w.cattleId === animal.id);
        const latestWeight = animalWeights.length > 0
          ? animalWeights.sort((a, b) => new Date(b.date) - new Date(a.date))[0].weight
          : "Sin peso";

        const animalMeds = meds.filter(m => m.cattleId === animal.id);
        let inWithdrawal = "No";
        let daysLeft = 0;

        animalMeds.forEach(m => {
          const adminDate = new Date(m.date);
          const endDate = new Date(adminDate);
          endDate.setDate(adminDate.getDate() + m.withdrawalDays);

          if (endDate > today) {
            const diffTime = endDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > daysLeft) {
              inWithdrawal = "SÍ";
              daysLeft = diffDays;
            }
          }
        });

        return [
          animal.id,
          animal.name || "Sin nombre",
          animal.breed,
          animal.gender,
          animal.dob || "S/D",
          calculateAge(animal.dob),
          animal.status,
          latestWeight,
          inWithdrawal,
          daysLeft > 0 ? daysLeft : 0,
          (animal.notes || "").replace(/;/g, ",").replace(/\n/g, " ")
        ];
      });

      const BOM = "\uFEFF";
      const csvContent = BOM + [
        headers.join(";"),
        ...rows.map(row => row.join(";"))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      const dateStr = today.toISOString().split('T')[0];
      link.href = url;
      link.download = `reporte_ganado_excel_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Reporte de Excel (CSV) descargado con éxito.' });
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al exportar CSV: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = () => {
    if (window.confirm("¿ESTÁS COMPLETAMENTE SEGURO? Esto borrará permanentemente todo el ganado, pesos, tratamientos y vacunas. Esta acción no se puede deshacer a menos que tengas un respaldo.")) {
      localStorage.setItem("ganado_cattle", JSON.stringify([]));
      localStorage.setItem("ganado_weights", JSON.stringify([]));
      localStorage.setItem("ganado_vaccines", JSON.stringify([]));
      localStorage.setItem("ganado_medications", JSON.stringify([]));

      loadStats();
      if (onRefreshList) onRefreshList();
      setMessage({ type: 'success', text: 'Base de datos local limpiada correctamente.' });
    }
  };

  return (
    <div>
      {/* Encabezado */}
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Gestión de Datos Locales</h1>
          <p style={{ color: 'hsl(var(--text-muted))' }}>
            Respalda, restaura y descarga reportes en Excel de toda la información de tu rancho.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadStats} style={{ gap: '0.25rem' }}>
          <RefreshCw size={14} /> Refrescar
        </button>
      </div>

      {/* Alertas */}
      {message.text && (
        <div className="glass-card mb-4" style={{
          borderColor: message.type === 'success' ? 'hsl(var(--success) / 0.3)' : 'hsl(var(--danger) / 0.3)',
          background: message.type === 'success' ? 'hsl(142 76% 99%)' : 'hsl(0 84% 99%)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem'
        }}>
          {message.type === 'success' ? (
            <CheckCircle size={20} style={{ color: 'hsl(var(--success))' }} />
          ) : (
            <AlertTriangle size={20} style={{ color: 'hsl(var(--danger))' }} />
          )}
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{message.text}</span>
        </div>
      )}

      {/* Estadísticas */}
      <div className="glass-card mb-4" style={{
        background: 'linear-gradient(135deg, hsl(var(--primary-light) / 0.3) 0%, hsl(var(--bg-glass)) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Database size={20} style={{ color: 'hsl(var(--primary))' }} />
          <h3>Estadísticas de la Base de Datos Local</h3>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            { label: 'CATTLE (ANIMALES)', value: stats.cattle },
            { label: 'REGISTROS DE PESO', value: stats.weights },
            { label: 'VACUNAS APLICADAS', value: stats.vaccines },
            { label: 'MEDICAMENTOS ADM.', value: stats.medications },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'white',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid hsl(var(--border-color))'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>{label}</span>
              <h4 style={{ fontSize: '1.5rem', color: 'hsl(var(--primary))', fontWeight: 700 }}>{value}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Panel Excel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'hsl(var(--success))' }}>
              <FileSpreadsheet size={22} />
              <h3 style={{ color: 'inherit' }}>Exportar para Microsoft Excel</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Genera y descarga una hoja de cálculo unificada en formato CSV compatible con Microsoft Excel.
              El reporte incluye todos tus animales, su raza, sexo, edad calculada, peso más reciente,
              periodo de retiro activo y observaciones generales.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleExportCSV}
            disabled={loading || stats.cattle === 0}
            style={{ width: '100%', padding: '0.8rem', gap: '0.5rem' }}
          >
            <Download size={18} /> Descargar Reporte de Excel (.csv)
          </button>
        </div>

        {/* Panel Respaldos */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'hsl(var(--primary))' }}>
              <Database size={22} />
              <h3 style={{ color: 'inherit' }}>Copias de Seguridad (Respaldos)</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', lineHeight: 1.5, marginBottom: '1rem' }}>
              Toda la información se guarda localmente en el navegador. Se recomienda descargar una copia
              periódicamente. Puedes cargar un respaldo parcial (solo vacunas, solo animales, etc.) y
              únicamente se sobreescribirán los datos que contenga el archivo.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary"
              onClick={handleExportJSON}
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', gap: '0.5rem', justifyContent: 'center' }}
            >
              <Download size={16} /> Descargar Copia de Seguridad (.json)
            </button>

            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                disabled={loading}
                id="import-backup-file"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  top: 0,
                  left: 0
                }}
              />
              <button
                className="btn btn-primary"
                type="button"
                style={{ width: '100%', padding: '0.75rem', gap: '0.5rem', justifyContent: 'center', pointerEvents: 'none' }}
              >
                <Upload size={16} /> Cargar Copia de Seguridad (.json)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zona de Peligro */}
      <div className="glass-card" style={{
        marginTop: '2rem',
        borderColor: 'hsl(var(--danger) / 0.3)',
        background: 'linear-gradient(to right, hsl(0 100% 99.5%), hsl(var(--bg-glass)))'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'hsl(var(--danger))' }}>
          <AlertTriangle size={20} />
          <h3 style={{ color: 'inherit' }}>Zona de Peligro</h3>
        </div>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', maxWidth: '500px', margin: 0 }}>
            Borrará permanentemente toda la base de datos de tu rancho. No realices esta acción a menos que tengas un respaldo descargado.
          </p>
          <button
            className="btn btn-danger"
            onClick={handleClearDatabase}
            style={{ fontWeight: 600 }}
          >
            Limpiar Base de Datos
          </button>
        </div>
      </div>
    </div>
  );
}