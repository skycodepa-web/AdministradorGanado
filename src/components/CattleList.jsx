import React, { useEffect, useState } from 'react';
import { cattleAPI } from '../api/client';
import { Search, Filter, Eye, Trash2, Plus, Calendar, Scale, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CattleList({ setActiveTab, setSelectedCattleId, onAddAnimal, refreshTrigger }) {
  const [cattle, setCattle] = useState([]);
  const [latestWeights, setLatestWeights] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBreed, setFilterBreed] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const loadCattleList = async () => {
    try {
      setLoading(true);
      const list = await cattleAPI.getAllCattle();
      setCattle(list);

      // Cargar el peso más reciente de cada animal asíncronamente
      const weightPromises = list.map(async (animal) => {
        const weights = await cattleAPI.getWeightsByCattleId(animal.id);
        if (weights.length > 0) {
          return { id: animal.id, weight: weights[weights.length - 1].weight };
        }
        return { id: animal.id, weight: null };
      });
      
      const weightsResult = await Promise.all(weightPromises);
      const weightMap = {};
      weightsResult.forEach(item => {
        weightMap[item.id] = item.weight;
      });
      setLatestWeights(weightMap);
    } catch (error) {
      console.error("Error al cargar listado de ganado:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCattleList();
  }, [refreshTrigger]);

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`¿Está seguro de eliminar a ${name || id}? Se borrará también su historial de peso, vacunas y tratamientos.`)) {
      try {
        await cattleAPI.deleteCattle(id);
        alert("Animal eliminado con éxito.");
        loadCattleList();
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  const handleRowClick = (id) => {
    setSelectedCattleId(id);
    setActiveTab('cattle-profile');
  };

  // Cálculo de edad exacta en años y meses
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
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
    return `${years} ${years === 1 ? 'año' : 'años'}${months > 0 ? ` y ${months} ${months === 1 ? 'mes' : 'meses'}` : ''}`;
  };

  // Obtener lista única de razas para el dropdown del filtro
  const uniqueBreeds = [...new Set(cattle.map(c => c.breed))].filter(Boolean);

  // Filtrado de datos
  const filteredCattle = cattle.filter(animal => {
    const matchesSearch = 
      animal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.name && animal.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesBreed = filterBreed === '' || animal.breed === filterBreed;
    const matchesGender = filterGender === '' || animal.gender === filterGender;
    const matchesStatus = filterStatus === '' || animal.status === filterStatus;
    
    return matchesSearch && matchesBreed && matchesGender && matchesStatus;
  });

  // Paginación lógica
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCattle.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCattle.length / itemsPerPage);

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
      {/* Encabezado */}
      <div className="flex-between mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Inventario de Ganado</h1>
          <p style={{ color: 'hsl(var(--text-muted))' }}>
            Gestiona el catálogo total de animales de la finca ({filteredCattle.length} de {cattle.length} registrados)
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddAnimal}>
          <Plus size={16} /> Registrar Animal
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="glass-card mb-4" style={{ padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Campo de búsqueda */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}>
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Buscar por ID/arete, nombre o raza..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Filtro Raza */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={filterBreed}
              onChange={(e) => { setFilterBreed(e.target.value); setCurrentPage(1); }}
              className="form-control"
            >
              <option value="">Todas las Razas</option>
              {uniqueBreeds.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Filtro Género */}
          <div>
            <select
              value={filterGender}
              onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}
              className="form-control"
            >
              <option value="">Todos los Sexos</option>
              <option value="Hembra">Hembra</option>
              <option value="Macho">Macho</option>
            </select>
          </div>

          {/* Filtro Estado */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="form-control"
            >
              <option value="">Todos los Estados</option>
              <option value="Activo">Activo</option>
              <option value="Enfermo">Enfermo</option>
              <option value="Vendido">Vendido</option>
              <option value="Muerto">Muerto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid hsl(var(--primary-light))',
            borderTopColor: 'hsl(var(--primary))',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <span style={{ color: 'hsl(var(--text-muted))' }}>Cargando inventario...</span>
        </div>
      ) : filteredCattle.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'hsl(var(--text-main))', marginBottom: '0.5rem' }}>
            No se encontraron animales
          </p>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Intenta cambiar los parámetros de búsqueda o registrar un nuevo animal en la finca.
          </p>
          <button className="btn btn-primary" onClick={onAddAnimal}>
            <Plus size={16} /> Registrar Animal
          </button>
        </div>
      ) : (
        <>
          <div className="table-container shadow-md">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Arete / Código</th>
                  <th>Nombre</th>
                  <th>Raza</th>
                  <th>Sexo</th>
                  <th>Edad</th>
                  <th>Último Peso</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((animal) => (
                  <tr 
                    key={animal.id} 
                    onClick={() => handleRowClick(animal.id)}
                    style={{ cursor: 'pointer', transition: 'background var(--transition-fast)' }}
                  >
                    <td style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>{animal.id}</td>
                    <td style={{ fontWeight: 600 }}>{animal.name || '—'}</td>
                    <td>{animal.breed}</td>
                    <td>
                      <span className={`badge ${animal.gender === 'Macho' ? 'badge-info' : 'badge-success'}`} style={{ opacity: 0.85 }}>
                        {animal.gender}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{calculateAge(animal.dob)}</td>
                    <td style={{ fontWeight: 600 }}>
                      {latestWeights[animal.id] ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Scale size={14} style={{ color: 'hsl(var(--text-muted))' }} />
                          {latestWeights[animal.id]} kg
                        </span>
                      ) : 'S/P'}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(animal.status)}`}>
                        {animal.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleRowClick(animal.id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                          title="Ver Ficha y Registro Histórico"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, animal.id, animal.name)}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                          title="Eliminar animal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex-between" style={{ marginTop: '1.5rem', padding: '0 0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                Mostrando página {currentPage} de {totalPages} ({filteredCattle.length} animales)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
