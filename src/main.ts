import "./styles/main.css";
import { Game } from "./core/Game";
import { gameConfig } from "./config/gameConfig";

function bootstrap(): void {
  const game = new Game(gameConfig);

  try {
    game.initialize();
    game.start();
  } catch (error) {
    console.error("[Explore Tapaktuan 3D] Failed to start the application:", error);
    showStartupError(error);
  }
}

function showStartupError(error: unknown): void {
  const app = document.getElementById(gameConfig.appId);
  if (!app) return;

  const message =
    error instanceof Error ? error.message : "Unknown initialization error.";

  app.innerHTML = "";

  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
    "padding:24px;font-family:system-ui,sans-serif;color:#e0e6ea;background:#0e1520;" +
    "text-align:center;line-height:1.6;white-space:pre-wrap;";
  overlay.textContent = `Unable to start the application.\n\n${message}`;

  app.appendChild(overlay);
}

bootstrap();