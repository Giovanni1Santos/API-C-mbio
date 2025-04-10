import React, { useState, useEffect } from "react";
import { getHistoricoPeriodo } from "./cambio";

interface HistoricoProps {
  moedaDe: string;
  moedaPara: string;
}

interface DadoHistorico {
  date: string;
  taxa: number | null;
  erro?: string;
}

const HistoricoCambio: React.FC<HistoricoProps> = ({ moedaDe, moedaPara }) => {
  const [dados, setDados] = useState<DadoHistorico[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [dias, setDias] = useState(7);

  useEffect(() => {
    if (!moedaDe || !moedaPara) return;

    const fetchHistorico = async () => {
      setCarregando(true);
      setErro("");
      
      try {
        const resultados = await getHistoricoPeriodo(moedaDe, moedaPara, dias);
        setDados(resultados);
        
        // Verifica se há erros em algum dos resultados
        const temErros = resultados.some(item => item.erro);
        if (temErros) {
          setErro("Algumas datas não puderam ser carregadas");
        }
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        setErro("Erro ao carregar histórico de câmbio");
        setDados([]);
      } finally {
        setCarregando(false);
      }
    };

    fetchHistorico();
  }, [moedaDe, moedaPara, dias]);

  return (
    <div style={{ marginTop: "30px", borderTop: "1px solid #ccc", paddingTop: "20px" }}>
      <h3>Histórico de Câmbio</h3>
      
      <div style={{ marginBottom: "15px" }}>
        <label>Período (dias): </label>
        <select
          value={dias}
          onChange={(e) => setDias(Number(e.target.value))}
          style={{ padding: "5px", marginLeft: "10px" }}
        >
          <option value="7">7 dias</option>
          <option value="15">15 dias</option>
          <option value="30">30 dias</option>
        </select>
      </div>

      {carregando && <p>Carregando histórico...</p>}
      {erro && <p style={{ color: "red" }}>{erro}</p>}

      {dados.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Data</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Taxa ({moedaDe.toUpperCase()} → {moedaPara.toUpperCase()})</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item) => (
                <tr key={item.date}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.date}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {item.taxa !== null ? item.taxa.toFixed(6) : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoricoCambio;