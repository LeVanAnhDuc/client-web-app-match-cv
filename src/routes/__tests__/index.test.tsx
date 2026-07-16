import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HomeComponent } from '../index'

describe('Home', () => {
  it('renders app name', () => {
    render(<HomeComponent />)
    expect(screen.getByRole('heading', { name: /match cv/i })).toBeDefined()
  })

  it('renders antd primary button', () => {
    render(<HomeComponent />)
    expect(screen.getByRole('button', { name: /start/i })).toBeDefined()
  })

  describe('console output', () => {
    let errorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      errorSpy.mockRestore()
    })

    it('renders without console errors', () => {
      render(<HomeComponent />)
      expect(errorSpy).not.toHaveBeenCalled()
    })
  })
})
