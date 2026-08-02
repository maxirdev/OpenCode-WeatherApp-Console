const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export async function withSpinner<T>(
  msg: string,
  fn: () => Promise<T>,
): Promise<T> {
  const stream = process.stdout;
  const isTTY = stream.isTTY && !process.env.CI;
  let i = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  if (isTTY) {
    stream.write(`\r${msg} `);
    timer = setInterval(() => {
      const frame = FRAMES[i % FRAMES.length];
      if (frame !== undefined) stream.write(`\r${msg} ${frame}`);
      i++;
    }, 80);
  }

  try {
    return await fn();
  } finally {
    if (timer) clearInterval(timer);
    if (isTTY) stream.write(`\r${" ".repeat(msg.length + 2)}\r`);
  }
}