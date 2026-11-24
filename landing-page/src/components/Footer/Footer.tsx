import { LOGO_SRC, navLinks } from "../../data/links";
import "./Footer.css";

const projetoLinks = [
  { href: "#acessibilidade", label: "Acessibilidade" },
  { href: "#seguranca", label: "Segurança" },
  { href: "#contato", label: "Tirar dúvidas" },
  { href: "#baixar", label: "Baixar o aplicativo" },
  { href: "#politicas", label: "Políticas de segurança e de uso" },
];

const politicas = [
  {
    id: "politica-seguranca",
    icon: "fa-shield-halved",
    titulo: "Política de segurança",
    itens: [
      "O PASI lida com informações sensíveis de saúde e de assistência social, e elas são tratadas com cuidado.",
      "O acesso é dividido em níveis (gestão, atendimento e paciente): cada pessoa vê só o que a sua função pede.",
      "Ações importantes feitas no sistema ficam registradas.",
      "Cada pessoa é responsável por manter a sua senha em sigilo e por não compartilhá-la.",
      "Se você suspeitar de acesso indevido ou de uso errado dos seus dados, avise a equipe pelo formulário de contato.",
    ],
  },
  {
    id: "politica-uso",
    icon: "fa-file-contract",
    titulo: "Política de uso",
    itens: [
      "O PASI é um apoio à triagem da assistência social (CRAS, CAPS e CREAS). Ele não substitui o atendimento do profissional.",
      "Informe dados verdadeiros e mantenha o seu cadastro atualizado.",
      "Use a sua conta só para a finalidade do serviço. Não acesse nem tente acessar dados de outras pessoas.",
      "O formulário de contato do site é só para dúvidas: não envie documentos nem informações pessoais ou de saúde por ele.",
      "Este é um projeto acadêmico da Fatec Mauá, em desenvolvimento. Os termos podem mudar conforme o projeto evolui.",
    ],
  },
];

const equipe = ["Anna Carolina de Azevedo Leite", "Ellen Eufrasio de Oliveira", "Hector Ferreira da Silva"];

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-marca">
            <img src={LOGO_SRC} alt="PASI" />
            <p>
              Plataforma de Atendimento de Sistemas Integrados. A triagem da assistência social,
              digital, organizada e humana.
            </p>
            <span className="footer-servicos">CRAS · CAPS · CREAS</span>
          </div>

          <nav aria-label="Navegação do rodapé">
            <h2>Navegação</h2>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </nav>

          <nav aria-label="Sobre o projeto">
            <h2>O projeto</h2>
            {projetoLinks.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </nav>

          <div className="footer-equipe">
            <h2>Equipe</h2>
            <ul>
              {equipe.map((nome) => (
                <li key={nome}>{nome}</li>
              ))}
            </ul>
            <p>
              Orientação: Bruno Zolotareff, Carlos Ronny e Lucas Bonilha.
            </p>
          </div>
        </div>

        <section className="footer-politicas" id="politicas" aria-labelledby="politicas-titulo">
          <h2 id="politicas-titulo">Políticas de segurança e de uso</h2>
          <div className="footer-politicas-grid">
            {politicas.map((politica) => (
              <details key={politica.id} id={politica.id}>
                <summary>
                  <i className={`fa-solid ${politica.icon}`} aria-hidden="true"></i>
                  {politica.titulo}
                  <i className="fa-solid fa-chevron-down footer-politicas-seta" aria-hidden="true"></i>
                </summary>
                <ul>
                  {politica.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>

        <div className="footer-base">
          <span>
            © 2026 PASI · Projeto Interdisciplinar de Desenvolvimento de Software Multiplataforma · Fatec Mauá
          </span>
          <a href="#inicio" className="footer-topo">
            Voltar ao topo
            <i className="fa-solid fa-arrow-up" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
