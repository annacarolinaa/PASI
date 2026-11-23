import { useEffect, useRef, useState } from "react";
import { useReveal } from "../../hooks/useReveal";
import "./Acessibilidade.css";

const recursos = [
  {
    icon: "fa-volume-high",
    titulo: "Leitura em voz alta",
    texto: "Recurso previsto para ler as telas em voz alta, apoiando quem não lê ou tem pouca familiaridade com a leitura.",
    selo: "Previsto no projeto",
  },
  {
    icon: "fa-layer-group",
    titulo: "Uma etapa por vez",
    texto: "Formulários longos divididos em várias telas, para a pessoa não se cansar nem se perder.",
  },
  {
    icon: "fa-bell",
    titulo: "Feedback visual e sonoro",
    texto: "Sinais visuais e sonoros que confirmam cada ação e reforçam a inclusão.",
  },
  {
    icon: "fa-table-cells-large",
    titulo: "Informação clara",
    texto: "Listas, cards e categorias com hierarquia visual simples, fáceis de entender.",
  },
  {
    icon: "fa-mobile-screen",
    titulo: "Em diferentes celulares",
    texto: "Uma interface responsiva e multiplataforma, com a mesma experiência em sistemas diferentes.",
  },
  {
    icon: "fa-hands-holding",
    titulo: "Com apoio na unidade",
    texto: "A triagem também pode ser feita presencialmente, com o profissional registrando tudo no PASI.",
  },
];

const ondas = [8, 14, 10, 18, 12, 20, 9, 16, 11, 19, 13, 8, 15, 10];

function Acessibilidade() {
  const sectionRef = useReveal<HTMLElement>();
  const textoRef = useRef<HTMLDivElement | null>(null);
  const listaRef = useRef<HTMLUListElement | null>(null);
  const [lendo, setLendo] = useState(false);
  const suportado = typeof window !== "undefined" && "speechSynthesis" in window;

  // ao sair da página, a leitura para
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const alternarLeitura = () => {
    if (!suportado) return;
    if (lendo) {
      window.speechSynthesis.cancel();
      setLendo(false);
      return;
    }
    const texto = [textoRef.current?.innerText, listaRef.current?.innerText]
      .filter(Boolean)
      .join(". ")
      .replace(/Ouvir esta seção|Parar leitura/g, "");
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.onend = () => setLendo(false);
    fala.onerror = () => setLendo(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(fala);
    setLendo(true);
  };

  return (
    <section ref={sectionRef} className="acessibilidade" id="acessibilidade" aria-labelledby="acessibilidade-titulo">
      <div className="container acessibilidade-grid">
        <div className="acessibilidade-intro reveal" ref={textoRef}>
          <span className="section-tag">Acessibilidade</span>
          <h2 className="section-display" id="acessibilidade-titulo">
            ninguém <span>fica de fora.</span>
          </h2>
          <p className="section-lead">
            Muitas pessoas que procuram o CRAS, o CAPS e o CREAS são idosas, crianças ou têm
            pouco contato com a leitura e com a tecnologia. Por isso, a acessibilidade faz parte
            do PASI desde o começo.
          </p>
          {suportado && (
            <button
              type="button"
              className={`ouvir-tela ${lendo ? "is-lendo" : ""}`}
              onClick={alternarLeitura}
              aria-pressed={lendo}
            >
              <span className="ouvir-tela-icone" aria-hidden="true">
                <i className={`fa-solid ${lendo ? "fa-stop" : "fa-volume-high"}`}></i>
              </span>
              <span>
                <strong>{lendo ? "Parar leitura" : "Ouvir esta seção"}</strong>
                <span className="ouvir-tela-onda" aria-hidden="true">
                  {ondas.map((altura, i) => (
                    <i key={i} style={{ "--i": i, height: altura } as React.CSSProperties}></i>
                  ))}
                </span>
              </span>
            </button>
          )}
        </div>

        <ul className="acessibilidade-lista reveal" ref={listaRef}>
          {recursos.map((recurso) => (
            <li key={recurso.titulo}>
              <span className="icon-tile" aria-hidden="true">
                <i className={`fa-solid ${recurso.icon}`}></i>
              </span>
              <div>
                <h3>
                  {recurso.titulo}
                  {recurso.selo && <span className="acessibilidade-selo">{recurso.selo}</span>}
                </h3>
                <p>{recurso.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Acessibilidade;
