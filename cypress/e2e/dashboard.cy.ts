describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Intercept API calls to prevent real API requests during testing
    cy.intercept('GET', '**/top-headlines**', {
      fixture: 'news.json'
    }).as('getNews')
    
    cy.intercept('GET', '**/movie/popular**', {
      fixture: 'movies.json'
    }).as('getMovies')

    cy.visit('/')
  })

  it('should load the dashboard successfully', () => {
    cy.get('[data-testid="dashboard"]').should('be.visible')
    cy.get('[data-testid="header"]').should('be.visible')
    cy.get('[data-testid="sidebar"]').should('be.visible')
  })

  it('should display content cards', () => {
    cy.wait(['@getNews', '@getMovies'])
    cy.get('[data-testid="content-card"]').should('have.length.greaterThan', 0)
  })

  it('should toggle dark mode', () => {
    cy.get('[data-testid="theme-toggle"]').click()
    cy.get('html').should('have.class', 'dark')
    
    cy.get('[data-testid="theme-toggle"]').click()
    cy.get('html').should('not.have.class', 'dark')
  })

  it('should open and close settings panel', () => {
    cy.get('[data-testid="settings-button"]').click()
    cy.get('[data-testid="settings-panel"]').should('be.visible')
    
    cy.get('[data-testid="settings-close"]').click()
    cy.get('[data-testid="settings-panel"]').should('not.be.visible')
  })

  it('should update user preferences', () => {
    cy.get('[data-testid="settings-button"]').click()
    cy.get('[data-testid="settings-panel"]').should('be.visible')
    
    // Toggle a category preference
    cy.get('[data-testid="category-technology"]').click()
    cy.get('[data-testid="save-preferences"]').click()
    
    // Verify the preference was saved (check localStorage or UI state)
    cy.window().its('localStorage').invoke('getItem', 'userPreferences')
      .should('contain', 'technology')
  })

  describe('Search functionality', () => {
    it('should perform search and display results', () => {
      const searchQuery = 'technology'
      
      cy.intercept('GET', '**/everything**', {
        fixture: 'search-results.json'
      }).as('searchNews')
      
      cy.intercept('GET', '**/search/movie**', {
        fixture: 'search-movies.json'
      }).as('searchMovies')

      cy.get('[data-testid="search-input"]').type(searchQuery)
      cy.get('[data-testid="search-button"]').click()

      cy.wait(['@searchNews', '@searchMovies'])
      cy.get('[data-testid="search-results"]').should('be.visible')
      cy.get('[data-testid="search-result-item"]').should('have.length.greaterThan', 0)
    })

    it('should clear search results', () => {
      cy.get('[data-testid="search-input"]').type('test')
      cy.get('[data-testid="search-button"]').click()
      
      cy.get('[data-testid="clear-search"]').click()
      cy.get('[data-testid="search-results"]').should('not.be.visible')
      cy.get('[data-testid="search-input"]').should('have.value', '')
    })

    it('should debounce search input', () => {
      cy.get('[data-testid="search-input"]').type('tech')
      
      // Should not trigger search immediately
      cy.get('[data-testid="search-results"]').should('not.exist')
      
      // Wait for debounce delay and continue typing
      cy.wait(300)
      cy.get('[data-testid="search-input"]').type('nology')
      
      // Should trigger search after debounce delay
      cy.wait(600)
      cy.get('[data-testid="search-results"]').should('be.visible')
    })
  })

  describe('Favorites functionality', () => {
    it('should add item to favorites', () => {
      cy.wait(['@getNews', '@getMovies'])
      
      cy.get('[data-testid="content-card"]').first().within(() => {
        cy.get('[data-testid="favorite-button"]').click()
      })

      // Navigate to favorites section
      cy.get('[data-testid="favorites-tab"]').click()
      cy.get('[data-testid="favorites-section"]').should('be.visible')
      cy.get('[data-testid="favorite-item"]').should('have.length', 1)
    })

    it('should remove item from favorites', () => {
      // First add an item to favorites
      cy.wait(['@getNews', '@getMovies'])
      cy.get('[data-testid="content-card"]').first().within(() => {
        cy.get('[data-testid="favorite-button"]').click()
      })

      // Navigate to favorites and remove
      cy.get('[data-testid="favorites-tab"]').click()
      cy.get('[data-testid="favorite-item"]').first().within(() => {
        cy.get('[data-testid="remove-favorite"]').click()
      })

      cy.get('[data-testid="favorite-item"]').should('have.length', 0)
    })
  })

  describe('Drag and Drop functionality', () => {
    it('should reorder content cards', () => {
      cy.wait(['@getNews', '@getMovies'])
      
      // Get the first two cards
      cy.get('[data-testid="content-card"]').first().as('firstCard')
      cy.get('[data-testid="content-card"]').eq(1).as('secondCard')

      // Store initial titles
      cy.get('@firstCard').find('[data-testid="card-title"]').invoke('text').as('firstTitle')
      cy.get('@secondCard').find('[data-testid="card-title"]').invoke('text').as('secondTitle')

      // Perform drag and drop
      cy.get('@firstCard').trigger('dragstart')
      cy.get('@secondCard').trigger('dragover')
      cy.get('@secondCard').trigger('drop')

      // Verify the order has changed
      cy.get('[data-testid="content-card"]').first().find('[data-testid="card-title"]')
        .should(($el) => {
          cy.get('@secondTitle').then((secondTitle) => {
            expect($el.text()).to.equal(secondTitle)
          })
        })
    })
  })

  describe('Navigation', () => {
    it('should navigate between sections', () => {
      const sections = ['feed', 'trending', 'favorites']
      
      sections.forEach((section) => {
        cy.get(`[data-testid="${section}-tab"]`).click()
        cy.get(`[data-testid="${section}-section"]`).should('be.visible')
      })
    })

    it('should maintain section state on page reload', () => {
      cy.get('[data-testid="trending-tab"]').click()
      cy.reload()
      cy.get('[data-testid="trending-section"]').should('be.visible')
    })
  })

  describe('Responsive design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x')
      
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible')
      cy.get('[data-testid="sidebar"]').should('not.be.visible')
      
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="sidebar"]').should('be.visible')
    })

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2')
      
      cy.get('[data-testid="dashboard"]').should('be.visible')
      cy.get('[data-testid="content-card"]').should('be.visible')
    })
  })

  describe('Error handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '**/top-headlines**', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getNewsError')

      cy.visit('/')
      cy.wait('@getNewsError')
      
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="retry-button"]').should('be.visible')
    })

    it('should retry failed requests', () => {
      cy.intercept('GET', '**/top-headlines**', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getNewsError')

      cy.visit('/')
      cy.wait('@getNewsError')
      
      // Mock successful retry
      cy.intercept('GET', '**/top-headlines**', {
        fixture: 'news.json'
      }).as('getNewsRetry')

      cy.get('[data-testid="retry-button"]').click()
      cy.wait('@getNewsRetry')
      
      cy.get('[data-testid="content-card"]').should('be.visible')
    })
  })
})