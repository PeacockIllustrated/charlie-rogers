// Shared by the change password page and the emailed reset page.
export const PASSWORD_MIN_LENGTH = 10

// Saved on the account whenever its owner sets a password themselves. An
// account without it is still on the password it was created with, and the
// dashboard asks its owner to choose their own.
export function passwordChangedStamp(): { password_changed_at: string } {
  return { password_changed_at: new Date().toISOString() }
}

export function hasChosenPassword(metadata: Record<string, unknown> | undefined): boolean {
  return typeof metadata?.password_changed_at === 'string'
}
