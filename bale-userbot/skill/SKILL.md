---
name: balex-sdk
description: >-
  Comprehensive developer skill and runbook for BaleX (Bale Messenger Protobuf SDK & Userbot).
  Use when the user asks to build, test, automate, or integrate with Bale messenger protocols,
  including authentication (StartPhoneAuth, ValidateCode, 2FA), real-time messaging, WebSocket
  streams, Iranian Shetab banking (card-to-card, inquiry, dynamic OTP, gold packet), and stealth/humanize engines.
---

# BaleX SDK & Protocol Developer Skill

This skill teaches the AI assistant how to understand, interact with, debug, and build applications using the **BaleX** library (the pure Protobuf wire engine and client SDK for the Iranian **Bale Messenger** ecosystem).

---

## 1. Core Architecture & Endpoints

Bale's infrastructure operates on a dual-layer transport architecture:

1. **gRPC-Web HTTP Layer (Unary RPCs & Authentication)**:
   - **Primary Endpoint**: `https://maviz-ws.bale.ai`
   - **Fallback Endpoint**: `https://next-ws.bale.ai`
   - **Content-Type**: `application/grpc-web+proto`
   - **Framing**: Standard 5-byte gRPC-Web prefix:
     `[1-byte flag (0x00=Data, 0x80=Trailers)][4-byte Big-Endian Length uint32][Protobuf Binary Payload]`
   - **Mandatory Headers**:
     - `Origin: https://web.bale.ai`
     - `x-grpc-web: 1`
     - `User-Agent: Mozilla/5.0 ...`
     - `app_version: 171248`
     - `session_id: <timestamp_ms>`

2. **WebSocket Layer (Real-time Stream & Authenticated RPCs)**:
   - **Primary Endpoint**: `wss://maviz-ws.bale.ai/ws/?uid=<USER_ID>`
   - **Fallback Endpoint**: `wss://next-ws.bale.ai/ws/?uid=<USER_ID>`
   - **IMPORTANT**: An unauthenticated WebSocket connection without a valid `jwt` and `uid` is immediately dropped by the server with close code `4401` (`onUnauthenticated`). Authentication **MUST** be performed first via gRPC-Web HTTP unary.

---

## 2. Authentication Runbook

### Step 1: Start Phone Auth (`bale.auth.v1.Auth.StartPhoneAuth`)
Triggers an official 5-digit SMS OTP from Bale.

- **Request Schema**:
  - `Field 1 (int64)`: Phone number normalized to international numeric format without leading zeros (e.g. `989372570490`).
  - `Field 2 (int32)`: `appId = 4` (Official Bale Web client ID).
  - `Field 3 (string)`: Web API Key (`C28D46DC4C3A7A26564BFCC48B929086A95C93C98E789A19847BEE8627DE4E7D`).
  - `Field 4 (bytes)`: Device random hash (16 random bytes).
  - `Field 5 (string)`: Device title (e.g., `'BaleX Desktop'`).
- **Response Schema**:
  - `Field 1 (string)`: `transactionHash` (Required for subsequent validation calls).

### Step 2: Validate SMS Code (`bale.auth.v1.Auth.ValidateCode`)
Verifies the SMS code. Bale SMS OTPs in Iran are strictly **5 digits**.

- **Normalization Rule**: Persian digits (`۰۱۲۳۴۵۶۷۸۹`) and Arabic digits (`٠١٢٣٤٥٦٧٨٩`) **MUST** be normalized to ASCII digits (`0-9`) before sending, or the server will reject with `PHONE_CODE_INVALID`.
- **Request Schema**:
  - `Field 1 (string)`: `transactionHash` from Step 1.
  - `Field 2 (string)`: 5-digit normalized SMS code.
  - `Field 3 (submessage)`: `BoolValue isJwt` (`{ 1: true }`).
  - `Field 5 (int32)`: `language = 1`.
