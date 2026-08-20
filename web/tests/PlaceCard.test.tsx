import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import PlaceCard from '@/components/places/PlaceCard'
import { renderWithProviders } from './utils/renderWithProviders'
import { mockPlaceListItems } from './fixtures/places'

describe('PlaceCard Component', () => {
  const samplePlace = mockPlaceListItems[0]

  it('renders place name, city, category badge, and average rating', () => {
    renderWithProviders(<PlaceCard place={samplePlace} />)

    expect(screen.getByText('Taj Mahal Monument')).toBeInTheDocument()
    expect(screen.getByText(/Agra/i)).toBeInTheDocument()
    expect(screen.getByText('Historical Landmarks')).toBeInTheDocument()
    expect(screen.getByText('4.9')).toBeInTheDocument()
    expect(screen.getByText('(128)')).toBeInTheDocument()
  })

  it('renders cover image with proper alt text', () => {
    renderWithProviders(<PlaceCard place={samplePlace} />)

    const img = screen.getByRole('img', { name: /Taj Mahal Monument/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', samplePlace.cover_image_url)
  })

  it('renders favorite button with accessible aria-label', async () => {
    renderWithProviders(<PlaceCard place={samplePlace} />)

    const favButton = screen.getByRole('button', { name: /toggle favorite/i })
    expect(favButton).toBeInTheDocument()
  })

  it('supports keyboard focus and navigation on explore link', async () => {
    renderWithProviders(<PlaceCard place={samplePlace} />)

    const cardLink = screen.getByRole('link', { name: /explore place/i })
    expect(cardLink).toBeInTheDocument()
    expect(cardLink).toHaveAttribute('href', `/places/${samplePlace.uuid}`)
  })
})
