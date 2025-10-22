import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import DashboardPage from './components/DashboardPage';
import SimulacionIAPage from './components/SimulacionIAPage';

// --- Import Chart.js components ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
// NOTE: The date adapter that was causing an error has been removed.
// We will handle dates manually using timestamps.

// --- Register Chart.js components ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


// --- Main App Component ---
export default function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigateTo = (page) => {
        setCurrentPage(page);
        setMobileMenuOpen(false);
    };

    const PageContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage />;
            case 'simulacion':
                return <SimulacionIAPage />;
            case 'analisis':
                return <PlaceholderPage title="Análisis de Escenarios" />;
            case 'reportes':
                return <PlaceholderPage title="Generación de Reportes" />;
            default:
                return <DashboardPage />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
            <div className="flex flex-1">
                <Sidebar currentPage={currentPage} navigateTo={navigateTo} isMobileMenuOpen={isMobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
                <div className="flex-1 flex flex-col">
                    <Header setMobileMenuOpen={setMobileMenuOpen} />
                    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-800 overflow-y-auto">
                        <PageContent />
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    );
}


const PlaceholderPage = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <i className="fas fa-tools text-6xl text-gray-500 mb-4"></i>
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-gray-400 max-w-md">Esta sección se encuentra en desarrollo. Vuelva pronto para descubrir nuevas funcionalidades de análisis y reportes energéticos.</p>
    </div>
);