- **Response Schema (Module 25637 / 86923)**:
  - `Field 2 (submessage)`: User profile:
    - `Field 1 (int32)`: User ID (`id`).
    - `Field 2 (int64)`: `accessHash` (Varint 64-bit number — **NOT a string!**).
    - `Field 3 (string)`: User full name (`name`).
    - `Field 4 (submessage)`: `localName` (`StringValue`).
    - `Field 9 (submessage)`: `nick` (Username `StringValue`).
  - `Field 4 (submessage)`: `StringValue` containing `jwt` session token.

### Step 3: Two-Factor Authentication (2FA) (`bale.auth.v1.Auth.ValidatePassword`)
Used when account is protected with a cloud password (server returns `PHONE_PASSWORD_INVALID` in step 2).
- `Field 1 (string)`: `transactionHash`.
- `Field 2 (string)`: Account password.
- `Field 3 (submessage)`: `BoolValue isJwt` (`{ 1: true }`).

---

## 3. Shetab Banking & Financial Hub Runbook

Bale has official direct integration with Iranian Shetab banking and Shaparak.

### Step 1: Destination Cardholder Inquiry (`InquireDestinationPan`)
Service: `bale.banking.v1.Banking` (or via official Bale banking RPC)
- **Inputs**:
  - `sourcePan`: 16-digit source card number (e.g., Bank Melli `603799...`).
  - `destinationPan`: 16-digit destination card number (e.g., Bank Mellat `610433...`).
  - `amountRials`: Transfer amount in Rials (Toman $\times 10$).
- **Luhn Check**: Validate card numbers using standard mod 10 Luhn algorithm before network invocation.
- **Output**:
  - `cardHolderName`: Full legal name of destination account holder (e.g., `'علی محمدی'`).
  - `inquiryToken`: Unique security token required for the transfer step.

### Step 2: Dynamic OTP & Card-to-Card Transfer (`TransferMoneyByCard`)
- **Inputs**:
  - `sourcePan`, `destinationPan`, `amountRials`.
  - `cvv2`: Card CVV2 (3 or 4 digits).
  - `expireDate`: Expiry MMYY (e.g. `'0628'` for 1406/08).
  - `pin2`: Dynamic SMS OTP from Harim system.
  - `inquiryToken`: Token returned by step 1.
  - `description`: Transfer memo / description.
- **Output**:
  - `rrn`: Retrieval Reference Number (شماره پیگیری / ارجاع).
  - `trackingCode`: Shaparak tracking code.
  - `transactionDate`: Timestamp.

### Step 3: Cash & Gold Gift Packets (بسته‌های هدیه نقدی و طلا)
Bale supports two distinct gift packet subsystems:

1. **Cash Gift Packets (`bale.giftpacket.v1.GiftPacket`)**:
   - **Send Cash Gift Packet**: `client.sendGiftPacket({ peer, amount, count, message, givingType, coverId, showTotalAmount })`
     - Wire Tag 17 in `Message` (`giftPacketMessage`).
     - `givingType`: `0` for Random (شانسی), `1` for Equal (مساوی).
   - **Open / Claim Cash Gift Packet**: `client.openGiftPacket({ peer, randomId, date, walletId })`
     - Dispatches `bale.giftpacket.v1.GiftPacket.OpenGiftPacket`.
     - Returns `{ status, selfWinAmount, rank, openedCount, giftReceivers }`.
   - **Get Payment Token**: `client.getGiftPacketPaymentToken({ token, amount })`
     - Dispatches `bale.giftpacket.v1.GiftPacket.GetPaymentToken`.

2. **Gold Gift Packets (`bale.balebank.v1.GoldGiftPacket`)**:
   - **Send Gold Gift Packet**: `client.sendGoldGiftPacket({ peer, amountMilligrams, count, message, givingType })`
     - Wire Tag 28 in `Message` (`goldGiftPacketMessage`).
     - Dispatches `bale.balebank.v1.GoldGiftPacket.SendGoldGiftPacket`.
   - **Open / Claim Gold Packet**: `client.openGoldGiftPacket(giftPacketId)`
     - Dispatches `bale.balebank.v1.GoldGiftPacket.OpenGoldGiftPacket`.
     - Returns `{ selfWinAmount, openedCount }`.
   - **Get Gold Winners**: `client.getGoldGiftPacketWinners(giftPacketId)`
     - Dispatches `bale.balebank.v1.GoldGiftPacket.GetWinnerIDs`.

