describe('Tainacan Plugin Test', function () {
  beforeEach(() => {
    cy.loginByUI()
  })

  it('clear DB', function(){
    cy.clearDB()
  })

  context('Collections', function(){
    it('canceled collection', function(){
      cy.visit('/wp-admin/admin.php?page=tainacan_admin#/collections')
      cy.get('h1').should('contain', 'Collections Page')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book canceled')
      cy.get('#tainacan-text-description').type('description book canceled')
      cy.get('#button-cancel-collection-creation').click()
      cy.url().should('contain', '/wp-admin/admin.php?page=tainacan_admin#/collections/')
      cy.get('h1').should('contain', 'Collections Page')
      cy.get('td').should('not.contain', 'Book canceled')
    })

    it('create collection with status publish', function(){
      cy.visit('/wp-admin/admin.php?page=tainacan_admin#/collections')
      cy.get('h1').should('contain', 'Collections Page')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book publish')
      cy.get('#tainacan-text-description').type('description book publish')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book publish')
    })

    it('create collection with status private', function(){
      cy.visit('/wp-admin/admin.php?page=tainacan_admin#/collections')
      cy.get('h1').should('contain', 'Collections Page')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book private')
      cy.get('#tainacan-text-description').type('description book private')
      cy.get('#tainacan-select-status').select('Private').should('have.value', 'private')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book private')
    })

    it('create collection with status draft', function(){
      cy.visit('/wp-admin/admin.php?page=tainacan_admin#/collections')
      cy.get('h1').should('contain', 'Collections Page')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book draft')
      cy.get('#tainacan-text-description').type('description book draft')
      cy.get('#tainacan-select-status').select('Draft').should('have.value', 'draft')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book draft')
    })

    it('create collection with status trash', function(){
      cy.visit('/wp-admin/admin.php?page=tainacan_admin#/collections')
      cy.get('h1').should('contain', 'Collections Page')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book trash')
      cy.get('#tainacan-text-description').type('description book trash')
      cy.get('#tainacan-select-status').select('Trash').should('have.value', 'trash')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book trash')
    })

    it('delete collection', function(){
      cy.visit('/wp-admin/admin.php?page=tainacan_admin#/collections')
      cy.get('h1').should('contain', 'Collections Page')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book delete')
      cy.get('#tainacan-text-description').type('description book delete')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book delete')
      cy.get(':nth-child(1) > [data-label="Actions"] > :nth-child(1) > #button-delete > .icon > .mdi').click()
      cy.get('.modal-card-body').should('contain', 'Do you really want to delete this collection?')
      cy.get('.is-primary').click()
      cy.get('.b-table').should('not.contain', 'Book delete')
    })
  })

  context('Create many collections for verify persistence the datas', function(){
    it('create many collections', function(){
      cy.visit('/wp-admin/admin.php?page=tainacan_admin#/collections')
      cy.get('h1').should('contain', 'Collections Page')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 1')
      cy.get('#tainacan-text-description').type('description book 1')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 1')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 2')
      cy.get('#tainacan-text-description').type('description book 2')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 2')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 3')
      cy.get('#tainacan-text-description').type('description book 3')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 3')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 4')
      cy.get('#tainacan-text-description').type('description book 4')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 4')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 5')
      cy.get('#tainacan-text-description').type('description book 5')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 5')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 6')
      cy.get('#tainacan-text-description').type('description book 6')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 6')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 7')
      cy.get('#tainacan-text-description').type('description book 7')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 7')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 8')
      cy.get('#tainacan-text-description').type('description book 8')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 8')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 9')
      cy.get('#tainacan-text-description').type('description book 9')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 9')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 10')
      cy.get('#tainacan-text-description').type('description book 10')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 10')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 11')
      cy.get('#tainacan-text-description').type('description book 11')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 11')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 12')
      cy.get('#tainacan-text-description').type('description book 12')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 12')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 13')
      cy.get('#tainacan-text-description').type('description book 13')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 13')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 14')
      cy.get('#tainacan-text-description').type('description book 14')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 14')
      cy.get('#button-collection-creation').click()
      cy.get('#tainacan-text-name').type('Book 15')
      cy.get('#tainacan-text-description').type('description book 15')
      cy.get('#tainacan-select-status').select('Publish').should('have.value', 'publish')
      cy.get('#button-submit-collection-creation').click()
      cy.get('.breadcrumbs > :nth-child(2) > .router-link-active').click()
      cy.get('.b-table').should('contain', 'Book 15')
    })
  })

  context('Check all collections', function(){
    it('check if collections are updated to page', function(){
      cy.visit('/wp-admin/admin.php?page=tainacan_admin#/collections')
      cy.get('h1').should('contain', 'Collections Page')
      cy.get('.active-fields-area >').should('contain', 'Book publish')
      .and('contain', 'Book private')
      .and('contain', 'Book draft')
      .and('contain', 'Book trash')
      .and('contain', 'Book 1')
      .and('contain', 'Book 2')
      .and('contain', 'Book 3')
      .and('contain', 'Book 4')
      .and('contain', 'Book 5')
      .and('contain', 'Book 6')
      .and('contain', 'Book 7')
      .and('contain', 'Book 8')
      .and('contain', 'Book 9')
      .and('contain', 'Book 10')
      .and('contain', 'Book 11')
      .and('contain', 'Book 12')
      .and('contain', 'Book 13')
      .and('contain', 'Book 14')
      .and('contain', 'Book 15')
    })
  })
})
