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

let distributeurs = [];
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
    document.getElementById('add-distributeur-btn').addEventListener('click', addDistributeur);

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
        case 'distributeurs':
            loadDistributeursGrid();
            break;
        case 'qrcodes':
            loadQRCodesGrid();
            break;
    }
}

// Chargement des données d'administration
function loadAdminData() {
    loadAsblTable();
    loadCategoriesGrid();
    loadDistributeursGrid();
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

// Gestion des distributeurs
function loadDistributeursGrid() {
    const grid = document.getElementById('distributeurs-grid');
    grid.innerHTML = '';

    if (distributeurs.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Aucun distributeur configuré</p>';
        return;
    }

    distributeurs.forEach(distributeur => {
        const card = document.createElement('div');
        card.className = 'distributeur-card';
        card.innerHTML = `
            <div class="distributeur-header">
                <h4>${distributeur.nom}</h4>
                <div class="table-actions">
                    <button class="btn-edit" onclick="editDistributeur('${distributeur.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteDistributeur('${distributeur.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p><i class="fas fa-map-marker-alt"></i> ${distributeur.adresse}</p>
            <p><i class="fas fa-qrcode"></i> QR Code: ${distributeur.qrCode}</p>
            <div style="margin-top: 1rem;">
                <button class="btn-primary" onclick="generateQRCode('${distributeur.id}')">
                    <i class="fas fa-download"></i>
                    Télécharger QR
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function addDistributeur() {
    const nom = prompt('Nom du distributeur:');
    const adresse = prompt('Adresse du distributeur:');
    
    if (nom && adresse) {
        const distributeur = {
            id: 'dist_' + Date.now(),
            nom: nom,
            adresse: adresse,
            qrCode: generateQRCodeData(),
            dateCreation: new Date().toISOString()
        };
        
        distributeurs.push(distributeur);
        loadDistributeursGrid();
        updateStats();
        addActivity('add', `Distributeur "${nom}" ajouté`);
    }
}

function generateQRCodeData(productType = 'SNACK') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `PIXIE_${productType}_${timestamp}_${random}`;
}

function generateQRCode(distributeurId) {
    const distributeur = distributeurs.find(d => d.id === distributeurId);
    if (distributeur) {
        // Simulation de génération de QR code
        alert(`QR Code pour ${distributeur.nom}:\n${distributeur.qrCode}\n\nURL: ${window.location.origin}/qr?code=${distributeur.qrCode}`);
    }
}

function deleteDistributeur(distributeurId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce distributeur ?')) {
        const index = distributeurs.findIndex(d => d.id === distributeurId);
        if (index !== -1) {
            distributeurs.splice(index, 1);
            loadDistributeursGrid();
            updateStats();
            addActivity('delete', `Distributeur supprimé`);
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
window.editDistributeur = editDistributeur;
window.deleteDistributeur = deleteDistributeur;
window.generateQRCode = generateQRCode;
window.generateProductQRCodes = generateProductQRCodes;
window.downloadQRCode = downloadQRCode;
window.deleteQRCode = deleteQRCode;



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
        card.innerHTML = `
            <div class="qrcode-header">
                <h4>${qrCode.productType}</h4>
                <div class="table-actions">
                    <button class="btn-primary" onclick="downloadQRCode('${qrCode.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteQRCode('${qrCode.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p><i class="fas fa-qrcode"></i> Code: ${qrCode.code}</p>
            <p><i class="fas fa-calendar"></i> Créé le: ${formatDate(qrCode.dateCreation)}</p>
            <p><i class="fas fa-info-circle"></i> Statut: ${qrCode.used ? 'Utilisé' : 'Disponible'}</p>
        `;
        grid.appendChild(card);
    });
}

function generateProductQRCodes() {
    const quantity = parseInt(prompt('Combien de codes QR voulez-vous générer ?')) || 1;
    const productType = prompt('Type de produit (ex: SNACK, BOISSON, CHOCOLAT):') || 'SNACK';
    
    if (quantity > 0 && quantity <= 100) {
        const newCodes = [];
        for (let i = 0; i < quantity; i++) {
            const qrCode = {
                id: 'qr_' + Date.now() + '_' + i,
                code: generateQRCodeData(productType),
                productType: productType,
                dateCreation: new Date().toISOString(),
                used: false,
                usedBy: null,
                usedDate: null
            };
            newCodes.push(qrCode);
            qrCodes.push(qrCode);
        }
        
        loadQRCodesGrid();
        updateStats();
        addActivity('add', `${quantity} codes QR générés pour ${productType}`);
        
        // Proposer le téléchargement en PDF
        if (confirm('Voulez-vous télécharger les codes QR en PDF ?')) {
            downloadQRCodesPDF(newCodes);
        }
    } else {
        alert('Veuillez entrer un nombre valide entre 1 et 100');
    }
}

function downloadQRCode(qrCodeId) {
    const qrCode = qrCodes.find(qr => qr.id === qrCodeId);
    if (qrCode) {
        // Simulation de téléchargement individuel
        const url = `${window.location.origin}/qr.html?code=${qrCode.code}`;
        alert(`Code QR: ${qrCode.code}\nURL: ${url}\n\nCopiez cette URL ou scannez le code QR généré.`);
    }
}

function downloadQRCodesPDF(codes) {
    // Simulation de génération PDF
    const pdfContent = codes.map(qr => 
        `Code QR: ${qr.code}\nType: ${qr.productType}\nURL: ${window.location.origin}/qr.html?code=${qr.code}`
    ).join('\n\n');
    
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codes_qr_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addActivity('download', `PDF de codes QR téléchargé (${codes.length} codes)`);
}

function deleteQRCode(qrCodeId) {
    const qrCode = qrCodes.find(qr => qr.id === qrCodeId);
    if (qrCode && qrCode.used) {
        alert('Impossible de supprimer un code QR déjà utilisé');
        return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce code QR ?')) {
        const index = qrCodes.findIndex(qr => qr.id === qrCodeId);
        if (index !== -1) {
            qrCodes.splice(index, 1);
            loadQRCodesGrid();
            updateStats();
            addActivity('delete', `Code QR supprimé`);
        }
    }
}

function markQRCodeAsUsed(code, asblId) {
    const qrCode = qrCodes.find(qr => qr.code === code);
    if (qrCode && !qrCode.used) {
        qrCode.used = true;
        qrCode.usedBy = asblId;
        qrCode.usedDate = new Date().toISOString();
        return true;
    }
    return false;
}