---

## 4. Real-time Messaging & Events Runbook

### Loading Dialogs (`bale.messaging.v2.Messaging.LoadDialogs`)
- **Request**:
  - `minDate (int64)`: 0 (or timestamp for pagination).
  - `limit (int32)`: Number of dialogs to fetch (default 30).
  - `dialogType (int32)`: 0 for all.
- **Response**:
  - `dialogs`: List of active conversations with last message, unread count, and peer.
  - `users`: User metadata (id, name, avatar, username).
  - `groups`: Group metadata (id, title, member count).

### Sending Messages
- `peer`: `{ id: <int>, type: 1 (User) | 2 (Group) }`
- `randomId`: Unique int64 identifier to prevent duplicate sends.
- `message`: Text message with optional formatting tags or reply-to reference (`replyToMessageId`).

### WebSocket Stream Event Decoding & Complete 16-Event Catalog
Incoming server frames have wire tags and are mapped to 16 client events:

| Event Name | Wire Source | Payload | Description |
| :--- | :--- | :--- | :--- |
| `message` | Tag `55` (`UpdateMessage`) | `MessageEvent` | New incoming message with rich action helpers |
| `messageEdit` | Tag `162` (`UpdateMessageContentChanged`) | `{ peer, rid, message, date }` | Message edited |
| `messageDelete` | Tag `46` (`UpdateMessageDelete`) | `{ peer, rids }` | Message deleted |
| `messageReceived` | Tag `54` (`UpdateMessageReceived`) | `{ peer, startDate, date }` | Message delivered checkmark (grey tick) |
| `messageRead` | Tag `19` (`UpdateMessageRead`) | `{ peer, startDate, date }` | Messages read / seen (double blue ticks) |
| `chatClear` | Tag `47` (`UpdateChatClear`) | `{ peer }` | Chat cleared |
| `reaction` | Tag `222` / `54323` | `{ peer, rid, reactions, reactionByMe }` | Reaction added / removed |
| `typing` | Tag `6` (`UpdateTyping`) | `{ peer, userId, typingType }` | User started typing |
| `typingStop` | Tag `81` (`UpdateTypingStop`) | `{ peer, userId }` | User stopped typing |
| `userOnline` | Tag `7` (`UpdateUserOnline`) | `{ userId, deviceType }` | User came online |
| `userOffline` | Tag `8` (`UpdateUserOffline`) | `{ userId, lastSeen }` | User went offline with lastSeen timestamp |
| `connected` | Socket Transport | `{ uid, url, timestamp }` | WebSocket connection established |
| `disconnected` | Socket Transport | `{ code, reason }` | WebSocket disconnected |
| `status` | Socket Transport | `ConnectionStatus` | State machine change (CONNECTING, CONNECTED, ...) |
| `error` | Runtime | `Error` | Network or protobuf framing errors |
| `update` | Universal | `{ type, data, raw }` | Raw server frame update for custom pipeline |

#### MessageEvent Helpers & Detection Properties:
When the `message` event fires, the event object contains:
- **Identification & Content**: `senderId`, `peer`, `date`, `randomId`, `text`, `rawMessage`, `isGroup`, `isOut`
- **Content Type Boolean Flags**: `isPhoto`, `isVoice`, `isAudio`, `isVideo`, `isDocument`, `isSticker`, `isGiftPacket`, `isGoldGiftPacket`
- **Submessage Objects**: `giftPacket` (cash gift packet info), `goldGiftPacket` (gold gift packet info)
- **Convenience Actions**:
  - `await msg.reply(text, options)`: Sends reply with humanized reading and typing simulation
  - `await msg.markAsRead()`: Sends seen read receipt (double blue checkmarks)
  - `await msg.markAsReceived()`: Sends delivered receipt (single checkmark)
  - `await msg.react(emoji)`: Sends emoji reaction
  - `await msg.pin()`: Pins message in conversation
  - `await msg.delete()`: Deletes message
  - `await msg.forwardTo(toPeer)`: Forwards message to destination peer
  - `await msg.openGiftPacket(walletId)`: Automatically claims/opens cash gift packet
  - `await msg.openGoldGiftPacket()`: Automatically claims/opens gold gift packet

