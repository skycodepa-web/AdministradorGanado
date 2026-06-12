import React, { useState } from 'react';
import { cattleAPI } from '../api/client';
import { X, HelpCircle } from 'lucide-react';

// --- MODAL: REGISTRAR NUEVO ANIMAL ---
export function AddCattleModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    breed: 'Holstein',
    dob: new Date().toISOString().split('T')[0],
    gender: 'Hembra',
    status: 'Activo',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id.trim()) {
      setError("El número de arete/código es obligatorio.");
      return;
    }
    try {
      setLoading(true);
      setError('');
      await cattleAPI.createCattle({
        ...formData,
        id: formData.id.trim().toUpperCase()
      });
      onSuccess();
    } catch (err) {
      setError(err.message || "Error al registrar el animal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem' }}>Registrar Nuevo Animal</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: 'hsl(0 84% 95%)', color: 'hsl(var(--danger))', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600 }}>
                {error}
              </div>
            )}
            
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Número de Arete / ID *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: G-105" 
                  value={formData.id}
                  onChange={e => setFormData({...formData, id: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre / Apodo</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: Bella" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Raza</label>
                <select 
                  className="form-control"
                  value={formData.breed}
                  onChange={e => setFormData({...formData, breed: e.target.value})}
                >
                  <option value="Holstein">Holstein</option>
                  <option value="Jersey">Jersey</option>
                  <option value="Angus">Angus</option>
                  <option value="Nelore">Nelore</option>
                  <option value="Brahman">Brahman</option>
                  <option value="Charolais">Charolais</option>
                  <option value="Gyr">Gyr</option>
                  <option value="Brown Swiss">Brown Swiss</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sexo</label>
                <select 
                  className="form-control"
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Hembra">Hembra (Vaca/Novilla)</option>
                  <option value="Macho">Macho (Toro/Novillo)</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Fecha Nacimiento</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.dob}
                  onChange={e => setFormData({...formData, dob: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estado Inicial</label>
                <select 
                  className="form-control"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Activo">Activo / Sano</option>
                  <option value="Enfermo">Enfermo / Bajo Control</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Observaciones Adicionales</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="Notas sobre el animal..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Registrando..." : "Registrar Animal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MODAL: EDITAR DETALLES DE ANIMAL ---
export function EditCattleModal({ cattle, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: cattle.name || '',
    breed: cattle.breed || 'Holstein',
    dob: cattle.dob || '',
    gender: cattle.gender || 'Hembra',
    status: cattle.status || 'Activo',
    notes: cattle.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await cattleAPI.updateCattle(cattle.id, formData);
      onSuccess();
    } catch (err) {
      setError("Error al guardar cambios.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem' }}>Editar Animal: {cattle.id}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: 'hsl(0 84% 95%)', color: 'hsl(var(--danger))', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Nombre / Apodo</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Raza</label>
                <select 
                  className="form-control"
                  value={formData.breed}
                  onChange={e => setFormData({...formData, breed: e.target.value})}
                >
                  <option value="Holstein">Holstein</option>
                  <option value="Jersey">Jersey</option>
                  <option value="Angus">Angus</option>
                  <option value="Nelore">Nelore</option>
                  <option value="Brahman">Brahman</option>
                  <option value="Charolais">Charolais</option>
                  <option value="Gyr">Gyr</option>
                  <option value="Brown Swiss">Brown Swiss</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sexo</label>
                <select 
                  className="form-control"
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Hembra">Hembra</option>
                  <option value="Macho">Macho</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Fecha Nacimiento</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.dob}
                  onChange={e => setFormData({...formData, dob: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select 
                  className="form-control"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Activo">Activo / Sano</option>
                  <option value="Enfermo">Enfermo / Bajo Observación</option>
                  <option value="Vendido">Vendido</option>
                  <option value="Muerto">Muerto</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Observaciones</label>
              <textarea 
                className="form-control" 
                rows="3" 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MODAL: REGISTRAR PESO ---
export function AddWeightModal({ cattleId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    weight: '',
    date: new Date().toISOString().split('T')[0],
    notes: 'Control de peso rutinario'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const wVal = parseFloat(formData.weight);
    if (isNaN(wVal) || wVal <= 0) {
      setError("El peso debe ser un número mayor a 0.");
      return;
    }

    try {
      setLoading(true);
      await cattleAPI.addWeightRecord(cattleId, formData);
      onSuccess();
    } catch (err) {
      setError("Error al registrar peso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem' }}>Registrar Control de Peso</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: 'hsl(0 84% 95%)', color: 'hsl(var(--danger))', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </div>
            )}
            
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Peso en Kilogramos (kg) *</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="form-control" 
                  placeholder="Ej: 420.5" 
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                  required 
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Pesaje *</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notas / Contexto del pesaje</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : "Registrar Peso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MODAL: REGISTRAR VACUNACIÓN ---
export function AddVaccineModal({ cattleId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    vaccineName: 'Fiebre Aftosa',
    date: new Date().toISOString().split('T')[0],
    dosage: '2 ml',
    batch: '',
    nextDoseDate: '',
    vet: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vaccineName.trim()) {
      setError("El nombre de la vacuna es obligatorio.");
      return;
    }

    try {
      setLoading(true);
      await cattleAPI.addVaccineRecord(cattleId, formData);
      onSuccess();
    } catch (err) {
      setError("Error al registrar vacunación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem' }}>Aplicar Vacuna</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: 'hsl(0 84% 95%)', color: 'hsl(var(--danger))', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </div>
            )}
            
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Vacuna / Biológico *</label>
                <select 
                  className="form-control"
                  value={formData.vaccineName}
                  onChange={e => setFormData({...formData, vaccineName: e.target.value})}
                >
                  <option value="Fiebre Aftosa">Fiebre Aftosa</option>
                  <option value="Triple Bovina">Triple Bovina (Septicemia/Carbunco/Pasteurella)</option>
                  <option value="Carbunco Sintomático">Carbunco Sintomático (Pierna Negra)</option>
                  <option value="Rabia Paralítica">Rabia Paralítica Bovina</option>
                  <option value="Clostridiosis">Clostridiosis (Polivalente)</option>
                  <option value="Brucelosis">Brucelosis (Cepa 19 / RB51)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Aplicación *</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Dosis Aplicada (ml/cc)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: 2 ml o 5 cc" 
                  value={formData.dosage}
                  onChange={e => setFormData({...formData, dosage: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Código de Lote</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: B-892A" 
                  value={formData.batch}
                  onChange={e => setFormData({...formData, batch: e.target.value})}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Próxima Dosis / Refuerzo</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.nextDoseDate}
                  onChange={e => setFormData({...formData, nextDoseDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Veterinario Responsable</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: Dr. Carlos Mendoza" 
                  value={formData.vet}
                  onChange={e => setFormData({...formData, vet: e.target.value})}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : "Registrar Aplicación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MODAL: REGISTRAR TRATAMIENTO MÉDICO ---
export function AddMedicationModal({ cattleId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    medicationName: 'Ivermectina 1%',
    date: new Date().toISOString().split('T')[0],
    dosage: '10 ml',
    reason: '',
    durationDays: '1',
    withdrawalDays: '28',
    vet: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      setError("Debes indicar el diagnóstico o motivo del tratamiento.");
      return;
    }
    const duration = parseInt(formData.durationDays);
    const withdrawal = parseInt(formData.withdrawalDays);
    
    if (isNaN(duration) || duration <= 0) {
      setError("La duración debe ser al menos 1 día.");
      return;
    }
    if (isNaN(withdrawal) || withdrawal < 0) {
      setError("El tiempo de retiro no puede ser menor a 0.");
      return;
    }

    try {
      setLoading(true);
      await cattleAPI.addMedicationRecord(cattleId, formData);
      onSuccess();
    } catch (err) {
      setError("Error al registrar tratamiento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem' }}>Registrar Tratamiento Médico</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: 'hsl(0 84% 95%)', color: 'hsl(var(--danger))', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </div>
            )}
            
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Medicamento / Fármaco *</label>
                <select 
                  className="form-control"
                  value={formData.medicationName}
                  onChange={e => setFormData({...formData, medicationName: e.target.value})}
                >
                  <option value="Ivermectina 1%">Ivermectina 1% (Antiparasitario)</option>
                  <option value="Penicilina G Sódica">Penicilina G Sódica (Antibiótico)</option>
                  <option value="Oxitetraciclina">Oxitetraciclina L.A. (Antibiótico espectro ancho)</option>
                  <option value="Fenbendazol">Fenbendazol (Desparasitante oral)</option>
                  <option value="Flunixin Meglumine">Flunixin Meglumine (Antiinflamatorio/Analgésico)</option>
                  <option value="Complejo B12">Complejo B12 (Vitamínico/Reconstituyente)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Administración *</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Diagnóstico / Motivo del Tratamiento *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: Infección respiratoria, Gabarro, Parásitos internos..." 
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                required 
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Dosis Administrada</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: 10 ml o 5 cc" 
                  value={formData.dosage}
                  onChange={e => setFormData({...formData, dosage: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Duración (Días) *</label>
                <input 
                  type="number" 
                  min="1"
                  className="form-control" 
                  value={formData.durationDays}
                  onChange={e => setFormData({...formData, durationDays: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Tiempo de retiro (Muy importante) */}
            <div className="form-group" style={{ 
              backgroundColor: 'hsl(0 84% 97%)', 
              padding: '1rem', 
              borderRadius: 'var(--radius-md)',
              border: '1px dashed hsl(var(--danger) / 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: 'hsl(var(--danger))' }}>
                <HelpCircle size={16} />
                <label className="form-label" style={{ margin: 0, fontWeight: 700, color: 'inherit' }}>
                  Tiempo de Retiro (Días) *
                </label>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                Es el tiempo que debe transcurrir entre la última dosis y el consumo de carne o leche del animal para asegurar la inocuidad.
              </p>
              <input 
                type="number" 
                min="0"
                className="form-control" 
                value={formData.withdrawalDays}
                onChange={e => setFormData({...formData, withdrawalDays: e.target.value})}
                required 
                style={{ borderColor: 'hsl(var(--danger) / 0.4)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Veterinario Responsable</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: Dr. Carlos Mendoza" 
                value={formData.vet}
                onChange={e => setFormData({...formData, vet: e.target.value})}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : "Registrar Tratamiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
