import app from './app';
import { config } from './config';
import { connectDB, disconnectDB } from './config/database';

// ─── Start Server ────────────────────────────────────────────
const startServer = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
    console.log(`API URL: http://localhost:${config.port}`);
  });

  // ─── Graceful Shutdown ───────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      console.log('Process terminated');
      process.exit(0);
    });

    // Force shutdown after 10 s
    setTimeout(() => {
      console.error('Forced shutdown — timeout exceeded');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Catch unhandled errors so the process doesn't silently die
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });
};

startServer();
