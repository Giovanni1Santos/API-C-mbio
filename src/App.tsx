import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import "./App.css";
import { getCambio, getMoedas } from "./cambio";
import MoedaSelectOptions from "./MoedaSelect";

function App() {
  const [moedas, setMoedas] = useState<Record<string, string>>({});
  const [moedaDe, setMoedaDe] = useState("brl");
  const [moedaPara, setMoedaPara] = useState("usd");
  const [valor, setValor] = useState(1);
  const [valorInput, setValorInput] = useState("1");
  const [resultado, setResultado] = useState<number | null>(null);
  const [resultadoMoeda, setResultadoMoeda] = useState<string>("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    setCarregando(true);
    getMoedas()
      .then((data) => setMoedas(data))
      .catch((err) => {
        console.error("Erro ao buscar moedas:", err);
        setErro("Erro ao carregar lista de moedas: " + err.message);
      })
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    const valorNum = Number(valor);
    if (isNaN(valorNum) || valorNum < 0) {
      setErro("Por favor, insira um valor válido");
      return;
    }

    setCarregando(true);
    setErro("");

    getCambio(moedaDe, moedaPara)
      .then((cambio) => {
        if (cambio === undefined) {
          throw new Error("Falha ao carregar câmbio");
        }
        const resultadoConvertido = valorNum * cambio;
        setResultado(resultadoConvertido);
        setResultadoMoeda(moedaPara);
      })
      .catch((err) => {
        console.error("Erro ao converter:", err);
        setErro("Erro na conversão: " + err.message);
        setResultado(null);
        setResultadoMoeda("");
      })
      .finally(() => setCarregando(false));
  }, [moedaDe, moedaPara, valor]);

  const _setValorDebounced = useDebouncedCallback((valor: string) => {
    const valorNum = Number(valor);
    if (isNaN(valorNum) || valorNum < 0) {
      setErro("Por favor, insira um valor válido");
      return;
    }
    setValor(valorNum);
  }, 400);
  const setValorDebounced = (valor: string) => {
    setCarregando(true);
    setErro("");
    _setValorDebounced(valor);
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Conversor de Moedas</h1>

      <div style={{ marginBottom: "15px" }}>
        <label>De: </label>
        <select
          value={moedaDe}
          onChange={(e) => {
            setMoedaDe(e.target.value);
          }}
          style={{ padding: "5px", marginLeft: "10px" }}
        >
          <MoedaSelectOptions moedas={moedas} />
        </select>
      </div>

      <button
        onClick={() => {
          const tmp = moedaPara;
          setMoedaPara(moedaDe);
          setMoedaDe(tmp);
        }}
      >
        Trocar
      </button>

      <div style={{ marginBottom: "15px" }}>
        <label>Para: </label>
        <select
          value={moedaPara}
          onChange={(e) => {
            setMoedaPara(e.target.value);
          }}
          style={{ padding: "5px", marginLeft: "10px" }}
        >
          <MoedaSelectOptions moedas={moedas} />
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Valor: </label>
        <input
          type="number"
          value={valorInput}
          min="0"
          step="0.01"
          onChange={(e) => {
            setValorInput(e.target.value);
            setValorDebounced(e.target.value);
          }}
          style={{ padding: "5px", marginLeft: "10px" }}
        />
      </div>

      <button
        // onClick={converterMoeda}
        disabled={carregando}
        style={{
          padding: "10px 15px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {carregando ? "Convertendo..." : "Converter"}
      </button>

      {erro && <p style={{ color: "red", marginTop: "15px" }}>{erro}</p>}

      {resultado !== null && !erro && (
        <h2 style={{ marginTop: "20px" }}>
          Resultado: {resultado.toFixed(5)} {resultadoMoeda.toUpperCase()}
        </h2>
      )}
    </div>
  );
}

export default App;
