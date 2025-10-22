import React, { useState, useEffect } from 'react';



const Footer = () => (
    <footer className="bg-gray-900 text-gray-400 py-6 px-8 text-sm">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div>
                    <h3 className="font-bold text-white mb-3">Hark'ay K'anchay</h3>
                    <p>Plataforma de IA para el pronóstico de demanda y generación eléctrica ante escenarios climáticos en el Perú.</p>
                </div>
                <div>
                     <h3 className="font-bold text-white mb-3">Contacto</h3>
                    <p><i className="fas fa-map-marker-alt mr-2"></i> Lima, Perú</p>
                    <p><i className="fas fa-envelope mr-2"></i> contacto@harkaykanchay.pe</p>
                </div>
                <div>
                    <h3 className="font-bold text-white mb-3">Información del Sistema</h3>
                     <p><i className="fas fa-clock mr-2"></i> Última actualización: <span id="lastUpdate">{new Date().toLocaleString('es-PE')}</span></p>
                    <p><i className="fas fa-server mr-2"></i> Versión: 2.0.0-react</p>
                </div>
            </div>
            <div className="border-t border-gray-700 mt-6 pt-6 text-center">
                <p>© 2024 Hark'ay K'anchay - Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>
);


export default Footer;