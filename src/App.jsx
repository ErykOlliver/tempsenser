import { useState, useEffect } from 'react';
import { ref, onValue, getDatabase } from "firebase/database";
import { app } from '../firebase';

const db = getDatabase(app);

function App() {
  const [temperaturaAtual, setTemperaturaAtual] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [status, setStatus] = useState('');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState('');

  useEffect(() => {
    // Listener para temperatura atual
    const tempAtualRef = ref(db, "sensores/temperatura/atual");
    const unsubscribeAtual = onValue(tempAtualRef, (snapshot) => {
      const data = snapshot.val();
      setTemperaturaAtual(data);
    });

    // Listener para histórico
    const historicoRef = ref(db, "sensores/temperatura/historico");
    const unsubscribeHistorico = onValue(historicoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.entries(data).map(([timestamp, value]) => ({
          timestamp: timestamp,
          temperatura: typeof value === 'object' ? value.temperatura : value,
          data: typeof value === 'object' && value.data ? value.data : new Date(parseInt(timestamp)).toLocaleString(),
        }));
        // Ordena por timestamp (mais recente primeiro)
        items.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
        setHistorico(items.slice(0, 10)); // Pega apenas os 10 mais recentes
      } else {
        setHistorico([]);
      }
    });

    // Listener para status
    const statusRef = ref(db, "sensores/status");
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      setStatus(data || 'offline');
    });

    // Listener para última atualização
    const ultimaAtualizacaoRef = ref(db, "sensores/ultima_atualizacao");
    const unsubscribeUltima = onValue(ultimaAtualizacaoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUltimaAtualizacao(new Date(data).toLocaleString());
      }
    });

    // Limpa os listeners quando o componente desmonta
    return () => {
      unsubscribeAtual();
      unsubscribeHistorico();
      unsubscribeStatus();
      unsubscribeUltima();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">
          🌡️ Monitor de Temperatura
        </h1>

        {/* Card Temperatura Atual */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Temperatura Atual</h2>
            {temperaturaAtual !== null ? (
              <div className="text-6xl font-bold text-blue-600 mb-4">
                {temperaturaAtual.toFixed(1)}°C
              </div>
            ) : (
              <div className="text-4xl text-gray-400 mb-4">
                Carregando...
              </div>
            )}
            
            <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
              <span className={`px-3 py-1 rounded-full font-medium ${
                status === 'online' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {status === 'online' ? '🟢 Online' : '🔴 Offline'}
              </span>
              {ultimaAtualizacao && (
                <span className="text-gray-500">
                  Última atualização: {ultimaAtualizacao}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Histórico de Temperaturas</h2>
          
          {historico.length > 0 ? (
            <div className="space-y-3">
              {historico.map((item, index) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {typeof item.temperatura === 'number' ? item.temperatura.toFixed(1) : item.temperatura}°C
                    </span>
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium">
                        {item.data}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {item.horario}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-gray-400">
                      #{index + 1}
                    </div>
                    <div className="text-xs text-gray-300">
                      {new Date(item.timestamp).toLocaleString('pt-BR', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-4">📊</div>
              <p>Nenhum dado de histórico encontrado</p>
            </div>
          )}
        </div>

        {/* Estatísticas rápidas */}
        {historico.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Estatísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.max(...historico.map(h => parseFloat(h.temperatura))).toFixed(1)}°C
                </div>
                <div className="text-sm text-gray-600">Máxima</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {(historico.reduce((acc, h) => acc + parseFloat(h.temperatura), 0) / historico.length).toFixed(1)}°C
                </div>
                <div className="text-sm text-gray-600">Média</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.min(...historico.map(h => parseFloat(h.temperatura))).toFixed(1)}°C
                </div>
                <div className="text-sm text-gray-600">Mínima</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;