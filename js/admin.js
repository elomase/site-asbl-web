// Interface d'administration Pixie

// Configuration
const ADMIN_PASSWORD = 'pixie2024'; // Mot de passe par défaut (à changer)

// Variables globales
let currentEditingAsbl = null;
let currentEditingCategory = null;
let categories = [
    { id: 'humanitaire', nom: 'Humanitaire', couleur: '#e74c3c' },
    { id: 'medical', nom: 'Médical', couleur: '#2ecc71' },
    { id: 'environnement', nom: 'Environnement', couleur: '#3498db' },
    { id: 'enfance', nom: 'Enfance', couleur: '#e91e63' },
    { id: 'droits-humains', nom: 'Droits humains', couleur: '#9b59b6' },
    { id: 'developpement', nom: 'Développement', couleur: '#f39c12' }
];

let qrCodes = []; // Stockage des codes QR générés

// Éléments DOM
const loginPage = document.getElementById('login-page');
const adminInterface = document.getElementById('admin-interface');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

// Navigation
const menuBtns = document.querySelectorAll('.menu-btn');
const adminSections = document.querySelectorAll('.admin-section');

// Modales
const asblModal = document.getElementById('asbl-modal');
const categoryModal = document.getElementById('category-modal');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
    updateStats();
    loadRecentActivity();
});

// Gestion de l'authentification
function checkAuthStatus() {
    const isLoggedIn = sessionStorage.getItem('pixie_admin_logged_in');
    if (isLoggedIn === 'true') {
        showAdminInterface();
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    loginPage.style.display = 'flex';
    adminInterface.style.display = 'none';
}

function showAdminInterface() {
    loginPage.style.display = 'none';
    adminInterface.style.display = 'block';
    loadAdminData();
}

// Configuration des événements
function setupEventListeners() {
    // Connexion
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    // Navigation
    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });

    // Boutons d'ajout
    document.getElementById('add-asbl-btn').addEventListener('click', () => openAsblModal());
    document.getElementById('add-category-btn').addEventListener('click', () => openCategoryModal());
    // SUPPRIMÉ : Gestion des distributeurs

    // Modales
    setupModalEvents();
}

function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('pixie_admin_logged_in', 'true');
        showAdminInterface();
        document.getElementById('admin-password').value = '';
    } else {
        alert('Mot de passe incorrect');
    }
}

function handleLogout() {
    sessionStorage.removeItem('pixie_admin_logged_in');
    showLoginPage();
}

// Navigation entre sections
function switchSection(sectionName) {
    // Mise à jour des boutons
    menuBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Mise à jour des sections
    adminSections.forEach(section => section.classList.remove('active'));
    document.getElementById(`${sectionName}-section`).classList.add('active');

    // Chargement des données spécifiques
    switch(sectionName) {
        case 'dashboard':
            updateStats();
            loadRecentActivity();
            break;
        case 'asbl':
            loadAsblTable();
            break;
        case 'categories':
            loadCategoriesGrid();
            break;
        // case 'distributeurs': supprimé
        case 'qrcodes':
            loadQRCodesGrid();
            break;
    }
}

// Chargement des données d'administration
function loadAdminData() {
    loadAsblTable();
    loadCategoriesGrid();
    loadQRCodesGrid();
    updateStats();
}

