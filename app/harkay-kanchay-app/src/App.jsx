import React, { useState, useEffect, useRef } from 'react';

// --- Configuration ---
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
                // As per instructions, this page is ignored but kept for UI integrity
                return <PlaceholderPage title="Análisis de Escenarios" />;
            case 'reportes':
                 // As per instructions, this page is ignored but kept for UI integrity
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


// --- Page Components ---

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

                if (!demandaRes.ok || !generacionRes.ok) {
                    throw new Error('Error al conectar con la API del COES.');
                }

                const demandaData = await demandaRes.json();
                const generacionData = await generacionRes.json();

                setData({
                    demanda: demandaData.total_demanda,
                    generacion: generacionData.total_generacion
                });

            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch dashboard data:", err);
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
                    value={loading ? 'Cargando...' : `${formatNumber(data.demanda)} MWh`}
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

const DashboardCard = ({ title, value, icon, color }) => {
    const colors = {
        blue: 'from-blue-500 to-blue-700',
        green: 'from-green-500 to-green-700'
    };
    return (
        <div className={`bg-gradient-to-br ${colors[color]} p-6 rounded-lg shadow-lg text-white`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <i className={`fas ${icon} text-4xl opacity-30`}></i>
            </div>
        </div>
    );
};


const SimulacionIAPage = () => {
    const [simData, setSimData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const demandaChartRef = useRef(null);
    const generacionChartRef = useRef(null);

    const handleRunSimulation = async () => {
        setLoading(true);
        setError(null);
        if(simData) setSimData(null); // Clear previous results

        const today = new Date();
        const startDate = formatDate(today);
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const historyStartDate = formatDate(thirtyDaysAgo);

        try {
            // Fetch all data in parallel
            const [
                demandaHistRes, generacionHistRes,
                demandaPredRes, generacionPredRes
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/demanda/?start_date=${startDate}&num_days=30`),
                fetch(`${API_BASE_URL}/generacion/?start_date=${startDate}&num_days=30`),
                fetch(`${API_BASE_URL}/predict/demanda/?start_date=${startDate}`),
                fetch(`${API_BASE_URL}/predict/generacion/?start_date=${startDate}`),
            ]);

            if (!demandaHistRes.ok || !generacionHistRes.ok || !demandaPredRes.ok || !generacionPredRes.ok) {
                 throw new Error('Una o más de las APIs de simulación fallaron.');
            }

            const demandaHistData = await demandaHistRes.json();
            const generacionHistData = await generacionHistRes.json();
            const demandaPredData = await demandaPredRes.json();
            const generacionPredData = await generacionPredRes.json();
            
            // Process historical demanda (aggregate by day)
            const dailyDemand = demandaHistData.reduce((acc, item) => {
                const date = item.fecha_hora.split('T')[0];
                acc[date] = (acc[date] || 0) + parseFloat(item.demanda);
                return acc;
            }, {});
            const processedDemandaHist = Object.entries(dailyDemand).map(([date, value]) => ({ fecha: date, demanda: value }));

            // Process historical generacion (aggregate by day)
            const dailyGeneration = generacionHistData.reduce((acc, item) => {
                const date = item.fecha;
                acc[date] = (acc[date] || 0) + parseFloat(item.generacion);
                return acc;
            }, {});
            const processedGeneracionHist = Object.entries(dailyGeneration).map(([date, value]) => ({ fecha: date, generacion: value }));

            setSimData({
                demanda: {
                    historical: processedDemandaHist,
                    prediction: demandaPredData
                },
                generacion: {
                    historical: processedGeneracionHist,
                    prediction: generacionPredData
                }
            });

        } catch (err) {
            setError(err.message);
            console.error("Failed to run simulation:", err);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (!simData) return;

        // --- Cleanup previous charts ---
        if (demandaChartRef.current) demandaChartRef.current.destroy();
        if (generacionChartRef.current) generacionChartRef.current.destroy();

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { 
                    type: 'time',
                    time: { unit: 'day' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' }
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
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            }
        };

        // --- Create Demanda Chart ---
        const demandaCtx = document.getElementById('demandaPredictionChart').getContext('2d');
        demandaChartRef.current = new Chart(demandaCtx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Demanda Histórica (MWh)',
                        data: simData.demanda.historical.map(d => ({ x: d.fecha, y: d.demanda })),
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f6',
                        tension: 0.1
                    },
                    {
                        label: 'Predicción Demanda (MWh)',
                        data: simData.demanda.prediction.map(d => ({ x: d.fecha_hora.split('T')[0], y: d.prediccion })),
                        borderColor: '#10b981',
                        backgroundColor: '#10b981',
                        borderDash: [5, 5],
                        tension: 0.1
                    }
                ]
            },
            options: chartOptions
        });

        // --- Create Generación Chart ---
        const generacionCtx = document.getElementById('generacionPredictionChart').getContext('2d');
        generacionChartRef.current = new Chart(generacionCtx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Generación Histórica (MWh)',
                        data: simData.generacion.historical.map(d => ({ x: d.fecha, y: d.generacion })),
                        borderColor: '#f97316',
                        backgroundColor: '#f97316',
                        tension: 0.1
                    },
                    {
                        label: 'Predicción Generación (MWh)',
                        data: simData.generacion.prediction.map(d => ({ x: d.fecha, y: d.prediccion })),
                        borderColor: '#ec4899',
                        backgroundColor: '#ec4899',
                        borderDash: [5, 5],
                        tension: 0.1
                    }
                ]
            },
            options: chartOptions
        });
        
        return () => {
             if (demandaChartRef.current) demandaChartRef.current.destroy();
             if (generacionChartRef.current) generacionChartRef.current.destroy();
        }

    }, [simData]);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-2">Simulación con Inteligencia Artificial</h2>
            <p className="text-gray-400 mb-6">Ejecute un pronóstico de 30 días para la demanda y generación eléctrica basado en el día actual.</p>
            
            <div className="bg-gray-700/50 p-6 rounded-lg mb-6">
                <button 
                    onClick={handleRunSimulation} 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-lg"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando Simulación...
                        </>
                    ) : (
                        <><i className="fas fa-play mr-2"></i> Ejecutar Simulación IA</>
                    )}
                </button>
            </div>

            {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-6">{error}</div>}

            {simData && (
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="bg-gray-700/50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">Pronóstico de Demanda Eléctrica</h3>
                        <div className="h-96">
                            <canvas id="demandaPredictionChart"></canvas>
                        </div>
                    </div>
                     <div className="bg-gray-700/50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">Pronóstico de Generación Eléctrica</h3>
                        <div className="h-96">
                            <canvas id="generacionPredictionChart"></canvas>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const PlaceholderPage = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <i className="fas fa-tools text-6xl text-gray-500 mb-4"></i>
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-gray-400 max-w-md">Esta sección se encuentra en desarrollo. Vuelva pronto para descubrir nuevas funcionalidades de análisis y reportes energéticos.</p>
    </div>
);
