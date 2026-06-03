// Fire-and-forget Telegram notifier. Silently no-ops if env vars missing.
// Re-uses the Roccoagent_bot pattern from the main maisontanneurs project.

type SendOptions = { parseMode?: "HTML" | "MarkdownV2"; silent?: boolean }

export async function notifyTelegram(message: string, opts: SendOptions = {}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID
  if (!token || !chat) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text: message,
        parse_mode: opts.parseMode ?? "HTML",
        disable_notification: opts.silent ?? false,
        disable_web_page_preview: true,
      }),
    })
  } catch {
    // Swallow — telegram alerts are best-effort, never break the request.
  }
}

export function escapeHTML(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