// Gestion des ASBL
function loadAsblTable() {
    const tbody = document.getElementById('asbl-table-body');
    tbody.innerHTML = '';

    asblData.forEach(asbl => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><div class="table-logo">${asbl.logo}</div></td>
            <td><strong>${asbl.nom}</strong></td>
            <td><span class="badge" style="background-color: ${asbl.couleur}">${asbl.categorie}</span></td>
            <td>${asbl.unites_achetees}</td>
            <td>${asbl.video ? '✅' : '❌'}</td>
            <td class="table-actions">
                <button class="btn-edit" onclick="editAsbl('${asbl.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger" onclick="deleteAsbl('${asbl.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openAsblModal(asblId = null) {
    currentEditingAsbl = asblId;
    const modal = document.getElementById('asbl-modal');
    const title = document.getElementById('asbl-modal-title');
    const form = document.getElementById('asbl-form');

    // Mise à jour du titre
    title.textContent = asblId ? 'Modifier l\'ASBL' : 'Ajouter une ASBL';

    // Chargement des catégories dans le select
    const categorySelect = document.getElementById('asbl-categorie');
    categorySelect.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.nom;
        categorySelect.appendChild(option);
    });

    // Pré-remplissage si édition
    if (asblId) {
        const asbl = asblData.find(a => a.id === asblId);
        if (asbl) {
            document.getElementById('asbl-nom').value = asbl.nom;
            document.getElementById('asbl-categorie').value = asbl.categorie.toLowerCase().replace(' ', '-');
            document.getElementById('asbl-logo').value = asbl.logo;
            document.getElementById('asbl-description').value = asbl.description;
            document.getElementById('asbl-mission').value = asbl.mission;
            document.getElementById('asbl-email').value = asbl.email;
            document.getElementById('asbl-telephone').value = asbl.telephone;
            document.getElementById('asbl-adresse').value = asbl.adresse;
            document.getElementById('asbl-website').value = asbl.website;
            document.getElementById('asbl-video').value = asbl.video || '';
        }
    } else {
        form.reset();
    }

    modal.classList.add('active');
}

function editAsbl(asblId) {
    openAsblModal(asblId);
}

function deleteAsbl(asblId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ASBL ?')) {
        const index = asblData.findIndex(a => a.id === asblId);
        if (index !== -1) {
            asblData.splice(index, 1);
            loadAsblTable();
            updateStats();
            addActivity('delete', `ASBL supprimée`);
        }
    }
}

