const routes = {
    '/': { page: 'pages/home.html', css: 'css/home/style.css' },
    '/homepol': { page: 'pages/home.html', css: 'css/home/style.css' },
    '/sobre': { page: 'pages/sobre.html', css: 'css/sobre/style.css' },
    '/contato': { page: 'pages/contato.html', css: 'css/contato/style.css' },
    '/projetos': { page: 'pages/projetos.html', css: 'css/projetos/style.css' },
    '/galeria': { page: 'pages/galeria.html', css: 'css/galeria/style.css' },
    '/meta': { page: 'pages/meta.html', css: 'css/meta/style.css' },
};

function loadRoute() {
    const path = window.location.hash.slice(1) || '/';
    const route = routes[path] || routes['/'];

    // Remove o CSS antigo da página, se existir
    const oldCss = document.getElementById('page-css');
    if (oldCss) oldCss.remove();

    if (route.css) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = route.css;
        link.id = 'page-css';
        document.head.appendChild(link);
    }

    // Carrega o HTML da página
    fetch(route.page)
        .then(response => {
            if (!response.ok) throw new Error('Página não encontrada');
            return response.text();
        })
        .then(html => {
            document.getElementById('app').innerHTML = html;
        })
        .catch(err => {
            document.getElementById('app').innerHTML = `<h1>Erro 404</h1><p>Página não encontrada.</p>`;
            console.error('Erro ao carregar a página:', err);
        });
        window.scrollTo(0, 0);
}

window.addEventListener('hashchange', loadRoute);
window.addEventListener('DOMContentLoaded', loadRoute);
