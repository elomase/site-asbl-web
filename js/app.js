// Variables globales
let filteredAsbl = [...asblData];
let currentAsbl = null;
let editMode = false;
let currentEditAsbl = null;

// Éléments DOM
const asblGrid = document.getElementById('asbl-grid');
const statsGrid = document.getElementById('stats-grid');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('asbl-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const unitsInput = document.getElementById('units-input');
const decreaseBtn = document.getElementById('decrease-units');
const increaseBtn = document.getElementById('increase-units');
const purchaseBtn = document.getElementById('purchase-btn');

// Éléments pour le mode édition
const editModeBtn = document.getElementById('edit-mode-btn');
const editModal = document.getElementById('edit-modal');
const editModalClose = document.getElementById('edit-modal-close');
const editForm = document.getElementById('edit-form');
const editCancel = document.getElementById('edit-cancel');
const imageInput = document.getElementById('edit-image-input');
const imagePreview = document.getElementById('image-preview');
const imageUploadText = document.getElementById('image-upload-text');
const videoInput = document.getElementById('edit-video');
const videoPreviewContainer = document.getElementById('video-preview-container');

// Navigation
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    renderAsblGrid();
    renderStatistics();
    updateHeroStats();
    setupEventListeners();
    setupNavigation();
});

// Configuration de la navigation
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            // Mise à jour des liens actifs
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Scroll vers la section
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mise à jour de la navigation au scroll
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// Configuration des événements
function setupEventListeners() {
    // Recherche
    searchInput.addEventListener('input', handleSearch);
    
    // Filtres
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
    
    // Modal
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Contrôles d'unités
    decreaseBtn.addEventListener('click', function() {
        const currentValue = parseInt(unitsInput.value);
        if (currentValue > 1) {
            unitsInput.value = currentValue - 1;
        }
    });
    
    increaseBtn.addEventListener('click', function() {
        const currentValue = parseInt(unitsInput.value);
        if (currentValue < 100) {
            unitsInput.value = currentValue + 1;
        }
    });
    
    // Achat d'unités
    purchaseBtn.addEventListener('click', handlePurchase);
    
    // Mode édition
    editModeBtn.addEventListener('click', toggleEditMode);
    editModalClose.addEventListener('click', closeEditModal);
    editCancel.addEventListener('click', closeEditModal);
    editForm.addEventListener('submit', handleEditSubmit);
    imageInput.addEventListener('change', handleImageUpload);
    videoInput.addEventListener('input', handleVideoPreview);
    
    // Fermeture modal d'édition avec clic extérieur
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    // Fermeture modal avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Rendu de la grille ASBL
function renderAsblGrid() {
    asblGrid.innerHTML = '';
    
    if (filteredAsbl.length === 0) {
        asblGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Aucune ASBL trouvée</h3>
                <p style="color: var(--text-secondary);">Essayez de modifier vos critères de recherche</p>
            </div>
        `;
        return;
    }
    
    filteredAsbl.forEach(asbl => {
        const card = createAsblCard(asbl);
        asblGrid.appendChild(card);
    });
}

// Création d'une carte ASBL
function createAsblCard(asbl) {
    const card = document.createElement('div');
    card.className = 'asbl-card';
    card.setAttribute('data-category', asbl.categorie);
    
    if (editMode) {
        card.classList.add('edit-mode');
    }
    
    card.innerHTML = `
        <div class="asbl-card-header">
            <div class="asbl-logo" style="background-color: ${asbl.couleur}20; color: ${asbl.couleur};">
                ${asbl.logo}
            </div>
            <h3 class="asbl-name">${asbl.nom}</h3>
            <span class="asbl-category" style="background-color: ${asbl.couleur};">${asbl.categorie}</span>
        </div>
        <div class="asbl-card-body">
            <p class="asbl-description">${asbl.description}</p>
        </div>
        <div class="asbl-card-footer">
            <div class="units-count">
                <i class="fas fa-shopping-cart"></i>
                ${asbl.unites_achetees} unité${asbl.unites_achetees !== 1 ? 's' : ''}
            </div>
            <a href="#" class="view-details" data-asbl-id="${asbl.id}">
                Voir détails
                <i class="fas fa-arrow-right"></i>
            </a>
        </div>
        ${editMode ? `
        <div class="edit-overlay">
            <div class="edit-controls">
                <button class="edit-btn" onclick="openEditModal('${asbl.id}')" title="Éditer">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
        ` : ''}
    `;
    
    // Événement pour ouvrir la modal
    card.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-details') || e.target.closest('.view-details')) {
            e.preventDefault();
            openModal(asbl);
        } else if (!editMode && !e.target.closest('.edit-overlay')) {
            openModal(asbl);
        }
    });
    
    return card;
}

// Gestion de la recherche
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    filteredAsbl = asblData.filter(asbl => {
        return asbl.nom.toLowerCase().includes(searchTerm) ||
               asbl.description.toLowerCase().includes(searchTerm) ||
               asbl.categorie.toLowerCase().includes(searchTerm);
    });
    
    // Appliquer aussi le filtre de catégorie actuel
    const activeFilter = document.querySelector('.filter-btn.active');
    if (activeFilter && activeFilter.getAttribute('data-category') !== 'all') {
        const category = activeFilter.getAttribute('data-category');
        filteredAsbl = filteredAsbl.filter(asbl => asbl.categorie === category);
    }
    
    renderAsblGrid();
}

// Gestion des filtres
function handleFilter(e) {
    const category = e.target.getAttribute('data-category');
    
    // Mise à jour des boutons actifs
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Filtrage des données
    if (category === 'all') {
        filteredAsbl = [...asblData];
    } else {
        filteredAsbl = asblData.filter(asbl => asbl.categorie === category);
    }
    
    // Appliquer aussi la recherche si elle existe
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredAsbl = filteredAsbl.filter(asbl => {
            return asbl.nom.toLowerCase().includes(searchTerm) ||
                   asbl.description.toLowerCase().includes(searchTerm) ||
                   asbl.categorie.toLowerCase().includes(searchTerm);
        });
    }
    
    renderAsblGrid();
}

// Ouverture de la modal
function openModal(asbl) {
    currentAsbl = asbl;
    modalTitle.textContent = asbl.nom;
    
    // Préparer le contenu vidéo
    let videoContent = '';
    if (asbl.video) {
        const videoId = extractYouTubeVideoId(asbl.video);
        if (videoId) {
            videoContent = `
                <div class="modal-info">
                    <h4><i class="fas fa-play-circle"></i> Vidéo de présentation</h4>
                    <div class="video-wrapper">
                        <iframe 
                            src="https://www.youtube.com/embed/${videoId}" 
                            frameborder="0" 
                            allowfullscreen
                            title="Vidéo de présentation - ${asbl.nom}">
                        </iframe>
                    </div>
                </div>
            `;
        } else {
            videoContent = `
                <div class="modal-info">
                    <h4><i class="fas fa-play-circle"></i> Vidéo de présentation</h4>
                    <div class="video-link">
                        <a href="${asbl.video}" target="_blank" class="btn-primary">
                            <i class="fas fa-external-link-alt"></i>
                            Voir la vidéo
                        </a>
                    </div>
                </div>
            `;
        }
    }
    
    modalBody.innerHTML = `
        <div class="modal-info">
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">${asbl.logo}</div>
                <span class="asbl-category" style="background-color: ${asbl.couleur};">${asbl.categorie}</span>
            </div>
            
            <div class="modal-info">
                <h4><i class="fas fa-info-circle"></i> Description</h4>
                <p>${asbl.description}</p>
            </div>
            
            <div class="modal-info">
                <h4><i class="fas fa-bullseye"></i> Mission</h4>
                <p>${asbl.mission}</p>
            </div>
            
            ${videoContent}
            
            <div class="modal-info">
                <h4><i class="fas fa-envelope"></i> Contact</h4>
                <p><strong>Email:</strong> ${asbl.contact.email}</p>
                <p><strong>Téléphone:</strong> ${asbl.contact.telephone}</p>
                <p><strong>Adresse:</strong> ${asbl.contact.adresse}</p>
            </div>
            
            <div class="modal-info">
                <h4><i class="fas fa-globe"></i> Site web</h4>
                <p><a href="${asbl.website}" target="_blank" style="color: var(--primary-color);">${asbl.website}</a></p>
            </div>
            
            <div class="modal-info">
                <h4><i class="fas fa-shopping-cart"></i> Unités achetées</h4>
                <p style="font-size: 1.5rem; font-weight: 600; color: var(--primary-color);">
                    ${asbl.unites_achetees} unité${asbl.unites_achetees !== 1 ? 's' : ''}
                </p>
            </div>
        </div>
    `;
    
    // Réinitialiser le nombre d'unités à acheter
    unitsInput.value = 1;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fonction pour extraire l'ID d'une vidéo YouTube
function extractYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Fermeture de la modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentAsbl = null;
}

// Gestion de l'achat d'unités
function handlePurchase() {
    if (!currentAsbl) return;
    
    const nombreUnites = parseInt(unitsInput.value);
    if (nombreUnites < 1 || nombreUnites > 100) {
        alert('Veuillez sélectionner un nombre d\'unités valide (1-100).');
        return;
    }
    
    // Animation du bouton
    purchaseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';
    purchaseBtn.disabled = true;
    
    setTimeout(() => {
        // Effectuer l'achat
        if (acheterUnites(currentAsbl.id, nombreUnites)) {
            // Mise à jour de l'affichage
            renderAsblGrid();
            renderStatistics();
            updateHeroStats();
            
            // Mise à jour de la modal
            const unitesElement = modalBody.querySelector('.modal-info:last-child p');
            if (unitesElement) {
                unitesElement.innerHTML = `
                    <span style="font-size: 1.5rem; font-weight: 600; color: var(--primary-color);">
                        ${currentAsbl.unites_achetees} unité${currentAsbl.unites_achetees !== 1 ? 's' : ''}
                    </span>
                `;
            }
            
            // Message de succès
            showSuccessMessage(`Merci ! Vous avez acheté ${nombreUnites} unité${nombreUnites !== 1 ? 's' : ''} pour ${currentAsbl.nom}.`);
            
            // Réinitialiser le formulaire
            unitsInput.value = 1;
        } else {
            alert('Erreur lors de l\'achat. Veuillez réessayer.');
        }
        
        // Restaurer le bouton
        purchaseBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Acheter les unités';
        purchaseBtn.disabled = false;
    }, 1000);
}

// Affichage d'un message de succès
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    successDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 3000);
}

// Rendu des statistiques
function renderStatistics() {
    const stats = getStatistics();
    
    statsGrid.innerHTML = '';
    
    // Statistiques globales
    const globalStats = document.createElement('div');
    globalStats.className = 'stats-card';
    globalStats.innerHTML = `
        <h3>Statistiques Globales</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div>
                <div class="stats-number" style="font-size: 2rem;">${stats.totalAsbl}</div>
                <div class="stats-label">ASBL</div>
            </div>
            <div>
                <div class="stats-number" style="font-size: 2rem;">${stats.totalUnites}</div>
                <div class="stats-label">Unités</div>
            </div>
            <div>
                <div class="stats-number" style="font-size: 2rem;">${stats.totalCategories}</div>
                <div class="stats-label">Catégories</div>
            </div>
        </div>
    `;
    statsGrid.appendChild(globalStats);
    
    // Top 3 des ASBL
    const topAsbl = stats.asblStats.slice(0, 3);
    if (topAsbl.some(asbl => asbl.unites > 0)) {
        const topStats = document.createElement('div');
        topStats.className = 'stats-card';
        topStats.innerHTML = `
            <h3>Top 3 des ASBL</h3>
            <div style="margin-top: 1rem;">
                ${topAsbl.map((asbl, index) => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-weight: 600; color: ${asbl.couleur};">#${index + 1}</span>
                            <span style="font-size: 0.9rem;">${asbl.nom}</span>
                        </div>
                        <span style="font-weight: 600; color: var(--primary-color);">${asbl.unites}</span>
                    </div>
                `).join('')}
            </div>
        `;
        statsGrid.appendChild(topStats);
    }
    
    // Répartition par catégorie
    const categoriesStats = {};
    stats.asblStats.forEach(asbl => {
        if (!categoriesStats[asbl.categorie]) {
            categoriesStats[asbl.categorie] = 0;
        }
        categoriesStats[asbl.categorie] += asbl.unites;
    });
    
    if (Object.values(categoriesStats).some(val => val > 0)) {
        const categoryStats = document.createElement('div');
        categoryStats.className = 'stats-card';
        categoryStats.innerHTML = `
            <h3>Par Catégorie</h3>
            <div style="margin-top: 1rem;">
                ${Object.entries(categoriesStats).map(([category, units]) => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                        <span style="font-size: 0.9rem;">${category}</span>
                        <span style="font-weight: 600; color: var(--primary-color);">${units}</span>
                    </div>
                `).join('')}
            </div>
        `;
        statsGrid.appendChild(categoryStats);
    }
}

// Mise à jour des statistiques du hero
function updateHeroStats() {
    const stats = getStatistics();
    
    document.getElementById('total-asbl').textContent = stats.totalAsbl;
    document.getElementById('total-unites').textContent = stats.totalUnites;
    document.getElementById('total-categories').textContent = stats.totalCategories;
}

// Ajout des animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .asbl-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .asbl-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
    }
`;
document.head.appendChild(style);



// Fonctions pour le mode édition

// Basculer le mode édition
function toggleEditMode() {
    editMode = !editMode;
    
    if (editMode) {
        editModeBtn.classList.add('active');
        editModeBtn.innerHTML = '<i class="fas fa-times"></i> Quitter Édition';
    } else {
        editModeBtn.classList.remove('active');
        editModeBtn.innerHTML = '<i class="fas fa-edit"></i> Mode Édition';
    }
    
    renderAsblGrid();
}

// Ouvrir la modal d'édition
function openEditModal(asblId) {
    const asbl = asblData.find(a => a.id === asblId);
    if (!asbl) return;
    
    currentEditAsbl = asbl;
    
    // Remplir le formulaire
    document.getElementById('edit-nom').value = asbl.nom;
    document.getElementById('edit-categorie').value = asbl.categorie;
    document.getElementById('edit-description').value = asbl.description;
    document.getElementById('edit-mission').value = asbl.mission;
    document.getElementById('edit-email').value = asbl.contact.email;
    document.getElementById('edit-telephone').value = asbl.contact.telephone;
    document.getElementById('edit-adresse').value = asbl.contact.adresse;
    document.getElementById('edit-website').value = asbl.website;
    document.getElementById('edit-video').value = asbl.video || '';
    
    // Réinitialiser l'aperçu d'image
    imagePreview.style.display = 'none';
    imageUploadText.style.display = 'block';
    
    // Afficher l'aperçu vidéo si une URL est présente
    if (asbl.video) {
        handleVideoPreview({ target: { value: asbl.video } });
    } else {
        videoPreviewContainer.style.display = 'none';
    }
    
    editModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fermer la modal d'édition
function closeEditModal() {
    editModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentEditAsbl = null;
    editForm.reset();
    imagePreview.style.display = 'none';
    imageUploadText.style.display = 'block';
    videoPreviewContainer.style.display = 'none';
}

// Gérer l'upload d'image
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            imageUploadText.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// Gérer l'aperçu vidéo
function handleVideoPreview(e) {
    const url = e.target.value;
    if (url) {
        videoPreviewContainer.style.display = 'block';
        // Ici on pourrait ajouter une logique pour afficher un aperçu de la vidéo
        // Pour l'instant, on affiche juste le conteneur
    } else {
        videoPreviewContainer.style.display = 'none';
    }
}

// Gérer la soumission du formulaire d'édition
function handleEditSubmit(e) {
    e.preventDefault();
    
    if (!currentEditAsbl) return;
    
    // Récupérer les données du formulaire
    const formData = new FormData(editForm);
    
    // Mettre à jour l'ASBL
    currentEditAsbl.nom = formData.get('nom');
    currentEditAsbl.categorie = formData.get('categorie');
    currentEditAsbl.description = formData.get('description');
    currentEditAsbl.mission = formData.get('mission');
    currentEditAsbl.contact.email = formData.get('email');
    currentEditAsbl.contact.telephone = formData.get('telephone');
    currentEditAsbl.contact.adresse = formData.get('adresse');
    currentEditAsbl.website = formData.get('website');
    currentEditAsbl.video = formData.get('video') || '';
    
    // Gérer l'image si elle a été changée
    if (imageInput.files[0]) {
        // Pour une vraie application, on uploadrait l'image sur un serveur
        // Ici, on utilise l'emoji existant ou on pourrait convertir en base64
        // currentEditAsbl.logo = ... (logique d'upload d'image)
    }
    
    // Sauvegarder les données
    saveData();
    
    // Mettre à jour l'affichage
    renderAsblGrid();
    renderStatistics();
    updateHeroStats();
    
    // Fermer la modal
    closeEditModal();
    
    // Message de succès
    showSuccessMessage(`Les informations de ${currentEditAsbl.nom} ont été mises à jour avec succès !`);
}

// Modifier la fonction openModal pour inclure la vidéo
function openModalWithVideo(asbl) {
    currentAsbl = asbl;
    modalTitle.textContent = asbl.nom;
    
    let videoSection = '';
    if (asbl.video) {
        videoSection = `
            <div class="modal-info">
                <h4><i class="fas fa-video"></i> Vidéo de présentation</h4>
                <div class="video-container">
                    ${getVideoEmbed(asbl.video)}
                </div>
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="modal-info">
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">${asbl.logo}</div>
                <span class="asbl-category" style="background-color: ${asbl.couleur};">${asbl.categorie}</span>
            </div>
            
            <div class="modal-info">
                <h4><i class="fas fa-info-circle"></i> Description</h4>
                <p>${asbl.description}</p>
            </div>
            
            <div class="modal-info">
                <h4><i class="fas fa-bullseye"></i> Mission</h4>
                <p>${asbl.mission}</p>
            </div>
            
            ${videoSection}
            
            <div class="modal-info">
                <h4><i class="fas fa-envelope"></i> Contact</h4>
                <p><strong>Email:</strong> ${asbl.contact.email}</p>
                <p><strong>Téléphone:</strong> ${asbl.contact.telephone}</p>
                <p><strong>Adresse:</strong> ${asbl.contact.adresse}</p>
            </div>
            
            <div class="modal-info">
                <h4><i class="fas fa-globe"></i> Site web</h4>
                <p><a href="${asbl.website}" target="_blank" style="color: var(--primary-color);">${asbl.website}</a></p>
            </div>
            
            <div class="modal-info">
                <h4><i class="fas fa-shopping-cart"></i> Unités achetées</h4>
                <p style="font-size: 1.5rem; font-weight: 600; color: var(--primary-color);">
                    ${asbl.unites_achetees} unité${asbl.unites_achetees !== 1 ? 's' : ''}
                </p>
            </div>
        </div>
    `;
    
    // Réinitialiser le nombre d'unités à acheter
    unitsInput.value = 1;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fonction pour convertir les URLs vidéo en embed
function getVideoEmbed(url) {
    if (!url) return '';
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
        return `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${youtubeMatch[1]}" frameborder="0" allowfullscreen></iframe>`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        return `<iframe width="100%" height="200" src="https://player.vimeo.com/video/${vimeoMatch[1]}" frameborder="0" allowfullscreen></iframe>`;
    }
    
    // Autres formats vidéo
    if (url.match(/\.(mp4|webm|ogg)$/)) {
        return `<video width="100%" height="200" controls><source src="${url}" type="video/mp4"></video>`;
    }
    
    return `<p>Format vidéo non supporté. <a href="${url}" target="_blank">Voir la vidéo</a></p>`;
}

// Remplacer la fonction openModal existante
const originalOpenModal = openModal;
openModal = openModalWithVideo;

