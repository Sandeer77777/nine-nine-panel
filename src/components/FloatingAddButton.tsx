
import React, { useState } from 'react'
import {Plus} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import ProcedimentoModal from './ProcedimentoModal'

export default function FloatingAddButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const location = useLocation()

  // Mostrar apenas nas páginas principais
  const showButton = ['/', '/procedimentos', '/dashboard'].includes(location.pathname)

  if (!showButton) return null

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="floating-add-btn btn-primary w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110" /* Use btn-primary */
        title="Adicionar Novo Procedimento"
      >
        <Plus className="h-6 w-6" />
      </button>

      <ProcedimentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // editingProcedimento={null} removed as it's the default
      />
    </>
  )
}
