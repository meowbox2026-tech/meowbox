import { useState } from 'react'
import { useLocale } from '../../i18n'
import { AppButton } from './AppButton'
import { Modal } from './Modal'

const SEEN_KEY = 'meowbox-tutorial:planning-diagonal-v1'
const copy = {
  'zh-TW': { title: '斜著排，也能消除！', hint: '同款貓咪沿斜線連續排滿 3 格，就能消除。↘ 和 ↗ 兩個方向都可以，中間不能空一格。', close: '知道了，試試看' },
  en: { title: 'Diagonal lines count too!', hint: 'Place 3 matching cats in consecutive diagonal cells. Both ↘ and ↗ work, with no empty cells between them.', close: 'Got it, let’s try' },
  ja: { title: '斜めに並べても消せる！', hint: '同じ猫を斜めに3マス続けて並べよう。↘も↗もOK。間に空きマスを作らないでね。', close: 'わかった、やってみよう' }
}

export function useDiagonalTutorial(levelId: number) {
  const [open, setOpen] = useState(() => {
    if (levelId < 2 || levelId > 10) return false
    try { return localStorage.getItem(SEEN_KEY) !== '1' } catch { return true }
  })
  const close = () => {
    try { localStorage.setItem(SEEN_KEY, '1') } catch { /* Still dismissible without storage. */ }
    setOpen(false)
  }
  return { open, close }
}

export function PlanningDiagonalTutorial({ open, onClose }: { open: boolean; onClose: () => void }) {
  const text = copy[useLocale()]
  return <Modal open={open} ariaLabel={text.title} className="planning-diagonal-tutorial">
    <h2>{text.title}</h2>
    <div className="planning-diagonal-demo" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <span key={i} className={i % 4 === 0 ? 'is-match' : ''}>
        {i % 4 === 0 && <img src="/assets/cats/orange.png" alt="" />}
      </span>)}
    </div>
    <p>{text.hint}</p>
    <AppButton onClick={onClose}>{text.close}</AppButton>
  </Modal>
}
