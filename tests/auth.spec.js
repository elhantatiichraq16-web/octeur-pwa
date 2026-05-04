import { test, expect } from '@playwright/test'

const EMAIL = 'test@meditrack.com'
const PASSWORD = 'password123'
const PRENOM = 'Yasmine'
const NOM = 'Benali'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Clear localStorage before each test
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

// ─── INSCRIPTION ────────────────────────────────────────────────────────────

test('affiche la page de connexion par défaut', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'MediTrack' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible()
})

test('inscription crée un compte et connecte', async ({ page }) => {
  await page.getByText("S'inscrire").click()
  await expect(page.getByText('Créer un compte')).toBeVisible()

  await page.getByPlaceholder('Yasmine').fill(PRENOM)
  await page.getByPlaceholder('Benali').fill(NOM)
  await page.getByPlaceholder('votre@email.com').fill(EMAIL)

  const pwdFields = page.getByPlaceholder('••••••••')
  await pwdFields.nth(0).fill(PASSWORD)
  await pwdFields.nth(1).fill(PASSWORD)

  await page.getByRole('button', { name: 'Créer mon compte' }).click()

  // Après inscription → page accueil
  await expect(page.getByText('MediTrack')).toBeVisible()
  await expect(page.getByText(`Bonjour, ${PRENOM}`)).toBeVisible()
})

test('inscription échoue si email déjà utilisé', async ({ page }) => {
  // Créer le compte une première fois
  await page.evaluate((u) => {
    localStorage.setItem('meditrack_users', JSON.stringify([u]))
  }, { prenom: PRENOM, nom: NOM, email: EMAIL, password: PASSWORD })

  await page.getByText("S'inscrire").click()
  await page.getByPlaceholder('Yasmine').fill('Autre')
  await page.getByPlaceholder('Benali').fill('User')
  await page.getByPlaceholder('votre@email.com').fill(EMAIL)
  const pwdFields = page.getByPlaceholder('••••••••')
  await pwdFields.nth(0).fill('autrepwd')
  await pwdFields.nth(1).fill('autrepwd')

  await page.getByRole('button', { name: 'Créer mon compte' }).click()
  await expect(page.getByText('Un compte existe déjà avec cet email.')).toBeVisible()
})

test('inscription échoue si mots de passe différents', async ({ page }) => {
  await page.getByText("S'inscrire").click()
  await page.getByPlaceholder('Yasmine').fill(PRENOM)
  await page.getByPlaceholder('Benali').fill(NOM)
  await page.getByPlaceholder('votre@email.com').fill(EMAIL)
  const pwdFields = page.getByPlaceholder('••••••••')
  await pwdFields.nth(0).fill('password1')
  await pwdFields.nth(1).fill('password2')

  await page.getByRole('button', { name: 'Créer mon compte' }).click()
  await expect(page.getByText('Les mots de passe ne correspondent pas.')).toBeVisible()
})

test('inscription échoue si mot de passe trop court', async ({ page }) => {
  await page.getByText("S'inscrire").click()
  await page.getByPlaceholder('Yasmine').fill(PRENOM)
  await page.getByPlaceholder('Benali').fill(NOM)
  await page.getByPlaceholder('votre@email.com').fill(EMAIL)
  const pwdFields = page.getByPlaceholder('••••••••')
  await pwdFields.nth(0).fill('123')
  await pwdFields.nth(1).fill('123')

  await page.getByRole('button', { name: 'Créer mon compte' }).click()
  await expect(page.getByText('Au moins 6 caractères')).toBeVisible()
})

// ─── CONNEXION ───────────────────────────────────────────────────────────────

test('connexion avec identifiants corrects', async ({ page }) => {
  await page.evaluate((u) => {
    localStorage.setItem('meditrack_users', JSON.stringify([u]))
  }, { prenom: PRENOM, nom: NOM, email: EMAIL, password: PASSWORD })

  await page.getByPlaceholder('votre@email.com').fill(EMAIL)
  await page.getByPlaceholder('••••••••').fill(PASSWORD)
  await page.getByRole('button', { name: 'Se connecter' }).click()

  await expect(page.getByText(`Bonjour, ${PRENOM}`)).toBeVisible()
})

test('connexion échoue avec mauvais mot de passe', async ({ page }) => {
  await page.evaluate((u) => {
    localStorage.setItem('meditrack_users', JSON.stringify([u]))
  }, { prenom: PRENOM, nom: NOM, email: EMAIL, password: PASSWORD })

  await page.getByPlaceholder('votre@email.com').fill(EMAIL)
  await page.getByPlaceholder('••••••••').fill('mauvais')
  await page.getByRole('button', { name: 'Se connecter' }).click()

  await expect(page.getByText('Mot de passe incorrect.')).toBeVisible()
})

test('connexion échoue si email inconnu', async ({ page }) => {
  await page.getByPlaceholder('votre@email.com').fill('inconnu@test.com')
  await page.getByPlaceholder('••••••••').fill(PASSWORD)
  await page.getByRole('button', { name: 'Se connecter' }).click()

  await expect(page.getByText('Aucun compte trouvé avec cet email.')).toBeVisible()
})

test('connexion insensible à la casse de l\'email', async ({ page }) => {
  await page.evaluate((u) => {
    localStorage.setItem('meditrack_users', JSON.stringify([u]))
  }, { prenom: PRENOM, nom: NOM, email: EMAIL, password: PASSWORD })

  await page.getByPlaceholder('votre@email.com').fill(EMAIL.toUpperCase())
  await page.getByPlaceholder('••••••••').fill(PASSWORD)
  await page.getByRole('button', { name: 'Se connecter' }).click()

  await expect(page.getByText(`Bonjour, ${PRENOM}`)).toBeVisible()
})

