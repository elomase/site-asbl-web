// Page QR Code avec prise de photo - Pixie

// Variables globales
let currentStep = 'qr-validation';
let qrCode = null;
let distributeurInfo = null;
let selectedAsbl = null;
let capturedPhoto = null;
let cameraStream = null;

// Éléments DOM
const sections = {
    scan: document.getElementById('qr-scan'),
    validation: document.getElementById('qr-validation'),
    photo: document.getElementById('product-photo'),
    selection: document.getElementById('asbl-selection'),
    confirmation: document.getElementById('confirmation'),
    error: document.getElementById('qr-error')
};

// Éléments caméra
const cameraVideo = document.getElementById('camera-video');
const photoCanvas = document.getElementById('photo-canvas');
const photoPreview = document.getElementById('photo-preview');
const capturedPhotoImg = document.getElementById('captured-photo');

// Éléments scanner QR
const qrScannerVideo = document.getElementById('qr-scanner-video');
const qrScannerCanvas = document.getElementById('qr-scanner-canvas');
const startQRScanBtn = document.getElementById('start-qr-scan-btn');
const stopQRScanBtn = document.getElementById('stop-qr-scan-btn');

// Boutons caméra
const startCameraBtn = document.getElementById('start-camera-btn');
const takePhotoBtn = document.getElementById('take-photo-btn');
const retakePhotoBtn = document.getElementById('retake-photo-btn');
const confirmPhotoBtn = document.getElementById('confirm-photo-btn');

// Autres boutons
const newSelectionBtn = document.getElementById('new-selection-btn');
const closeQrBtn = document.getElementById('close-qr-btn');
const retryQrBtn = document.getElementById('retry-qr-btn');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeQRPage();
    setupEventListeners();
});

function initializeQRPage() {
    // Commencer par l'étape de scan QR
    showStep('qr-scan');
    
    // Récupération du code QR depuis l'URL (optionnel)
    const urlParams = new URLSearchParams(window.location.search);
    const urlCode = urlParams.get('code');
    
    if (urlCode) {
        // Si un code est fourni dans l'URL, l'utiliser directement
        qrCode = urlCode;
        validateQRCode(qrCode);
    } else {
        // Sinon, commencer par le scan
        startQRScanner();
    }
}

function setupEventListeners() {
    // Boutons scanner QR
    if (startQRScanBtn) startQRScanBtn.addEventListener('click', startQRScanner);
    if (stopQRScanBtn) stopQRScanBtn.addEventListener('click', stopQRScanner);
    
    // Boutons caméra
    startCameraBtn.addEventListener('click', startCamera);
    takePhotoBtn.addEventListener('click', takePhoto);
    retakePhotoBtn.addEventListener('click', retakePhoto);
    confirmPhotoBtn.addEventListener('click', confirmPhoto);
    
    // Boutons navigation
    newSelectionBtn.addEventListener('click', () => showStep('selection'));
    closeQrBtn.addEventListener('click', closeQRPage);
    retryQrBtn.addEventListener('click', () => location.reload());
}

// Gestion des étapes
function showStep(step) {
    // Masquer toutes les sections
    Object.values(sections).forEach(section => {
        if (section) section.classList.remove('active');
    });
    
    // Afficher la section demandée
    if (sections[step]) {
        sections[step].classList.add('active');
        currentStep = step;
    }
}

// Validation du QR Code
function validateQRCode(code) {
    showStep('validation');
    
    // Simulation de validation avec la nouvelle logique
    setTimeout(() => {
        // Vérifier si le code QR existe dans les codes générés (simulation avec localStorage)
        const qrCodes = JSON.parse(localStorage.getItem('pixie_qr_codes') || '[]');
        const qrCode = qrCodes.find(qr => qr.code === code);
        
        if (code && code.startsWith('PIXIE_') && qrCode && !qrCode.used) {
            // QR Code valide et non utilisé
            distributeurInfo = {
                id: code,
                nom: `Produit ${qrCode.productType}`,
                adresse: 'Code QR valide',
                productType: qrCode.productType
            };
            
            document.getElementById('qr-status').innerHTML = `
                <div class="qr-status success">
                    <i class="fas fa-check-circle"></i>
                    QR Code validé avec succès !<br>
                    <small>Produit: ${qrCode.productType}</small>
                </div>
            `;
            
            setTimeout(() => {
                showStep('photo');
            }, 1500);
        } else if (qrCode && qrCode.used) {
            showError('Ce code QR a déjà été utilisé');
        } else {
            showError('QR Code invalide ou expiré');
        }
    }, 2000);
}

function showError(message) {
    showStep('error');
    const errorCard = document.querySelector('.error-card p');
    if (errorCard) {
        errorCard.textContent = message;
    }
}

