window.addEventListener('hashchange', loadGalleryIfNeeded);
window.addEventListener('DOMContentLoaded', loadGalleryIfNeeded);

function loadGalleryIfNeeded() {
  if (location.hash === '#/galeria') {
    // espera um pequeno tempo pra garantir que o DOM foi injetado
    setTimeout(() => {
      const galleryContainer = document.getElementById('gallery-container');
      if (!galleryContainer) return; // div ainda não carregada

      // já limpando qualquer imagem anterior
      galleryContainer.innerHTML = '';

      const imageFiles = [];
        for (let i = 1; i <= 56; i++) {
            imageFiles.push(`${i}.jpg`);
        }
        
      imageFiles.forEach(filename => {
        const img = document.createElement('img');
        img.src = `images/galeria/${filename}`;
        img.alt = filename;
        img.onerror = () => img.remove();
        galleryContainer.appendChild(img);
      });
    }, 100);
  }
}
