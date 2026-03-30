import "cypress-mochawesome-reporter/cucumberSupport";
import { faker } from "@faker-js/faker";
import {
  Before,
  After,
  Given,
  When,
  Then,
} from "@badeball/cypress-cucumber-preprocessor";

// ======================
// SELECTEURS
// ======================
const SEL = {
  top: {
    signup: "#signin2",
    login: "#login2",
    cart: "#cartur",
    logout: "#logout2",
  },

  modal: {
    signup: "#signInModal",
    login: "#logInModal",
    contact: "#exampleModal",
    about: "#videoModal",
    order: "#orderModal",
  },

  signup: {
    username: "#sign-username",
    password: "#sign-password",
    submit: "#signInModal button.btn.btn-primary",
  },

  login: {
    username: "#loginusername",
    password: "#loginpassword",
    submit: "#logInModal button.btn.btn-primary",
  },

  contact: {
    email: "#recipient-email",
    name: "#recipient-name",
    message: "#message-text",
    send: "#exampleModal button.btn.btn-primary",
  },

  about: {
    video: "#example-video_html5_api",
    player: "#videoModal .video-js",
    playButton: "#videoModal .vjs-big-play-button",
  },

  home: {
    productTitles: "#tbodyid .card-title a",
    productsContainer: "#tbodyid",
  },

  product: {
    title: "h2.name",
  },

  cart: {
    rows: "#tbodyid > tr",
  },

  order: {
    name: "#name",
    country: "#country",
    city: "#city",
    card: "#card",
    month: "#month",
    year: "#year",
    purchase: "#orderModal button.btn.btn-primary",
  },

  sweetAlert: {
    container: ".sweet-alert, .sweet-alert.showSweetAlert",
    confirmBtn: ".confirm",
  },

  navbar: {
    welcomeUser: "#nameofuser",
  },
};

let createdUser = null;

// ======================
// DONNEES TEST
// ======================
function buildCredentials() {
  const unique = `${Date.now()}${Math.floor(Math.random() * 60000)}`;
  return {
    username: `e2euser${unique}`,
    password: "Test1234!",
  };
}

// ======================
// HELPERS
// ======================
function assertHomeLoaded() {
  cy.url().should("include", "demoblaze.com");
  cy.waitForHomeProducts();
}

function assertWelcomeUser() {
  cy.get(SEL.navbar.welcomeUser, { timeout: 60000 })
    .should("be.visible")
    .and("contain.text", `Welcome ${createdUser.username}`);
}

function closeVisibleModal(modalSelector) {
  cy.get("body").then(($body) => {
    if ($body.find(`${modalSelector}:visible`).length > 0) {
      cy.get(modalSelector).find("button.close").click({ force: true });
    }
  });
}

// ======================
// HOOKS
// ======================
Before(() => {
  cy.viewport(1536, 960);

  if (!createdUser) {
    createdUser = buildCredentials();
  }

  //utilisation de intercepter sert à ecoute la reception de la reponse non la reponse 
  cy.intercept("GET", "**/entries*").as("entries");
  cy.intercept("POST", "**/signup").as("signup");
  cy.intercept("POST", "**/login").as("login");
  cy.intercept("POST", "**/addtocart").as("addToCart");
  cy.intercept("POST", "**/deleteitem").as("deleteItem");
  cy.intercept("POST", "**/viewcart").as("viewCart");
  cy.intercept("POST", "**/bycat").as("bycat");
  cy.intercept("POST", "**/view").as("viewProduct");

  cy.visit("https://www.demoblaze.com/index.html");
  cy.waitForHomeProducts();
});

After(() => {
  cy.get("body").then(($body) => {
    if ($body.find(SEL.sweetAlert.container).length > 0) {
      cy.get(SEL.sweetAlert.confirmBtn).click({ force: true });
    }
  });

  closeVisibleModal(SEL.modal.signup);
  closeVisibleModal(SEL.modal.login);
  closeVisibleModal(SEL.modal.contact);
  closeVisibleModal(SEL.modal.about);
  closeVisibleModal(SEL.modal.order);
});

// ======================
// HOME
// ======================
Given("je suis sur la page d'accueil", () => {
  assertHomeLoaded();
});

When("je retourne sur Home", () => {
  cy.contains("a", "Home").click();
  cy.waitForHomeProducts();
});

Then("je vois les catégories Phones, Laptops et Monitors", () => {
  cy.contains("CATEGORIES").should("be.visible");
  cy.contains("Phones").should("be.visible");
  cy.contains("Laptops").should("be.visible");
  cy.contains("Monitors").should("be.visible");
});