---

## 5. Media Messaging & Protobuf Schemas

Bale handles all rich attachments through `documentMessage` (Tag `4`) and `stickerMessage` (Tag `12`):

```text
Message (ai.bale.messaging.v2.Message)
├── Tag 4: DocumentMessage
│   ├── Field 1: int64 fileId
│   ├── Field 2: int64 accessHash
│   ├── Field 3: int32 fileSize
│   ├── Field 4: string name
│   ├── Field 5: string mimeType
│   ├── Field 7: DocumentEx
│   │   ├── Tag 1: Photo ({ w: int32, h: int32 })
│   │   ├── Tag 2: Video ({ w: int32, h: int32, duration: int32 })
│   │   ├── Tag 3: Voice ({ duration: int32, waveForm: bytes })
│   │   ├── Tag 4: Gif ({ w: int32, h: int32 })
│   │   └── Tag 5: Audio ({ duration: int32, title: string, performer: string })
│   └── Field 8: TextMessage caption ({ 1: text })
├── Tag 12: StickerMessage ({ 1: stickerId, 2: accessHash, 3: stickerPackId })
├── Tag 15: TextMessage ({ 1: text, 2: mentions })
├── Tag 17: GiftPacketMessage ({ 1: giftCount, 2: totalAmount, 3: givingType, 4: walletId, 5: regarding, 6: ownerUserId, 7: coverId, 8: showTotalAmount })
└── Tag 28: GoldGiftPacketMessage ({ 1: packetId })
```

### High-Level Media Methods in BaleX:
```javascript
// 1. Photo (sets typing type to PHOTO)
await client.sendPhoto(peer, {
  fileId: 1048576, accessHash: 987654321n, fileSize: 245000,
  name: 'image.jpg', width: 1280, height: 720, caption: 'Caption text'
});

// 2. Voice (sets typing type to RECORD_VOICE)
await client.sendVoice(peer, {
  fileId: 2097152, accessHash: 876543210n, fileSize: 64000,
  duration: 15, waveForm: Buffer.alloc(16), caption: 'Voice note'
});

// 3. Audio / Music (playable in native player)
await client.sendAudio(peer, {
  fileId: 3145728, accessHash: 765432109n, fileSize: 5200000,
  name: 'track.mp3', duration: 180, title: 'Title', performer: 'Artist', caption: 'Music'
});

// 4. Video (sets typing type to RECORD_VIDEO)
await client.sendVideo(peer, {
  fileId: 4194304, accessHash: 654321098n, fileSize: 18500000,
  name: 'clip.mp4', width: 1920, height: 1080, duration: 45, caption: 'Video clip'
});

// 5. Document / File (sets typing type to UPLOAD_DOCUMENT)
await client.sendDocument(peer, {
  fileId: 5242880, accessHash: 543210987n, fileSize: 14200000,
  name: 'file.pdf', mimeType: 'application/pdf', caption: 'Document'
});

// 6. Sticker
await client.sendSticker(peer, stickerId, accessHash, stickerPackId);
```

---

## 6. Message Management & Group Administration Runbook

### Message Operations:
- **Edit Message**: `await client.editMessage(peer, messageId, 'New text');`
  - Dispatches `bale.messaging.v2.Messaging.EditMessage`.
- **Forward Messages**: `await client.forwardMessages(toPeer, fromPeer, [mid1, mid2]);`
  - Dispatches `bale.messaging.v2.Messaging.ForwardMessages`.
- **Pin Message**: `await client.pinMessage(peer, messageId);`
  - Dispatches `bale.messaging.v2.Messaging.PinMessage`.
- **Delete Messages**: `await client.deleteMessages(peer, [mid1, mid2]);`
  - Dispatches `bale.messaging.v2.Messaging.DeleteMessage`.
- **Clear Chat**: `await client.clearChat(peer);`
  - Dispatches `bale.messaging.v2.Messaging.ClearChat`.

