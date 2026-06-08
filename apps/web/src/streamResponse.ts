import type { UseFormSetValue } from "react-hook-form";
import type { IChat, IMessage } from "./interfaces";
import { flushSync } from 'react-dom';


export async function streamResponse(
  chat: IChat,
  setValue: UseFormSetValue<IChat>,
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>
) {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/converse', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chat)
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let currentResponseText = "";
    let buffer = "";

    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE Events sind durch \n\n getrennt
      const events = buffer.split("\n\n");
      buffer = events.pop() || ""; // letztes unvollständiges Event aufheben

      for (const event of events) {
        const lines = event.split("\n");
        const eventType = lines.find(l => l.startsWith("event: "))?.slice(7);
        const dataLine = lines.find(l => l.startsWith("data: "))?.slice(6);

        if (!dataLine) continue;

        if (eventType === "text") {
          currentResponseText += JSON.parse(dataLine);

          flushSync(() => {
            setMessages(prev => prev.map((msg, i) =>
              i === 0 ? { ...msg, content: currentResponseText } : msg
            ));
          });
        } else if (eventType === "metrics") {
          try {
            const metrics = JSON.parse(dataLine);
            setValue("inputTokens", metrics.inputTokens);
            setValue("outputTokens", metrics.outputTokens);
          } catch (e) {
            console.error("Fehler beim Parsen der Metriken", e);
          }
        }
      }
    }

    setValue('messages', chat.messages.map((msg, idx) =>
      idx === 0 ? { ...msg, content: currentResponseText } : msg
    ));

  } catch (error) {
    console.error('Streaming error: ', error);
  }
}