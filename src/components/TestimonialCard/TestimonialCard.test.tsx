import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestimonialCard } from './TestimonialCard'

describe('TestimonialCard', () => {
  it('renders the quote, name, and role text', () => {
    render(
      <TestimonialCard
        quote="Esta es una prueba"
        name="Juan García"
        role="nivel B1"
      />,
    )
    expect(screen.getByText(/Esta es una prueba/)).toBeInTheDocument()
    expect(screen.getByText('Juan García')).toBeInTheDocument()
    expect(screen.getByText('nivel B1')).toBeInTheDocument()
  })

  it('renders exactly 5 star elements with rating=5, all classed text-sun-500', () => {
    render(
      <TestimonialCard
        rating={5}
        quote="Test quote"
        name="John"
        role="role"
      />,
    )
    const starsContainer = screen.getByTestId('testimonial-stars')
    const starSvgs = starsContainer.querySelectorAll('svg')
    expect(starSvgs).toHaveLength(5)
    starSvgs.forEach((svg) => {
      expect(svg).toHaveClass('text-sun-500')
    })
  })

  it('renders 3 filled stars and 2 unfilled for rating=3', () => {
    render(
      <TestimonialCard
        rating={3}
        quote="Test quote"
        name="John"
        role="role"
      />,
    )
    const starsContainer = screen.getByTestId('testimonial-stars')
    const starSvgs = starsContainer.querySelectorAll('svg')
    expect(starSvgs).toHaveLength(5)

    // First 3 should be filled (text-sun-500)
    for (let i = 0; i < 3; i++) {
      expect(starSvgs[i]).toHaveClass('text-sun-500')
    }

    // Last 2 should be unfilled (text-border)
    for (let i = 3; i < 5; i++) {
      expect(starSvgs[i]).toHaveClass('text-border')
    }
  })

  it('renders 1 filled star and 4 unfilled for rating=1', () => {
    render(
      <TestimonialCard
        rating={1}
        quote="Test quote"
        name="John"
        role="role"
      />,
    )
    const starsContainer = screen.getByTestId('testimonial-stars')
    const starSvgs = starsContainer.querySelectorAll('svg')
    expect(starSvgs).toHaveLength(5)

    expect(starSvgs[0]).toHaveClass('text-sun-500')
    for (let i = 1; i < 5; i++) {
      expect(starSvgs[i]).toHaveClass('text-border')
    }
  })

  it('renders 0 filled stars and 5 unfilled for rating=0', () => {
    render(
      <TestimonialCard
        rating={0}
        quote="Test quote"
        name="John"
        role="role"
      />,
    )
    const starsContainer = screen.getByTestId('testimonial-stars')
    const starSvgs = starsContainer.querySelectorAll('svg')
    expect(starSvgs).toHaveLength(5)

    starSvgs.forEach((svg) => {
      expect(svg).toHaveClass('text-border')
    })
  })

  it('clamps rating=7 (out of range) to 5 filled stars', () => {
    render(
      <TestimonialCard
        rating={7}
        quote="Test quote"
        name="John"
        role="role"
      />,
    )
    const starsContainer = screen.getByTestId('testimonial-stars')
    const starSvgs = starsContainer.querySelectorAll('svg')
    expect(starSvgs).toHaveLength(5)
    starSvgs.forEach((svg) => {
      expect(svg).toHaveClass('text-sun-500')
    })
  })

  it('renders custom avatar content in the avatar slot', () => {
    render(
      <TestimonialCard
        quote="Test quote"
        avatar={<span data-testid="custom-avatar">JK</span>}
        name="John"
        role="role"
      />,
    )
    expect(screen.getByTestId('custom-avatar')).toBeInTheDocument()
    expect(screen.getByTestId('custom-avatar')).toHaveTextContent('JK')
  })
})
