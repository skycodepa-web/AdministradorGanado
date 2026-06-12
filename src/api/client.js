// Cliente de API simulado para la gestión de ganado
// Almacena los datos en localStorage y simula llamadas asíncronas con Promesas.
// Para conectar con tu backend PHP en el futuro, simplemente cambia USE_MOCK_API a false
// e implementa las peticiones fetch correspondientes en este mismo archivo.

const USE_MOCK_API = true;
const API_BASE_URL = '/api.php'; // URL a tu script PHP

// Datos de semilla iniciales (en caso de que el localStorage esté vacío)
const SEED_CATTLE = [
  {
    id: "G-001",
    name: "Clementina",
    breed: "Holstein",
    dob: "2023-04-12",
    gender: "Hembra",
    status: "Activo",
    notes: "Productora de leche alta calidad. Dócil."
  },
  {
    id: "G-002",
    name: "Toro Rambo",
    breed: "Angus",
    dob: "2022-08-25",
    gender: "Macho",
    status: "Activo",
    notes: "Gorrón reproductor principal. Gran musculatura."
  },
  {
    id: "G-003",
    name: "Mariposa",
    breed: "Jersey",
    dob: "2024-01-10",
    gender: "Hembra",
    status: "Enfermo",
    notes: "Bajo observación por cojera en pata trasera izquierda."
  },
  {
    id: "G-004",
    name: "Hércules",
    breed: "Brahman",
    dob: "2023-11-05",
    gender: "Macho",
    status: "Activo",
    notes: "Adaptado a zonas cálidas. Resistente."
  }
];

const SEED_WEIGHTS = [
  // Clementina
  { id: "w1", cattleId: "G-001", date: "2025-10-15", weight: 450, notes: "Control mensual" },
  { id: "w2", cattleId: "G-001", date: "2025-11-15", weight: 462, notes: "Control mensual" },
  { id: "w3", cattleId: "G-001", date: "2025-12-15", weight: 475, notes: "Control mensual" },
  { id: "w4", cattleId: "G-001", date: "2026-05-10", weight: 510, notes: "Control post-gestación" },
  
  // Toro Rambo
  { id: "w5", cattleId: "G-002", date: "2025-10-15", weight: 780, notes: "Pesaje rutinario" },
  { id: "w6", cattleId: "G-002", date: "2025-12-15", weight: 810, notes: "Evaluación reproductiva" },
  { id: "w7", cattleId: "G-002", date: "2026-04-20", weight: 850, notes: "Pesaje anual" },

  // Mariposa
  { id: "w8", cattleId: "G-003", date: "2026-03-01", weight: 280, notes: "Ingreso al registro" },
  { id: "w9", cattleId: "G-003", date: "2026-04-15", weight: 300, notes: "Control de desarrollo" },
  { id: "w10", cattleId: "G-003", date: "2026-05-25", weight: 310, notes: "Bajo peso por enfermedad" },

  // Hércules
  { id: "w11", cattleId: "G-004", date: "2026-02-10", weight: 380, notes: "Ingreso" },
  { id: "w12", cattleId: "G-004", date: "2026-04-10", weight: 415, notes: "Pesaje rutinario" }
];

const SEED_VACCINES = [
  {
    id: "v1",
    cattleId: "G-001",
    date: "2025-11-01",
    vaccineName: "Fiebre Aftosa",
    dosage: "2 ml",
    batch: "L-AF889",
    nextDoseDate: "2026-11-01",
    vet: "Dr. Carlos Mendoza"
  },
  {
    id: "v2",
    cattleId: "G-002",
    date: "2025-11-01",
    vaccineName: "Fiebre Aftosa",
    dosage: "2 ml",
    batch: "L-AF889",
    nextDoseDate: "2026-11-01",
    vet: "Dr. Carlos Mendoza"
  },
  {
    id: "v3",
    cattleId: "G-003",
    date: "2026-02-15",
    vaccineName: "Triple Bovina",
    dosage: "5 ml",
    batch: "T-9921X",
    nextDoseDate: "2026-08-15",
    vet: "Dra. Laura Gómez"
  },
  {
    id: "v4",
    cattleId: "G-004",
    date: "2026-03-10",
    vaccineName: "Carbunco Sintomático",
    dosage: "2 ml",
    batch: "C-223A",
    nextDoseDate: "2027-03-10",
    vet: "Dr. Carlos Mendoza"
  }
];