// ======================
// SIGNUP
// ======================
When("j'ouvre la modale Sign up", () => {
  cy.get(SEL.top.signup).click();
  cy.get(SEL.modal.signup).should("be.visible");
});

When("je saisis un username et un password valides", () => {
  cy.get(SEL.signup.username).clear().type(createdUser.username);
  cy.get(SEL.signup.password).clear().type(createdUser.password);
});

When("je confirme le signup", () => {
  cy.stubAlert("alert");
  cy.get(SEL.signup.submit).contains("Sign up").click();
  cy.wait("@signup", { timeout: 30000 });
});

Then("une alerte contient {string}", (expectedText) => {
  cy.get("@alert", { timeout: 60000 }).should("have.been.called");
  cy.get("@alert").then((stub) => {
    const alertText = stub.getCall(0).args[0];
    expect(alertText).to.include(expectedText);
  });
});

// ======================
// LOGIN
// ======================
When("j'ouvre la modale Log in", () => {
  cy.get(SEL.top.login).click();
  cy.get(SEL.modal.login).should("be.visible");
});

When("je me connecte avec le compte créé", () => {
  cy.get(SEL.login.username).clear().type(createdUser.username);
  cy.get(SEL.login.password).clear().type(createdUser.password);
  cy.get(SEL.login.submit).contains("Log in").click();

  cy.wait("@login", { timeout: 30000 });
  cy.wait(1000);
});

Then("je vois le message de bienvenue", () => {
  assertWelcomeUser();
});

Then("la liste des produits est visible", () => {
  cy.waitForHomeProducts();
});

Then("la modale Log in est fermée", () => {
  cy.get(SEL.modal.login).should("not.be.visible");
});

Then("je vois Welcome avec le nom sur la navbar", () => {
  assertWelcomeUser();
});

Then("je vois Logout sur la navbar", () => {
  cy.contains("a", "Log out", { timeout: 15000 }).should("be.visible");
});

Then("je ne vois plus Sign up ni Log in", () => {
  cy.get(SEL.top.signup).should("not.be.visible");
  cy.get(SEL.top.login).should("not.be.visible");
});

// ======================
// CONTACT
// ======================
When("j'ouvre la modale Contact", () => {
  cy.contains("a", "Contact").click();
  cy.get(SEL.modal.contact).should("be.visible");
});

When("je remplis le formulaire de contact", () => {
  cy.get(SEL.contact.email).clear().type(faker.internet.email());
  cy.get(SEL.contact.name).clear().type(faker.person.fullName());
  cy.get(SEL.contact.message).clear().type("Message de test Cypress Demoblaze");
});

When("j'envoie le message Contact", () => {
  cy.stubAlert("alert");
  cy.get(SEL.contact.send).contains("Send message").click();
});

// ======================
// ABOUT US
// ======================
When("j'ouvre la modale About us", () => {
  cy.contains("a", "About us").click();
  cy.get(SEL.modal.about).should("be.visible");
  cy.get(SEL.about.player).should("exist");
});

Then("la vidéo About us est visible", () => {
  cy.get(SEL.modal.about).should("be.visible");
  cy.get(SEL.about.player).should("be.visible");
  cy.get(SEL.about.video).should("exist");
});

When("je clique sur la vidéo pour la lancer", () => {
  cy.get(SEL.about.playButton)
    .should("be.visible")
    .click({ force: true });

  cy.get(SEL.about.video).then(($video) => {
    const video = $video[0];
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  });
});

When("j'avance la vidéo à 20 secondes", () => {
  cy.get(SEL.about.video).then(($video) => {
    const video = $video[0];

    if (video.readyState >= 1) {
      video.currentTime = 20;
    } else {
      return new Cypress.Promise((resolve) => {
        video.addEventListener(
          "loadedmetadata",
          () => {
            video.currentTime = 20;
            resolve();
          },
          { once: true }
        );
      });
    }
  });

  cy.get(SEL.about.video).should(($video) => {
    expect($video[0].currentTime).to.be.gte(19);
  });
});

When("je ferme la modale About us", () => {
  cy.get(SEL.about.video).then(($video) => {
    $video[0].pause();
  });

  cy.wait(500);

  cy.get("body").then(($body) => {
    if ($body.find('#videoModal button[data-dismiss="modal"]').length > 0) {
      cy.get('#videoModal button[data-dismiss="modal"]')
        .last()
        .click({ force: true });
    } else if ($body.find('#videoModal button.close').length > 0) {
      cy.get('#videoModal button.close').click({ force: true });
    }
  });

  cy.wait(1000);
});

