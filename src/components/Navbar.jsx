import React, { useState } from 'react';
import { LayoutDashboard, ClipboardList, PlusCircle, ShieldAlert, BookOpen, Menu, X } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, totalCattle, onAddAnimal }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cattle-list', label: 'Inventario Ganado', icon: ClipboardList, badge: totalCattle },
    { id: 'data-management', label: 'Gestión de Datos', icon: BookOpen }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false); // Cerrar menú móvil
  };

  return (
    <>
      <header className="navbar-top">
        {/* Logo / Título */}
        <div 
          className="logo-box" 
          onClick={() => setActiveTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            G
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', lineHeight: 1.1, fontWeight: 700 }}></h2>
            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>
              Control Agropecuario
            </span>
          </div>
        </div>

        {/* Menú de Navegación Horizontal (Escritorio) */}
        <nav className="nav-menu-horizontal" style={{ display: 'flex', gap: '0.35rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'cattle-list' && activeTab === 'cattle-profile');
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`menu-btn ${isActive ? 'active' : ''}`}
                style={{
                  padding: '0.6rem 1rem !important',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  height: '40px'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    fontSize: '0.7rem',
                    background: isActive ? 'white' : 'hsl(var(--primary-light))',
                    color: 'hsl(var(--primary))',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    marginLeft: '0.25rem'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Botón de Registro Rápido (Derecha) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onAddAnimal}
            className="btn btn-primary-bounce"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              fontSize: '0.9rem',
              height: '40px'
            }}
          >
            <PlusCircle size={16} />
            <span className="btn-register-text">Registrar Animal</span>
          </button>

          {/* Toggle de Menú Móvil */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'hsl(var(--text-main))',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Menú Desplegable Móvil */}
        {isOpen && (
          <div className="mobile-menu-dropdown">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'cattle-list' && activeTab === 'cattle-profile');
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`menu-btn ${isActive ? 'active' : ''}`}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{
                      fontSize: '0.7rem',
                      background: 'hsl(var(--primary))',
                      color: 'white',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                      fontWeight: 700
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => {
                onAddAnimal();
                setIsOpen(false);
              }}
              className="btn btn-primary-bounce"
              style={{ width: '100%', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
            >
              <PlusCircle size={16} />
              <span>Registrar Animal</span>
            </button>
          </div>
        )}
      </header>

      {/* Estilos responsive específicos para el Navbar Superior */}
      <style>{`
        .mobile-menu-toggle {
          display: none !important;
        }
        @media (max-width: 900px) {
          .nav-menu-horizontal {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
          .btn-register-text {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
