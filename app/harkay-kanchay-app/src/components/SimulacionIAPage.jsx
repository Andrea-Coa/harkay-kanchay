import React, { useState } from 'react';
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
    ArcElement, // <-- MODIFICATION: Added for Donut Chart
  } from 'chart.js';
  import { Line, Doughnut } from 'react-chartjs-2'; // <-- MODIFICATION: Added Doughnut
  
  // --- Register Chart.js components ---
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement // <-- MODIFICATION: Register ArcElement
  );
  

// --- Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8000';

// --- Helper Functions ---
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const SimulacionIAPage = () => {
    const [simData, setSimData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRunSimulation = async () => {
        setLoading(true);
        setError(null);
        if(simData) setSimData(null);

        // Using a fixed date for consistent mock data fetching
        const today = new Date('2023-01-01');
        
        const thirtyDaysAgo = new Date(today); // Clone date
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const startDate = formatDate(thirtyDaysAgo);
        const predictionStartDate = formatDate(today);


        try {
            const [
                demandaHistRes, generacionHistRes,
                demandaPredRes, generacionPredRes
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/demanda/?start_date=${startDate}&num_days=30`),
                fetch(`${API_BASE_URL}/generacion/?start_date=${startDate}&num_days=30`),
                fetch(`${API_BASE_URL}/predict/demanda/?start_date=${predictionStartDate}`),
                fetch(`${API_BASE_URL}/predict/generacion/?start_date=${predictionStartDate}`),
            ]);

            const responses = [
                { name: 'Demanda Histórica', res: demandaHistRes },
                { name: 'Generación Histórica', res: generacionHistRes },
                { name: 'Predicción Demanda', res: demandaPredRes },
                { name: 'Predicción Generación', res: generacionPredRes }
            ];

            for (const { name, res } of responses) {
                if (!res.ok) {
                    const errorText = await res.text().catch(() => 'Could not read error body.');
                    throw new Error(`API Error (${name}): ${res.status} ${res.statusText}. Details: ${errorText}`);
                }
            }

            const demandaHistData = await demandaHistRes.json();
            const generacionHistData = await generacionHistRes.json();
            const demandaPredData = await demandaPredRes.json();
            const generacionPredData = await generacionPredRes.json();
            
            // --- Process Historical Data (no changes needed here) ---
            const dailyDemand = demandaHistData.reduce((acc, item) => {
                const date = item.fecha_hora.split('T')[0];
                acc[date] = (acc[date] || 0) + parseFloat(item.demanda);
                return acc;
            }, {});
            const processedDemandaHist = Object.entries(dailyDemand).map(([date, value]) => ({ fecha: date, demanda: value }));

            const dailyGeneration = generacionHistData.reduce((acc, item) => {
                const date = item.fecha;
                acc[date] = (acc[date] || 0) + parseFloat(item.generacion);
                return acc;
            }, {});
            const processedGeneracionHist = Object.entries(dailyGeneration).map(([date, value]) => ({ fecha: date, generacion: value }));
            
            // --- MODIFICATION: Process Generation Prediction Data ---

            // 1. Aggregate daily generation totals for the Line Chart
            const dailyGenerationPred = generacionPredData.reduce((acc, item) => {
                const date = item.fecha;
                acc[date] = (acc[date] || 0) + parseFloat(item.prediccion);
                return acc;
            }, {});
            const processedGeneracionPred = Object.entries(dailyGenerationPred).map(([date, value]) => ({ fecha: date, prediccion: value }));

            // 2. Aggregate generation by type for the Donut Chart
            const generationByType = generacionPredData.reduce((acc, item) => {
                const type = item.tipo;
                // Capitalize first letter for display
                const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
                acc[capitalizedType] = (acc[capitalizedType] || 0) + parseFloat(item.prediccion);
                return acc;
            }, {});


            setSimData({
                demanda: {
                    historical: processedDemandaHist,
                    prediction: demandaPredData
                },
                generacion: {
                    historical: processedGeneracionHist,
                    prediction: processedGeneracionPred, // Use aggregated daily data
                    predictionByType: generationByType // Store new data for donut chart
                }
            });

        } catch (err) {
            setError(err.message);
            console.error("--- SIMULATION FETCH ERROR ---", err);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Chart Configurations ---
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { 
                type: 'linear',
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { 
                    color: 'rgba(255, 255, 255, 0.7)',
                    callback: value => new Date(value).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: { 
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: 'rgba(255, 255, 255, 0.7)' }
            }
        },
        plugins: {
            legend: { labels: { color: 'rgba(255, 255, 255, 0.9)' } },
            tooltip: { 
                callbacks: {
                    title: tooltipItems => new Date(tooltipItems[0].parsed.x).toLocaleDateString('es-PE', { dateStyle: 'long' })
                }
            }
        }
    };

    const donutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: 'rgba(255, 255, 255, 0.9)',
                    padding: 20,
                    font: { size: 14 }
                }
            }
        },
        cutout: '60%'
    };

    // --- Chart Data Definitions ---
    const demandaChartData = simData ? {
        datasets: [
            {
                label: 'Demanda Histórica (MWh)',
                data: simData.demanda.historical.map(d => ({ x: new Date(d.fecha).getTime(), y: d.demanda })),
                borderColor: '#3b82f6',
            },
            {
                label: 'Predicción Demanda (MWh)',
                data: simData.demanda.prediction.map(d => ({ x: new Date(d.fecha_hora).getTime(), y: d.prediccion })),
                borderColor: '#10b981',
                borderDash: [5, 5],
            }
        ]
    } : { datasets: [] };
    
    const generacionChartData = simData ? {
        datasets: [
            {
                label: 'Generación Histórica (MWh)',
                data: simData.generacion.historical.map(d => ({ x: new Date(d.fecha).getTime(), y: d.generacion })),
                borderColor: '#f97316',
            },
            {
                label: 'Predicción Generación (MWh)',
                data: simData.generacion.prediction.map(d => ({ x: new Date(d.fecha).getTime(), y: d.prediccion })),
                borderColor: '#ec4899',
                borderDash: [5, 5],
            }
        ]
    } : { datasets: [] };

    const generacionDonutData = simData ? {
        labels: Object.keys(simData.generacion.predictionByType),
        datasets: [{
            data: Object.values(simData.generacion.predictionByType),
            backgroundColor: ['#34d399', '#f87171', '#60a5fa', '#facc15'],
            borderColor: '#1f2937', // bg-gray-800
            borderWidth: 3,
            hoverOffset: 4
        }]
    } : { labels: [], datasets: [] };

    return (
        <div className="text-white">
            <h2 className="text-3xl font-bold mb-2">Simulación con Inteligencia Artificial</h2>
            <p className="text-gray-400 mb-6">Ejecute un pronóstico de 30 días para la demanda y generación eléctrica.</p>
            
            <div className="bg-gray-700/50 p-6 rounded-lg mb-6">
                <button 
                    onClick={handleRunSimulation} 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-lg"
                >
                    {/* Button content (loading/default state) */}
                    {loading ? 'Procesando Simulación...' : 'Ejecutar Simulación IA'}
                </button>
            </div>

            {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-6">{error}</div>}

            {simData && (
                 <div className="space-y-8">
                    {/* Demanda Chart */}
                    <div className="bg-gray-700/50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">Pronóstico de Demanda Eléctrica</h3>
                        <div className="h-96">
                            <Line options={lineChartOptions} data={demandaChartData} />
                        </div>
                    </div>
                    {/* MODIFICATION: Generation Charts in a Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-gray-700/50 p-6 rounded-lg">
                           <h3 className="text-xl font-semibold mb-4">Pronóstico de Generación Eléctrica (Total Diario)</h3>
                           <div className="h-96">
                                <Line options={lineChartOptions} data={generacionChartData} />
                           </div>
                       </div>
                       <div className="bg-gray-700/50 p-6 rounded-lg">
                           <h3 className="text-xl font-semibold mb-4">Distribución de Generación</h3>
                           <div className="h-96">
                                <Doughnut options={donutChartOptions} data={generacionDonutData} />
                           </div>
                       </div>
                   </div>
                </div>
            )}
        </div>
    );
};

export default SimulacionIAPage;
