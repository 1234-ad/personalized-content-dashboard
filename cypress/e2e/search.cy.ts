describe('Search Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000); // Wait for initial load
  });

  describe('Search Input', () => {
    it('should display search input in header', () => {
      cy.get('[data-testid="search-input"]')
        .should('be.visible')
        .and('have.attr', 'placeholder')
        .and('contain', 'Search content');
    });

    it('should focus search input when clicked', () => {
      cy.get('[data-testid="search-input"]')
        .click()
        .should('be.focused');
    });

    it('should accept text input', () => {
      const searchTerm = 'technology';
      
      cy.get('[data-testid="search-input"]')
        .type(searchTerm)
        .should('have.value', searchTerm);
    });
  });

  describe('Search Execution', () => {
    it('should perform search when typing', () => {
      cy.get('[data-testid="search-input"]')
        .type('react');
      
      // Wait for debounced search
      cy.wait(600);
      
      // Should show search results
      cy.get('[data-testid="search-results"]')
        .should('be.visible');
    });

    it('should show loading state during search', () => {
      cy.get('[data-testid="search-input"]')
        .type('javascript');
      
      // Should show loading indicator
      cy.get('[data-testid="search-loading"]')
        .should('be.visible');
    });

    it('should display search results count', () => {
      cy.get('[data-testid="search-input"]')
        .type('programming');
      
      cy.wait(600);
      
      cy.get('[data-testid="search-results-count"]')
        .should('be.visible')
        .and('contain', 'results found');
    });
  });

  describe('Search Results', () => {
    beforeEach(() => {
      cy.get('[data-testid="search-input"]')
        .type('technology');
      cy.wait(600);
    });

    it('should display search results in cards', () => {
      cy.get('[data-testid="search-results"]')
        .should('be.visible');
      
      cy.get('[data-testid="content-card"]')
        .should('have.length.greaterThan', 0);
    });

    it('should show different content types in results', () => {
      cy.get('[data-testid="content-card"]')
        .should('contain', 'news')
        .or('contain', 'movie')
        .or('contain', 'social');
    });

    it('should allow clicking on search result cards', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .click();
      
      // Should show content details or navigate
      cy.url().should('not.equal', Cypress.config().baseUrl + '/');
    });

    it('should highlight search terms in results', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .find('[data-testid="highlighted-text"]')
        .should('exist');
    });
  });

  describe('Search Filters', () => {
    it('should filter by content type', () => {
      cy.get('[data-testid="search-input"]')
        .type('test');
      cy.wait(600);
      
      // Click news filter
      cy.get('[data-testid="filter-news"]')
        .click();
      
      cy.get('[data-testid="content-card"]')
        .each(($card) => {
          cy.wrap($card)
            .should('contain', 'news');
        });
    });

    it('should filter by category', () => {
      cy.get('[data-testid="search-input"]')
        .type('sports');
      cy.wait(600);
      
      cy.get('[data-testid="category-filter"]')
        .select('sports');
      
      cy.get('[data-testid="content-card"]')
        .should('have.length.greaterThan', 0);
    });

    it('should clear filters', () => {
      cy.get('[data-testid="search-input"]')
        .type('test');
      cy.wait(600);
      
      cy.get('[data-testid="filter-news"]')
        .click();
      
      cy.get('[data-testid="clear-filters"]')
        .click();
      
      // All content types should be visible again
      cy.get('[data-testid="content-card"]')
        .should('have.length.greaterThan', 0);
    });
  });

  describe('Search History', () => {
    it('should save search history', () => {
      const searches = ['react', 'javascript', 'python'];
      
      searches.forEach(term => {
        cy.get('[data-testid="search-input"]')
          .clear()
          .type(term);
        cy.wait(600);
      });
      
      // Click on search input to show history
      cy.get('[data-testid="search-input"]')
        .clear()
        .click();
      
      cy.get('[data-testid="search-history"]')
        .should('be.visible');
      
      searches.forEach(term => {
        cy.get('[data-testid="search-history"]')
          .should('contain', term);
      });
    });

    it('should allow selecting from search history', () => {
      cy.get('[data-testid="search-input"]')
        .type('react');
      cy.wait(600);
      
      cy.get('[data-testid="search-input"]')
        .clear()
        .click();
      
      cy.get('[data-testid="search-history-item"]')
        .contains('react')
        .click();
      
      cy.get('[data-testid="search-input"]')
        .should('have.value', 'react');
    });

    it('should clear search history', () => {
      cy.get('[data-testid="search-input"]')
        .type('test');
      cy.wait(600);
      
      cy.get('[data-testid="search-input"]')
        .clear()
        .click();
      
      cy.get('[data-testid="clear-search-history"]')
        .click();
      
      cy.get('[data-testid="search-history"]')
        .should('not.exist');
    });
  });

  describe('Search Shortcuts', () => {
    it('should support keyboard shortcuts', () => {
      // Ctrl+K should focus search
      cy.get('body').type('{ctrl}k');
      
      cy.get('[data-testid="search-input"]')
        .should('be.focused');
    });

    it('should clear search with Escape key', () => {
      cy.get('[data-testid="search-input"]')
        .type('test query');
      
      cy.get('[data-testid="search-input"]')
        .type('{esc}');
      
      cy.get('[data-testid="search-input"]')
        .should('have.value', '');
    });

    it('should navigate results with arrow keys', () => {
      cy.get('[data-testid="search-input"]')
        .type('technology');
      cy.wait(600);
      
      cy.get('[data-testid="search-input"]')
        .type('{downarrow}');
      
      cy.get('[data-testid="content-card"]')
        .first()
        .should('have.class', 'focused');
    });
  });

  describe('Search Performance', () => {
    it('should debounce search requests', () => {
      cy.intercept('GET', '**/api/content**').as('searchRequest');
      
      cy.get('[data-testid="search-input"]')
        .type('t')
        .type('e')
        .type('s')
        .type('t');
      
      // Should only make one request after debounce
      cy.wait(600);
      cy.get('@searchRequest.all').should('have.length', 1);
    });

    it('should cancel previous requests', () => {
      cy.intercept('GET', '**/api/content**', { delay: 1000 }).as('slowSearch');
      
      cy.get('[data-testid="search-input"]')
        .type('first search');
      
      cy.wait(100);
      
      cy.get('[data-testid="search-input"]')
        .clear()
        .type('second search');
      
      cy.wait(600);
      
      // Should only show results for second search
      cy.get('[data-testid="search-results"]')
        .should('not.contain', 'first search');
    });

    it('should cache search results', () => {
      cy.intercept('GET', '**/api/content**').as('searchRequest');
      
      const searchTerm = 'cached search';
      
      // First search
      cy.get('[data-testid="search-input"]')
        .type(searchTerm);
      cy.wait(600);
      cy.wait('@searchRequest');
      
      // Clear and search again
      cy.get('[data-testid="search-input"]')
        .clear()
        .type(searchTerm);
      cy.wait(600);
      
      // Should use cached results (no new request)
      cy.get('@searchRequest.all').should('have.length', 1);
    });
  });

  describe('Search Error Handling', () => {
    it('should handle search API errors gracefully', () => {
      cy.intercept('GET', '**/api/content**', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('failedSearch');
      
      cy.get('[data-testid="search-input"]')
        .type('error test');
      cy.wait(600);
      
      cy.get('[data-testid="search-error"]')
        .should('be.visible')
        .and('contain', 'search failed');
    });

    it('should show no results message', () => {
      cy.intercept('GET', '**/api/content**', {
        body: { data: [], totalResults: 0 }
      }).as('emptySearch');
      
      cy.get('[data-testid="search-input"]')
        .type('nonexistent content');
      cy.wait(600);
      
      cy.get('[data-testid="no-results"]')
        .should('be.visible')
        .and('contain', 'No results found');
    });

    it('should retry failed searches', () => {
      cy.intercept('GET', '**/api/content**', {
        statusCode: 500
      }).as('failedSearch');
      
      cy.get('[data-testid="search-input"]')
        .type('retry test');
      cy.wait(600);
      
      cy.get('[data-testid="retry-search"]')
        .click();
      
      cy.wait('@failedSearch');
    });
  });

  describe('Mobile Search', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should work on mobile devices', () => {
      cy.get('[data-testid="mobile-search-button"]')
        .click();
      
      cy.get('[data-testid="search-input"]')
        .should('be.visible')
        .type('mobile search');
      
      cy.wait(600);
      
      cy.get('[data-testid="search-results"]')
        .should('be.visible');
    });

    it('should close mobile search overlay', () => {
      cy.get('[data-testid="mobile-search-button"]')
        .click();
      
      cy.get('[data-testid="close-mobile-search"]')
        .click();
      
      cy.get('[data-testid="search-overlay"]')
        .should('not.be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      cy.get('[data-testid="search-input"]')
        .focus()
        .type('accessibility test');
      
      cy.wait(600);
      
      // Tab through results
      cy.get('[data-testid="content-card"]')
        .first()
        .focus()
        .should('be.focused');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="search-input"]')
        .should('have.attr', 'aria-label');
      
      cy.get('[data-testid="search-input"]')
        .type('aria test');
      cy.wait(600);
      
      cy.get('[data-testid="search-results"]')
        .should('have.attr', 'role', 'region')
        .and('have.attr', 'aria-label');
    });

    it('should announce search results to screen readers', () => {
      cy.get('[data-testid="search-input"]')
        .type('screen reader test');
      cy.wait(600);
      
      cy.get('[data-testid="search-results-announcement"]')
        .should('have.attr', 'aria-live', 'polite');
    });
  });
});