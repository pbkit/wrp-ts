# WRP - Webview/Worker Request Protocol

pronounce as **wrap**(`ræp`)

## Design

<img
  width="500"
  alt="architecture diagram"
  src="https://kroki.io/pikchr/svg/eNq9kj9vwjAQxXd_ipMnUIsFVCwwdqCdOrRbYTDJQawGO7INycfvOf6jtN27RPa9F9_vnr1vb7iFTwbwgYPfAr9QgdP21bgtnMwAXBnHd3A1d4RNN5A0VqWurVE13-WCOlt5RQ698g0IDdIHO5ywNX04Tbi_h3TSovYceK90bfrQ1xMGcCEE-oqzIwu-A9V7VdO5e6ITcfkAq2UXtQbVpfFRTOuJKpNSUSu0jD03Umts49TvpvpCH9cAvIoaH3cjohsNoXBM1IdRjBDx90L0lHsWpmQoVBOHLGoiOxZUBwuYLR9htSb7nLFWaYSzNdefMiU5B8pNk7EbdixmF24QOmvuqkYHmV9aS_fgDaTxReqtGdvf0Pm3u6RIDH0ncWdvSXz9K_JsKPNtsiE-gzhZmCs5yTJbhBAifUYOBHwcP7OIPljXo3NJEbyYf2WMiIsJY2MSYiYRGK6hEH4DBOwAoA==">

```typescript
// Glue implementation provides socket object.
type Socket = Reader & Writer;
interface Reader {
  read(p: Uint8Array): Promise<number | null>;
}
interface Writer {
  write(p: Uint8Array): Promise<number>;
}

// Channel provides a per-message communication method.
interface WrpChannel {
  listen(): AsyncGenerator<WrpMessage>;
  send(message: WrpMessage): Promise<void>;
}

// Guest provides a way to send requests to the host.
interface WrpGuest {
  availableMethods: Set<string>;
  request(
    name: string,
    metadata: Map<string, string>,
    req: AsyncGenerator<Uint8Array>,
  ): {
    res: AsyncGenerator<Uint8Array>;
    header: Promise<Map<string, string>>;
    trailer: Promise<Map<string, string>>;
  };
}

// Host provides a way to handle and respond to requests from guests.
interface WrpHost {
  listen(): AsyncGenerator<WrpRequest>;
}
interface WrpRequest {
  methodName: string;
  metadata: Map<string, string>;
  req: AsyncGenerator<Uint8Array>;
  sendHeader(value: Map<string, string>): void;
  sendPayload(value: Uint8Array): void;
  sendTrailer(value: Map<string, string>): void;
}
```