// Gestion des catégories
function loadCategoriesGrid() {
    const grid = document.getElementById('categories-grid');
    grid.innerHTML = '';

    categories.forEach(category => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-header">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="category-color" style="background-color: ${category.couleur}"></div>
                    <h4>${category.nom}</h4>
                </div>
                <div class="table-actions">
                    <button class="btn-edit" onclick="editCategory('${category.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p>Utilisée par ${asblData.filter(a => a.categorie.toLowerCase().replace(' ', '-') === category.id).length} ASBL</p>
        `;
        grid.appendChild(card);
    });
}

function openCategoryModal(categoryId = null) {
    currentEditingCategory = categoryId;
    const modal = document.getElementById('category-modal');
    const title = document.getElementById('category-modal-title');
    const form = document.getElementById('category-form');

    title.textContent = categoryId ? 'Modifier la catégorie' : 'Ajouter une catégorie';

    if (categoryId) {
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            document.getElementById('category-nom').value = category.nom;
            document.getElementById('category-couleur').value = category.couleur;
        }
    } else {
        form.reset();
    }

    modal.classList.add('active');
}

function editCategory(categoryId) {
    openCategoryModal(categoryId);
}

function deleteCategory(categoryId) {
    const asblCount = asblData.filter(a => a.categorie.toLowerCase().replace(' ', '-') === categoryId).length;
    if (asblCount > 0) {
        alert(`Impossible de supprimer cette catégorie car elle est utilisée par ${asblCount} ASBL.`);
        return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
        const index = categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
            categories.splice(index, 1);
            loadCategoriesGrid();
            updateStats();
            addActivity('delete', `Catégorie supprimée`);
        }
    }
}

// Gestion des modales
function setupModalEvents() {
    // Modal ASBL
    document.getElementById('asbl-modal-close').addEventListener('click', () => {
        asblModal.classList.remove('active');
    });
    
    document.getElementById('asbl-cancel').addEventListener('click', () => {
        asblModal.classList.remove('active');
    });
    
    document.getElementById('asbl-form').addEventListener('submit', handleAsblSubmit);

    // Modal Catégorie
    document.getElementById('category-modal-close').addEventListener('click', () => {
        categoryModal.classList.remove('active');
    });
    
    document.getElementById('category-cancel').addEventListener('click', () => {
        categoryModal.classList.remove('active');
    });
    
    document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);

    // Fermeture en cliquant à l'extérieur
    [asblModal, categoryModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

function handleAsblSubmit(e) {
    e.preventDefault();
    
    const formData = {
        nom: document.getElementById('asbl-nom').value,
        categorie: categories.find(c => c.id === document.getElementById('asbl-categorie').value)?.nom || 'Autre',
        logo: document.getElementById('asbl-logo').value || '🏢',
        description: document.getElementById('asbl-description').value,
        mission: document.getElementById('asbl-mission').value,
        email: document.getElementById('asbl-email').value,
        telephone: document.getElementById('asbl-telephone').value,
        adresse: document.getElementById('asbl-adresse').value,
        website: document.getElementById('asbl-website').value,
        video: document.getElementById('asbl-video').value,
        couleur: categories.find(c => c.id === document.getElementById('asbl-categorie').value)?.couleur || '#3498db'
    };

    if (currentEditingAsbl) {
        // Modification
        const index = asblData.findIndex(a => a.id === currentEditingAsbl);
        if (index !== -1) {
            asblData[index] = { ...asblData[index], ...formData };
            addActivity('edit', `ASBL "${formData.nom}" modifiée`);
        }
    } else {
        // Ajout
        const newAsbl = {
            id: 'asbl_' + Date.now(),
            ...formData,
            unites_achetees: 0,
            date_creation: new Date().toISOString().split('T')[0]
        };
        asblData.push(newAsbl);
        addActivity('add', `ASBL "${formData.nom}" ajoutée`);
    }

    asblModal.classList.remove('active');
    loadAsblTable();
    updateStats();
}

function handleCategorySubmit(e) {
    e.preventDefault();
    
    const formData = {
        nom: document.getElementById('category-nom').value,
        couleur: document.getElementById('category-couleur').value
    };

    if (currentEditingCategory) {
        // Modification
        const index = categories.findIndex(c => c.id === currentEditingCategory);
        if (index !== -1) {
            categories[index] = { ...categories[index], ...formData };
            addActivity('edit', `Catégorie "${formData.nom}" modifiée`);
        }
    } else {
        // Ajout
        const newCategory = {
            id: formData.nom.toLowerCase().replace(/\s+/g, '-'),
            ...formData
        };
        categories.push(newCategory);
        addActivity('add', `Catégorie "${formData.nom}" ajoutée`);
    }

    categoryModal.classList.remove('active');
    loadCategoriesGrid();
    updateStats();
}

// Statistiques
function updateStats() {
    document.getElementById('total-asbl-admin').textContent = asblData.length;
    document.getElementById('total-units-admin').textContent = asblData.reduce((sum, asbl) => sum + asbl.unites_achetees, 0);
    document.getElementById('total-categories-admin').textContent = categories.length;
    document.getElementById('total-distributeurs-admin').textContent = distributeurs.length;
    
    // Ajouter les statistiques des codes QR si l'élément existe
    const totalQRElement = document.getElementById('total-qrcodes-admin');
    if (totalQRElement) {
        totalQRElement.textContent = qrCodes.length;
    }
    
    const usedQRElement = document.getElementById('used-qrcodes-admin');
    if (usedQRElement) {
        usedQRElement.textContent = qrCodes.filter(qr => qr.used).length;
    }
}

// Activité récente
function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    const activities = JSON.parse(localStorage.getItem('pixie_admin_activity') || '[]');
    
    activityList.innerHTML = '';
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aucune activité récente</p>';
        return;
    }

    activities.slice(-5).reverse().forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <div class="activity-time">${formatDate(activity.timestamp)}</div>
            </div>
        `;
        activityList.appendChild(item);
    });
}

