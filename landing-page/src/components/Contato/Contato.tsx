import { useState, type FormEvent } from "react";
import { CONTACT_EMAIL } from "../../data/links";
import { useReveal } from "../../hooks/useReveal";
import "./Contato.css";

function Contato() {
  const sectionRef = useReveal<HTMLElement>();
  const [status, setStatus] = useState("");
  const [enviando, setEnviando] = useState(false);

  // O envio usa o FormSubmit (formsubmit.co): ele recebe os campos e repassa por e-mail
  // para o endereço da equipe (VITE_CONTACT_EMAIL). Não precisa de servidor próprio.
  const enviarDuvida = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!CONTACT_EMAIL) {
      setStatus("O formulário está pronto, mas falta configurar o e-mail que receberá as mensagens.");
      return;
    }

    const form = event.currentTarget;
    const dados = new FormData(form);
    // campo escondido: pessoas não preenchem, robôs sim
    if (dados.get("_honey")) return;

    setEnviando(true);
    setStatus("Enviando sua mensagem...");

    try {
      const resposta = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "PASI: nova mensagem pelo formulário de contato",
          _template: "table",
          _captcha: "false",
          Nome: dados.get("nome"),
          "E-mail para retorno": dados.get("email"),
          Assunto: (form.elements.namedItem("assunto") as HTMLSelectElement).selectedOptions[0].text,
          Mensagem: dados.get("mensagem"),
          email: dados.get("email"),
        }),
      });
      const resultado = await resposta.json().catch(() => ({}));

      if (!resposta.ok || resultado.success === "false" || resultado.success === false) {
        throw new Error(resultado.message || "falha no envio");
      }

      form.reset();
      setStatus("Mensagem enviada! A equipe do PASI vai responder no e-mail que você informou.");
    } catch {
      setStatus("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section ref={sectionRef} className="contato" id="contato" aria-labelledby="contato-titulo">
      <div className="container contato-grid">
        <div className="contato-intro reveal">
          <span className="section-tag">Conversa aberta</span>
          <h2 className="section-headline" id="contato-titulo">
            Ficou com <span>alguma dúvida?</span>
          </h2>
          <p className="section-lead">
            Quer saber mais sobre o PASI, os perfis de acesso ou como funciona a triagem? Escreva para a equipe.
          </p>
          <div className="contato-nota">
            <i className="fa-solid fa-shield-heart" aria-hidden="true"></i>
            <p>Não envie documentos nem informações pessoais ou de saúde por este formulário.</p>
          </div>
        </div>

        <form className="contato-formulario reveal" onSubmit={enviarDuvida}>
          <input type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
          <div className="contato-formulario-intro">
            <span className="contato-formulario-icone" aria-hidden="true">
              <i className="fa-solid fa-envelope-open-text"></i>
            </span>
            <div>
              <h3>Sua mensagem</h3>
              <p>Preencha os campos e conte para a equipe como podemos ajudar.</p>
            </div>
          </div>

          <div className="contato-campos-duplos">
            <label>
              Seu nome
              <input name="nome" type="text" autoComplete="name" required />
            </label>
            <label>
              Seu e-mail
              <input name="email" type="email" autoComplete="email" required />
            </label>
          </div>

          <label>
            Assunto
            <select name="assunto" defaultValue="duvida">
              <option value="duvida">Dúvida geral</option>
              <option value="atendimento">Triagem e atendimento</option>
              <option value="profissional">Perfil profissional</option>
              <option value="acessibilidade">Acessibilidade</option>
              <option value="projeto">Sobre o projeto</option>
            </select>
          </label>

          <label>
            Como podemos ajudar?
            <textarea name="mensagem" rows={5} maxLength={1000} required></textarea>
          </label>

          <div className="contato-formulario-rodape">
            <p id="contato-status" role="status" aria-live="polite">
              {status || (CONTACT_EMAIL
                ? "Sua mensagem chega direto para a equipe do PASI."
                : "O envio será ativado quando a equipe configurar um endereço de contato.")}
            </p>
            <button className="btn btn-primary" type="submit" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar mensagem"}
              <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Contato;