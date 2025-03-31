const routes = {
    '/': 'index.html',  
    '/homepol': 'index.html',  
    '/sobre': 'pages/sobre.html',
    '/contato': 'pages/contato.html',
    '/projetos': 'pages/projetos.html',
    '/rest': 'pages/projetos.html',
};

function loadRoute() {
    const path = window.location.hash.slice(1) || '/';
    const route = routes[path] || routes['/'];

    fetch(route)
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
}

// Carregar rota inicial e escutar mudanças no hash
window.addEventListener('hashchange', loadRoute);
window.addEventListener('DOMContentLoaded', loadRoute);
