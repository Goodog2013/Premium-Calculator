import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  factorizeExpression,
  simplifySymbolicExpression,
  solveEquation,
} from '../engine/symbolicEngine'
import { STORAGE_KEYS } from '../persistence/keys'
import { SymbolicState } from '../types/calculator'

interface SymbolicStore extends SymbolicState {
  setSolveExpression: (expression: string) => void
  setSolveVariable: (variable: string) => void
  solve: () => void
  setFactorExpression: (expression: string) => void
  factorize: () => void
  setSimplifyExpression: (expression: string) => void
  simplify: () => void
  clearError: () => void
}

const initialState: SymbolicState = {
  solveExpression: 'x^2 - 5*x + 6 = 0',
  solveVariable: 'x',
  solveResult: 'x = 2, 3',
  factorExpression: 'x^3 - 1',
  factorResult: '(x-1)*(x^2+x+1)',
  simplifyExpression: '(x^2 - 1)/(x - 1)',
  simplifyResult: 'x+1',
  error: null,
}

export const useSymbolicStore = create<SymbolicStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSolveExpression: (solveExpression) =>
        set({ solveExpression, error: null }),

      setSolveVariable: (solveVariable) =>
        set({ solveVariable, error: null }),

      solve: () => {
        const { solveExpression, solveVariable } = get()

        try {
          const result = solveEquation(solveExpression, solveVariable)

          set({
            solveResult:
              result.solutions.length === 0
                ? 'No solutions found'
                : `${result.variable} = ${result.solutions.join(', ')}`,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unable to solve equation',
          })
        }
      },

      setFactorExpression: (factorExpression) =>
        set({ factorExpression, error: null }),

      factorize: () => {
        const { factorExpression } = get()

        try {
          const factorResult = factorizeExpression(factorExpression)
          set({ factorResult, error: null })
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Unable to factorize expression',
          })
        }
      },

      setSimplifyExpression: (simplifyExpression) =>
        set({ simplifyExpression, error: null }),

      simplify: () => {
        const { simplifyExpression } = get()

        try {
          const simplifyResult = simplifySymbolicExpression(simplifyExpression)
          set({ simplifyResult, error: null })
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Unable to simplify expression',
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: STORAGE_KEYS.symbolicState,
      partialize: (state) => ({
        solveExpression: state.solveExpression,
        solveVariable: state.solveVariable,
        solveResult: state.solveResult,
        factorExpression: state.factorExpression,
        factorResult: state.factorResult,
        simplifyExpression: state.simplifyExpression,
        simplifyResult: state.simplifyResult,
      }),
    },
  ),
)

