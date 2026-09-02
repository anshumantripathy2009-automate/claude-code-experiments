# Example Requests

Use these with [Hoppscotch](https://hoppscotch.io) (or Postman/curl) to test the
`/webhook` endpoint without needing a real WhatsApp connection.

- **Method:** `POST`
- **URL (local via `vercel dev`):** `http://localhost:3000/webhook`
- **URL (deployed):** `https://<your-project>.vercel.app/webhook`
- **Headers:** `Content-Type: application/json`

Send these in order, using the **same `from` number**, to simulate one full
conversation building up in memory.

## 1. Opening message

```json
{
  "from": "+919876543210",
  "message": "Hi"
}
```

Expect a warm Hinglish greeting asking how it can help.

## 2. Give name

```json
{
  "from": "+919876543210",
  "message": "Mera naam Ananya hai"
}
```

Expect it to acknowledge the name and ask what service is needed.

## 3. Give service

```json
{
  "from": "+919876543210",
  "message": "Mujhe teeth cleaning karwani hai"
}
```

Expect it to ask for a preferred date and time.

## 4. Give date/time → booking JSON should appear

```json
{
  "from": "+919876543210",
  "message": "Kal shaam 5 baje aa sakti hoon"
}
```

Expect a confirmation reply, and the server console should log something like:

```json
{
  "name": "Ananya",
  "service": "Teeth cleaning",
  "preferred_date": "Kal (tomorrow)",
  "preferred_time": "5 PM",
  "status": "pending_confirmation"
}
```

The `booking` field will also be present in the JSON response body once the
model has collected all three fields, along with `"bookingLogged": true`
if it was successfully appended to your Google Sheet (`false` if Sheets
isn't configured or the append failed — check the server logs).

## 5. All-in-one message (single turn)

You can also test a single message that already contains everything:

```json
{
  "from": "+919812345678",
  "message": "Hi, I'm Rohan, I need a root canal, can I come this Saturday at 11am?"
}
```

Expect the booking JSON to be produced immediately since all details are present.

## Error cases

Missing `message`:

```json
{
  "from": "+919876543210"
}
```

→ `400 { "error": "\"message\" (text) is required." }`

Wrong HTTP method (e.g. GET) → `405 { "error": "Method not allowed. Use POST." }`
