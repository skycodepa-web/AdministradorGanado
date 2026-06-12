import React, { useState } from 'react';
import { LayoutDashboard, ClipboardList, PlusCircle, ShieldAlert, BookOpen, Menu, X } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, totalCattle, onAddAnimal }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cattle-list', label: 'Inventario Ganado', icon: ClipboardList, badge: totalCattle },
      { id: 'data-management', label: 'Gestión de Datos', icon: BookOpen }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false); // Cerrar en móvil al hacer click
  };

  return (
    <>
      {/* Botón de Hamburguesa para Móviles */}
      <button 
        className="mobile-toggle-btn" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1100,
          background: 'hsl(var(--primary))',
          color: 'white',
          border: 'none',
          padding: '0.6rem',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* CSS específico inline para responsive de Sidebar */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-toggle-btn {
            display: flex !important;
          }
          .sidebar-aside {
            transform: translateX(${isOpen ? '0' : '-100%'}) !important;
            width: 260px !important;
          }
        }
      `}</style>

      {/* Sidebar Aside */}
      <aside 
        className="sidebar-aside"
        style={{
          width: '260px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: 'hsl(var(--bg-card))',
          borderRight: '1px solid hsl(var(--border-color))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem 1rem',
          zIndex: 1000,
          transition: 'transform var(--transition-normal), width var(--transition-normal)'
        }}
      >
        <div>
          {/* Logo / Título */}
          <div className="logo-box" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0.75rem 1.5rem 0.75rem',
            borderBottom: '1px solid hsl(var(--border-color))',
            marginBottom: '1.5rem',
            cursor: 'pointer'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem'
            }}>
              G
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', lineHeight: 1.1 }}>GanadoPro</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>
                Control Agropecuario
              </span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'cattle-list' && activeTab === 'cattle-profile');
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`menu-btn ${isActive ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{
                      fontSize: '0.75rem',
                      background: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-muted) / 0.15)',
                      color: isActive ? 'white' : 'hsl(var(--text-main))',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      fontWeight: 600
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sección Inferior de Acciones Rápidas */}
        <div>
          <button
            onClick={() => {
              onAddAnimal();
              setIsOpen(false);
            }}
            className="btn btn-primary-bounce"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              padding: '0.75rem'
            }}
          >
            <PlusCircle size={18} />
            <span>Registrar Animal</span>
          </button>
          
          <div style={{
            padding: '0.75rem',
            background: 'hsl(var(--bg-main))',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            color: 'hsl(var(--text-muted))',
            border: '1px dashed hsl(var(--border-color))',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldAlert size={14} style={{ color: 'hsl(var(--success))', flexShrink: 0 }} />
            <span>Base de datos local activa</span>
          </div>
        </div>
      </aside>
    </>
  );
}
