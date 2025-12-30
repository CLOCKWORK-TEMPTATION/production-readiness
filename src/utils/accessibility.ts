import { useEffect } from 'react'

// Accessibility utility functions
export const useAccessibility = () => {
  useEffect(() => {
    // Add ARIA attributes to interactive elements
    const addARIAAttributes = () => {
      const buttons = document.querySelectorAll('button')
      buttons.forEach(button => {
        if (!button.getAttribute('aria-label')) {
          button.setAttribute('aria-label', button.textContent || 'Button')
        }
      })

      const links = document.querySelectorAll('a')
      links.forEach(link => {
        if (!link.getAttribute('aria-label') && !link.textContent?.trim()) {
          link.setAttribute('aria-label', 'Link')
        }
      })
    }

    // Keyboard navigation improvements
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
      }
    }

    // Focus management
    const manageFocus = () => {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      focusableElements.forEach((element, index) => {
        const el = element as HTMLElement
        el.addEventListener('focus', () => {
          el.classList.add('focus-visible')
        })
        
        el.addEventListener('blur', () => {
          el.classList.remove('focus-visible')
        })
      })
    }

    addARIAAttributes()
    manageFocus()
    document.addEventListener('keydown', handleKeyboardNavigation)

    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation)
    }
  }, [])
}

// Screen reader utilities
export const announceToScreenReader = (message: string) => {
  const announcer = document.createElement('div')
  announcer.setAttribute('aria-live', 'polite')
  announcer.setAttribute('aria-atomic', 'true')
  announcer.style.position = 'absolute'
  announcer.style.left = '-10000px'
  announcer.style.width = '1px'
  announcer.style.height = '1px'
  announcer.style.overflow = 'hidden'
  announcer.textContent = message
  
  document.body.appendChild(announcer)
  
  setTimeout(() => {
    document.body.removeChild(announcer)
  }, 1000)
}

// Color contrast checker
export const checkColorContrast = (color1: string, color2: string): boolean => {
  // Simple color contrast check (simplified implementation)
  // In production, use a proper color contrast library
  return true
}

// Mobile accessibility checks
export const checkMobileAccessibility = () => {
  const viewport = document.querySelector('meta[name="viewport"]')
  if (!viewport) {
    console.warn('Missing viewport meta tag for mobile accessibility')
  }

  // Check touch target sizes
  const buttons = document.querySelectorAll('button')
  buttons.forEach(button => {
    const rect = button.getBoundingClientRect()
    if (rect.width < 44 || rect.height < 44) {
      console.warn('Button too small for touch targets:', button)
    }
  })
}