// Gestion de la caméra et prise de photo
async function startCamera() {
    try {
        // Demander l'accès à la caméra
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Caméra arrière si disponible
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        cameraVideo.srcObject = cameraStream;
        cameraVideo.style.display = 'block';
        
        // Mise à jour des boutons
        startCameraBtn.style.display = 'none';
        takePhotoBtn.style.display = 'inline-flex';
        
    } catch (error) {
        console.error('Erreur d\'accès à la caméra:', error);
        showCameraError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
}

function takePhoto() {
    const canvas = photoCanvas;
    const context = canvas.getContext('2d');
    
    // Définir les dimensions du canvas
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;
    
    // Animation de capture
    document.querySelector('.camera-container').classList.add('capturing');
    setTimeout(() => {
        document.querySelector('.camera-container').classList.remove('capturing');
    }, 300);
    
    // Capturer l'image
    context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
    
    // Convertir en base64
    capturedPhoto = canvas.toDataURL('image/jpeg', 0.8);
    
    // Afficher l'aperçu
    capturedPhotoImg.src = capturedPhoto;
    cameraVideo.style.display = 'none';
    photoPreview.style.display = 'block';
    
    // Mise à jour des boutons
    takePhotoBtn.style.display = 'none';
    retakePhotoBtn.style.display = 'inline-flex';
    confirmPhotoBtn.style.display = 'inline-flex';
}

function retakePhoto() {
    // Remettre la caméra
    cameraVideo.style.display = 'block';
    photoPreview.style.display = 'none';
    
    // Mise à jour des boutons
    retakePhotoBtn.style.display = 'none';
    confirmPhotoBtn.style.display = 'none';
    takePhotoBtn.style.display = 'inline-flex';
    
    capturedPhoto = null;
}

function confirmPhoto() {
    if (!capturedPhoto) {
        alert('Aucune photo capturée');
        return;
    }
    
    // Arrêter la caméra
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    // Passer à la sélection d'ASBL
    showStep('selection');
    loadAsblSelection();
}

function showCameraError(message) {
    const cameraContainer = document.querySelector('.camera-container');
    cameraContainer.innerHTML = `
        <div class="camera-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
    cameraContainer.classList.add('no-camera');
}

// Sélection d'ASBL
function loadAsblSelection() {
    // Afficher les informations du distributeur
    const distributeurInfoDiv = document.getElementById('distributeur-info');
    if (distributeurInfo) {
        distributeurInfoDiv.innerHTML = `
            <h4><i class="fas fa-box"></i> ${distributeurInfo.nom}</h4>
            <p>${distributeurInfo.adresse}</p>
        `;
    }
    
    // Charger la grille des ASBL
    const asblGrid = document.getElementById('qr-asbl-grid');
    asblGrid.innerHTML = '';
    
    // Ajouter un message d'instruction
    const instructionDiv = document.createElement('div');
    instructionDiv.className = 'selection-instruction';
    instructionDiv.innerHTML = `
        <p><i class="fas fa-info-circle"></i> <strong>Sélectionnez une seule ASBL</strong> que vous souhaitez soutenir avec votre achat.</p>
    `;
    asblGrid.appendChild(instructionDiv);
    
    asblData.forEach(asbl => {
        const card = document.createElement('div');
        card.className = 'qr-asbl-card';
        card.innerHTML = `
            <div class="qr-asbl-logo">${asbl.logo}</div>
            <h3>${asbl.nom}</h3>
            <div class="qr-asbl-category" style="background-color: ${asbl.couleur}">
                ${asbl.categorie}
            </div>
            <p class="qr-asbl-description">${asbl.description}</p>
            ${asbl.video ? `<div class="asbl-video-indicator"><i class="fas fa-play-circle"></i> Vidéo disponible</div>` : ''}
            <button class="select-asbl-btn" onclick="selectAsbl('${asbl.id}')">
                <i class="fas fa-heart"></i>
                Soutenir cette ASBL
            </button>
        `;
        asblGrid.appendChild(card);
    });
}

function selectAsbl(asblId) {
    selectedAsbl = asblData.find(asbl => asbl.id === asblId);
    
    if (selectedAsbl) {
        // Marquer le code QR comme utilisé
        const qrCodes = JSON.parse(localStorage.getItem('pixie_qr_codes') || '[]');
        const qrCodeIndex = qrCodes.findIndex(qr => qr.code === qrCode);
        
        if (qrCodeIndex !== -1) {
            qrCodes[qrCodeIndex].used = true;
            qrCodes[qrCodeIndex].usedBy = asblId;
            qrCodes[qrCodeIndex].usedDate = new Date().toISOString();
            localStorage.setItem('pixie_qr_codes', JSON.stringify(qrCodes));
        }
        
        // Incrémenter le compteur
        selectedAsbl.unites_achetees += 1;
        
        // Enregistrer la transaction
        saveTransaction();
        
        // Afficher la confirmation
        showConfirmation();
    }
}

function saveTransaction() {
    const transaction = {
        id: 'txn_' + Date.now(),
        qrCode: qrCode,
        distributeur: distributeurInfo,
        asbl: selectedAsbl,
        photo: capturedPhoto,
        timestamp: new Date().toISOString(),
        amount: 1 // 1 unité
    };
    
    // Sauvegarder dans le localStorage (remplacer par API)
    const transactions = JSON.parse(localStorage.getItem('pixie_transactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('pixie_transactions', JSON.stringify(transactions));
    
    console.log('Transaction sauvegardée:', transaction);
}

function showConfirmation() {
    showStep('confirmation');
    
    const selectedAsblInfo = document.getElementById('selected-asbl-info');
    selectedAsblInfo.innerHTML = `
        <div class="selected-asbl-header">
            <div class="selected-asbl-logo">${selectedAsbl.logo}</div>
            <div>
                <h3>${selectedAsbl.nom}</h3>
                <div class="selected-asbl-category" style="background-color: ${selectedAsbl.couleur}">
                    ${selectedAsbl.categorie}
                </div>
            </div>
        </div>
        <p>${selectedAsbl.description}</p>
        <p><strong>Mission:</strong> ${selectedAsbl.mission}</p>
    `;
}

function closeQRPage() {
    // Arrêter la caméra si active
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    
    // Rediriger vers la page principale ou fermer
    if (window.opener) {
        window.close();
    } else {
        window.location.href = 'index.html';
    }
}

// Fonctions globales
window.selectAsbl = selectAsbl;

// Gestion de la fermeture de page
window.addEventListener('beforeunload', function() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
});

// Gestion des erreurs de caméra
window.addEventListener('error', function(e) {
    console.error('Erreur:', e);
});

// Support pour les anciens navigateurs
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    document.addEventListener('DOMContentLoaded', function() {
        showCameraError('Votre navigateur ne supporte pas l\'accès à la caméra. Veuillez utiliser un navigateur plus récent.');
    });
}


// Fonctions de scan QR
let qrScannerStream = null;
let isScanning = false;

async function startQRScanner() {
    try {
        // Demander l'accès à la caméra
        qrScannerStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Caméra arrière si disponible
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        if (qrScannerVideo) {
            qrScannerVideo.srcObject = qrScannerStream;
            qrScannerVideo.style.display = 'block';
        }
        
        // Mise à jour des boutons
        if (startQRScanBtn) startQRScanBtn.style.display = 'none';
        if (stopQRScanBtn) stopQRScanBtn.style.display = 'inline-flex';
        
        // Commencer le scan
        isScanning = true;
        scanForQRCode();
        
    } catch (error) {
        console.error('Erreur d\'accès à la caméra pour le scan QR:', error);
        showQRScanError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
}

function stopQRScanner() {
    isScanning = false;
    
    if (qrScannerStream) {
        qrScannerStream.getTracks().forEach(track => track.stop());
        qrScannerStream = null;
    }
    
    if (qrScannerVideo) {
        qrScannerVideo.style.display = 'none';
    }
    
    // Mise à jour des boutons
    if (startQRScanBtn) startQRScanBtn.style.display = 'inline-flex';
    if (stopQRScanBtn) stopQRScanBtn.style.display = 'none';
}

function scanForQRCode() {
    if (!isScanning || !qrScannerVideo || !qrScannerCanvas) return;
    
    const canvas = qrScannerCanvas;
    const context = canvas.getContext('2d');
    
    // Définir les dimensions du canvas
    canvas.width = qrScannerVideo.videoWidth;
    canvas.height = qrScannerVideo.videoHeight;
    
    if (canvas.width > 0 && canvas.height > 0) {
        // Capturer l'image
        context.drawImage(qrScannerVideo, 0, 0, canvas.width, canvas.height);
        
        // Simulation de détection QR (remplacer par une vraie librairie de scan QR)
        // Pour une vraie implémentation, utiliser une librairie comme jsQR
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const detectedCode = simulateQRDetection(imageData);
        
        if (detectedCode) {
            qrCode = detectedCode;
            stopQRScanner();
            
            // Animation de succès
            showQRDetectedAnimation();
            
            setTimeout(() => {
                validateQRCode(qrCode);
            }, 1000);
            return;
        }
    }
    
    // Continuer le scan
    if (isScanning) {
        requestAnimationFrame(scanForQRCode);
    }
}

function simulateQRDetection(imageData) {
    // Simulation simple - dans une vraie implémentation, utiliser jsQR ou une autre librairie
    // Pour les tests, on peut simuler la détection après quelques secondes
    const random = Math.random();
    if (random < 0.01) { // 1% de chance de "détecter" un code à chaque frame
        return 'PIXIE_SNACK_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    return null;
}

function showQRDetectedAnimation() {
    const scanSection = sections.scan;
    if (scanSection) {
        scanSection.classList.add('qr-detected');
        
        // Afficher un message de succès
        const statusDiv = document.getElementById('qr-scan-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="qr-status success">
                    <i class="fas fa-check-circle"></i>
                    Code QR détecté !
                </div>
            `;
        }
    }
}

function showQRScanError(message) {
    const scannerContainer = document.querySelector('.qr-scanner-container');
    if (scannerContainer) {
        scannerContainer.innerHTML = `
            <div class="qr-scan-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="startQRScanner()" class="btn-primary">
                    <i class="fas fa-redo"></i>
                    Réessayer
                </button>
            </div>
        `;
        scannerContainer.classList.add('no-camera');
    }
}

// Exposer les fonctions globalement
window.startQRScanner = startQRScanner;
window.stopQRScanner = stopQRScanner;

