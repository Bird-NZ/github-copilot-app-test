import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('changes the button text after clicking', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /say hello/i }))

    expect(
      screen.getByRole('button', { name: /hello from copilot/i }),
    ).toBeInTheDocument()
  })
})
