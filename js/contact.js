// Page de contact Pixie

// Configuration
const CONTACT_EMAIL = 'contact@pixie.be'; // Email de destination (modifiable)

// Éléments DOM
const contactForm = document.getElementById('contact-form');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    setupContactForm();
    handleURLParams();
});

function setupContactForm() {
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
}

function handleURLParams() {
    // Pré-remplir le sujet si spécifié dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const sujet = urlParams.get('sujet');
    
    if (sujet) {
        const sujetSelect = document.getElementById('sujet');
        if (sujetSelect) {
            sujetSelect.value = sujet;
        }
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Récupération des données du formulaire
    const formData = new FormData(contactForm);
    const data = {
        nom: formData.get('nom'),
        prenom: formData.get('prenom'),
        email: formData.get('email'),
        telephone: formData.get('telephone'),
        sujet: formData.get('sujet'),
        message: formData.get('message')
    };
    
    // Validation
    if (!validateForm(data)) {
        return;
    }
    
    // Simulation d'envoi (remplacer par vraie API)
    sendContactMessage(data);
}

function validateForm(data) {
    // Supprimer les messages d'erreur précédents
    removeFormMessages();
    
    const errors = [];
    
    // Validation des champs requis
    if (!data.nom.trim()) {
        errors.push('Le nom est requis');
    }
    
    if (!data.prenom.trim()) {
        errors.push('Le prénom est requis');
    }
    
    if (!data.email.trim()) {
        errors.push('L\'email est requis');
    } else if (!isValidEmail(data.email)) {
        errors.push('L\'email n\'est pas valide');
    }
    
    if (!data.sujet) {
        errors.push('Le sujet est requis');
    }
    
    if (!data.message.trim()) {
        errors.push('Le message est requis');
    } else if (data.message.trim().length < 10) {
        errors.push('Le message doit contenir au moins 10 caractères');
    }
    
    // Afficher les erreurs
    if (errors.length > 0) {
        showFormMessage('error', 'Erreurs de validation :', errors);
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function sendContactMessage(data) {
    // Afficher un message de chargement
    showFormMessage('info', 'Envoi en cours...');
    
    // Simulation d'envoi (remplacer par vraie API)
    setTimeout(() => {
        // Simulation de succès
        if (Math.random() > 0.1) { // 90% de succès
            handleSendSuccess(data);
        } else {
            handleSendError();
        }
    }, 2000);
}

function handleSendSuccess(data) {
    // Message de succès
    showFormMessage('success', 'Message envoyé avec succès !', [
        'Nous avons bien reçu votre message.',
        'Nous vous répondrons dans les plus brefs délais.',
        'Merci de votre intérêt pour Pixie !'
    ]);
    
    // Réinitialiser le formulaire
    contactForm.reset();
    
    // Enregistrer dans le localStorage pour suivi
    saveContactToHistory(data);
    
    // Scroll vers le message
    document.querySelector('.form-message').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

function handleSendError() {
    showFormMessage('error', 'Erreur lors de l\'envoi', [
        'Une erreur est survenue lors de l\'envoi de votre message.',
        'Veuillez réessayer ou nous contacter directement à ' + CONTACT_EMAIL
    ]);
}

function showFormMessage(type, title, messages = []) {
    removeFormMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type} show`;
    
    let content = `<strong>${title}</strong>`;
    if (messages.length > 0) {
        content += '<ul>';
        messages.forEach(msg => {
            content += `<li>${msg}</li>`;
        });
        content += '</ul>';
    }
    
    messageDiv.innerHTML = content;
    
    // Insérer avant le formulaire
    contactForm.parentNode.insertBefore(messageDiv, contactForm);
}

function removeFormMessages() {
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
}

function saveContactToHistory(data) {
    const contacts = JSON.parse(localStorage.getItem('pixie_contacts') || '[]');
    
    const contact = {
        id: 'contact_' + Date.now(),
        ...data,
        timestamp: new Date().toISOString(),
        status: 'sent'
    };
    
    contacts.push(contact);
    
    // Garder seulement les 20 derniers contacts
    if (contacts.length > 20) {
        contacts.splice(0, contacts.length - 20);
    }
    
    localStorage.setItem('pixie_contacts', JSON.stringify(contacts));
}

// Fonctions utilitaires pour l'administration
function getContactHistory() {
    return JSON.parse(localStorage.getItem('pixie_contacts') || '[]');
}

function clearContactHistory() {
    localStorage.removeItem('pixie_contacts');
}

// Export pour utilisation dans d'autres scripts
window.PixieContact = {
    getContactHistory,
    clearContactHistory,
    CONTACT_EMAIL
};

