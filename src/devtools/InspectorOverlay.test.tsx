import { act, fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InspectorOverlay } from './InspectorOverlay'

describe('InspectorOverlay', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    sessionStorage.setItem('meowbox-dev-inspector-mode.v1', 'inspector')
  })
  afterEach(() => {
    cleanup()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('starts in clean project mode in a new tab and enters inspector with the shortcut', () => {
    sessionStorage.clear()
    render(<InspectorOverlay />)

    expect(screen.queryByRole('dialog', { name: 'Meow Line 檢視工具' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '開啟 Meow Line 檢視工具' })).not.toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'i', ctrlKey: true, shiftKey: true })

    expect(screen.queryByRole('dialog', { name: 'Meow Line 檢視工具' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '開啟 Meow Line 檢視工具' })).toBeInTheDocument()
    expect(sessionStorage.getItem('meowbox-dev-inspector-mode.v1')).toBe('inspector')

    fireEvent.click(screen.getByRole('button', { name: '開啟 Meow Line 檢視工具' }))
    expect(screen.getByRole('dialog', { name: 'Meow Line 檢視工具' })).toBeInTheDocument()
  })

  it('opens the local inspector panel from its launcher', () => {
    render(<InspectorOverlay />)

    expect(screen.queryByRole('dialog', { name: 'Meow Line 檢視工具' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '開啟 Meow Line 檢視工具' }))

    expect(screen.getByRole('dialog', { name: 'Meow Line 檢視工具' })).toBeInTheDocument()
    expect(screen.getByText('MEOW LINE INSPECTOR')).toBeInTheDocument()
  })

  it('persists overlay toggles across remounts', () => {
    const firstRender = render(<InspectorOverlay />)
    fireEvent.click(screen.getByRole('button', { name: '開啟 Meow Line 檢視工具' }))
    fireEvent.click(screen.getByLabelText('格線'))

    expect(JSON.parse(localStorage.getItem('meowbox-dev-inspector.v1') || '{}')).toMatchObject({ grid: true })
    firstRender.unmount()

    render(<InspectorOverlay />)
    fireEvent.click(screen.getByRole('button', { name: '開啟 Meow Line 檢視工具' }))
    expect(screen.getByLabelText('格線')).toBeChecked()
  })

  it('toggles grid from the Cmd/Ctrl+Shift+G shortcut', () => {
    render(<InspectorOverlay />)

    fireEvent.keyDown(window, { key: 'g', ctrlKey: true, shiftKey: true })

    fireEvent.click(screen.getByRole('button', { name: '開啟 Meow Line 檢視工具' }))
    expect(screen.getByLabelText('格線')).toBeChecked()
  })

  it('moves a component by dragging and persists the preview offset', () => {
    const target = document.createElement('button')
    target.className = 'artwork-button home-start'
    document.body.append(target)
    const elementFromPoint = vi.fn().mockReturnValue(target)
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: elementFromPoint })
    const dispatchPointer = (type: string, init: { clientX: number; clientY: number; pointerId: number }) => {
      const event = Object.assign(new Event(type, { bubbles: true, cancelable: true }), init)
      window.dispatchEvent(event)
    }

    const firstRender = render(<InspectorOverlay />)
    fireEvent.click(screen.getByRole('button', { name: '開啟 Meow Line 檢視工具' }))
    fireEvent.click(screen.getByLabelText('調整模式'))
    fireEvent.click(screen.getByRole('button', { name: '關閉檢視工具' }))
    expect(screen.queryByRole('dialog', { name: 'Meow Line 檢視工具' })).not.toBeInTheDocument()
    act(() => {
      dispatchPointer('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 })
      dispatchPointer('pointermove', { clientX: 32, clientY: 12, pointerId: 1 })
      dispatchPointer('pointerup', { clientX: 32, clientY: 12, pointerId: 1 })
    })

    expect(localStorage.getItem('meowbox-dev-inspector-overrides.v1')).toContain('"x":22')
    expect(localStorage.getItem('meowbox-dev-inspector-overrides.v1')).toContain('"y":-8')
    expect(screen.queryByRole('dialog', { name: 'Meow Line 檢視工具' })).not.toBeInTheDocument()

    firstRender.unmount()
    render(<InspectorOverlay />)
    expect(document.getElementById('mbo-inspector-overrides')?.textContent).toContain('translate: 22px -8px')
    fireEvent.click(screen.getByRole('button', { name: '開啟 Meow Line 檢視工具' }))
    fireEvent.click(screen.getByRole('button', { name: '清除全部調整' }))
    expect(localStorage.getItem('meowbox-dev-inspector-overrides.v1')).toBe('{}')
    expect(document.getElementById('mbo-inspector-overrides')?.textContent).toBe('')

    Reflect.deleteProperty(document, 'elementFromPoint')
    target.remove()
  })

  it('edits selected size and rotation without reopening the panel', () => {
    const target = document.createElement('button')
    target.className = 'artwork-button home-start'
    target.getBoundingClientRect = () => ({
      x: 20, y: 40, left: 20, top: 40, right: 140, bottom: 100, width: 120, height: 60,
      toJSON: () => ({}),
    }) as DOMRect
    document.body.append(target)
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: vi.fn().mockReturnValue(target) })

    render(<InspectorOverlay />)
    fireEvent.click(screen.getByRole('button', { name: '開啟 Meow Line 檢視工具' }))
    fireEvent.click(screen.getByLabelText('元件框線'))
    act(() => {
      window.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 40, clientY: 60 }))
    })

    fireEvent.change(screen.getByLabelText('預覽寬度'), { target: { value: '180' } })
    fireEvent.change(screen.getByLabelText('預覽高度'), { target: { value: '90' } })
    fireEvent.change(screen.getByLabelText('預覽旋轉角度'), { target: { value: '15' } })

    const savedOverrides = JSON.parse(localStorage.getItem('meowbox-dev-inspector-overrides.v1') || '{}')
    expect(Object.values(savedOverrides)).toContainEqual(expect.objectContaining({
      width: 180,
      height: 90,
      rotate: 15,
      baseWidth: 120,
      baseHeight: 60,
      scaleX: 1.5,
      scaleY: 1.5,
    }))

    Reflect.deleteProperty(document, 'elementFromPoint')
    target.remove()
  })

  it('supports resizing and rotating through the selection handles', () => {
    const target = document.createElement('button')
    target.className = 'artwork-button home-start'
    target.getBoundingClientRect = () => ({
      x: 20, y: 40, left: 20, top: 40, right: 140, bottom: 100, width: 120, height: 60,
      toJSON: () => ({}),
    }) as DOMRect
    document.body.append(target)
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: vi.fn().mockReturnValue(target) })
    const dispatchPointer = (type: string, init: { clientX: number; clientY: number; pointerId: number }) => {
      const event = Object.assign(new Event(type, { bubbles: true, cancelable: true }), init)
      window.dispatchEvent(event)
    }

    render(<InspectorOverlay />)
    fireEvent.click(screen.getByRole('button', { name: '開啟 Meow Line 檢視工具' }))
    fireEvent.click(screen.getByLabelText('元件框線'))
    act(() => {
      window.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 40, clientY: 60 }))
    })
    fireEvent.click(screen.getByLabelText('調整模式'))
    expect(screen.queryByLabelText('移動模式')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('尺寸模式')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('旋轉模式')).not.toBeInTheDocument()

    const resizeHandle = document.querySelector('.mbo-resize-handle--se')
    expect(resizeHandle).toBeInTheDocument()
    expect(document.querySelector('.mbo-rotate-handle')).toBeInTheDocument()
    act(() => {
      const event = Object.assign(new Event('pointerdown', { bubbles: true, cancelable: true }), { clientX: 140, clientY: 100, pointerId: 2 })
      resizeHandle?.dispatchEvent(event)
      dispatchPointer('pointermove', { clientX: 160, clientY: 110, pointerId: 2 })
      dispatchPointer('pointerup', { clientX: 160, clientY: 110, pointerId: 2 })
    })

    const rotateHandle = document.querySelector('.mbo-rotate-handle')
    expect(rotateHandle).toBeInTheDocument()
    act(() => {
      const event = Object.assign(new Event('pointerdown', { bubbles: true, cancelable: true }), { clientX: 80, clientY: 20, pointerId: 3 })
      rotateHandle?.dispatchEvent(event)
      dispatchPointer('pointermove', { clientX: 140, clientY: 70, pointerId: 3 })
      dispatchPointer('pointerup', { clientX: 140, clientY: 70, pointerId: 3 })
    })

    const savedOverrides = JSON.parse(localStorage.getItem('meowbox-dev-inspector-overrides.v1') || '{}')
    expect(Object.values(savedOverrides)).toContainEqual(expect.objectContaining({
      width: 140,
      height: 70,
      baseWidth: 120,
      baseHeight: 60,
      scaleX: 140 / 120,
      scaleY: 70 / 60,
      rotate: 90,
    }))
    expect(document.getElementById('mbo-inspector-overrides')?.textContent).toContain(`scale: ${140 / 120} ${70 / 60}`)
    expect(document.getElementById('mbo-inspector-overrides')?.textContent).not.toMatch(/(?:^|[;{ ])(?:width|height):/)

    Reflect.deleteProperty(document, 'elementFromPoint')
    target.remove()
  })

  it('migrates legacy size overrides to non-layout scale previews', () => {    const target = document.createElement('button')
    target.className = 'artwork-button home-start'
    target.getBoundingClientRect = () => ({
      x: 20, y: 40, left: 20, top: 40, right: 140, bottom: 100, width: 120, height: 60,
      toJSON: () => ({}),
    }) as DOMRect
    document.body.append(target)
    localStorage.setItem('meowbox-dev-inspector-overrides.v1', JSON.stringify({
      'button.home-start': { width: 240, height: 120 },
    }))

    render(<InspectorOverlay />)

    expect(document.getElementById('mbo-inspector-overrides')?.textContent).toContain('scale: 2 2')
    expect(document.getElementById('mbo-inspector-overrides')?.textContent).not.toMatch(/(?:^|[;{ ])(?:width|height):/)
    expect(JSON.parse(localStorage.getItem('meowbox-dev-inspector-overrides.v1') || '{}')).toMatchObject({
      'button.home-start': { baseWidth: 120, baseHeight: 60, scaleX: 2, scaleY: 2 },
    })

    target.remove()
  })

  it('shows the SE 375x667 baseline frame and device checklist', () => {
    render(<InspectorOverlay />)
    fireEvent.click(screen.getByRole('button', { name: '開啟 Meow Line 檢視工具' }))

    expect(screen.getByText('Viewport / SE 基準')).toBeInTheDocument()
    expect(screen.getByText(/iPhone SE 375×667/)).toBeInTheDocument()
    expect(screen.getAllByText(/iPhone 12 \/ 13 \/ 14/).length).toBeGreaterThanOrEqual(1)
    expect(document.querySelector('.mbo-baseline-frame')).toBeInTheDocument()
    expect(document.querySelector('#meowbox-dev-inspector.is-baseline')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('顯示 SE 基準框'))
    expect(document.querySelector('#meowbox-dev-inspector.is-baseline')).not.toBeInTheDocument()
    expect(localStorage.getItem('meowbox-dev-inspector-baseline.v1')).toBe('0')
  })
})
