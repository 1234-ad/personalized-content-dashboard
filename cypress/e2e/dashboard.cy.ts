describe('Personalized Content Dashboard', () => {
  beforeEach(() => {
    // Visit the dashboard
    cy.visit('/')
    
    // Wait for initial content to load
    cy.get('[data-testid="content-feed"]', { timeout: 10000 }).should('be.visible')
  })

  describe('Dashboard Layout', () => {
    it('should display header with navigation elements', () => {
      cy.get('[data-testid="header"]').should('be.visible')
      cy.get('[data-testid="search-input"]').should('be.visible')
      cy.get('[data-testid="dark-mode-toggle"]').should('be.visible')
      cy.get('[data-testid="settings-button"]').should('be.visible')
    })

    it('should display sidebar with navigation options', () => {
      cy.get('[data-testid="sidebar"]').should('be.visible')
      cy.get('[data-testid="nav-feed"]').should('be.visible')
      cy.get('[data-testid="nav-trending"]').should('be.visible')
      cy.get('[data-testid="nav-favorites"]').should('be.visible')
    })

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x')
      
      // Sidebar should be hidden on mobile
      cy.get('[data-testid="sidebar"]').should('not.be.visible')
      
      // Menu button should be visible
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible')
      
      // Click menu button to open sidebar
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="sidebar"]').should('be.visible')
    })
  })

  describe('Content Display', () => {
    it('should display content cards with proper information', () => {
      cy.get('[data-testid="content-card"]').should('have.length.at.least', 1)
      
      cy.get('[data-testid="content-card"]').first().within(() => {
        cy.get('[data-testid="card-title"]').should('be.visible')
        cy.get('[data-testid="card-description"]').should('be.visible')
        cy.get('[data-testid="card-image"]').should('be.visible')
        cy.get('[data-testid="card-actions"]').should('be.visible')
      })
    })

    it('should handle loading states', () => {
      // Intercept API calls to simulate loading
      cy.intercept('GET', '**/news/**', { delay: 2000, fixture: 'news.json' }).as('getNews')
      
      cy.reload()
      cy.get('[data-testid="loading-spinner"]').should('be.visible')
      
      cy.wait('@getNews')
      cy.get('[data-testid="loading-spinner"]').should('not.exist')
      cy.get('[data-testid="content-card"]').should('be.visible')
    })

    it('should handle error states gracefully', () => {
      // Intercept API calls to simulate error
      cy.intercept('GET', '**/news/**', { statusCode: 500 }).as('getNewsError')
      
      cy.reload()
      cy.wait('@getNewsError')
      
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="error-message"]').should('contain', 'Failed to load content')
    })
  })

  describe('Search Functionality', () => {
    it('should perform search and display results', () => {
      const searchTerm = 'technology'
      
      cy.get('[data-testid="search-input"]').type(searchTerm)
      
      // Wait for debounced search
      cy.wait(1000)
      
      cy.get('[data-testid="search-results"]').should('be.visible')
      cy.get('[data-testid="search-results"] [data-testid="content-card"]')
        .should('have.length.at.least', 1)
    })

    it('should clear search results when input is cleared', () => {
      cy.get('[data-testid="search-input"]').type('test search')
      cy.wait(1000)
      
      cy.get('[data-testid="search-results"]').should('be.visible')
      
      cy.get('[data-testid="search-input"]').clear()
      cy.wait(1000)
      
      cy.get('[data-testid="search-results"]').should('not.exist')
      cy.get('[data-testid="content-feed"]').should('be.visible')
    })

    it('should handle empty search results', () => {
      cy.get('[data-testid="search-input"]').type('nonexistentquery12345')
      cy.wait(1000)
      
      cy.get('[data-testid="empty-search-results"]').should('be.visible')
      cy.get('[data-testid="empty-search-results"]')
        .should('contain', 'No results found')
    })
  })

  describe('Favorites Functionality', () => {
    it('should add and remove items from favorites', () => {
      // Add to favorites
      cy.get('[data-testid="content-card"]').first().within(() => {
        cy.get('[data-testid="favorite-button"]').click()
      })
      
      // Check if added to favorites
      cy.get('[data-testid="nav-favorites"]').click()
      cy.get('[data-testid="favorites-section"]').should('be.visible')
      cy.get('[data-testid="favorites-section"] [data-testid="content-card"]')
        .should('have.length.at.least', 1)
      
      // Remove from favorites
      cy.get('[data-testid="favorites-section"] [data-testid="content-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="favorite-button"]').click()
        })
      
      // Check if removed from favorites
      cy.get('[data-testid="favorites-section"]')
        .should('contain', 'No favorite content yet')
    })

    it('should persist favorites across page reloads', () => {
      // Add to favorites
      cy.get('[data-testid="content-card"]').first().within(() => {
        cy.get('[data-testid="favorite-button"]').click()
      })
      
      // Reload page
      cy.reload()
      
      // Check if favorites are still there
      cy.get('[data-testid="nav-favorites"]').click()
      cy.get('[data-testid="favorites-section"] [data-testid="content-card"]')
        .should('have.length.at.least', 1)
    })
  })

  describe('Drag and Drop', () => {
    it('should reorder content cards via drag and drop', () => {
      // Get initial order
      cy.get('[data-testid="content-card"] [data-testid="card-title"]')
        .first()
        .invoke('text')
        .as('firstCardTitle')
      
      cy.get('[data-testid="content-card"] [data-testid="card-title"]')
        .eq(1)
        .invoke('text')
        .as('secondCardTitle')
      
      // Perform drag and drop
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart')
      
      cy.get('[data-testid="content-card"]')
        .eq(1)
        .trigger('drop')
      
      // Check if order changed
      cy.get('@secondCardTitle').then((secondTitle) => {
        cy.get('[data-testid="content-card"] [data-testid="card-title"]')
          .first()
          .should('contain', secondTitle)
      })
    })
  })

  describe('Theme Switching', () => {
    it('should toggle between light and dark modes', () => {
      // Check initial theme (light)
      cy.get('html').should('not.have.class', 'dark')
      
      // Toggle to dark mode
      cy.get('[data-testid="dark-mode-toggle"]').click()
      cy.get('html').should('have.class', 'dark')
      
      // Toggle back to light mode
      cy.get('[data-testid="dark-mode-toggle"]').click()
      cy.get('html').should('not.have.class', 'dark')
    })

    it('should persist theme preference across page reloads', () => {
      // Switch to dark mode
      cy.get('[data-testid="dark-mode-toggle"]').click()
      cy.get('html').should('have.class', 'dark')
      
      // Reload page
      cy.reload()
      
      // Check if dark mode is still active
      cy.get('html').should('have.class', 'dark')
    })
  })

  describe('Settings Panel', () => {
    it('should open and close settings panel', () => {
      // Open settings
      cy.get('[data-testid="settings-button"]').click()
      cy.get('[data-testid="settings-panel"]').should('be.visible')
      
      // Close settings
      cy.get('[data-testid="settings-close"]').click()
      cy.get('[data-testid="settings-panel"]').should('not.be.visible')
    })

    it('should update user preferences', () => {
      // Open settings
      cy.get('[data-testid="settings-button"]').click()
      
      // Change category preferences
      cy.get('[data-testid="category-technology"]').uncheck()
      cy.get('[data-testid="category-sports"]').check()
      
      // Save settings
      cy.get('[data-testid="save-settings"]').click()
      
      // Verify settings are saved
      cy.get('[data-testid="settings-button"]').click()
      cy.get('[data-testid="category-technology"]').should('not.be.checked')
      cy.get('[data-testid="category-sports"]').should('be.checked')
    })
  })

  describe('Section Navigation', () => {
    it('should navigate between different sections', () => {
      // Navigate to trending section
      cy.get('[data-testid="nav-trending"]').click()
      cy.get('[data-testid="trending-section"]').should('be.visible')
      cy.get('[data-testid="content-feed"]').should('not.be.visible')
      
      // Navigate to favorites section
      cy.get('[data-testid="nav-favorites"]').click()
      cy.get('[data-testid="favorites-section"]').should('be.visible')
      cy.get('[data-testid="trending-section"]').should('not.be.visible')
      
      // Navigate back to feed
      cy.get('[data-testid="nav-feed"]').click()
      cy.get('[data-testid="content-feed"]').should('be.visible')
      cy.get('[data-testid="favorites-section"]').should('not.be.visible')
    })
  })

  describe('Infinite Scrolling', () => {
    it('should load more content when scrolling to bottom', () => {
      // Get initial content count
      cy.get('[data-testid="content-card"]').its('length').as('initialCount')
      
      // Scroll to bottom
      cy.scrollTo('bottom')
      
      // Wait for new content to load
      cy.wait(2000)
      
      // Check if more content is loaded
      cy.get('@initialCount').then((initialCount) => {
        cy.get('[data-testid="content-card"]')
          .its('length')
          .should('be.gt', initialCount)
      })
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      // Tab through interactive elements
      cy.get('body').tab()
      cy.focused().should('have.attr', 'data-testid', 'search-input')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'dark-mode-toggle')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'settings-button')
    })

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="search-input"]')
        .should('have.attr', 'aria-label', 'Search content')
      
      cy.get('[data-testid="dark-mode-toggle"]')
        .should('have.attr', 'aria-label', 'Toggle dark mode')
      
      cy.get('[data-testid="favorite-button"]')
        .first()
        .should('have.attr', 'aria-label')
    })
  })

  describe('Performance', () => {
    it('should load initial content within acceptable time', () => {
      const startTime = Date.now()
      
      cy.visit('/')
      cy.get('[data-testid="content-card"]').should('be.visible')
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(5000) // 5 seconds
      })
    })

    it('should handle rapid search input changes', () => {
      const searchInput = cy.get('[data-testid="search-input"]')
      
      // Type rapidly
      searchInput.type('a')
      searchInput.type('b')
      searchInput.type('c')
      searchInput.type('d')
      
      // Should not crash and should show results
      cy.wait(1500) // Wait for debounce
      cy.get('[data-testid="search-results"]').should('be.visible')
    })
  })
})