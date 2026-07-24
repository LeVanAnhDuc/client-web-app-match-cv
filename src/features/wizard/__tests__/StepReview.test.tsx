import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '#/i18n'
import * as documentQueries from '#/features/documents/queries'
import * as matchQueries from '#/features/matching/queries'
import { StepReview } from '../StepReview'
import { useWizardStore } from '../store'
import type { DocumentDto } from '#/features/documents/types'
import type { MatchResultDto } from '#/features/matching/types'

function renderStep() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <StepReview />
    </QueryClientProvider>,
  )
}

const jdDto: DocumentDto = {
  id: 'jd-1',
  kind: 'JD',
  title: 'Senior Product Designer',
  sourceFormat: 'pdf',
  rawText: 'We need a senior product designer with Figma experience.',
  isSaved: true,
  createdAt: '2023-10-12T00:00:00.000Z',
}

const cvDto: DocumentDto = {
  id: 'cv-1',
  kind: 'CV',
  title: 'Sarah Johnson',
  sourceFormat: 'pdf',
  rawText: 'Sarah Johnson — 6 years of product design experience.',
  isSaved: true,
  createdAt: '2023-10-12T00:00:00.000Z',
}

const matchResult: MatchResultDto = {
  id: 'match-1',
  cvDocumentId: 'cv-1',
  jdDocumentId: 'jd-1',
  overallScore: 75,
  semanticScore: 88,
  keywordScore: 62,
  report: { strengths: [], gaps: [], suggestions: [] },
  createdAt: '2023-10-12T00:00:00.000Z',
}

describe('StepReview', () => {
  beforeEach(() => {
    useWizardStore.setState({
      step: 3,
      jdDocId: 'jd-1',
      cvDocId: 'cv-1',
      matchId: null,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders two review panes prefilled with the CV and JD rawText', async () => {
    vi.spyOn(documentQueries, 'useDocument').mockImplementation((id) => {
      const data = id === 'jd-1' ? jdDto : id === 'cv-1' ? cvDto : undefined
      return { data, isLoading: false, isError: false } as ReturnType<
        typeof documentQueries.useDocument
      >
    })
    vi.spyOn(matchQueries, 'useRunMatch').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof matchQueries.useRunMatch>)

    renderStep()

    expect(await screen.findByDisplayValue(jdDto.rawText)).toBeInTheDocument()
    expect(await screen.findByDisplayValue(cvDto.rawText)).toBeInTheDocument()
  })

  it('Back navigates to step 2', async () => {
    vi.spyOn(documentQueries, 'useDocument').mockImplementation((id) => {
      const data = id === 'jd-1' ? jdDto : id === 'cv-1' ? cvDto : undefined
      return { data, isLoading: false, isError: false } as ReturnType<
        typeof documentQueries.useDocument
      >
    })
    vi.spyOn(matchQueries, 'useRunMatch').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof matchQueries.useRunMatch>)

    renderStep()
    await screen.findByDisplayValue(jdDto.rawText)

    fireEvent.click(screen.getByRole('button', { name: /back/i }))

    await waitFor(() => expect(useWizardStore.getState().step).toBe(2))
  })

  it('Run match reuses existing doc ids unchanged, sets matchId and advances to step 4', async () => {
    vi.spyOn(documentQueries, 'useDocument').mockImplementation((id) => {
      const data = id === 'jd-1' ? jdDto : id === 'cv-1' ? cvDto : undefined
      return { data, isLoading: false, isError: false } as ReturnType<
        typeof documentQueries.useDocument
      >
    })
    const mutateAsync = vi.fn(async () => matchResult)
    vi.spyOn(matchQueries, 'useRunMatch').mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof matchQueries.useRunMatch>)

    renderStep()
    await screen.findByDisplayValue(jdDto.rawText)

    fireEvent.click(screen.getByRole('button', { name: /run match/i }))

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ cvDocumentId: 'cv-1', jdDocumentId: 'jd-1' }),
    )
    await waitFor(() => expect(useWizardStore.getState().matchId).toBe('match-1'))
    await waitFor(() => expect(useWizardStore.getState().step).toBe(4))
  })

  it('Run match creates a fresh transient document when text was edited', async () => {
    vi.spyOn(documentQueries, 'useDocument').mockImplementation((id) => {
      const data = id === 'jd-1' ? jdDto : id === 'cv-1' ? cvDto : undefined
      return { data, isLoading: false, isError: false } as ReturnType<
        typeof documentQueries.useDocument
      >
    })
    const createMutateAsync = vi.fn(async () => ({ ...jdDto, id: 'jd-2' }))
    vi.spyOn(documentQueries, 'useCreateDocument').mockReturnValue({
      mutateAsync: createMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof documentQueries.useCreateDocument>)
    const runMutateAsync = vi.fn(async () => matchResult)
    vi.spyOn(matchQueries, 'useRunMatch').mockReturnValue({
      mutateAsync: runMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof matchQueries.useRunMatch>)

    renderStep()
    const jdTextarea = await screen.findByDisplayValue(jdDto.rawText)
    fireEvent.change(jdTextarea, { target: { value: 'Edited JD text' } })

    fireEvent.click(screen.getByRole('button', { name: /run match/i }))

    await waitFor(() =>
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'paste',
          kind: 'JD',
          sourceText: 'Edited JD text',
          save: false,
        }),
      ),
    )
    await waitFor(() =>
      expect(runMutateAsync).toHaveBeenCalledWith({ cvDocumentId: 'cv-1', jdDocumentId: 'jd-2' }),
    )
  })
})