### Group & Channel Operations:
- **Create Group**: `const grp = await client.createGroup('Group Title', [userId1, userId2]);`
  - Dispatches `bale.groups.v1.Groups.CreateGroup`.
- **Invite Members**: `await client.inviteMembers(groupId, [userId1, userId2]);`
  - Dispatches `bale.groups.v1.Groups.InviteUser`.
- **Kick Member**: `await client.kickMember(groupId, userId);`
  - Dispatches `bale.groups.v1.Groups.KickUser`.
- **Set Group Title**: `await client.setGroupTitle(groupId, 'New Title');`
  - Dispatches `bale.groups.v1.Groups.EditGroupTitle`.
- **Leave Group**: `await client.leaveGroup(groupId);`
  - Dispatches `bale.groups.v1.Groups.LeaveGroup`.

### User & Contact Queries:
- **Get User**: `const user = await client.getUser(userId);`
  - Dispatches `bale.users.v1.Users.LoadFullUsers`.
- **Get Group Info**: `const group = await client.getGroup(groupId);`
  - Dispatches `bale.groups.v1.Groups.LoadFullGroups`.
- **Get Contacts**: `const contacts = await client.getContacts();`
  - Dispatches `bale.users.v1.Users.GetContacts`.
- **Load History**: `const history = await client.loadHistory(peer, limit, date);`
  - Dispatches `bale.messaging.v2.Messaging.LoadHistory`.

### User, Contacts & Profile Operations:
- **Import Contacts**: `await client.importContacts([{ phone: '09121234567', name: 'Ali' }]);`
  - Dispatches `bale.users.v1.Users.ImportContacts`.
  - Normalizes phone numbers (+98, Persian digits) and accepts `contacts: [{ phone, name }]`.
- **Add Single Contact**: `const contact = await client.addContact('09121234567', 'Name');`
  - Convenience wrapper around `importContacts`.
- **Add Contact by UID**: `await client.addContactByUid(userId, accessHash);`
  - Dispatches `bale.users.v1.Users.AddContact`.
- **Remove Contact**: `await client.removeContact(userId, accessHash);`
  - Dispatches `bale.users.v1.Users.RemoveContact`.
- **Search Contacts**: `const list = await client.searchContacts('Query');`
  - Dispatches `bale.users.v1.Users.SearchContacts`.
- **Edit Profile Name**: `await client.editName('New Name');`
  - Dispatches `bale.users.v1.Users.EditName`.
- **Edit Bio / About**: `await client.editAbout('Bio description');`
  - Dispatches `bale.users.v1.Users.EditAbout`.
- **Edit Username**: `await client.editUsername('handle');`
  - Dispatches `bale.users.v1.Users.EditNickName`.
- **Check Username**: `const available = await client.checkUsername('handle');`
  - Dispatches `bale.users.v1.Users.CheckNickName`.
- **Block / Unblock User**: `await client.blockUser(userId);` / `await client.unblockUser(userId);`
  - Dispatches `bale.users.v1.Users.BlockUser` / `bale.users.v1.Users.UnblockUser`.
- **Load Blocked Users**: `const blocked = await client.loadBlockedUsers();`
  - Dispatches `bale.users.v1.Users.LoadBlockedUsers`.

### Reactions & Folders Operations:
- **Set Reaction**: `await client.setReaction(peer, messageId, '❤️');`
  - Dispatches `bale.abacus.v1.Abacus.MessageSetReaction`.
- **Remove Reaction**: `await client.removeReaction(peer, messageId, '❤️');`
  - Dispatches `bale.abacus.v1.Abacus.MessageRemoveReaction`.
- **Get Reactions**: `const stats = await client.getReactions(peer, [messageId]);`
  - Dispatches `bale.abacus.v1.Abacus.GetMessagesReactions`.
- **Create Chat Folder**: `await client.createFolder('Work', [peer1, peer2]);`
  - Dispatches `bale.messaging.v2.Messaging.CreateFolder`.
- **Load Folders**: `const folders = await client.loadFolders();`
  - Dispatches `bale.messaging.v2.Messaging.LoadFolders`.
