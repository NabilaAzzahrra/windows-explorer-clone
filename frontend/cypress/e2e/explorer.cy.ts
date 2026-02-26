describe('File Explorer E2E', () => {
    it('should load and display folders', () => {
        cy.visit('http://localhost:3000')
        cy.contains('Explorer').should('be.visible')
        cy.contains('Documents').should('be.visible')
    })

    it('should search for folders', () => {
        cy.visit('http://localhost:3000')
        cy.get('input[placeholder="Search folders..."]').type('Pictures')
        cy.get('.main-content').contains('Pictures').should('be.visible')
    })
})
