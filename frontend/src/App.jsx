import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3001";
const MODO_ALEATORIO = "🎲 Aleatório";

export default function App() {
  const [temas, setTemas] = useState([]);
  const [temaSelecionado, setTemaSelecionado] = useState(null);
  const [modoAleatorio, setModoAleatorio] = useState(false);

  const [cartaAtual, setCartaAtual] = useState(null);
  const [indiceDica, setIndiceDica] = useState(0);
  const [cartasUsadas, setCartasUsadas] = useState([]);
  const [pontuacaoTotal, setPontuacaoTotal] = useState(0);
  const [ultimoResultado, setUltimoResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null); // { tipo: 'acertou' | 'pular' }

  useEffect(() => {
    fetch(`${API_URL}/api/temas`)
      .then((r) => r.json())
      .then(setTemas)
      .catch(() => setErro("Não foi possível conectar ao servidor."));
  }, []);

  function sortearTema(temaAnterior = null, listaTemas = temas) {
    const disponiveis = listaTemas.filter((t) => t !== temaAnterior);
    if (disponiveis.length === 0) return listaTemas[0];
    return disponiveis[Math.floor(Math.random() * disponiveis.length)];
  }

  async function puxarCarta(tema) {
    setCarregando(true);
    setErro(null);
    setUltimoResultado(null);
    try {
      const excluir = cartasUsadas.join(",");
      const resp = await fetch(
        `${API_URL}/api/cartas/aleatoria?tema=${encodeURIComponent(tema)}&excluir=${excluir}`
      );
      if (!resp.ok) {
        setErro("Não há mais cartas restantes nesse tema.");
        setCartaAtual(null);
        return;
      }
      const carta = await resp.json();
      setCartaAtual(carta);
      setIndiceDica(0);
      setTemaSelecionado(carta.tema);
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  function escolherTema(tema) {
    setTemaSelecionado(tema);
    setModoAleatorio(false);
    setPontuacaoTotal(0);
    setCartasUsadas([]);
    puxarCarta(tema);
  }

  function escolherAleatorio() {
    setModoAleatorio(true);
    setTemaSelecionado(MODO_ALEATORIO);
    setPontuacaoTotal(0);
    setCartasUsadas([]);
    const temaInicial = sortearTema(null, temas);
    puxarCarta(temaInicial);
  }

  function proximaDica() {
    if (indiceDica < 9) setIndiceDica(indiceDica + 1);
  }

  // Abre o modal ao invés de executar direto
  function pedirConfirmacaoAcertou() {
    setConfirmacao({ tipo: "acertou" });
  }

  function pedirConfirmacaoPular() {
    setConfirmacao({ tipo: "pular" });
  }

  function cancelarConfirmacao() {
    setConfirmacao(null);
  }

  function confirmarAcao() {
    if (confirmacao.tipo === "acertou") {
      const pontos = 10 - indiceDica;
      setPontuacaoTotal((p) => p + pontos);
      setUltimoResultado({ texto: `Acertou na dica ${indiceDica + 1}!`, pontos, temaCartaAtual: cartaAtual.tema });
    } else {
      setUltimoResultado({ texto: "Carta pulada.", pontos: 0, temaCartaAtual: cartaAtual.tema });
    }
    setConfirmacao(null);
    encerrarCarta();
  }

  function encerrarCarta() {
    setCartasUsadas((prev) => [...prev, cartaAtual.id]);
    setCartaAtual(null);
  }

  function proximaCartaDepoisDoResultado() {
    if (modoAleatorio) {
      const proximoTema = sortearTema(ultimoResultado.temaCartaAtual);
      puxarCarta(proximoTema);
    } else {
      puxarCarta(temaSelecionado);
    }
  }

  function reiniciarJogo() {
    setTemaSelecionado(null);
    setModoAleatorio(false);
    setCartaAtual(null);
    setIndiceDica(0);
    setCartasUsadas([]);
    setPontuacaoTotal(0);
    setUltimoResultado(null);
    setErro(null);
    setConfirmacao(null);
  }

  // Tela 1: escolha de tema
  if (!temaSelecionado) {
    return (
      <div className="tela">
        <h1 className="titulo">Jogo de Adivinhação</h1>
        <p className="subtitulo">Escolha um tema para começar</p>
        {erro && <p className="erro">{erro}</p>}
        <div className="lista-temas">
          <button className="botao-tema botao-aleatorio" onClick={escolherAleatorio}>
            {MODO_ALEATORIO}
          </button>
          {temas.map((tema) => (
            <button key={tema} className="botao-tema" onClick={() => escolherTema(tema)}>
              {tema}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tela">
      <header className="cabecalho">
        <div className="cabecalho-tema">
          {modoAleatorio && <span className="badge-aleatorio">Aleatório</span>}
          <span className="tema-atual">{cartaAtual ? cartaAtual.tema : temaSelecionado}</span>
        </div>
        <span className="pontuacao">Pontos: {pontuacaoTotal}</span>
        <button className="botao-reiniciar" onClick={reiniciarJogo}>
          Reiniciar
        </button>
      </header>

      {carregando && <p className="carregando">Puxando carta...</p>}
      {erro && <p className="erro">{erro}</p>}

      {ultimoResultado && !cartaAtual && (
        <div className="resultado-carta">
          <p className="resultado-texto">{ultimoResultado.texto}</p>
          {ultimoResultado.pontos > 0 && (
            <p className="resultado-pontos">+{ultimoResultado.pontos} pontos</p>
          )}
          <button className="botao-primario" onClick={proximaCartaDepoisDoResultado}>
            Próxima carta
          </button>
        </div>
      )}

      {cartaAtual && (
        <div className="carta">
          <div className="carta-resposta">✅ {cartaAtual.resposta}</div>
          <div className="carta-contador">Dica {indiceDica + 1} de 10</div>
          <p className="carta-dica">{cartaAtual.dicas[indiceDica]}</p>

          <div className="carta-botoes">
            <button className="botao-secundario" onClick={proximaDica} disabled={indiceDica >= 9}>
              Próxima dica
            </button>
            <button className="botao-primario" onClick={pedirConfirmacaoAcertou}>
              Acertou
            </button>
            <button className="botao-perigo" onClick={pedirConfirmacaoPular}>
              Pular carta
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmação */}
      {confirmacao && (
        <div className="modal-overlay" onClick={cancelarConfirmacao}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {confirmacao.tipo === "acertou" ? (
              <>
                <p className="modal-titulo">O jogador acertou?</p>
                <p className="modal-subtitulo">
                  Serão adicionados <strong>{10 - indiceDica} pontos</strong> (dica {indiceDica + 1}).
                </p>
              </>
            ) : (
              <>
                <p className="modal-titulo">Pular esta carta?</p>
                <p className="modal-subtitulo">Nenhum ponto será marcado e a carta será descartada.</p>
              </>
            )}
            <div className="modal-botoes">
              <button className="botao-secundario" onClick={cancelarConfirmacao}>
                Cancelar
              </button>
              <button
                className={confirmacao.tipo === "acertou" ? "botao-primario" : "botao-perigo"}
                onClick={confirmarAcao}
              >
                {confirmacao.tipo === "acertou" ? "Sim, acertou!" : "Sim, pular"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
