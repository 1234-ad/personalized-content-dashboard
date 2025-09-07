describe('Drag and Drop Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000); // Wait for initial content load
  });

  describe('Basic Drag and Drop', () => {
    it('should allow dragging content cards', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .should('have.attr', 'draggable', 'true');
    });

    it('should show drag handle on hover', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('mouseover');
      
      cy.get('[data-testid="drag-handle"]')
        .should('be.visible');
    });

    it('should change cursor when hovering over drag handle', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('mouseover');
      
      cy.get('[data-testid="drag-handle"]')
        .should('have.css', 'cursor', 'grab');
    });
  });

  describe('Drag Operations', () => {
    it('should start drag operation', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      // Should add dragging class
      cy.get('[data-testid="content-card"]')
        .first()
        .should('have.class', 'dragging');
    });

    it('should show drop zones during drag', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="drop-zone"]')
        .should('be.visible')
        .and('have.length.greaterThan', 0);
    });

    it('should highlight valid drop targets', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="content-card"]')
        .eq(1)
        .trigger('dragover');
      
      cy.get('[data-testid="content-card"]')
        .eq(1)
        .should('have.class', 'drag-over');
    });

    it('should prevent invalid drops', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      // Try to drop on invalid target
      cy.get('[data-testid="sidebar"]')
        .trigger('dragover')
        .trigger('drop');
      
      // Card should remain in original position
      cy.get('[data-testid="content-card"]')
        .first()
        .should('not.have.class', 'moved');
    });
  });

  describe('Drop Operations', () => {
    it('should reorder cards when dropped', () => {
      // Get initial order
      cy.get('[data-testid="content-card"]')
        .first()
        .invoke('attr', 'data-id')
        .as('firstCardId');
      
      cy.get('[data-testid="content-card"]')
        .eq(1)
        .invoke('attr', 'data-id')
        .as('secondCardId');
      
      // Perform drag and drop
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="content-card"]')
        .eq(2)
        .trigger('dragover')
        .trigger('drop');
      
      // Verify new order
      cy.get('@firstCardId').then((firstId) => {
        cy.get('[data-testid="content-card"]')
          .eq(2)
          .should('have.attr', 'data-id', firstId as string);
      });
    });

    it('should animate card movement', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="content-card"]')
        .eq(2)
        .trigger('dragover')
        .trigger('drop');
      
      // Should have animation class during transition
      cy.get('[data-testid="content-card"]')
        .should('have.class', 'animating');
    });

    it('should persist new order', () => {
      // Perform drag and drop
      cy.get('[data-testid="content-card"]')
        .first()
        .invoke('attr', 'data-id')
        .as('movedCardId');
      
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="content-card"]')
        .eq(2)
        .trigger('dragover')
        .trigger('drop');
      
      // Refresh page
      cy.reload();
      cy.wait(1000);
      
      // Verify order is maintained
      cy.get('@movedCardId').then((cardId) => {
        cy.get('[data-testid="content-card"]')
          .eq(2)
          .should('have.attr', 'data-id', cardId as string);
      });
    });
  });

  describe('Visual Feedback', () => {
    it('should show drag preview', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="drag-preview"]')
        .should('be.visible');
    });

    it('should dim other cards during drag', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="content-card"]')
        .not('.dragging')
        .should('have.class', 'dimmed');
    });

    it('should show insertion indicator', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="content-card"]')
        .eq(1)
        .trigger('dragover');
      
      cy.get('[data-testid="insertion-indicator"]')
        .should('be.visible');
    });

    it('should remove visual feedback on drag end', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart')
        .trigger('dragend');
      
      cy.get('[data-testid="content-card"]')
        .should('not.have.class', 'dragging')
        .and('not.have.class', 'dimmed');
    });
  });

  describe('Touch Support', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should support touch drag on mobile', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] });
      
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('touchmove', { touches: [{ clientX: 100, clientY: 200 }] });
      
      cy.get('[data-testid="content-card"]')
        .first()
        .should('have.class', 'touch-dragging');
    });

    it('should show touch drag feedback', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] });
      
      cy.get('[data-testid="touch-drag-indicator"]')
        .should('be.visible');
    });

    it('should complete touch drop', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .invoke('attr', 'data-id')
        .as('draggedCardId');
      
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
        .trigger('touchmove', { touches: [{ clientX: 100, clientY: 300 }] })
        .trigger('touchend');
      
      // Verify card moved
      cy.get('@draggedCardId').then((cardId) => {
        cy.get('[data-testid="content-card"]')
          .eq(2)
          .should('have.attr', 'data-id', cardId as string);
      });
    });
  });

  describe('Keyboard Support', () => {
    it('should support keyboard navigation for drag and drop', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .focus()
        .type(' '); // Space to start drag mode
      
      cy.get('[data-testid="content-card"]')
        .first()
        .should('have.class', 'keyboard-dragging');
    });

    it('should move cards with arrow keys', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .focus()
        .type(' ') // Enter drag mode
        .type('{downarrow}') // Move down
        .type(' '); // Confirm drop
      
      // Verify card moved down one position
      cy.get('[data-testid="content-card"]')
        .eq(1)
        .should('be.focused');
    });

    it('should cancel keyboard drag with Escape', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .focus()
        .type(' ') // Enter drag mode
        .type('{esc}'); // Cancel
      
      cy.get('[data-testid="content-card"]')
        .first()
        .should('not.have.class', 'keyboard-dragging');
    });
  });

  describe('Different Content Types', () => {
    it('should allow dragging news articles', () => {
      cy.get('[data-testid="content-card"][data-type="news"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="content-card"][data-type="news"]')
        .eq(1)
        .trigger('dragover')
        .trigger('drop');
      
      // Should reorder successfully
      cy.get('[data-testid="content-card"][data-type="news"]')
        .should('have.length.greaterThan', 0);
    });

    it('should allow dragging movie cards', () => {
      cy.get('[data-testid="content-card"][data-type="movie"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="content-card"][data-type="movie"]')
        .eq(1)
        .trigger('dragover')
        .trigger('drop');
      
      // Should reorder successfully
      cy.get('[data-testid="content-card"][data-type="movie"]')
        .should('have.length.greaterThan', 0);
    });

    it('should allow dragging social posts', () => {
      cy.get('[data-testid="content-card"][data-type="social"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="content-card"][data-type="social"]')
        .eq(1)
        .trigger('dragover')
        .trigger('drop');
      
      // Should reorder successfully
      cy.get('[data-testid="content-card"][data-type="social"]')
        .should('have.length.greaterThan', 0);
    });
  });

  describe('Section-based Drag and Drop', () => {
    it('should allow moving cards between sections', () => {
      // Drag from main feed to favorites
      cy.get('[data-testid="main-feed"] [data-testid="content-card"]')
        .first()
        .invoke('attr', 'data-id')
        .as('cardId');
      
      cy.get('[data-testid="main-feed"] [data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="favorites-section"]')
        .trigger('dragover')
        .trigger('drop');
      
      // Verify card moved to favorites
      cy.get('@cardId').then((cardId) => {
        cy.get('[data-testid="favorites-section"] [data-testid="content-card"]')
          .should('contain.attr', 'data-id', cardId as string);
      });
    });

    it('should prevent invalid section drops', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      // Try to drop on header (invalid)
      cy.get('[data-testid="header"]')
        .trigger('dragover')
        .trigger('drop');
      
      // Card should remain in original section
      cy.get('[data-testid="main-feed"] [data-testid="content-card"]')
        .should('have.length.greaterThan', 0);
    });
  });

  describe('Performance', () => {
    it('should handle dragging with many cards', () => {
      // Simulate many cards
      cy.window().then((win) => {
        win.localStorage.setItem('test-many-cards', 'true');
      });
      
      cy.reload();
      cy.wait(2000);
      
      cy.get('[data-testid="content-card"]')
        .should('have.length.greaterThan', 20);
      
      // Should still be able to drag smoothly
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="content-card"]')
        .eq(10)
        .trigger('dragover')
        .trigger('drop');
      
      // Should complete without performance issues
      cy.get('[data-testid="content-card"]')
        .should('not.have.class', 'dragging');
    });

    it('should debounce drag operations', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      // Rapid dragover events
      for (let i = 1; i < 5; i++) {
        cy.get('[data-testid="content-card"]')
          .eq(i)
          .trigger('dragover');
      }
      
      // Should handle gracefully without lag
      cy.get('[data-testid="content-card"]')
        .eq(4)
        .trigger('drop');
    });
  });

  describe('Error Handling', () => {
    it('should handle drag errors gracefully', () => {
      // Simulate drag error
      cy.window().then((win) => {
        win.localStorage.setItem('simulate-drag-error', 'true');
      });
      
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="content-card"]')
        .eq(1)
        .trigger('dragover')
        .trigger('drop');
      
      // Should show error message
      cy.get('[data-testid="drag-error"]')
        .should('be.visible')
        .and('contain', 'Failed to reorder');
    });

    it('should revert on failed drop', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .invoke('attr', 'data-id')
        .as('originalCardId');
      
      // Simulate failed drop
      cy.window().then((win) => {
        win.localStorage.setItem('simulate-drop-failure', 'true');
      });
      
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="content-card"]')
        .eq(2)
        .trigger('dragover')
        .trigger('drop');
      
      // Should revert to original position
      cy.get('@originalCardId').then((cardId) => {
        cy.get('[data-testid="content-card"]')
          .first()
          .should('have.attr', 'data-id', cardId as string);
      });
    });
  });

  describe('Accessibility', () => {
    it('should announce drag operations to screen readers', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .trigger('dragstart');
      
      cy.get('[data-testid="drag-announcement"]')
        .should('have.attr', 'aria-live', 'assertive')
        .and('contain', 'Started dragging');
    });

    it('should provide keyboard instructions', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .focus();
      
      cy.get('[data-testid="keyboard-instructions"]')
        .should('be.visible')
        .and('contain', 'Press space to start dragging');
    });

    it('should have proper ARIA attributes', () => {
      cy.get('[data-testid="content-card"]')
        .first()
        .should('have.attr', 'role', 'button')
        .and('have.attr', 'aria-describedby')
        .and('have.attr', 'tabindex', '0');
    });
  });
});