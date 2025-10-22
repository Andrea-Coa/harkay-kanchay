import React, { useState, useEffect } from 'react';


const Header = ({ setMobileMenuOpen }) => (
    <header className="bg-gray-900 shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
            <button className="lg:hidden text-gray-400 hover:text-white mr-4" onClick={() => setMobileMenuOpen(true)}>
                <i className="fas fa-bars text-xl"></i>
            </button>
            <h2 className="text-lg sm:text-xl font-semibold">Inteligencia Artificial para la Seguridad Energética</h2>
        </div>
        <div className="flex items-center">
            <i className="fas fa-user-circle text-2xl text-gray-400"></i>
        </div>
    </header>
);

export default Header;