const SEED_MEDICATIONS = [
  {
    id: "m1",
    cattleId: "G-001",
    date: "2026-02-10",
    medicationName: "Ivermectina 1%",
    dosage: "5 ml",
    reason: "Desparasitación interna y externa",
    durationDays: 1,
    withdrawalDays: 28, // Tiempo de retiro carne
    vet: "Dra. Laura Gómez"
  },
  {
    id: "m2",
    cattleId: "G-003",
    date: "2026-06-08", // Medicamento reciente (hace 2 días respecto a la fecha del sistema)
    medicationName: "Penicilina G Sódica",
    dosage: "10 ml",
    reason: "Tratamiento de infección podal (cojera)",
    durationDays: 5,
    withdrawalDays: 10, // Sigue en periodo de retiro
    vet: "Dr. Carlos Mendoza"
  }
];

// Inicialización de LocalStorage
const initializeDB = () => {
  if (!localStorage.getItem("ganado_cattle")) {
    localStorage.setItem("ganado_cattle", JSON.stringify(SEED_CATTLE));
  }
  if (!localStorage.getItem("ganado_weights")) {
    localStorage.setItem("ganado_weights", JSON.stringify(SEED_WEIGHTS));
  }
  if (!localStorage.getItem("ganado_vaccines")) {
    localStorage.setItem("ganado_vaccines", JSON.stringify(SEED_VACCINES));
  }
  if (!localStorage.getItem("ganado_medications")) {
    localStorage.setItem("ganado_medications", JSON.stringify(SEED_MEDICATIONS));
  }
};

initializeDB();

