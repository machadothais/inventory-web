describe("Happy Path - Production Flow", () => {
  it("creates raw material, product, BOM and checks production plan", () => {
    const suffix = Date.now();
    const rmCode = `RM${suffix}`;
    const prodCode = `P${suffix}`;

    // RAW MATERIALS
    cy.visit("/raw-materials");

    cy.get("input[placeholder^='Code']", { timeout: 15000 }).clear().type(rmCode);
    cy.get("input[placeholder^='Name']").clear().type("Steel");
    cy.get("input[placeholder^='Stock']").clear().type("100");
    cy.contains(/^Save$/i).click();

    // PRODUCTS
    cy.visit("/products");

    cy.get('[data-cy="product-code"]', { timeout: 15000 }).clear().type(prodCode);
    cy.get('[data-cy="product-name"]').clear().type("Test Bike");
    cy.get('[data-cy="product-price"]').clear().type("1000");
    cy.get('[data-cy="product-save"]').click();

    // Garantir que a linha apareceu
    cy.get(`[data-cy="product-row-${prodCode}"]`, { timeout: 15000 }).should("exist");

    // Abrir BOM do produto criado
    cy.get(`[data-cy="product-bom-${prodCode}"]`).click();

    // BOM Editor
    cy.get('[data-cy="bom-editor"]', { timeout: 15000 }).should("be.visible");

    // Selecionar RM no select (o option mostra "RMxxx - Steel")
    cy.get('[data-cy="bom-raw-material-select"]')
      .should("be.visible")
      .select(`${rmCode} - Steel`);

    cy.get('[data-cy="bom-quantity-input"]').clear().type("10");
    cy.get('[data-cy="bom-add"]').click();

    // Validar item entrou
    cy.get('[data-cy="bom-table"]').should("be.visible");
    cy.contains("Steel").should("exist");
    cy.contains("10").should("exist");

    // PRODUCTION PLAN
    cy.visit("/production-plan");
    cy.contains(/^Refresh$/i, { timeout: 15000 }).click();

    // Validar: procura pelo code único
    cy.contains(prodCode).should("exist");
  });
});
