'use client'

// A status button that asks first when the step cannot be undone. Cancelling
// returns the stock and can never be reversed (the database refuses to reopen
// a cancelled order), and a refund is a statement about money that has left.
export function StatusButton({ label, orderNumber, confirmFirst, outline }: {
  label: string
  orderNumber: string
  confirmFirst: boolean
  outline: boolean
}) {
  return (
    <button
      type="submit"
      className={outline ? 'btn-admin-outline' : 'btn-admin'}
      onClick={(e) => {
        if (confirmFirst && !window.confirm(`${label} for ${orderNumber}? This cannot be undone.`)) e.preventDefault()
      }}
    >
      {label}
    </button>
  )
}
