declare module 'nerdamer' {
  interface NerdamerExpression {
    evaluate(): NerdamerExpression
    toString(): string
  }

  type EquationSolutionEntry = [string, unknown] | string | number | unknown

  interface NerdamerStatic {
    (expression: string): NerdamerExpression
    simplify(expression: string): NerdamerExpression
    solveEquations(equation: string, variable?: string): EquationSolutionEntry[]
  }

  const nerdamer: NerdamerStatic
  export default nerdamer
}

declare module 'nerdamer/Algebra'
declare module 'nerdamer/Solve'

