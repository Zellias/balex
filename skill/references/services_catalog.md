# Bale Protobuf Services Reference Catalog

This document lists the primary official RPC services extracted from the Bale Messenger client bundle (`web.bale.ai`).

## 1. `bale.auth.v1.Auth`
Handles telephone authentication, OTP validation, two-factor authentication, and sessions.

| Method | Type | Request Fields | Response Fields |
| :--- | :--- | :--- | :--- |
| `StartPhoneAuth` | Unary | `phoneNumber (int64)`, `appId (int32)`, `apiKey (string)`, `deviceHash (bytes)`, `deviceTitle (string)` | `transactionHash (string)` |
| `ValidateCode` | Unary | `transactionHash (string)`, `code (string)`, `isJwt (bool submessage)`, `language (int32)` | `user (User)`, `jwt (StringValue)` |
| `ValidatePassword` | Unary | `transactionHash (string)`, `password (string)`, `isJwt (bool submessage)` | `user (User)`, `jwt (StringValue)` |
| `SignOut` | Unary | *(empty)* | *(empty)* |
| `TerminateSession` | Unary | `id (int64)` | *(empty)* |

## 2. `bale.messaging.v2.Messaging`
Handles conversation lists, message histories, channels, and groups.

| Method | Type | Description |
| :--- | :--- | :--- |
| `LoadDialogs` | Unary | Retrieves list of dialogs, unread counts, user and group metadata. |
| `LoadHistory` | Unary | Retrieves message history for a peer (user or group) with pagination. |
| `SendMessage` | Unary | Sends a text message, quote, or forward to a target peer. |
| `DeleteMessage` | Unary | Deletes messages for self or everyone. |
| `PinMessage` | Unary | Pins a message to top of conversation. |

## 3. `bale.banking.v1.Banking`
Handles Shetab card-to-card, destination inquiry, and gold packets.

| Method | Type | Description |
| :--- | :--- | :--- |
| `InquireDestinationPan` | Unary | Inquires cardholder name and bank from destination card number. |
| `TransferMoneyByCard` | Unary | Executes card-to-card transfer with Harim dynamic OTP. |
| `GetCardBalance` | Unary | Inquires balance of verified source card. |
| `SendGoldPacket` | Unary | Creates digital gold gifting packet. |

## 4. `bale.file.v1.File`
Handles file upload and chunked download.

| Method | Type | Description |
| :--- | :--- | :--- |
| `GetFileUploadUrl` | Unary | Obtains signed upload URL for media and files. |
| `GetFileDownloadUrl` | Unary | Obtains secure file stream download link. |

## 5. `bale.groups.v1.Groups`
Handles group chat creation, membership invitations, kicks, titles, and admin permissions.

| Method | Type | Description |
| :--- | :--- | :--- |
| `CreateGroup` | Unary | Creates a new group with title and initial user IDs. |
| `InviteUser` | Unary | Invites / adds one or multiple users to an existing group. |
| `KickUser` | Unary | Removes / kicks a member from the group. |
| `EditGroupTitle` | Unary | Changes the group display title. |
| `EditGroupAbout` | Unary | Changes the group description / bio. |
| `LeaveGroup` | Unary | Leaves the group. |
| `LoadFullGroups` | Unary | Retrieves detailed group metadata and member counts. |

## 6. `bale.presence.v1.Presence`
Handles user online/offline status and typing indicators.

| Method | Type | Description |
| :--- | :--- | :--- |
| `SetOnline` | Unary | Sets presence state (online = true/false) with timeout. |
| `Typing` | Unary | Sends typing indicator (text, voice recording, file upload). |
| `StopTyping` | Unary | Cancels typing indicator. |
| `SubscribeToOnlineStatus` | Unary | Subscribes to target user's online/offline events. |

## 7. `bale.users.v1.Users`
Handles user profile fetching and contact book management.

| Method | Type | Description |
| :--- | :--- | :--- |
| `LoadFullUsers` | Unary | Fetches full user profiles by user IDs. |
| `GetContacts` | Unary | Retrieves user's synced phone contacts. |
| `SearchContacts` | Unary | Searches contacts by query text. |

## 8. `bale.stickers.v1.Stickers`
Handles sticker packs, favorites, and recent stickers.

| Method | Type | Description |
| :--- | :--- | :--- |
| `LoadStickerPacks` | Unary | Retrieves installed sticker packs. |
| `LoadStickers` | Unary | Retrieves stickers within a pack. |
| `GetFavoriteStickers` | Unary | Retrieves favorite stickers. |
