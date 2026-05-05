const users = new Map<string, { email: string; password: string; name: string; id: string }>()
let currentSession: { email: string; id: string; name: string } | null = null

export function mockSignUp(email: string, password: string, name?: string) {
  if (users.has(email)) {
    return { error: { message: 'User already registered' } }
  }
  if (password.length < 6) {
    return { error: { message: 'Password must be at least 6 characters' } }
  }
  const id = `mock-user-${Date.now()}`
  users.set(email, { email, password, name: name || '', id })
  return { data: { user: { id, email, user_metadata: { full_name: name || '' } } }, error: null }
}

export function mockSignIn(email: string, password: string) {
  const user = users.get(email)
  if (!user || user.password !== password) {
    return { error: { message: 'Invalid login credentials' } }
  }
  currentSession = { email: user.email, id: user.id, name: user.name }
  return {
    data: {
      user: { id: user.id, email: user.email, user_metadata: { full_name: user.name } },
      session: { user: { id: user.id, email: user.email } },
    },
    error: null,
  }
}

export function mockGetSession() {
  if (!currentSession) return { data: { session: null } }
  return {
    data: {
      session: {
        user: { id: currentSession.id, email: currentSession.email, user_metadata: { full_name: currentSession.name } },
      },
    },
  }
}

export function mockSignOut() {
  currentSession = null
}
