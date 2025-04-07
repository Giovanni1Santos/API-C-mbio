import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [moedas, setMoedas] = useState<Record<string, string>>({});
  const [moedaDe, setMoedaDe] = useState("brl");
  const [moedaPara, setMoedaPara] = useState("usd");
  const [valor, setValor] = useState(1);
  const [resultado, setResultado] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    setCarregando(true);
    fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json"
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Falha ao carregar moedas");
        }
        return res.json();
      })
      .then((data) => setMoedas(data))
      .catch((err) => {
        console.error("Erro ao buscar moedas:", err);
        setErro("Erro ao carregar lista de moedas: " + err.message);
      })
      .finally(() => setCarregando(false));
  }, []);

  const converterMoeda = () => {
    if (!valor || valor <= 0) {
      setErro("Por favor, insira um valor válido");
      return;
    }

    setCarregando(true);
    setErro("");
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${moedaDe}.json`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Falha na resposta da API");
        }
        return res.json();
      })
      .then((data) => {
        if (data[moedaDe] && data[moedaDe][moedaPara]) {
          const resultadoConvertido = valor * data[moedaDe][moedaPara];
          setResultado(resultadoConvertido);
        } else {
          throw new Error("Conversão não disponível para este par de moedas");
        }
      })
      .catch((err) => {
        console.error("Erro ao converter:", err);
        setErro("Erro na conversão: " + err.message);
        setResultado(null);
      })
      .finally(() => setCarregando(false));
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Conversor de Moedas</h1>

      <div style={{ marginBottom: "15px" }}>
        <label>De: </label>
        <select
          value={moedaDe}
          onChange={(e) => setMoedaDe(e.target.value)}
          style={{ padding: "5px", marginLeft: "10px" }}
        >
          {Object.entries(moedas).map(([code, name]) => (
            <option key={code} value={code}>
              {code.toUpperCase()} - {name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Para: </label>
        <select
          value={moedaPara}
          onChange={(e) => setMoedaPara(e.target.value)}
          style={{ padding: "5px", marginLeft: "10px" }}
        >
          {Object.entries(moedas).map(([code, name]) => (
            <option key={code} value={code}>
              {code.toUpperCase()} - {name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Valor: </label>
        <input
          type="number"
          value={valor}
          min="0"
          step="0.01"
          onChange={(e) => setValor(Number(e.target.value))}
          style={{ padding: "5px", marginLeft: "10px" }}
        />
      </div>

      <button
        onClick={converterMoeda}
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
          Resultado: {resultado.toFixed(2)} {moedaPara.toUpperCase()}
        </h2>
      )}
    </div>
  );
}

export default App;
