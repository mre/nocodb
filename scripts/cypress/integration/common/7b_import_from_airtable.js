// Cypress test suite: Project import from Airtable
//

import {
  isTestSuiteActive,
  roles,
} from "../../support/page_objects/projectConstants";
import { loginPage, projectsPage } from "../../support/page_objects/navigation";
import { mainPage } from "../../support/page_objects/mainPage";

let apiKey = "";
let sharedBase = "";

export const genTest = (apiType, dbType) => {
  if (!isTestSuiteActive(apiType, dbType)) return;

  describe(`Import from airtable`, () => {
    before(() => {
      apiKey = Cypress.env("airtable").apiKey;
      sharedBase = Cypress.env("airtable").sharedBase;
    });

    it("Import", () => {
      cy.log(apiKey, sharedBase);

      loginPage.signIn(roles.owner.credentials);
      projectsPage.createProject(
        { dbType: "none", apiType: "REST", name: "importSample" },
        {}
      );

      // trigger import
      cy.get(".nc-add-new-table").should("exist").trigger("mouseover");
      cy.get(".nc-import-menu").should("exist").click();
      cy.getActiveMenu(".nc-dropdown-import-menu")
        .find(".ant-dropdown-menu-item")
        .contains("Airtable")
        .click();

      cy.getActiveModal(".nc-modal-airtable-import")
        .find(".nc-input-api-key")
        .should("exist")
        .clear()
        .type(apiKey);
      cy.getActiveModal(".nc-modal-airtable-import")
        .find(".nc-input-shared-base")
        .should("exist")
        .clear()
        .type(sharedBase);
      cy.getActiveModal(".nc-modal-airtable-import")
        .find(".nc-btn-airtable-import")
        .should("exist")
        .click();

      // it will take a while for import to finish
      // cy.getActiveModal().find(".nc-btn-go-dashboard", {timeout: 180000}).should('exist').click()

      // wait for import to finish (kludge/hardcoded)
      cy.get(":nth-child(51) > .flex", { timeout: 180000 })
        .contains("Complete!")
        .should("exist");
      cy.get(".ant-modal-close-x").should("exist").click();
    });
  });
};


