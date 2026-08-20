import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PlacesListPage from '@/pages/places/PlacesListPage'
import { renderWithProviders } from './utils/renderWithProviders'

describe('PlacesListPage Integration', () => {
  it('renders page header and search input bar', async () => {
    renderWithProviders(<PlacesListPage />)

    expect(screen.getByPlaceholderText(/Search spots by name/i)).toBeInTheDocument()
  })

  it('fetches and displays tourist place cards from MSW handler', async () => {
    renderWithProviders(<PlacesListPage />)

    await waitFor(() => {
      expect(screen.getByText('Taj Mahal Monument')).toBeInTheDocument()
      expect(screen.getByText('Baga Beach Boardwalk')).toBeInTheDocument()
      expect(screen.getByText('Golden Temple Sanctuary')).toBeInTheDocument()
    })
  })

  it('filters place cards when user types into search input', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlacesListPage />)

    const searchInput = screen.getByPlaceholderText(/Search spots by name/i)

    await waitFor(() => {
      expect(screen.getByText('Taj Mahal Monument')).toBeInTheDocument()
    })

    await user.type(searchInput, 'Taj')

    await waitFor(() => {
      expect(screen.getByText('Taj Mahal Monument')).toBeInTheDocument()
      expect(screen.queryByText('Baga Beach Boardwalk')).not.toBeInTheDocument()
    })
  })
})
