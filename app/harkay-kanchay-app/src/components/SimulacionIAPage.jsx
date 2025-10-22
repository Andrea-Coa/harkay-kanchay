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
    ArcElement,
  } from 'chart.js';
  import { Line, Doughnut } from 'react-chartjs-2';
  
  // --- Register Chart.js components ---
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
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
        const today = new Date('2025-10-22');
        today.setHours(7, 0, 0, 0)
        
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const historicalStartDate = formatDate(today);
        const predictionStartDate = formatDate(today); // For generacion
        
        // --- MODIFICATION: Create a full datetime object for the demanda prediction ---
        // We use toISOString() to get the YYYY-MM-DDTHH:MM:SS.sssZ format,
        // which FastAPI automatically understands.
        const predictionStartDateTime = today.toISOString();


        try {
            const [
                demandaHistRes, generacionHistRes,
                demandaPredRes, generacionPredRes
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/demanda/?start_date=${historicalStartDate}&num_days=30`),
                fetch(`${API_BASE_URL}/generacion/?start_date=${historicalStartDate}&num_days=30`),
                // --- MODIFICATION: Update the demanda prediction fetch call ---
                fetch(`${API_BASE_URL}/predict/demanda/?start_datetime=${predictionStartDateTime}`),
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
            
            // --- Process Data ---
            const todayDateStr = formatDate(today); // "2025-10-22"

            // --- Process Historical Demand ---
            let todayHistDemandValue = 0;
            const pastHistDemandMap = {};
            demandaHistData.forEach(item => {
                const date = item.fecha_hora.split('T')[0];
                const value = parseFloat(item.demanda) || 0;
                if (date === todayDateStr) {
                    todayHistDemandValue += value;
                } else {
                    pastHistDemandMap[date] = (pastHistDemandMap[date] || 0) + value;
                }
            });
            const processedDemandaHist = Object.entries(pastHistDemandMap).map(([date, value]) => ({ fecha: date, demanda: value }));

            // --- Process Predicted Demand ---
            // Find the last day in the prediction set to exclude it
            const allDemandPredDates = [...new Set(demandaPredData.map(d => d.fecha_hora.split('T')[0]))].sort();
            const maxDemandPredDate = allDemandPredDates.length > 0 ? allDemandPredDates[allDemandPredDates.length - 1] : null;

            // Aggregate predictions, skipping the last day
            const futurePredDemandMap = {};
            demandaPredData.forEach(item => {
                const date = item.fecha_hora.split('T')[0];
                if (date === maxDemandPredDate) {
                    return; // Skip data from the last day
                }
                futurePredDemandMap[date] = (futurePredDemandMap[date] || 0) + (parseFloat(item.prediccion) || 0);
            });

            // Combine "today's" historical and predicted values
            const todayPredDemandValue = futurePredDemandMap[todayDateStr] || 0;
            // const combinedTodayDemand = todayHistDemandValue + todayPredDemandValue;
            const combinedTodayDemand =  todayHistDemandValue;

            
            // Set the combined value for "today" in the prediction map
            if (todayHistDemandValue > 0 || todayPredDemandValue > 0) {
                 futurePredDemandMap[todayDateStr] = combinedTodayDemand;
            }

            // Convert prediction map to final array
            const processedDemandaPred = Object.entries(futurePredDemandMap).map(([date, value]) => ({ fecha: date, prediccion: value }));

            
            // --- Process Historical Generation ---
            let todayHistGenValue = 0;
            const pastHistGenMap = {};
            generacionHistData.forEach(item => {
                const date = item.fecha;
                const value = parseFloat(item.generacion) || 0;
                if (date === todayDateStr) {
                    todayHistGenValue += value;
                } else {
                    pastHistGenMap[date] = (pastHistGenMap[date] || 0) + value;
                }
            });
            const processedGeneracionHist = Object.entries(pastHistGenMap).map(([date, value]) => ({ fecha: date, generacion: value }));

            // --- Process Predicted Generation ---
            // Find the last day to exclude it
            const allGenPredDates = [...new Set(generacionPredData.map(d => d.fecha))].sort();
            const maxGenPredDate = allGenPredDates.length > 0 ? allGenPredDates[allGenPredDates.length - 1] : null;

            // Aggregate predictions (by day for line chart, by type for donut)
            const futurePredGenMap = {};
            const generationByType = {};
            generacionPredData.forEach(item => {
                const date = item.fecha;
                if (date === maxGenPredDate) {
                    return; // Skip data from the last day
                }
                
                const value = parseFloat(item.prediccion) || 0;
                
                // For line chart (total per day)
                futurePredGenMap[date] = (futurePredGenMap[date] || 0) + value;

                // For donut chart (total per type, across all valid days)
                const type = item.tipo;
                const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
                generationByType[capitalizedType] = (generationByType[capitalizedType] || 0) + value;
            });

            // Combine "today's" historical and predicted values
            const todayPredGenValue = futurePredGenMap[todayDateStr] || 0;
            // const combinedTodayGen = todayHistGenValue + todayPredGenValue;
            const combinedTodayGen = todayHistGenValue;

            // Set the combined value for "today" in the prediction map
             if (todayHistGenValue > 0 || todayPredGenValue > 0) {
                futurePredGenMap[todayDateStr] = combinedTodayGen;
             }

            // Convert prediction map to final array
            const processedGeneracionPred = Object.entries(futurePredGenMap).map(([date, value]) => ({ fecha: date, prediccion: value }));
            

            setSimData({
                demanda: {
                    historical: processedDemandaHist,
                    prediction: processedDemandaPred 
                },
                generacion: {
                    historical: processedGeneracionHist,
                    prediction: processedGeneracionPred,
                    predictionByType: generationByType
                }
            });

        } catch (err) {
            setError(err.message);
            console.error("--- SIMULATION FETCH ERROR ---", err);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Chart Configurations (unchanged) ---
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
                // --- FIX: Map the aggregated data, using d.fecha ---
                data: simData.demanda.prediction.map(d => ({ x: new Date(d.fecha).getTime(), y: d.prediccion })),
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
            borderColor: '#1f2937',
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
                    {loading ? 'Procesando Simulación...' : 'Ejecutar Simulación IA'}
                </button>
            </div>

            {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-6">{error}</div>}

            {simData && (
                 <div className="space-y-8">
                    <div className="bg-gray-700/50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">Pronóstico de Demanda Eléctrica</h3>
                        <div className="h-96">
                            <Line options={lineChartOptions} data={demandaChartData} />
                        </div>
                    </div>
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