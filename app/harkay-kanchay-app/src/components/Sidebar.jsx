import React, { useState, useEffect } from 'react';

// --- Layout Components ---

const Sidebar = ({ currentPage, navigateTo, isMobileMenuOpen, setMobileMenuOpen }) => {
    const NavLink = ({ page, icon, children }) => (
        <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigateTo(page); }}
            className={`flex items-center px-4 py-3 text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg transition-colors duration-200 ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
        >
            <i className={`fas ${icon} w-6 text-center mr-3`}></i>
            <span className="font-medium">{children}</span>
        </a>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-gray-900 p-6 flex-col justify-between">
                <div>
                    <div className="flex items-center mb-10">
                        <i className="fas fa-bolt text-3xl text-yellow-400 mr-3"></i>
                        <h1 className="text-xl font-bold tracking-wider">Hark'ay K'anchay</h1>
                    </div>
                    <nav className="space-y-3">
                        <NavLink page="dashboard" icon="fa-tachometer-alt">Dashboard</NavLink>
                        <NavLink page="simulacion" icon="fa-robot">Simulación IA</NavLink>
                        <NavLink page="analisis" icon="fa-chart-pie">Análisis</NavLink>
                        <NavLink page="reportes" icon="fa-file-alt">Reportes</NavLink>
                    </nav>
                </div>
                <div className="text-xs text-gray-500">
                    <p>&copy; 2024 Hark'ay K'anchay</p>
                    <p>Todos los derechos reservados.</p>
                </div>
            </aside>
             {/* Mobile Sidebar */}
            <div className={`fixed inset-0 bg-gray-900 z-40 p-6 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center">
                        <i className="fas fa-bolt text-3xl text-yellow-400 mr-3"></i>
                        <h1 className="text-xl font-bold tracking-wider">Hark'ay K'anchay</h1>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <nav className="space-y-3">
                     <NavLink page="dashboard" icon="fa-tachometer-alt">Dashboard</NavLink>
                    <NavLink page="simulacion" icon="fa-robot">Simulación IA</NavLink>
                    <NavLink page="analisis" icon="fa-chart-pie">Análisis</NavLink>
                    <NavLink page="reportes" icon="fa-file-alt">Reportes</NavLink>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;