export function evaluateExpression(input: string): number {
  const sanitized = input.replace(/[^0-9+\-*/.]/g, '');
  if (!sanitized) return 0;
  const tokens = sanitized.match(/(\d+(\.\d+)?)|[+\-*/]/g);
  if (!tokens || tokens.length === 0) return 0;

  const values: number[] = [];
  const ops: string[] = [];
  const precedence = (op: string) => (op === '+' || op === '-' ? 1 : 2);

  const applyOp = () => {
    const op = ops.pop();
    const b = values.pop();
    const a = values.pop();
    if (!op || a === undefined || b === undefined) return;
    if (op === '+') values.push(a + b);
    else if (op === '-') values.push(a - b);
    else if (op === '*') values.push(a * b);
    else if (op === '/') values.push(b === 0 ? 0 : a / b);
  };

  for (const token of tokens) {
    if (/^\d+(\.\d+)?$/.test(token)) {
      values.push(Number(token));
      continue;
    }
    while (ops.length > 0 && precedence(ops[ops.length - 1]) >= precedence(token)) {
      applyOp();
    }
    ops.push(token);
  }

  while (ops.length > 0) applyOp();
  return Number.isFinite(values[0]) ? values[0] : 0;
}