// ─── DÉCONNEXION / RECONNEXION ───────────────────────────────────────────────

test('déconnexion revient à la page de connexion', async ({ page }) => {
  // Inscription
  await page.evaluate((u) => {
    localStorage.setItem('meditrack_users', JSON.stringify([u]))
    localStorage.setItem('meditrack_current', JSON.stringify({ email: u.email, prenom: u.prenom, nom: u.nom }))
  }, { prenom: PRENOM, nom: NOM, email: EMAIL, password: PASSWORD })
  await page.reload()

  await page.getByRole('button', { name: 'Plus' }).click()
  await page.getByRole('button', { name: 'Déconnexion' }).click()

  await expect(page.getByText('Connexion')).toBeVisible()
})

test('reconnexion après déconnexion fonctionne', async ({ page }) => {
  await page.evaluate((u) => {
    localStorage.setItem('meditrack_users', JSON.stringify([u]))
  }, { prenom: PRENOM, nom: NOM, email: EMAIL, password: PASSWORD })

  // Connexion initiale
  await page.getByPlaceholder('votre@email.com').fill(EMAIL)
  await page.getByPlaceholder('••••••••').fill(PASSWORD)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByText(`Bonjour, ${PRENOM}`)).toBeVisible()

  // Déconnexion
  await page.getByRole('button', { name: 'Plus' }).click()
  await page.getByRole('button', { name: 'Déconnexion' }).click()
  await expect(page.getByText('Connexion')).toBeVisible()

  // Reconnexion avec les mêmes identifiants
  await page.getByPlaceholder('votre@email.com').fill(EMAIL)
  await page.getByPlaceholder('••••••••').fill(PASSWORD)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByText(`Bonjour, ${PRENOM}`)).toBeVisible()
})

// ─── MOT DE PASSE OUBLIÉ ─────────────────────────────────────────────────────

test('réinitialisation mot de passe fonctionne', async ({ page }) => {
  await page.evaluate((u) => {
    localStorage.setItem('meditrack_users', JSON.stringify([u]))
  }, { prenom: PRENOM, nom: NOM, email: EMAIL, password: PASSWORD })

  await page.getByText('Mot de passe oublié ?').click()
  await page.getByPlaceholder('votre@email.com').fill(EMAIL)
  await page.getByRole('button', { name: 'Continuer' }).click()

  await expect(page.getByText(`Compte trouvé : ${PRENOM} ${NOM}`)).toBeVisible()

  const newPwd = 'nouveaupwd123'
  const pwdFields = page.getByPlaceholder('••••••••')
  await pwdFields.nth(0).fill(newPwd)
  await pwdFields.nth(1).fill(newPwd)
  await page.getByRole('button', { name: 'Réinitialiser' }).click()

  await expect(page.getByText('Mot de passe modifié !')).toBeVisible()
  await page.getByRole('button', { name: 'Se connecter' }).click()

  // Connexion avec le nouveau mot de passe
  await page.getByPlaceholder('votre@email.com').fill(EMAIL)
  await page.getByPlaceholder('••••••••').fill(newPwd)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByText(`Bonjour, ${PRENOM}`)).toBeVisible()
})

test('réinitialisation échoue si email inconnu', async ({ page }) => {
  await page.getByText('Mot de passe oublié ?').click()
  await page.getByPlaceholder('votre@email.com').fill('inconnu@test.com')
  await page.getByRole('button', { name: 'Continuer' }).click()
  await expect(page.getByText('Aucun compte avec cet email.')).toBeVisible()
})

// ─── PERSISTANCE DONNÉES ──────────────────────────────────────────────────────

test('les données sont isolées par utilisateur', async ({ page }) => {
  const user2 = { prenom: 'Ahmed', nom: 'Idrissi', email: 'ahmed@test.com', password: 'pwd456' }

  await page.evaluate((users) => {
    localStorage.setItem('meditrack_users', JSON.stringify(users))
    // Données de Yasmine
    localStorage.setItem(`meditrack_${users[0].email}_meds`, JSON.stringify([
      { id: 1, nom: 'Paracétamol', dosage: '500mg', frequence: '1×/jour', stock: 10, seuilAlerte: 3, actif: true, heures: [], prises: [] }
    ]))
  }, [{ prenom: PRENOM, nom: NOM, email: EMAIL, password: PASSWORD }, user2])

  // Connexion Yasmine
  await page.getByPlaceholder('votre@email.com').fill(EMAIL)
  await page.getByPlaceholder('••••••••').fill(PASSWORD)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.getByRole('button', { name: 'Médicaments', exact: true }).click()
  await expect(page.getByText('Paracétamol')).toBeVisible()

  // Déconnexion → connexion Ahmed
  await page.getByRole('button', { name: 'Plus' }).click()
  await page.getByRole('button', { name: 'Déconnexion' }).click()
  await page.getByPlaceholder('votre@email.com').fill(user2.email)
  await page.getByPlaceholder('••••••••').fill(user2.password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.getByRole('button', { name: 'Médicaments', exact: true }).click()

  // Ahmed ne voit pas les médicaments de Yasmine
  await expect(page.getByText('Paracétamol')).not.toBeVisible()
  await expect(page.getByText('Aucun médicament')).toBeVisible()
})
