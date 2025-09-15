      // Função para abrir páginas específicas
      function openPage(url) {
        if (url.startsWith("/webapps/")) {
          location.href = url;
          return;
        }
        window.open(url, '_blank');
      }

      // Função para ler texto de componentes
      function readText(component) {
        for (let section of document.getElementsByTagName("section")) {
          if (section.getAttribute("name") == component) {
            section.classList.remove("hidden");
            continue;
          }
          section.classList.add("hidden");
        }

        for (let section of document.getElementsByTagName("tr")) {
          if (section.getAttribute("name") == component) {
            section.classList.add("hidden");
            continue;
          }
          section.classList.remove("hidden");
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Adiciona os eventos aos elementos clicáveis
      document.querySelectorAll('.tr').forEach(el => {
        el.addEventListener('click', () => {
          const page = el.getAttribute('data-page');
          if (page.endsWith('.html') || page.startsWith('https://')) {
            openPage(page);
          } else {
            readText(page);
          }
        });

        el.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            el.click();
          }
        });
      });