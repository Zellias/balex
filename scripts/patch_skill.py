# -*- coding: utf-8 -*-
import sys

with open(".agents/skills/balex/SKILL.md", "r", encoding="utf-8") as f:
    text = f.read()

# Update 60 to 62 methods
text = text.replace("60 Official Bale Bot API Methods", "62 Official Bale Bot API Methods")
text = text.replace("All 60 official methods from `https://docs.bale.ai/`", "All 62 official methods from `https://docs.bale.ai/`")
text = text.replace("`deleteMessage(chatId, messageId)`", "`deleteMessage(chatId, messageId)`, `deleteMessages(chatId, messageIds)`")
text = text.replace("`unpinChatMessage(chatId, messageId)`", "`unpinChatMessage(chatId, messageId)`, `unPinChatMessage(chatId, messageId)`")

# Add Client 106 Methods summary in skill
client_methods_summary = """
### 10.4 Complete List of 106 High-Level BaleClient Methods
All 106 convenience methods on `BaleClient` provide zero-wire overhead access to Bale features:

| Category | High-Level Methods |
| :--- | :--- |
| **Authentication & Session** | `connect()`, `disconnect()`, `sendCode(phone)`, `signIn(code, hash)`, `signInWithPassword(pass, hash)`, `logout()`, `isConnected`, `me` |
| **Messaging & History** | `sendMessage(peer, text, opts)`, `sendTextMessage(peerId, text, isGroup)`, `forwardMessages(toPeer, fromPeer, mids, opts)`, `editMessage(peer, msgId, text)`, `pinMessage(peer, msgId)`, `deleteMessages(peer, mids)`, `clearChat(peer)`, `loadDialogs(limit, endDate)`, `loadHistory(peer, limit, date)`, `markAsReceived(peer, date)`, `markAsRead(peer, date)` |
| **Media & Files** | `sendPhoto(peer, photo, opts)`, `sendVoice(peer, voice, opts)`, `sendAudio(peer, audio, opts)`, `sendVideo(peer, video, opts)`, `sendDocument(peer, doc, opts)`, `sendSticker(peer, stickerId, hash, packId)` |
| **Groups** | `createGroup(title, userIds)`, `getGroup(groupId)`, `inviteMembers(groupId, userIds)`, `kickMember(groupId, userId)`, `setGroupTitle(groupId, title)`, `leaveGroup(groupId)` |
| **Contacts & Users** | `getUser(userId)`, `getContacts()`, `importContacts(contacts)`, `addContact(phone, name)`, `addContactByUid(uid, hash)`, `removeContact(uid, hash)`, `searchContacts(query)` |
| **Profile & Privacy** | `editName(name)`, `editAbout(about)`, `editUsername(username)`, `checkUsername(username)`, `blockUser(userId)`, `unblockUser(userId)`, `loadBlockedUsers()` |
| **Reactions & Folders** | `setReaction(peer, msgId, emoji)`, `removeReaction(peer, msgId, emoji)`, `getReactions(peer, msgIds)`, `loadFolders()`, `createFolder(title, peers)`, `deleteFolder(folderId)` |
| **Polls & Quizzes** | `sendPoll(peer, question, opts, cfg)`, `createPoll(question, opts, cfg)`, `getPollResults(pollId)`, `closePoll(pollId)` |
| **Cash Gift Packets** | `sendGiftPacket(options)`, `openGiftPacket(options)`, `claimGiftPacket(options)`, `getGiftPacketReceivers(options)`, `getGiftPacketPaymentToken(options)` |
| **Gold Gift Packets** | `sendGoldGiftPacket(options)`, `openGoldGiftPacket(packetId)`, `claimGoldGiftPacket(packetId)`, `getGoldGiftPacketWinners(packetId)` |
| **Mini Apps & WebApps** | `createMiniAppParams(botUserId, opts)`, `createInitData(options)`, `signInitData(data, token)`, `validateInitData(initData, token, maxAge)`, `parseInitData(initData)`, `buildMiniAppUrl(options)`, `getMiniAppUrl(options)`, `getWebappHash(botUserId, data)`, `sendMiniAppData(options)`, `getBotMenuButton(botUserId)`, `invokeMiniAppCustomMethod(options)` |
| **Shetab Banking** | `inquireDestinationPan(options)`, `transferMoneyByCard(options)`, `getCardBalance(options)` |
| **Stories & Scheduling** | `sendStory(options)`, `deleteStory(storyId)`, `getUserStories(userId)`, `getStoryViewers(storyId)`, `likeStory(storyId, reaction)`, `scheduleMessage(options)`, `loadScheduledMessages(peer)`, `deleteScheduledMessage(peer, taskId)` |
| **AI & Turing** | `summarizeLink(link)`, `askAI(prompt)` |
| **Presence & Stealth** | `setOnline(isOnline, timeout)`, `sendTyping(peer, durationMs, type)`, `stopTyping(peer, type)`, `setHumanize(value)`, `enableHumanize(config)`, `disableHumanize()`, `isHumanized`, `sleep(ms)` |
| **Wire & RPC Invoker** | `invoke(service, method, payload, meta)` |

"""

if "10.4 Complete List of 106 High-Level BaleClient Methods" not in text:
    target = "---" + "\n\n" + "## 11. Go (Golang) Integration & IPC Bridge Runbook"
    text = text.replace(target, client_methods_summary + target)

with open(".agents/skills/balex/SKILL.md", "w", encoding="utf-8") as f:
    f.write(text)

with open("skill/SKILL.md", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated .agents/skills/balex/SKILL.md and skill/SKILL.md successfully.")
