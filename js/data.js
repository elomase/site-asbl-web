// Données des ASBL
const asblData = [
    {
        id: "croix-rouge-belgique",
        nom: "Croix-Rouge de Belgique",
        description: "La Croix-Rouge de Belgique est une association humanitaire qui vient en aide aux personnes les plus vulnérables en Belgique et dans le monde. Elle agit dans les domaines de l'aide humanitaire, des premiers secours, de la formation et de l'action sociale.",
        mission: "Prévenir et alléger les souffrances humaines, protéger la vie et la santé, faire respecter la personne humaine, notamment en temps de conflit armé et dans d'autres situations d'urgence.",
        logo: "🏥",
        contact: {
            email: "info@croix-rouge.be",
            telephone: "+32 2 371 31 11",
            adresse: "Rue de Stalle 96, 1180 Uccle, Belgique"
        },
        website: "https://www.croix-rouge.be",
        unites_achetees: 0,
        date_creation: "1864-01-01",
        categorie: "Humanitaire",
        couleur: "#e74c3c",
        video: ""
    },
    {
        id: "medecins-sans-frontieres",
        nom: "Médecins Sans Frontières Belgique",
        description: "Médecins Sans Frontières est une organisation médicale humanitaire internationale qui apporte une assistance médicale aux populations dont la vie ou la santé sont menacées, principalement en cas de conflits armés, mais aussi d'épidémies, de pandémies, de catastrophes naturelles ou encore d'exclusion des soins.",
        mission: "Apporter une assistance médicale à des populations dont la vie ou la santé sont menacées, témoigner des violations du droit humanitaire dont nos équipes sont témoins.",
        logo: "⚕️",
        contact: {
            email: "info@msf.be",
            telephone: "+32 2 474 74 74",
            adresse: "Rue Dupré 94, 1090 Jette, Belgique"
        },
        website: "https://www.msf.be",
        unites_achetees: 0,
        date_creation: "1971-01-01",
        categorie: "Médical",
        couleur: "#2ecc71",
        video: ""
    },
    {
        id: "oxfam-belgique",
        nom: "Oxfam Belgique",
        description: "Oxfam Belgique est une organisation de développement qui lutte contre la pauvreté et l'injustice dans le monde. Elle mène des programmes de développement, d'aide humanitaire et de plaidoyer pour un monde plus juste.",
        mission: "Lutter contre la pauvreté et l'injustice en s'attaquant aux causes structurelles qui les génèrent, en particulier les inégalités entre les femmes et les hommes.",
        logo: "🌍",
        contact: {
            email: "info@oxfam.be",
            telephone: "+32 2 501 67 00",
            adresse: "Rue des Quatre Vents 60, 1080 Molenbeek-Saint-Jean, Belgique"
        },
        website: "https://www.oxfam.be",
        unites_achetees: 0,
        date_creation: "1964-01-01",
        categorie: "Développement",
        couleur: "#3498db",
        video: ""
    },
    {
        id: "wwf-belgique",
        nom: "WWF Belgique",
        description: "Le WWF Belgique œuvre pour la conservation de la nature et la protection de l'environnement. L'organisation travaille à la préservation de la biodiversité, à la lutte contre le changement climatique et à la promotion d'un mode de vie durable.",
        mission: "Construire un avenir où les humains vivent en harmonie avec la nature, en conservant la diversité biologique mondiale, en garantissant l'utilisation durable des ressources naturelles renouvelables.",
        logo: "🐼",
        contact: {
            email: "info@wwf.be",
            telephone: "+32 2 340 09 99",
            adresse: "Boulevard Emile Jacqmain 90, 1000 Bruxelles, Belgique"
        },
        website: "https://www.wwf.be",
        unites_achetees: 0,
        date_creation: "1966-01-01",
        categorie: "Environnement",
        couleur: "#27ae60",
        video: ""
    },
    {
        id: "unicef-belgique",
        nom: "UNICEF Belgique",
        description: "L'UNICEF Belgique travaille pour la défense des droits de l'enfant dans le monde. L'organisation mène des programmes de protection, d'éducation, de santé et d'aide d'urgence pour les enfants les plus vulnérables.",
        mission: "Défendre les droits de chaque enfant, partout, tout le temps. Transformer cette exigence en actions concrètes, en concentrant nos efforts sur les enfants les plus vulnérables et exclus.",
        logo: "👶",
        contact: {
            email: "info@unicef.be",
            telephone: "+32 2 230 59 70",
            adresse: "Avenue des Arts 20, 1000 Bruxelles, Belgique"
        },
        website: "https://www.unicef.be",
        unites_achetees: 0,
        date_creation: "1946-01-01",
        categorie: "Enfance",
        couleur: "#9b59b6",
        video: ""
    },
    {
        id: "amnesty-international",
        nom: "Amnesty International Belgique",
        description: "Amnesty International Belgique défend les droits humains dans le monde entier. L'organisation mène des campagnes contre les violations des droits humains, libère les prisonniers d'opinion et lutte contre la peine de mort.",
        mission: "Faire respecter tous les droits humains énoncés dans la Déclaration universelle des droits de l'homme et autres normes internationales par des recherches et des actions.",
        logo: "⚖️",
        contact: {
            email: "info@amnesty.be",
            telephone: "+32 2 538 81 77",
            adresse: "Rue Berckmans 9, 1060 Saint-Gilles, Belgique"
        },
        website: "https://www.amnesty.be",
        unites_achetees: 0,
        date_creation: "1961-01-01",
        categorie: "Droits humains",
        couleur: "#f39c12",
        video: ""
    }
];

// Fonction pour sauvegarder les données dans le localStorage
function saveData() {
    localStorage.setItem('asblData', JSON.stringify(asblData));
}

// Fonction pour charger les données depuis le localStorage
function loadData() {
    const savedData = localStorage.getItem('asblData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Mettre à jour les données avec les valeurs sauvegardées
        parsedData.forEach((savedAsbl, index) => {
            if (asblData[index]) {
                asblData[index].unites_achetees = savedAsbl.unites_achetees || 0;
            }
        });
    }
}

// Fonction pour obtenir les statistiques
function getStatistics() {
    const totalUnites = asblData.reduce((total, asbl) => total + asbl.unites_achetees, 0);
    const categories = [...new Set(asblData.map(asbl => asbl.categorie))];
    
    return {
        totalAsbl: asblData.length,
        totalUnites: totalUnites,
        totalCategories: categories.length,
        asblStats: asblData.map(asbl => ({
            nom: asbl.nom,
            unites: asbl.unites_achetees,
            categorie: asbl.categorie,
            couleur: asbl.couleur
        })).sort((a, b) => b.unites - a.unites)
    };
}

// Fonction pour acheter des unités
function acheterUnites(asblId, nombreUnites) {
    const asbl = asblData.find(a => a.id === asblId);
    if (asbl) {
        asbl.unites_achetees += nombreUnites;
        saveData();
        return true;
    }
    return false;
}

// Charger les données au démarrage
loadData();

