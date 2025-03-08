import type { EventSourceMessage } from '@microsoft/fetch-event-source'
import { fetchEventSource } from '@microsoft/fetch-event-source'

export async function connect(
  url: string,
  data: Record<string, unknown>,
  onopen: (response: Response) => Promise<void>,
  onmessage: (ev: EventSourceMessage) => void,
  onclose: () => void,
  onerror: (ev: Event) => void,
  method: string = 'POST',
  headers: Record<string, string> = {
    'Content-Type': 'application/json',
  },
) {
  await fetchEventSource(url, {
    method,
    openWhenHidden: true,
    headers,
    body: JSON.stringify(data),
    onopen,
    onmessage,
    onclose,
    onerror,
  })
}
