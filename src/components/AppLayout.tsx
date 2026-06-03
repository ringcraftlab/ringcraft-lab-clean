import { styled } from '@mui/material/styles'
import type { HTMLAttributes, ReactNode } from 'react'
import AppHeader, { type AppHeaderProps } from './AppHeader'

export type AppLayoutContainerVariant = 'wizard' | 'tool' | 'home' | 'step4'

export interface AppLayoutProps {
  children: ReactNode
  header: AppHeaderProps
  containerVariant?: AppLayoutContainerVariant
  className?: string
  containerClassName?: string
  containerProps?: HTMLAttributes<HTMLElement> & Record<string, string | undefined>
}

const PageRoot = styled('div')({
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
})

const MainWizard = styled('main')({
  width: '100%',
  maxWidth: 'var(--max-width)',
  margin: '0 auto',
  padding: '40px 24px 56px',
  boxSizing: 'border-box',
  '@media (max-width: 900px)': {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: '24px',
    paddingBottom: 'max(96px, calc(80px + env(safe-area-inset-bottom, 0px)))',
  },
})

const MainContent = styled('main')({
  width: '100%',
  maxWidth: 'var(--max-width)',
  margin: '0 auto',
  padding: '0 24px',
  boxSizing: 'border-box',
  '@media (max-width: 900px)': {
    paddingLeft: '16px',
    paddingRight: '16px',
  },
})

export default function AppLayout({
  children,
  header,
  containerVariant = 'wizard',
  className,
  containerClassName,
  containerProps,
}: AppLayoutProps) {
  const isWizardShell = containerVariant === 'wizard' || containerVariant === 'step4'

  const mainClassName = [
    isWizardShell ? 'wizard-container' : '',
    containerVariant === 'step4' ? 'step4-container' : '',
    containerClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <PageRoot className={['app-layout', 'wizard-page', className].filter(Boolean).join(' ')}>
      <AppHeader {...header} />
      {isWizardShell ? (
        <MainWizard className={mainClassName} {...containerProps}>
          {children}
        </MainWizard>
      ) : (
        <MainContent className={mainClassName} {...containerProps}>
          {children}
        </MainContent>
      )}
    </PageRoot>
  )
}
