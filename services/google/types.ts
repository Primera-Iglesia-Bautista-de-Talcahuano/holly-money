export type IntegrationStatus = "PENDING" | "SENT" | "ERROR"

export type MovementIntegrationPayload = {
  movementId: string
  folio: string
  movementTypeLabel: "INGRESO" | "EGRESO"
  movementDate: string
  amount: number
  category: string
  concept: string
  description: string
  reference?: string | null
  receivedBy?: string | null
  deliveredBy?: string | null
  beneficiary?: string | null
  paymentMethod?: string | null
  supportNumber?: string | null
  notes?: string | null
  registeredBy: string
  user: string
  registeredEmail: string
  registeredAt: string
  organizationName?: string | null
}

export type AppsScriptResponse = {
  ok: boolean
  message?: string
  pdfUrl?: string
  driveFileId?: string
  sheetSynced?: boolean
  mailSent?: boolean
  error?: string
}
