function updateActiveLink() {
    // Remove a classe 'active' de todos os links
    document.querySelectorAll('.navbar a').forEach(link => link.classList.remove('active'));

    // Obtém a rota atual (removendo #/)
    const currentRoute = window.location.hash.replace('#/', '') || 'home';

    // Seleciona o link correspondente pelo ID e adiciona a classe 'active'
    const activeLink = document.getElementById(currentRoute);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Atualiza ao carregar a página e ao mudar o hash
window.addEventListener('hashchange', updateActiveLink);
window.addEventListener('load', updateActiveLink);
