import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
const API_BASE_URL = 'http://127.0.0.1:8000';

// --- Helper Functions ---
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return parseFloat(num).toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const DashboardPage = () => {
    const [data, setData] = useState({ demanda: null, generacion: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            const today = formatDate(new Date());

            try {
                const [demandaRes, generacionRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/demanda/total?target_date=${today}`),
                    fetch(`${API_BASE_URL}/generacion/total?target_date=${today}`)
                ]);

                if (!demandaRes.ok) {
                    const errorText = await demandaRes.text().catch(() => 'Could not read error body.');
                    throw new Error(`API Error (Demanda): ${demandaRes.status} ${demandaRes.statusText}. Details: ${errorText}`);
                }
                if (!generacionRes.ok) {
                    const errorText = await generacionRes.text().catch(() => 'Could not read error body.');
                    throw new Error(`API Error (Generacion): ${generacionRes.status} ${generacionRes.statusText}. Details: ${errorText}`);
                }

                const demandaData = await demandaRes.json();
                const generacionData = await generacionRes.json();

                setData({
                    demanda: demandaData.total_demanda,
                    generacion: generacionData.total_generacion
                });

            } catch (err) {
                setError(err.message);
                console.error("--- DASHBOARD FETCH ERROR ---");
                console.error("Failed to fetch dashboard data. Error details below:");
                console.error(err);
                if (err.cause) {
                    console.error("Error Cause:", err.cause);
                }
                console.error("-----------------------------");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);
    
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Dashboard Energético</h2>
            {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-6">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard 
                    title="Demanda Ejecutada (Hoy)"
                    value={loading ? 'Cargando...' : `${formatNumber(data.demanda)} MW`}
                    icon="fa-bolt"
                    color="blue"
                />
                <DashboardCard 
                    title="Generación Total (Hoy)"
                    value={loading ? 'Cargando...' : `${formatNumber(data.generacion)} MWh`}
                    icon="fa-industry"
                    color="green"
                />
            </div>
            <div className="mt-8 bg-gray-700/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Aviso Importante</h3>
                <p className="text-gray-300">La sección "Matriz de Generación" ha sido movida a la página de "Análisis" para una visualización más detallada. Utilice la Simulación IA para obtener pronósticos actualizados.</p>
            </div>
        </div>
    );
};

export default DashboardPage;