function addActivity(type, message) {
    const activities = JSON.parse(localStorage.getItem('pixie_admin_activity') || '[]');
    activities.push({
        type: type,
        message: message,
        timestamp: new Date().toISOString()
    });
    
    // Garder seulement les 50 dernières activités
    if (activities.length > 50) {
        activities.splice(0, activities.length - 50);
    }
    
    localStorage.setItem('pixie_admin_activity', JSON.stringify(activities));
    loadRecentActivity();
}

function getActivityIcon(type) {
    switch(type) {
        case 'add': return 'plus';
        case 'edit': return 'edit';
        case 'delete': return 'trash';
        default: return 'info';
    }
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR') + ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Utilitaires
window.editAsbl = editAsbl;
window.deleteAsbl = deleteAsbl;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

// Gestion des codes QR
function loadQRCodesGrid() {
    const grid = document.getElementById('qrcodes-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (qrCodes.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Aucun code QR généré</p>';
        return;
    }
    qrCodes.forEach(qrCode => {
        const card = document.createElement('div');
        card.className = 'qrcode-card';
        // Génération du QR code visuel
        const qrContainer = createQRCodeCanvas(qrCode.code, 96);
        // Ajout d'un bouton de téléchargement PNG
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn-primary';
        downloadBtn.innerHTML = '<i class="fas fa-image"></i>';
        downloadBtn.title = 'Télécharger PNG';
        downloadBtn.onclick = function() {
            const canvas = qrContainer.querySelector('canvas');
            if (canvas) downloadCanvasAsPNG(canvas, `${qrCode.code}.png`);
        };
        card.innerHTML = `
            <div class="qrcode-header">
                <h4>${qrCode.productType}</h4>
                <div class="table-actions"></div>
            </div>
            <div class="qrcode-img"></div>
            <p><i class="fas fa-qrcode"></i> Code: ${qrCode.code}</p>
            <p><i class="fas fa-calendar"></i> Créé le: ${formatDate(qrCode.dateCreation)}</p>
            <p><i class="fas fa-info-circle"></i> Statut: ${qrCode.used ? 'Utilisé' : 'Disponible'}</p>
        `;
        // Ajout du QR visuel et du bouton dans la carte
        card.querySelector('.qrcode-img').appendChild(qrContainer);
        card.querySelector('.table-actions').appendChild(downloadBtn);
        // ...boutons existants (suppression, etc.)
        const delBtn = document.createElement('button');
        delBtn.className = 'btn-danger';
        delBtn.innerHTML = '<i class="fas fa-trash"></i>';
        delBtn.onclick = function() { deleteQRCode(qrCode.id); };
        card.querySelector('.table-actions').appendChild(delBtn);
        grid.appendChild(card);
    });
}

// Génère un QR code visuel (canvas) pour un texte donné
function createQRCodeCanvas(text, size = 128) {
    const container = document.createElement('div');
    container.style.display = 'inline-block';
    // Nettoyage du container
    container.innerHTML = '';
    new QRCode(container, {
        text: text,
        width: size,
        height: size,
        correctLevel: QRCode.CorrectLevel.H
    });
    return container;
}

// Télécharge un canvas en PNG
function downloadCanvasAsPNG(canvas, filename) {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
}

// Génération PDF avec images QR
function downloadQRCodesPDF(codes) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    codes.forEach((qr, idx) => {
        // Générer QR code en canvas
        const tempDiv = createQRCodeCanvas(qr.code, 80);
        const canvas = tempDiv.querySelector('canvas');
        if (canvas) {
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 10, y, 30, 30);
        }
        doc.text(`Code: ${qr.code}`, 45, y + 10);
        doc.text(`Type: ${qr.productType}`, 45, y + 18);
        doc.text(`URL: ${window.location.origin}/qr.html?code=${qr.code}`, 10, y + 38);
        y += 45;
        if (y > 260 && idx < codes.length - 1) {
            doc.addPage();
            y = 10;
        }
    });
    doc.save(`codes_qr_${new Date().toISOString().split('T')[0]}.pdf`);
    addActivity('download', `PDF de codes QR téléchargé (${codes.length} codes)`);
}

