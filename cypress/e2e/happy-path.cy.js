describe("Happy Path - Production Flow", () => {
  it("creates raw material, product, BOM and checks production plan", () => {
    const suffix = Date.now();
    const rmCode = `RM${suffix}`;
    const prodCode = `P${suffix}`;

    cy.visit("/raw-materials");

    cy.get('[data-cy="rm-code"]', { timeout: 15000 })
      .should("be.visible")
      .clear()
      .type(rmCode);

    cy.get('[data-cy="rm-name"]').clear().type("Steel");
    cy.get('[data-cy="rm-stock"]').clear().type("100");
    cy.get('[data-cy="rm-save"]').click();

    // opcional mas recomendado: garante que entrou na lista
    cy.get(`[data-cy="rm-row-${rmCode}"]`, { timeout: 15000 }).should("exist");

    cy.visit("/products");

    cy.get('[data-cy="product-code"]', { timeout: 15000 }).clear().type(prodCode);
    cy.get('[data-cy="product-name"]').clear().type("Test Bike");
    cy.get('[data-cy="product-price"]').clear().type("1000");
    cy.get('[data-cy="product-save"]').click();

    cy.get(`[data-cy="product-row-${prodCode}"]`, { timeout: 15000 }).should("exist");

    cy.get(`[data-cy="product-bom-${prodCode}"]`).click();

    cy.get('[data-cy="bom-editor"]', { timeout: 15000 }).should("be.visible");

    cy.get('[data-cy="bom-raw-material-select"]')
      .should("be.visible")
      .select(`${rmCode} - Steel`);

    cy.get('[data-cy="bom-quantity-input"]').clear().type("10");
    cy.get('[data-cy="bom-add"]').click();

    cy.get('[data-cy="bom-table"]').should("be.visible");
    cy.contains("Steel").should("exist");
    cy.contains("10").should("exist");

    cy.visit("/production-plan");
    cy.contains(/^Refresh$/i, { timeout: 15000 }).click();

    cy.contains(prodCode).should("exist");
  });
});