- **Delete Folder**: `await client.deleteFolder(folderId);`
  - Dispatches `bale.messaging.v2.Messaging.DeleteFolder`.

### Polls, Wallet & Bot Operations:
- **Send Poll in Chat**: `await client.sendPoll(peer, 'Question?', ['Opt 1', 'Opt 2'], { isAnonymous: true });`
  - Encodes `pollMessage` and dispatches `bale.messaging.v2.Messaging.SendMessage`.
- **Get Poll Results**: `const res = await client.getPollResults(pollId);`
  - Dispatches `bale.poll.v1.Poll.GetPollResults`.
- **Close Poll**: `await client.closePoll(pollId);`
  - Dispatches `bale.poll.v1.Poll.ClosePoll`.
- **Get Wallet Balance**: `const wallets = await client.getWalletCredit();`
  - Dispatches `bale.kifpool.v1.Kifpool.GetMyKifpools`.
- **Get Wallet Points**: `const points = await client.getWalletPoints();`
  - Dispatches `bale.kifpool.v1.Kifpool.GetKifpoolPointBalance`.
- **Send Inline Callback**: `await client.sendInlineCallback(peer, messageId, 'data');`
  - Dispatches `bale.ketf.v1.Ketf.SendInlineCallback`.

---

## 7. Dynamic RPC Dispatch for All 53 Services & 636 Methods

The client automatically maps all 53 official Bale gRPC services as camelCase properties on `client`:
- `client.auth.<methodName>(payload)`
- `client.messaging.<methodName>(payload)`
- `client.banking.<methodName>(payload)`
- `client.groups.<methodName>(payload)`
- `client.presence.<methodName>(payload)`
- `client.users.<methodName>(payload)`
- `client.files.<methodName>(payload)`

Or via universal invoker:
```javascript
const response = await client.invoke(
  'bale.presence.v1.Presence',
  'SetOnline',
  { isOnline: true, timeout: 60000, deviceType: 1 }
);
```

## 8. Stealth & Humanize Engine (Anti-Ban Guard)

Automated bots on Bale are detected if they perform instant actions without simulated human delays. Always activate the **Humanize Engine**:

1. **Typing Simulation**:
   Calculate reading and typing duration based on word count:
   $$\text{TypingMs} = \frac{\text{CharacterCount}}{5 \times \text{WPM}} \times 60\,000 \times (1 \pm \text{RandomVar})$$
   Send typing indicator (`bale.messaging.v1.SetTyping`) before sending the message payload.
2. **Reading Delay**:
   Before answering incoming messages, simulate a 2 to 5-second realistic human reading delay with a Gaussian normal distribution.
3. **Keep-Alive Heartbeat**:
   Send client ping (`randomId`) every 12 to 15 seconds over WebSocket to maintain active session.

---

## 9. Critical Bugs & Gotchas (Prevention Checklist)

| Issue | Root Cause | Mandatory Fix |
| :--- | :--- | :--- |
| **`RangeError: 17..186: -9223372036854775792`** | `64-bit int overflow` in `safeLen` calculation and misinterpreting `accessHash` (int64 varint) as string length in `User` model. | Calculate `maxAvailable = buf.length - offset` and clamp `safeLen = min(length, maxAvailable)`. In `User` decoder, treat Field 2 as `int64` varint. |
| **`PHONE_CODE_INVALID`** | Entering Persian digits `۰-۹` or dashes in SMS OTP. | Always run `BaleProto.normalizeCode(raw)` before gRPC dispatch. |
| **`4401 onUnauthenticated`** | Connecting to WebSocket before logging in. | Only open WebSocket **after** receiving `jwt` and `uid` from `ValidateCode`. |
| **UI Freeze on Android (2.3s doFrame)** | `GoogleFonts.vazirmatn()` attempting network HTTP download from `fonts.gstatic.com` (which is blocked inside Iran). | Set `GoogleFonts.config.allowRuntimeFetching = false;` or use local/bundled TTF assets with system font fallbacks. |
| **Status Bar Clipping** | Top bar drawn under Android camera notch. | Wrap top header in `SafeArea(bottom: false)`. |
