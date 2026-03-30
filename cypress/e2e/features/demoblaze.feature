# language: fr
Fonctionnalité: Demoblaze - parcours E2E complet connecté

  Scénario: Parcours complet utilisateur de bout en bout
    Étant donné je suis sur la page d'accueil

    Quand j'ouvre la modale Sign up
    Et je saisis un username et un password valides
    Et je confirme le signup
    Alors une alerte contient "Sign up successful."

    Quand j'ouvre la modale Log in
    Et je me connecte avec le compte créé
    Alors je vois le message de bienvenue
    Et la liste des produits est visible
    Et la modale Log in est fermée
    Et je vois Welcome avec le nom sur la navbar
    Et je vois Logout sur la navbar
    Et je ne vois plus Sign up ni Log in

    Quand je retourne sur Home
    Alors je vois les catégories Phones, Laptops et Monitors

    Quand j'ouvre la modale Contact
    Et je remplis le formulaire de contact
    Et j'envoie le message Contact
    Alors une alerte contient "Thanks for the message!!"

    Quand j'ouvre la modale About us
    Alors la vidéo About us est visible
    Quand je clique sur la vidéo pour la lancer
    Et j'avance la vidéo à 20 secondes
    Et je ferme la modale About us
    Alors la modale About us est fermée

    Quand je retourne sur Home
    Et je sélectionne la catégorie "Phones"
    Et j'ouvre le premier produit de la liste
    Et j'ajoute le produit au panier
    Alors une alerte contient "Product added."

    Quand je vais au panier
    Alors je vois le produit dans le panier

    Quand je supprime le produit du panier
    Alors le produit disparaît du panier

    Quand je retourne sur Home
    Et je sélectionne la catégorie "Phones"
    Et j'ouvre le premier produit de la liste
    Et j'ajoute le produit au panier
    Alors une alerte contient "Product added."

    Quand je vais au panier
    Alors je vois le produit dans le panier
    Quand je passe une commande en remplissant le formulaire
    Alors je vois la confirmation d'achat

    Quand je clique sur Logout
    Alors je suis déconnecté