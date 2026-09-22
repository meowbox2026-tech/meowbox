import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { PlanningDiagonalTutorial, useDiagonalTutorial } from './PlanningDiagonalTutorial'

function Example({ levelId }: { levelId: number }) {
  const tutorial = useDiagonalTutorial(levelId)
  return <PlanningDiagonalTutorial open={tutorial.open} onClose={tutorial.close} />
}
afterEach(() => { cleanup(); localStorage.removeItem('meowbox-tutorial:planning-diagonal-v1') })

it('introduces diagonal matches at level two and remembers dismissal across visits', () => {
  const first = render(<Example levelId={1} />)
  expect(screen.queryByRole('dialog')).toBeNull()
  first.unmount()
  const second = render(<Example levelId={2} />)
  expect(screen.getByRole('dialog', { name: '斜著排，也能消除！' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '知道了，試試看' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  second.unmount()
  render(<Example levelId={3} />)
  expect(screen.queryByRole('dialog')).toBeNull()
})
