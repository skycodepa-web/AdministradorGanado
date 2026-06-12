import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CattleList from './components/CattleList';
import CattleProfile from './components/CattleProfile';
import DataManagement from './components/DataManagement';
import { AddCattleModal } from './components/Forms';
import { cattleAPI } from './api/client';


export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCattleId, setSelectedCattleId] = useState(null);
  const [totalCattle, setTotalCattle] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // Cargar el conteo de cabezas total de ganado para la barra lateral
  const loadSidebarCount = async () => {
    try {
      const list = await cattleAPI.getAllCattle();
      setTotalCattle(list.length);
    } catch (error) {
      console.error("Error al cargar conteo del menú:", error);
    }
  };

  useEffect(() => {
    loadSidebarCount();
  }, [refreshTrigger]);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAnimalAdded = () => {
    setShowAddModal(false);
    triggerRefresh();
    // Cambiar al listado de ganado para ver el nuevo registro
    setActiveTab('cattle-list');
  };

  return (
    <div className="app-container">
      {/* Barra de Navegación Superior */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        totalCattle={totalCattle} 
        onAddAnimal={() => setShowAddModal(true)} 
      />

      {/* Contenido Principal */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            setActiveTab={setActiveTab} 
            setSelectedCattleId={setSelectedCattleId}
            onAddAnimal={() => setShowAddModal(true)} 
          />
        )}

        {activeTab === 'cattle-list' && (
          <CattleList 
            setActiveTab={setActiveTab} 
            setSelectedCattleId={setSelectedCattleId} 
            onAddAnimal={() => setShowAddModal(true)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === 'cattle-profile' && selectedCattleId && (
          <CattleProfile 
            cattleId={selectedCattleId} 
            onBack={() => {
              setSelectedCattleId(null);
              setActiveTab('cattle-list');
            }} 
            onRefreshList={triggerRefresh}
          />
        )}

        {activeTab === 'data-management' && (
          <DataManagement 
            onRefreshList={triggerRefresh}
          />
        )}
      </main>

      {/* Modal Global de Registro de Ganado */}
      {showAddModal && (
        <AddCattleModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAnimalAdded}
        />
      )}

    </div>
  );
}
