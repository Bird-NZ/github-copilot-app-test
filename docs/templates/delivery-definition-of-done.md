# Delivery-Surface Definition of Done

Purpose: prevent HAL from confusing artifact creation with actual delivery.

Before claiming completion, check all four:

## 1) Artifact created
- Did I actually make the thing?
- Is the file/output/content real and usable?

## 2) Destination identified
- What surface did Mat ask for?
  - WhatsApp chat
  - email inbox
  - local browser
  - deployed URL
  - downloadable file
  - voice note
  - documentation file

## 3) Delivery completed
- Did it reach the requested surface?
- Was it sent/shown/deployed in the right place?

## 4) Surface usability verified
- Can Mat actually use it there?
- For media: does it play/open correctly on the target surface?
- For deploys: is the live URL serving the intended revision?
- For messages: did the message route successfully?

## Delivery-specific examples

### Voice note
Not done if:
- audio file exists locally
- desktop playback works

Done only if:
- WhatsApp/mobile playback works on target surface

### App deploy
Not done if:
- build succeeded locally
- deploy command ran

Done only if:
- live URL is reachable
- intended revision/content is visible

### Build progress update
Not done if:
- internal work happened but Mat did not receive the update

Done only if:
- the update was actually sent in chat

### Report/document
Not done if:
- local file exists but Mat asked for email/chat delivery

Done only if:
- it reached the requested surface and is usable there

## Anti-patterns
- "generated" treated as "delivered"
- "deployed" treated as "verified live"
- "sent" treated as "usable"
- "likely fixed" treated as "confirmed on target surface"
