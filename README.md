# 📺 MoovleTV — Streaming Experience

O **MoovleTV** é uma plataforma de entretenimento de última geração que centraliza a busca e exibição de filmes e séries em uma interface de alta performance. Inspirado nos gigantes do mercado como Netflix e Disney+, o projeto oferece uma experiência fluida, dark mode nativo e integração inteligente com múltiplos provedores de conteúdo.

---

## 🚀 Funcionalidades Principais

* **🔍 Busca Inteligente (Smart Search):** Resultados instantâneos com exibição de Ano, Nota ★ e Categoria (Filme/Série) diretamente na barra de pesquisa.
* **🔌 Sistema Multi-Fontes:** Player integrado com seletor de 3 fontes distintas (Principal, Alternativa e VIP) para garantir a melhor disponibilidade de conteúdo.
* **⭐ Minha Lista (Favoritos):** Sistema de persistência via `localStorage` que permite salvar seus filmes e séries favoritos clicando na estrela.
* **👤 Autenticação Social:** Login integrado com **Google Sign-In**, exibindo perfil personalizado e avatar do usuário na interface.
* **🏷️ Filtros Dinâmicos:** Navegação rápida por abas de Filmes, Séries e categorias de gênero (Ação, Terror, Ficção, etc).
* **⚡ Alta Performance:** Carregamento de mais de 100 títulos simultâneos utilizando processamento assíncrono para máxima velocidade.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** HTML5 Semântico e CSS3 (Glassmorphism, Flexbox, Grid Layout).
* **Lógica:** JavaScript Moderno (ES6+), Fetch API e JWT Decoding para Login.
* **Dados:** TMDB API (The Movie Database).
* **UI/UX:** Iconografia FontAwesome e Tipografia Google Fonts (Inter).

---

## ⚙️ Como rodar o projeto

1.  **Clone este repositório:**
    ```bash
    git clone [https://github.com/SEU_USUARIO/moovletv.git](https://github.com/SEU_USUARIO/moovletv.git)
    ```

2.  **Configuração de API:**
    No arquivo `script.js`, insira sua chave do TMDB:
    ```javascript
    const API_KEY = 'SUA_CHAVE_AQUI';
    ```

3.  **Configuração de Login:**
    No arquivo `index.html`, insira seu Client ID do Google Cloud:
    ```html
    data-client_id="SEU_ID_DO_GOOGLE.apps.googleusercontent.com"
    ```

4.  **Execução:**
    Basta abrir o arquivo `index.html` em qualquer navegador moderno ou usar a extensão *Live Server* do VS Code.

---

## 📄 Licença e Aviso Legal

Este projeto foi desenvolvido estritamente para fins de estudo e portfólio. O **MoovleTV** não hospeda nenhum arquivo de vídeo em seus servidores, atuando apenas como um indexador de conteúdos fornecidos por serviços de terceiros via embed.

---

**Desenvolvido com ❤️ por [Miguel Forte Dalagassa]**
*Transformando código em entretenimento.* 🚀
