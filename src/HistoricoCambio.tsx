// Importa os hooks useState e useEffect do React
import React, { useState, useEffect } from "react";
// Importa a função getHistoricoPeriodo que busca os dados históricos de câmbio
import { getHistoricoPeriodo } from "./cambio";

// Define as props que o componente HistoricoCambio irá receber
interface HistoricoProps {
  moedaDe: string;     // Moeda de origem (ex: USD)
  moedaPara: string;   // Moeda de destino (ex: BRL)
}

// Define o formato dos dados históricos que serão recebidos
interface DadoHistorico {
  date: string;         // Data da taxa de câmbio
  taxa: number | null;  // Valor da taxa de câmbio (ou null se não disponível)
  erro?: string;        // Mensagem de erro opcional
}

// Componente principal HistoricoCambio
const HistoricoCambio: React.FC<HistoricoProps> = ({ moedaDe, moedaPara }) => {
  // Estado que armazena os dados históricos de câmbio
  const [dados, setDados] = useState<DadoHistorico[]>([]);
  // Estado para indicar se está carregando os dados
  const [carregando, setCarregando] = useState(false);
  // Estado que armazena uma mensagem de erro, se houver
  const [erro, setErro] = useState("");
  // Estado que define o número de dias do histórico a ser buscado
  const [dias, setDias] = useState(7);

  // Hook useEffect que executa quando moedaDe, moedaPara ou dias mudam
  useEffect(() => {
    // Se moedaDe ou moedaPara estiverem vazios, não faz nada
    if (!moedaDe || !moedaPara) return;

    // Função assíncrona para buscar os dados do histórico
    const fetchHistorico = async () => {
      setCarregando(true);   // Define que os dados estão sendo carregados
      setErro("");           // Limpa erros anteriores

      try {
        // Chama a função que busca os dados históricos
        const resultados = await getHistoricoPeriodo(moedaDe, moedaPara, dias);
        // Armazena os dados recebidos no estado
        setDados(resultados);

        // Verifica se algum item retornou com erro
        const temErros = resultados.some(item => item.erro);
        if (temErros) {
          // Define uma mensagem de erro genérica
          setErro("Algumas datas não puderam ser carregadas");
        }
      } catch (err) {
        // Se ocorrer erro na requisição, exibe mensagem no console e na interface
        console.error("Erro ao buscar histórico:", err);
        setErro("Erro ao carregar histórico de câmbio");
        setDados([]); // Limpa os dados anteriores em caso de erro
      } finally {
        // Define que terminou o carregamento
        setCarregando(false);
      }
    };

    // Executa a função que busca o histórico
    fetchHistorico();
  }, [moedaDe, moedaPara, dias]); // Executa sempre que moedaDe, moedaPara ou dias mudam

  // Renderização do componente
  return (
    <div style={{ marginTop: "30px", borderTop: "1px solid #ccc", paddingTop: "20px" }}>
      <h3>Histórico de Câmbio</h3>

      {/* Seletor para mudar o período de dias */}
      <div style={{ marginBottom: "15px" }}>
        <label>Período (dias): </label>
        <select
          value={dias} // Valor atual do estado "dias"
          onChange={(e) => setDias(Number(e.target.value))} // Atualiza o estado ao mudar
          style={{ padding: "5px", marginLeft: "10px" }}
        >
          <option value="7">7 dias</option>
          <option value="15">15 dias</option>
          <option value="30">30 dias</option>
        </select>
      </div>

      {/* Exibe mensagem de carregamento */}
      {carregando && <p>Carregando histórico...</p>}
      {/* Exibe mensagem de erro, se houver */}
      {erro && <p style={{ color: "red" }}>{erro}</p>}

      {/* Exibe tabela apenas se houver dados */}
      {dados.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Data</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Taxa ({moedaDe.toUpperCase()} → {moedaPara.toUpperCase()})
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Percorre cada item do histórico e exibe na tabela */}
              {dados.map((item) => (
                <tr key={item.date}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.date}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {/* Exibe a taxa formatada ou "N/A" se for nula */}
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

// Exporta o componente para ser usado em outros lugares
export default HistoricoCambio;