// Helper para simular retardo de red (300ms)
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const cattleAPI = {
  // --- GANADO (CATTLE) ---
  getAllCattle: async () => {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}?action=getCattle`);
      return response.json();
    }
    await delay();
    return JSON.parse(localStorage.getItem("ganado_cattle"));
  },

  getCattleById: async (id) => {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}?action=getCattleById&id=${id}`);
      return response.json();
    }
    await delay();
    const list = JSON.parse(localStorage.getItem("ganado_cattle"));
    return list.find(c => c.id === id) || null;
  },

  createCattle: async (cattleData) => {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}?action=createCattle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cattleData)
      });
      return response.json();
    }
    await delay();
    const list = JSON.parse(localStorage.getItem("ganado_cattle"));
    
    // Verificar duplicado de ID/arete
    if (list.some(c => c.id.toLowerCase() === cattleData.id.toLowerCase())) {
      throw new Error(`El arete/código ${cattleData.id} ya está registrado.`);
    }

    const newAnimal = {
      ...cattleData,
      status: cattleData.status || "Activo"
    };
    list.push(newAnimal);
    localStorage.setItem("ganado_cattle", JSON.stringify(list));
    return newAnimal;
  },

  updateCattle: async (id, updatedData) => {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}?action=updateCattle&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      return response.json();
    }
    await delay();
    const list = JSON.parse(localStorage.getItem("ganado_cattle"));
    const index = list.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Animal no encontrado.");
    
    list[index] = { ...list[index], ...updatedData };
    localStorage.setItem("ganado_cattle", JSON.stringify(list));
    return list[index];
  },

  deleteCattle: async (id) => {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}?action=deleteCattle&id=${id}`, {
        method: 'DELETE'
      });
      return response.json();
    }
    await delay();
    // Eliminar el ganado
    let list = JSON.parse(localStorage.getItem("ganado_cattle"));
    list = list.filter(c => c.id !== id);
    localStorage.setItem("ganado_cattle", JSON.stringify(list));

    // Eliminar registros asociados para limpiar la base de datos
    let weights = JSON.parse(localStorage.getItem("ganado_weights"));
    weights = weights.filter(w => w.cattleId !== id);
    localStorage.setItem("ganado_weights", JSON.stringify(weights));

    let vaccines = JSON.parse(localStorage.getItem("ganado_vaccines"));
    vaccines = vaccines.filter(v => v.cattleId !== id);
    localStorage.setItem("ganado_vaccines", JSON.stringify(vaccines));

    let medications = JSON.parse(localStorage.getItem("ganado_medications"));
    medications = medications.filter(m => m.cattleId !== id);
    localStorage.setItem("ganado_medications", JSON.stringify(medications));

    return { success: true };
  },

  // --- HISTORIAL DE PESO (WEIGHT RECORDS) ---
  getWeightsByCattleId: async (cattleId) => {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}?action=getWeights&cattleId=${cattleId}`);
      return response.json();
    }
    await delay();
    const allWeights = JSON.parse(localStorage.getItem("ganado_weights"));
    return allWeights
      .filter(w => w.cattleId === cattleId)
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordenar cronológicamente
  },

  addWeightRecord: async (cattleId, weightData) => {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}?action=addWeight&cattleId=${cattleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weightData)
      });
      return response.json();
    }
    await delay();
    const allWeights = JSON.parse(localStorage.getItem("ganado_weights"));
    const newRecord = {
      id: "w_" + Math.random().toString(36).substr(2, 9),
      cattleId,
      date: weightData.date || new Date().toISOString().split('T')[0],
      weight: parseFloat(weightData.weight),
      notes: weightData.notes || ""
    };
    allWeights.push(newRecord);
    localStorage.setItem("ganado_weights", JSON.stringify(allWeights));
    return newRecord;
  },

  deleteWeightRecord: async (id) => {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}?action=deleteWeight&id=${id}`, {
        method: 'DELETE'
      });
      return response.json();
    }
    await delay();
    let allWeights = JSON.parse(localStorage.getItem("ganado_weights"));
    allWeights = allWeights.filter(w => w.id !== id);
    localStorage.setItem("ganado_weights", JSON.stringify(allWeights));
    return { success: true };
  },

  // --- HISTORIAL DE VACUNAS (VACCINE RECORDS) ---
  getVaccinesByCattleId: async (cattleId) => {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}?action=getVaccines&cattleId=${cattleId}`);
      return response.json();
    }
    await delay();
    const allVaccines = JSON.parse(localStorage.getItem("ganado_vaccines"));
    return allVaccines
      .filter(v => v.cattleId === cattleId)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordenar más recientes primero
  },

  addVaccineRecord: async (cattleId, vaccineData) => {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}?action=addVaccine&cattleId=${cattleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vaccineData)
      });
      return response.json();
    }
    await delay();
    const allVaccines = JSON.parse(localStorage.getItem("ganado_vaccines"));
    const newRecord = {
      id: "v_" + Math.random().toString(36).substr(2, 9),
      cattleId,
      date: vaccineData.date || new Date().toISOString().split('T')[0],
      vaccineName: vaccineData.vaccineName,
      dosage: vaccineData.dosage || "",
      batch: vaccineData.batch || "",
      nextDoseDate: vaccineData.nextDoseDate || "",
      vet: vaccineData.vet || ""
    };
    allVaccines.push(newRecord);
    localStorage.setItem("ganado_vaccines", JSON.stringify(allVaccines));
    return newRecord;
  },

  // --- HISTORIAL DE MEDICAMENTOS (MEDICATION RECORDS) ---
  getMedicationsByCattleId: async (cattleId) => {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}?action=getMedications&cattleId=${cattleId}`);
      return response.json();
    }
    await delay();
    const allMeds = JSON.parse(localStorage.getItem("ganado_medications"));
    return allMeds
      .filter(m => m.cattleId === cattleId)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordenar más recientes primero
  },

  addMedicationRecord: async (cattleId, medData) => {
    if (!USE_MOCK_API) {
      const response = await fetch(`${API_BASE_URL}?action=addMedication&cattleId=${cattleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medData)
      });
      return response.json();
    }
    await delay();
    const allMeds = JSON.parse(localStorage.getItem("ganado_medications"));
    const newRecord = {
      id: "m_" + Math.random().toString(36).substr(2, 9),
      cattleId,
      date: medData.date || new Date().toISOString().split('T')[0],
      medicationName: medData.medicationName,
      dosage: medData.dosage || "",
      reason: medData.reason || "",
      durationDays: parseInt(medData.durationDays) || 1,
      withdrawalDays: parseInt(medData.withdrawalDays) || 0,
      vet: medData.vet || ""
    };
    allMeds.push(newRecord);
    localStorage.setItem("ganado_medications", JSON.stringify(allMeds));
    return newRecord;
  },

  // --- REPORTES / MÉTRICAS GENERALES (DASHBOARD METRICS) ---
  getDashboardSummary: async () => {
    await delay();
    const cattle = JSON.parse(localStorage.getItem("ganado_cattle"));
    const weights = JSON.parse(localStorage.getItem("ganado_weights"));
    const meds = JSON.parse(localStorage.getItem("ganado_medications"));
    const vaccines = JSON.parse(localStorage.getItem("ganado_vaccines"));
    
    // 1. Total de Cabezas
    const totalCattle = cattle.length;

    // 2. Estado de salud
    const active = cattle.filter(c => c.status === "Activo").length;
    const sick = cattle.filter(c => c.status === "Enfermo").length;

    // 3. Pesos
    // Encontrar el último peso registrado para cada animal
    const latestWeights = [];
    cattle.forEach(animal => {
      const animalWeights = weights.filter(w => w.cattleId === animal.id);
      if (animalWeights.length > 0) {
        // Ordenar por fecha desc
        const sorted = animalWeights.sort((a, b) => new Date(b.date) - new Date(a.date));
        latestWeights.push(sorted[0].weight);
      }
    });
    const avgWeight = latestWeights.length > 0 
      ? Math.round(latestWeights.reduce((a, b) => a + b, 0) / latestWeights.length) 
      : 0;

    // 4. Retiro de medicamentos activo (Alerta de Inocuidad)
    // Un animal está en retiro si tiene un tratamiento médico cuya (fecha + dias_retiro) es posterior al día de hoy.
    const today = new Date();
    let animalsInWithdrawal = 0;
    
    meds.forEach(med => {
      const adminDate = new Date(med.date);
      const withdrawalEndDate = new Date(adminDate);
      withdrawalEndDate.setDate(adminDate.getDate() + med.withdrawalDays);
      
      if (withdrawalEndDate > today) {
        // Verificar que el animal aún esté activo en el sistema
        if (cattle.some(c => c.id === med.cattleId && (c.status === "Activo" || c.status === "Enfermo"))) {
          animalsInWithdrawal++;
        }
      }
    });

    // 5. Próximas vacunas programadas en el futuro
    const upcomingVaccines = vaccines.filter(v => {
      if (!v.nextDoseDate) return false;
      return new Date(v.nextDoseDate) > today;
    }).length;

    // 6. Distribución de razas
    const breedDistribution = {};
    cattle.forEach(c => {
      breedDistribution[c.breed] = (breedDistribution[c.breed] || 0) + 1;
    });

    return {
      totalCattle,
      active,
      sick,
      avgWeight,
      animalsInWithdrawal,
      upcomingVaccines,
      breedDistribution
    };
  }
};
