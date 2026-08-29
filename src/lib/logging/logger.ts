export type LogLevel = 'info' | 'warn' | 'error';

export const log = (level: LogLevel, event: string, data: Record<string, unknown> = {}): void => {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data,
  });
  if (level === 'error') console.error(entry);
  else if (level === 'warn') console.warn(entry);
  else console.info(entry);
};