Then("la modale About us est fermée", () => {
  cy.get(SEL.modal.about, { timeout: 60000 }).should("not.be.visible");
});

// ======================
// CATALOGUE / PRODUIT
// ======================
When('je sélectionne la catégorie {string}', (category) => {
  cy.contains("a", category).click();
  cy.wait("@bycat", { timeout: 60000 });
  cy.waitForHomeProducts();
});

When("j'ouvre le premier produit de la liste", () => {
  cy.get(SEL.home.productTitles)
    .first()
    .then(($a) => {
      Cypress.env("LAST_PRODUCT_NAME", $a.text().trim());
    });

  cy.get(SEL.home.productTitles).first().click();

  cy.wait("@viewProduct", { timeout: 60000 });
  cy.url().should("include", "prod.html");
  cy.get(SEL.product.title, { timeout: 20000 }).should("be.visible");
});

// ======================
// PANIER / ACHAT
// ======================
When("j'ajoute le produit au panier", () => {
  cy.stubAlert("alert");
  cy.contains("a", "Add to cart").click();
  cy.wait("@addToCart", { timeout: 30000 });
});

When("je vais au panier", () => {
  cy.get(SEL.top.cart).click();
  cy.url().should("include", "cart");
  cy.get("body", { timeout: 60000 }).should("be.visible");
});

Then("je vois le produit dans le panier", () => {
  const expected = Cypress.env("LAST_PRODUCT_NAME");
  cy.get(SEL.cart.rows, { timeout: 60000 }).should("have.length.greaterThan", 0);
  cy.contains("td", expected, { timeout: 60000 }).should("be.visible");
});

When("je supprime le produit du panier", () => {
  cy.contains("a", "Delete").click();
  cy.wait(1500);
});

Then("le produit disparaît du panier", () => {
  const expected = Cypress.env("LAST_PRODUCT_NAME");
  cy.get("body", { timeout: 60000 }).should("not.contain", expected);
});

When("je passe une commande en remplissant le formulaire", () => {
  cy.contains("button", "Place Order").click();
  cy.get(SEL.modal.order).should("be.visible");

  cy.get(SEL.order.name).clear().type(faker.person.fullName());
  cy.get(SEL.order.country).clear().type("Morocco");
  cy.get(SEL.order.city).clear().type("Casablanca");
  cy.get(SEL.order.card).clear().type("4111111111111111");
  cy.get(SEL.order.month).clear().type("12");
  cy.get(SEL.order.year).clear().type("2028");

  cy.get(SEL.order.purchase).contains("Purchase").click();
});

Then("je vois la confirmation d'achat", () => {
  cy.get(SEL.sweetAlert.container, { timeout: 15000 }).should("be.visible");
  cy.contains("Thank you for your purchase!").should("be.visible");
  cy.get(SEL.sweetAlert.confirmBtn).contains("OK").click({ force: true });
});

// ======================
// LOGOUT
// ======================
When("je clique sur Logout", () => {
  cy.get("body").then(($body) => {
    if ($body.find(SEL.sweetAlert.container).length > 0) {
      cy.get(SEL.sweetAlert.confirmBtn).click({ force: true });
    }

    if ($body.find(`${SEL.modal.order}:visible`).length > 0) {
      cy.get(SEL.modal.order).find("button.close").click({ force: true });
    }

    if ($body.find(`${SEL.modal.about}:visible`).length > 0) {
      cy.get(SEL.modal.about).find("button.close").click({ force: true });
    }

    if ($body.find(`${SEL.modal.contact}:visible`).length > 0) {
      cy.get(SEL.modal.contact).find("button.close").click({ force: true });
    }

    if ($body.find(`${SEL.modal.login}:visible`).length > 0) {
      cy.get(SEL.modal.login).find("button.close").click({ force: true });
    }

    if ($body.find(`${SEL.modal.signup}:visible`).length > 0) {
      cy.get(SEL.modal.signup).find("button.close").click({ force: true });
    }
  });

  cy.wait(1000);

  cy.get(SEL.top.logout).should("be.visible").click({ force: true });
});

Then("je suis déconnecté", () => {
  //cy.get(SEL.navbar.welcomeUser).should("not.exist");
  cy.get(SEL.top.login).should("be.visible");
  cy.get(SEL.top.signup).should("be.visible");
});