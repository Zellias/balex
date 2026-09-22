# Bale Protobuf RPC Services & Methods Catalog

> Automatically extracted from Bale Web Client bundles.
> **Total Services**: 53  
> **Total Methods**: 636  
> **Protocol Version**: 1  
> **API Version**: 171248  

## Table of Contents

- [ai.bale.pushak.Push (`push` - 6 methods)](#ai-bale-pushak-push)
- [ai.bale.server.Files (`files` - 7 methods)](#ai-bale-server-files)
- [bale.abacus.v1.Abacus (`abacus` - 9 methods)](#bale-abacus-v1-abacus)
- [bale.advertisement.v1.Advertisement (`advertisement` - 126 methods)](#bale-advertisement-v1-advertisement)
- [bale.anonymous_contact.v1.AnonymousContact (`anonymousContact` - 1 methods)](#bale-anonymous-contact-v1-anonymouscontact)
- [bale.appzar.v1.Appzar (`appzar` - 3 methods)](#bale-appzar-v1-appzar)
- [bale.auth.v1.Auth (`auth` - 27 methods)](#bale-auth-v1-auth)
- [bale.balebank.v1.GoldGiftPacket (`goldGiftPacket` - 3 methods)](#bale-balebank-v1-goldgiftpacket)
- [bale.balebank.v1.GoldWallet (`goldWallet` - 1 methods)](#bale-balebank-v1-goldwallet)
- [bale.bank.v1.Bank (`bank` - 17 methods)](#bale-bank-v1-bank)
- [bale.charnet.v1.CharnetService (`charnet` - 11 methods)](#bale-charnet-v1-charnetservice)
- [bale.crowdfunding.v1.CrowdFunding (`crowdFunding` - 2 methods)](#bale-crowdfunding-v1-crowdfunding)
- [bale.falake.v1.Falake (`falake` - 1 methods)](#bale-falake-v1-falake)
- [bale.fanoos.v1.fanoos (`fanoos` - 2 methods)](#bale-fanoos-v1-fanoos)
- [bale.feedback.v1.FeedBack (`feedBack` - 1 methods)](#bale-feedback-v1-feedback)
- [bale.garson.v1.Garson (`garson` - 11 methods)](#bale-garson-v1-garson)
- [bale.ghasedak.v1.GhasedakService (`ghasedak` - 2 methods)](#bale-ghasedak-v1-ghasedakservice)
- [bale.giftpacket.v1.GiftPacket (`giftPacket` - 3 methods)](#bale-giftpacket-v1-giftpacket)
- [bale.groups.v1.Groups (`groups` - 50 methods)](#bale-groups-v1-groups)
- [bale.ketf.v1.Ketf (`ketf` - 14 methods)](#bale-ketf-v1-ketf)
- [bale.kifpool.v1.Kifpool (`kifpool` - 30 methods)](#bale-kifpool-v1-kifpool)
- [bale.llm_auth.v1.LLMAuthService (`lLMAuth` - 1 methods)](#bale-llm-auth-v1-llmauthservice)
- [bale.magazine.v1.Magazine (`magazine` - 9 methods)](#bale-magazine-v1-magazine)
- [bale.market.v1.Market (`market` - 26 methods)](#bale-market-v1-market)
- [bale.maviz.v1.MavizStream (`mavizStream` - 4 methods)](#bale-maviz-v1-mavizstream)
- [bale.meet.v1.Meet (`meet` - 30 methods)](#bale-meet-v1-meet)
- [bale.message_stream.v1.MessageStream (`messageStream` - 2 methods)](#bale-message-stream-v1-messagestream)
- [bale.messaging.v2.Messaging (`messaging` - 43 methods)](#bale-messaging-v2-messaging)
- [bale.microbanki.v1.MicroBanki (`microBanki` - 3 methods)](#bale-microbanki-v1-microbanki)
- [bale.my_bank.v1.MyBank (`myBank` - 1 methods)](#bale-my-bank-v1-mybank)
- [bale.negah.v1.Negah (`negah` - 1 methods)](#bale-negah-v1-negah)
- [bale.organizations.v1.Organizations (`organizations` - 2 methods)](#bale-organizations-v1-organizations)
- [bale.pfm.v1.Pfm (`pfm` - 15 methods)](#bale-pfm-v1-pfm)
- [bale.pishvaz.v1.Pishvaz (`pishvaz` - 3 methods)](#bale-pishvaz-v1-pishvaz)
- [bale.poll.v1.Poll (`poll` - 5 methods)](#bale-poll-v1-poll)
- [bale.premium.v1.Premium (`premium` - 7 methods)](#bale-premium-v1-premium)
- [bale.presence.v1.Presence (`presence` - 11 methods)](#bale-presence-v1-presence)
- [bale.ramz.v1.Ramz (`ramz` - 7 methods)](#bale-ramz-v1-ramz)
- [bale.recommender.v1.Recommender (`recommender` - 4 methods)](#bale-recommender-v1-recommender)
- [bale.report.v1.Report (`report` - 2 methods)](#bale-report-v1-report)
- [bale.sap.v1.Sap (`sap` - 16 methods)](#bale-sap-v1-sap)
- [bale.schedule.v1.Scheduler (`scheduler` - 6 methods)](#bale-schedule-v1-scheduler)
- [bale.search.v1.Search (`search` - 12 methods)](#bale-search-v1-search)
- [bale.shared_media.v1.SharedMediaService (`sharedMedia` - 2 methods)](#bale-shared-media-v1-sharedmediaservice)
- [bale.story.v1.Story (`story` - 24 methods)](#bale-story-v1-story)
- [bale.timche.v1.Timche (`timche` - 5 methods)](#bale-timche-v1-timche)
- [bale.tldr.v1.TLDR (`tLDR` - 2 methods)](#bale-tldr-v1-tldr)
- [bale.top_peer.v1.TopPeer (`topPeer` - 2 methods)](#bale-top-peer-v1-toppeer)
- [bale.turing.v1.AI (`aI` - 2 methods)](#bale-turing-v1-ai)
- [bale.users.v1.Users (`users` - 36 methods)](#bale-users-v1-users)
- [bale.v1.Configs (`configs` - 3 methods)](#bale-v1-configs)
- [bale.v1.Images (`images` - 10 methods)](#bale-v1-images)
- [bale.wallet.v1.Wallet (`wallet` - 13 methods)](#bale-wallet-v1-wallet)

---

### ai.bale.pushak.Push
Client Namespace: `client.push.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `RegisterGooglePush` | `projectId`, `token` | *(none/response)* | Unary |
| 2 | `RegisterPush` | `pushVersion`, `register` | `encryptionKey`, `serviceName` | Unary |
| 3 | `SetConfig` | `config`, `serviceName` | *(none/response)* | Unary |
| 4 | `UnregisterAllPushCredentials` | `register`, `pushVersion` | *(none/response)* | Unary |
| 5 | `UnregisterGooglePush` | `token` | *(none/response)* | Unary |
| 6 | `UnregisterPush` | `unregister`, `serviceName` | *(none/response)* | Unary |

### ai.bale.server.Files
Client Namespace: `client.files.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `FileUploadCancel` | `smallImage`, `largeImage`, `fullImage`, `id`, `date` | `canceled` | Unary |
| 2 | `GetNasimFilePublicUrl` | `peer`, `file`, `filename` | `fileUrl` | Unary |
| 3 | `GetNasimFileUploadResume` | `width`, `height`, `fileSize`, `fileLocation` | `canResume`, `fileUrl` | Unary |
| 4 | `GetNasimFileUploadUrl` | `expectedSize`, `crc`, `uid`, `name`, `mimeType`, `chunkSize`, `compressedSize`, `fileKind`, `exPeer`, `sendType` | `fileId`, `url`, `duplicate`, `chunkSize`, `blockSize` | Unary |
| 5 | `GetNasimFileUrl` | `fileId`, `accessHash`, `fileStorageVersion` | `width`, `height`, `fileSize`, `fileLocation` | Unary |
| 6 | `GetNasimFileUrls` | `ciphertext`, `files[]` | `fileUrls[]` | Unary |
| 7 | `GetUploadLimits` | `uploadLimitBytes`, `temporaryMaxBytes`, `permanentMaxBytes`, `boughtCapacityRemainingBytes`, `boughtCapacityUnlimited`, `serviceName` | `uploadLimitBytes`, `temporaryMaxBytes`, `permanentMaxBytes`, `boughtCapacityRemainingBytes`, `boughtCapacityUnlimited`, `serviceName` | Unary |

### bale.abacus.v1.Abacus
Client Namespace: `client.abacus.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `EnableShowReactionFlag` | `userId`, `isEnable` | *(none/response)* | Unary |
| 2 | `GetMessageReactionsList` | `peer`, `rid`, `date`, `code`, `page`, `limit` | `userReactions[]` | Unary |
| 3 | `GetMessagesReactions` | `peer`, `mids[]`, `originPeer`, `originMids[]` | `containers[]` | Unary |
| 4 | `GetMessagesViews` | `peer`, `mids[]`, `increment`, `correctMids[]` | `containers[]` | Unary |
| 5 | `GetShowReactionFlag` | `userId`, `isEnable` | `userId`, `isEnable` | Unary |
| 6 | `LoadReactions` | `peer`, `mids[]`, `ignoreCountViews` | `containers[]` | Unary |
| 7 | `MessageReactionsRead` | `peer`, `messageId` | *(none/response)* | Unary |
| 8 | `MessageRemoveReaction` | `peer`, `rid`, `code`, `date` | `peerUserId`, `msgRid`, `description` | Unary |
| 9 | `MessageSetReaction` | `peer`, `rid`, `code`, `date` | `peerUserId`, `msgRid`, `description` | Unary |

### bale.advertisement.v1.Advertisement
Client Namespace: `client.advertisement.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `AddCustomIncome` | `type`, `amount`, `description`, `customerUserId`, `customerName`, `paymentMethod`, `paymentDate`, `depositTrackingId`, `adId` | `id` | Unary |
| 2 | `BuildAudienceQuery` | `definition` | `query`, `estimatedSize` | Unary |
| 3 | `CalculatePrice` | `spot`, `viewCount`, `clickCount`, `link`, `isInstant`, `tag1`, `tag2`, `targeting` | `finalPrice`, `clickUnitPrice` | Unary |
| 4 | `ChangeAccountState` | `comment`, `createdAt`, `writerPeerId` | `id`, `title`, `isActive` | Unary |
| 5 | `ChangeAdState` | `adId`, `state`, `reason` | *(none/response)* | Unary |
| 6 | `ChangeBonusCodeState` | `id`, `title`, `picUrl`, `description`, `link`, `linkTitle`, `ownerId`, `viewCount`, `clickCount`, `createdAt`, `desiredStartTime`, `startTime`, `finishTime`, `state`, `spot`, `platform`, `topic`, `rejectionReason`, `autoFinish`, `setView`, `setClick`, `discountCode`, `totalPrice`, `payedPrice`, `phoneNo`, `sponsoredMessageOption`, `tag1`, `tag2`, `ownerType`, `isInstant`, `targetType`, `targetIds[]`, `isOnlyTargeted`, `targeting`, `placementIndex` | *(none/response)* | Unary |
| 7 | `ChangeBusinessLicenseState` | `ownerId`, `peerKey`, `licenseType`, `status`, `rejectionReason`, `expiresAt` | *(none/response)* | Unary |
| 8 | `ChangeCampaignContentState` | `campaignId`, `state`, `reason` | *(none/response)* | Unary |
| 9 | `ChangeCampaignState` | `campaignId`, `state`, `rejectionReason` | *(none/response)* | Unary |
| 10 | `ChangeChannelIncomeOwner` | `peerId` | `peerId` | Unary |
| 11 | `ChangeChannelShowAdPermissions` | `peerId`, `showAds`, `timeRestrict`, `categoryFilter` | *(none/response)* | Unary |
| 12 | `ChangeStatusDialogAdOrder` | `id`, `targetStatus`, `date`, `rejectionReason` | *(none/response)* | Unary |
| 13 | `ChangeUserDataState` | `ownerId`, `state`, `reason` | *(none/response)* | Unary |
| 14 | `ChannelIncomeGetCredit` | `peerId` | *(none/response)* | Unary |
| 15 | `ChannelIncomeKifTransfer` | `peerId`, `payType` | *(none/response)* | Unary |
| 16 | `ChannelIncomePayment` | `peerId`, `payType` | `factorHtml` | Unary |
| 17 | `ConvertIncome` | `convertToPoints`, `convertToGiftPacket`, `convertToGiftPacketForChannelOwner` | *(none/response)* | Unary |
| 18 | `CreateAd` | `adData`, `price`, `depositTrackingId`, `paymentMethod`, `paymentDate` | `adId` | Unary |
| 19 | `CreateAndStartChannelAd` | `title`, `description`, `link`, `platform`, `viewCount`, `clickCount`, `startTime` | `id` | Unary |
| 20 | `CreateAutomatedAudience` | `definition`, `single`, `randomGroups` | `result[]` | Unary |
| 21 | `CreateBaleDialogCustomAd` | `pic`, `title`, `description`, `link`, `platform` | `id` | Unary |
| 22 | `CreateBonusCode` | `peerUniqueId` | `adTitle`, `description`, `linkTitle`, `link`, `id`, `tag1`, `tag2`, `peer` | Unary |
| 23 | `CreateChannelIncomeFactor` | `peerId`, `year`, `month` | `factorHtml` | Unary |
| 24 | `CreateCustomCampaignPackage` | `userId`, `audienceId`, `baseCredit`, `creditExpireDays`, `campaignDailyCapacity`, `allowedConcurrentCampaign`, `campaignViewCoef`, `campaignClickCoef` | *(none/response)* | Unary |
| 25 | `DeleteCustomIncome` | `id` | *(none/response)* | Unary |
| 26 | `EditAccount` | `account`, `isRestoreExpiredCredit`, `depositTrackingId` | *(none/response)* | Unary |
| 27 | `EditAd` | `ad` | *(none/response)* | Unary |
| 28 | `EditCampaignAd` | `ad` | *(none/response)* | Unary |
| 29 | `EditCampaignContent` | `campaign` | *(none/response)* | Unary |
| 30 | `EstimateChannelSponsoredIncome` | `peerId` | `estimatedViews`, `estimatedIncome` | Unary |
| 31 | `FinishAd` | `id` | `title`, `description`, `link`, `platform`, `viewCount`, `clickCount`, `startTime` | Unary |
| 32 | `FinishAdV2` | `adId` | *(none/response)* | Unary |
| 33 | `FinishChannelAd` | `id` | `order` | Unary |
| 34 | `GetAccountData` | `gender` | `channelIds[]` | Unary |
| 35 | `GetAccounts` | `minChannelMembers`, `maxChannelMembers`, `channelIds[]` | `minChannelMembers`, `maxChannelMembers`, `locations[]` | Unary |
| 36 | `GetAccountsByState` | `minChannelMembers`, `maxChannelMembers` | `peer`, `peerIdentity`, `title`, `description`, `callToActionTxt`, `isStarted` | Unary |
| 37 | `GetActiveAds` | `ads[]` | `ads[]` | Unary |
| 38 | `GetActiveChannelAds` | `ads[]` | `ads[]` | Unary |
| 39 | `GetAdData` | `adId` | `adData` | Unary |
| 40 | `GetAdDetail` | `title`, `from`, `to` | `ads[]` | Unary |
| 41 | `GetAdProvider` | `peerId`, `adType`, `adSpot`, `adCount`, `includeNonZeroPlacements` | `content[]` | Unary |
| 42 | `GetAdReport` | `adId` | `views`, `clicks`, `title`, `link` | Unary |
| 43 | `GetAdReportV2` | `adId` | `data` | Unary |
| 44 | `GetAdsBySpotAndPlatform` | `audience`, `channels`, `channelMembers`, `gender`, `locations` | `audienceIds[]`, `fileId` | Unary |
| 45 | `GetAdsByStateAndSpot` | `pagingData`, `state`, `spot` | `ads[]` | Unary |
| 46 | `GetAllChannelIncomesFactor` | `year`, `month` | `factors[]` | Unary |
| 47 | `GetAllPaymentHistory` | `startDate`, `endDate` | `records[]` | Unary |
| 48 | `GetAvailableCampaignStartDate` | `date` | `date` | Unary |
| 49 | `GetAwaitingToShowAds` | `ads[]` | `ads[]` | Unary |
| 50 | `GetAwaitingToShowChannelAds` | `ads[]` | `ads[]` | Unary |
| 51 | `GetBaleCustomAd` | `adId` | `ad` | Unary |
| 52 | `GetBonusCodeData` | `id`, `fileLocation`, `link`, `expireTime`, `bannerWidth`, `bannerHeight` | `id`, `title`, `picUrl`, `description`, `link`, `linkTitle`, `ownerId`, `viewCount`, `clickCount`, `createdAt`, `desiredStartTime`, `startTime`, `finishTime`, `state`, `spot`, `platform`, `topic`, `rejectionReason`, `autoFinish`, `setView`, `setClick`, `discountCode`, `totalPrice`, `payedPrice`, `phoneNo`, `sponsoredMessageOption`, `tag1`, `tag2`, `ownerType`, `isInstant`, `targetType`, `targetIds[]`, `isOnlyTargeted`, `targeting`, `placementIndex` | Unary |
| 53 | `GetBonusCodes` | `pic`, `imageLocation`, `title`, `description`, `link`, `id`, `accessHash`, `tag1`, `tag2`, `linkTitle`, `peer`, `ownerType`, `placementIndex` | `id`, `caption`, `imageLocation`, `tag1`, `tag2`, `link`, `linkTitle`, `peer` | Unary |
| 54 | `GetBusinessAds` | `pagingData`, `state` | `ads[]` | Unary |
| 55 | `GetBusinessLicensesByPeer` | `link`, `ownerId` | `records[]` | Unary |
| 56 | `GetCampaignAds` | `pagingData`, `state` | `data[]` | Unary |
| 57 | `GetCampaignContentById` | `campaignId` | `campaign` | Unary |
| 58 | `GetCampaignContents` | `pagingData`, `state` | `campaigns[]` | Unary |
| 59 | `GetCampaignData` | `campaignId` | `data` | Unary |
| 60 | `GetChannelAds` | `groupId` | `ads[]` | Unary |
| 61 | `GetChannelEarnMoneyInfo` | `groupId` | `currentMonthIncome`, `notPaidIncome`, `adCount`, `adCountUpdateDate` | Unary |
| 62 | `GetChannelEarnMoneyStatus` | `groupId` | `status` | Unary |
| 63 | `GetChannelGraphReport` | `peerId`, `startTime`, `endTime` | `viewGraph[]` | Unary |
| 64 | `GetChannelIncomeReport` | `peerId` | `incomeReports[]` | Unary |
| 65 | `GetChannelOwnerBankInformation` | `channelId` | `userId`, `nationalCode`, `birthDate`, `address`, `postalCode`, `melliAccountNumber`, `firstName`, `lastName`, `phone`, `state`, `reason`, `channelNick`, `ownerId` | Unary |
| 66 | `GetChannelShowAdCategoryFilter` | `peerId` | `categories[]` | Unary |
| 67 | `GetChannelShowAdPermissions` | `peerId` | `showSponsoredAd`, `verifiedUserId` | Unary |
| 68 | `GetChannelShowAdTimeRestrict` | `peerId` | `data` | Unary |
| 69 | `GetChannelSponsoredIncomeReport` | `peerId`, `startTime`, `endTime` | `totalViews`, `totalIncome`, `totalAdCount`, `averageCtr`, `dailyReports[]`, `categoryReports[]` | Unary |
| 70 | `GetChannelsViewReport` | `startTime`, `endTime` | `channelsView[]` | Unary |
| 71 | `GetChannelUndepositedIncomes` | `year`, `month` | `items[]` | Unary |
| 72 | `GetConfig` | `config` | `config` | Unary |
| 73 | `GetCreditableAccounts` | `peer`, `peerIdentity`, `contactMemberCount` | `campaignId`, `id`, `title`, `picUrl`, `description`, `link`, `linkTitle`, `type`, `viewCount`, `clickCount`, `spot`, `platform`, `topic`, `cost`, `tag1`, `tag2`, `targeting`, `isOnlyTargeted` | Unary |
| 74 | `GetCreditHistory` | `ownerId`, `startTime`, `endTime` | `creditHistories[]` | Unary |
| 75 | `GetCRMIssues` | `userIssue`, `allIssue` | `data[]` | Unary |
| 76 | `GetCustomIncomes` | `startTime`, `endTime` | `records[]` | Unary |
| 77 | `GetDialogAdOrderDetails` | `dialogAdOrder[]` | `dialogAdOrder[]` | Unary |
| 78 | `GetDialogAdOrderPaymentToken` | `id`, `rialAmount`, `coinAmount` | `token` | Unary |
| 79 | `GetFactorEligibleAds` | `tBegin`, `tEnd` | `ads[]` | Unary |
| 80 | `GetInvoiceContent` | `invoiceRequestId` | `id`, `description[]`, `responseCode`, `data` | Unary |
| 81 | `GetLegalOrgChannels` | `channels[]` | `channels[]` | Unary |
| 82 | `GetMyContactPopularChannels` | `channels[]` | `channels[]` | Unary |
| 83 | `GetOnBoardingChannels` | `found`, `status`, `invoiceRequestId`, `taxId`, `errorDescription` | `id`, `adId`, `token`, `rialAmount`, `coinAmount`, `discountFixedAmount`, `discountPercent`, `discountCode`, `state`, `createdAt`, `approvalCode`, `ownerId` | Unary |
| 84 | `GetOnboardingPeers` | `id`, `userId`, `amount`, `createdAt` | `peers[]` | Unary |
| 85 | `GetOnboardingPosts` | `categoryId` | `posts[]` | Unary |
| 86 | `GetOnboardingSpotData` | `onboardingSpot`, `suggestedPeerType` | `contactChannels`, `suggestedChannels` | Unary |
| 87 | `GetOwnerIdByPhone` | `phoneNumber` | `userId` | Unary |
| 88 | `GetPaidAdsByTime` | `placementId` | `tag` | Unary |
| 89 | `GetPaymentData` | `adId` | `data` | Unary |
| 90 | `GetPendingBusinessLicenses` | `pagingData` | `records[]` | Unary |
| 91 | `GetPeriodCapacityData` | `beginDate`, `endDate` | `data[]` | Unary |
| 92 | `GetUserAds` | `pagingData`, `userId` | `ads[]` | Unary |
| 93 | `GetUserAuthData` | `channelId` | `userId`, `nationalCode`, `birthDate`, `address`, `postalCode`, `melliAccountNumber`, `firstName`, `lastName`, `phone`, `state`, `reason`, `channelNick` | Unary |
| 94 | `GetUserCampaigns` | `pagingData`, `userId` | `data[]` | Unary |
| 95 | `GetUserOnboardingScenario` | `config` | `scenario` | Unary |
| 96 | `GetUsersAuthDataByState` | `state` | `usersData[]` | Unary |
| 97 | `GetUserStatus` | `userId` | `status` | Unary |
| 98 | `GetVODContents` | `contents[]` | `contents[]` | Unary |
| 99 | `MergeCustomIncomeRecords` | `customIncomeIds[]` | `invoiceRequestId` | Unary |
| 100 | `MergeIncreaseCreditRecords` | `increaseCreditIds[]` | `customIncomeIds[]` | Unary |
| 101 | `ModifyCapacity` | `id`, `type`, `amount`, `description`, `createdAt`, `createdBy`, `customerUserId`, `customerState`, `customerName`, `paymentMethod`, `paymentDate`, `adId`, `invoiceRequestId` | `eventType`, `booleanOp`, `lastXDays`, `channelNicks[]`, `persianTokens[]`, `botNicks[]`, `genderType`, `locations[]` | Unary |
| 102 | `RegisterForEarnMoney` | `info` | *(none/response)* | Unary |
| 103 | `RetryFailedAutoSentInvoice` | `failedInvoiceRequestId` | `channelId`, `nationalCode`, `birthDate`, `address`, `postalCode`, `melliAccountNumber` | Unary |
| 104 | `SendAdminMessage` | `receiver`, `messageText`, `fileId`, `fileName` | *(none/response)* | Unary |
| 105 | `SendFactorMessage` | `channelId`, `messageText`, `fileId`, `fileName`, `year`, `month` | *(none/response)* | Unary |
| 106 | `SendInvoiceForPaymentHistoryRecord` | `recordId`, `depositTrackingId`, `paymentHistoryType` | `invoiceRequestId` | Unary |
| 107 | `SendLegalOrgChannelIncome` | `channelId` | `results[]` | Unary |
| 108 | `SetAdTarget` | `adId`, `targeting` | *(none/response)* | Unary |
| 109 | `SetCapacityMaxViews` | `data[]`, `spot` | *(none/response)* | Unary |
| 110 | `SetChannelInvoiceInfo` | `peerId`, `nationalCode`, `address`, `postalCode`, `name`, `tag1`, `tag2`, `birthDate` | *(none/response)* | Unary |
| 111 | `SetChannelOwnerBankInformation` | `channelId`, `nationalCode`, `birthDate`, `address`, `postalCode`, `melliAccountNumber` | *(none/response)* | Unary |
| 112 | `SetOnBoardingChannels` | `id`, `token`, `userId`, `packageType`, `rialAmount`, `createdAt` | *(none/response)* | Unary |
| 113 | `SetUserAuthData` | `channelId`, `nationalCode`, `birthDate`, `address`, `postalCode`, `melliAccountNumber` | *(none/response)* | Unary |
| 114 | `StartAd` | `adId`, `startTime`, `platform`, `autoFinish` | *(none/response)* | Unary |
| 115 | `StartBaleCustomAd` | `id`, `platform`, `pic`, `title`, `description`, `link`, `startTime`, `viewCount`, `clickCount` | `ad` | Unary |
| 116 | `StartChannelAdFromOrder` | `id`, `title`, `description`, `link`, `startTime`, `viewCount`, `clickCount`, `platform` | `id` | Unary |
| 117 | `StartFromOrder` | `id`, `platform`, `pic`, `title`, `description`, `link`, `startTime`, `viewCount`, `clickCount` | `id` | Unary |
| 118 | `StopAllBaleCustomAds` | `adId`, `pic` | `adId`, `pic` | Unary |
| 119 | `SubmitChannelAdOrder` | `order` | *(none/response)* | Unary |
| 120 | `SubmitDialogAdOrder` | `dialogAdOrder` | *(none/response)* | Unary |
| 121 | `SubmitPhotoForBaleCustomAd` | `adId`, `pic` | `ad` | Unary |
| 122 | `UpdateBusinessAd` | `updatedAd` | *(none/response)* | Unary |
| 123 | `UpdateClick` | `id`, `count`, `peer` | `dialogAdOrder` | Unary |
| 124 | `UpdateCRMIssue` | `addIssue`, `addComment`, `resolveIssue`, `ignoreUser` | *(none/response)* | Unary |
| 125 | `UpdateGroupStatus` | `groupId` | *(none/response)* | Unary |
| 126 | `UpdateView` | `id`, `count`, `peerId` | `isSuccessful` | Unary |

### bale.anonymous_contact.v1.AnonymousContact
Client Namespace: `client.anonymousContact.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetUserAnonymousContactPage` | `userId`, `serviceMessageRid`, `serviceMessageDate` | `countryNumber`, `registerAccountTime`, `lastTimeNameChanged`, `lastTimeAvatarChanged`, `commonGroups[]`, `extraInfo[]` | Unary |

### bale.appzar.v1.Appzar
Client Namespace: `client.appzar.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetMenuButton` | `botUserId` | `menuButton` | Unary |
| 2 | `GetMiniAppUrl` | `botUserId`, `screenMode`, `themeParams`, `main`, `menuButton`, `keyboardButton`, `directLink` | `url`, `screenMode`, `queryId` | Unary |
| 3 | `InvokeCustomMethod` | `botUserId`, `method`, `params` | `data` | Unary |

### bale.auth.v1.Auth
Client Namespace: `client.auth.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `ChangeLanguage` | `language` | *(none/response)* | Unary |
| 2 | `ChangePhone` | `phoneNumber`, `code`, `transactionHash` | *(none/response)* | Unary |
| 3 | `DeleteAccount` | `code`, `transactionHash` | *(none/response)* | Unary |
| 4 | `DisableTwoFactorAuthentication` | `language` | *(none/response)* | Unary |
| 5 | `EnableTwoFactorAuthentication` | `email`, `password` | *(none/response)* | Unary |
| 6 | `GetAuthSessions` | `userAuths[]` | `userAuths[]` | Unary |
| 7 | `GetBajeBamTicket` | `expDateTime`, `mobileNo` | `ticket` | Unary |
| 8 | `GetBaleTicket` | `expDateTime`, `mobileNo`, `clientId` | `redirectUrl` | Unary |
| 9 | `GetJWTToken` | `jwt` | `jwt` | Unary |
| 10 | `GetTicket` | `jsonRequest`, `jsonSign` | `redirectUrl` | Unary |
| 11 | `GetUserIdToken` | `ticket` | `token`, `userId`, `source`, `service` | Unary |
| 12 | `IsTwoFactorAuthenticationEnabled` | `isEnabled` | `isEnabled` | Unary |
| 13 | `LogOut` | `futureAuthToken` | `futureAuthToken` | Unary |
| 14 | `RecoverPassword` | `transactionHash` | `emailPattern` | Unary |
| 15 | `SendChangePhoneVerificationCode` | `transactionHash`, `activationType` | `transactionHash`, `activationType` | Unary |
| 16 | `SendDeleteAccountVerificationCode` | `transactionHash`, `activationType` | `transactionHash`, `activationType` | Unary |
| 17 | `SetNewPassword` | `newPassword`, `transactionHash` | *(none/response)* | Unary |
| 18 | `SignOut` | `futureAuthToken` | *(none/response)* | Unary |
| 19 | `SignUp` | `key`, `value` | `fileId`, `accessHash`, `fileSize` | Unary |
| 20 | `StartPhoneAuth` | `host`, `knownIp`, `isTrusted`, `tlsPublicKeyHash[]` | `transactionHash`, `isRegistered`, `activationType`, `isImeiOk`, `sentCodeType`, `nextSendCodeType`, `codeExpirationDate`, `nextSendCodeWaitTime`, `codeTimeout`, `exInfoAddress[]`, `availableSendCodeTypes[]` | Unary |
| 21 | `TerminateAllSessions` | `futureAuthToken` | *(none/response)* | Unary |
| 22 | `TerminateSession` | `id` | *(none/response)* | Unary |
| 23 | `ValidateCode` | `parameters[]` | `user`, `config`, `jwt` | Unary |
| 24 | `ValidatePassword` | `parameters[]` | `user`, `config`, `jwt` | Unary |
| 25 | `VerifyEmail` | `email`, `code` | *(none/response)* | Unary |
| 26 | `VerifyPassword` | `password` | *(none/response)* | Unary |
| 27 | `VerifyPasswordRecovery` | `code`, `transactionHash` | *(none/response)* | Unary |

### bale.balebank.v1.GoldGiftPacket
Client Namespace: `client.goldGiftPacket.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetWinnerIDs` | `giftPacketId` | `winners[]` | Unary |
| 2 | `OpenGoldGiftPacket` | `giftPacketId` | `openedCount`, `selfWinAmount`, `rank`, `giftReceivers[]`, `status`, `verificationDeadline` | Unary |
| 3 | `SendGoldGiftPacket` | `amount`, `count`, `description`, `givingType`, `randomId`, `peer` | `giftPacketId` | Unary |

### bale.balebank.v1.GoldWallet
Client Namespace: `client.goldWallet.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetBalance` | `balance` | `balance` | Unary |

### bale.bank.v1.Bank
Client Namespace: `client.bank.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `BuyFastCharge` | `amount`, `phoneNumber`, `operator`, `chargeType` | `transactionDate`, `refrenceNumber`, `pin`, `serial` | Unary |
| 2 | `GetCardRemain` | `cardNumber`, `cvv2`, `expireDate`, `pin2` | `currentBalanceAmount`, `availableBalanceAmount` | Unary |
| 3 | `GetCardTransferToken` | `gifs[]`, `offset` | `collections[]`, `seq`, `state` | Unary |
| 4 | `GetOrganizationPaymentToken` | `organizationId`, `invoiceId`, `amount` | `token`, `billHolderName`, `amount` | Unary |
| 5 | `GetOTPToken` | `cardNumberStartingSix` | `requestEndPoint`, `token` | Unary |
| 6 | `GetOTPTokenV2` | `messagePeer`, `msgRid`, `msgDate`, `peerUserId`, `cardNumberStartingSix`, `requestEndPoint`, `token` | `requestEndPoint`, `token` | Unary |
| 7 | `GetPaymentToken` | `msg`, `description`, `amount` | `token`, `endpoint`, `terminalId`, `cardAcqId`, `orderId` | Unary |
| 8 | `GetPayMoneyRequestToken` | `offset` | `ownStickers[]`, `offset` | Unary |
| 9 | `GetPayvandCard` | `id` | `card` | Unary |
| 10 | `GetPayvandCardList` | `collection` | `id` | Unary |
| 11 | `GetPSProxyPaymentToken` | `paymentAmount`, `msg`, `description` | `endpoint`, `token` | Unary |
| 12 | `GetPSProxyToken` | `endpoint`, `token` | `endpoint`, `token` | Unary |
| 13 | `GetRecentCharges` | `recentCharges[]` | `recentCharges[]` | Unary |
| 14 | `GetRemainToken` | `id`, `accessHash` | `id`, `accessHash` | Unary |
| 15 | `GetSadadPSPPaymentToken` | `msg`, `paymentAmount`, `description` | `endpoint`, `token`, `terminalId`, `merchantCode` | Unary |
| 16 | `GetTokenInvoice` | `service` | `endpoint`, `token` | Unary |
| 17 | `GrantBankiAccess` | `bot`, `serviceKey` | *(none/response)* | Unary |

### bale.charnet.v1.CharnetService
Client Namespace: `client.charnet.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `BuyCharge` | `walletToken`, `phoneNumber`, `amount`, `operatorType`, `remaining`, `chargeType`, `targetUserId`, `voucherId` | `paymentToken`, `receipt` | Unary |
| 2 | `BuyInternetBundle` | `walletToken`, `phoneNumber`, `bundleId`, `operatorType`, `remaining`, `targetUserId` | `paymentToken`, `receipt` | Unary |
| 3 | `DeleteRecentChargeOrder` | `accessHash` | *(none/response)* | Unary |
| 4 | `DeleteRecentInternetBundleOrder` | `orderId` | *(none/response)* | Unary |
| 5 | `GetAvailableCharges` | `operator`, `chargeType` | `amounts[]`, `canBeOptional` | Unary |
| 6 | `GetInternetBundleList` | `operatorType`, `simCardType`, `phoneNumber` | `bundleLists[]` | Unary |
| 7 | `GetInternetBundlePaymentToken` | `operatorType`, `bundleId`, `phoneNumber`, `targetUserId` | `token` | Unary |
| 8 | `GetRecentChargeOrders` | `count`, `types[]` | `orders[]` | Unary |
| 9 | `GetRecentInternetBundleOrders` | `count` | `orders[]` | Unary |
| 10 | `GetTopUpChargePaymentToken` | `providerCode`, `topupType`, `amount`, `targetPhoneNumber`, `targetUserId` | `token` | Unary |
| 11 | `GetVoucherChargePaymentToken` | `providerCode`, `amount`, `targetUserId` | `token` | Unary |

### bale.crowdfunding.v1.CrowdFunding
Client Namespace: `client.crowdFunding.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetParticipants` | `messageId`, `limit`, `offset` | `userPayments[]` | Unary |
| 2 | `GetTotalPaidAmount` | `messageId` | `myWallets[]`, `firstName`, `lastName` | Unary |

### bale.falake.v1.Falake
Client Namespace: `client.falake.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetLinkStatus` | `link` | `linkStatus` | Unary |

### bale.fanoos.v1.fanoos
Client Namespace: `client.fanoos.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `Send` | `eventName`, `date`, `items` | *(none/response)* | Unary |
| 2 | `SendBatch` | `events[]`, `serviceName` | *(none/response)* | Unary |

### bale.feedback.v1.FeedBack
Client Namespace: `client.feedBack.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `SendFeedBack` | `rate`, `title`, `description`, `mtDetails` | *(none/response)* | Unary |

### bale.garson.v1.Garson
Client Namespace: `client.garson.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `EditCustomServices` | `customItems`, `items[]` | `customItems` | Unary |
| 2 | `GetAdvertisementBot` | `bots[]` | `bots[]` | Unary |
| 3 | `GetBotBanners` | `empty`, `url`, `peer`, `menu` | `action`, `url`, `fileIdBanner` | Unary |
| 4 | `GetBotsByCategory` | `categoryId`, `pagination` | `type`, `payload` | Unary |
| 5 | `GetCategorizedBots` | `type`, `payload` | `categorizedBots[]` | Unary |
| 6 | `GetCustomServices` | `customItems` | `customItems` | Unary |
| 7 | `GetRecommendedBots` | `botId`, `pagination` | `bots[]`, `moreBotsUrl` | Unary |
| 8 | `GetServices` | `version` | `version`, `isChanged`, `data`, `banners[]`, `services`, `sections[]` | Unary |
| 9 | `GetTrendBots` | `botUserId`, `description`, `items[]` | `bots[]` | Unary |
| 10 | `GetUserRepeatedBots` | `bots[]` | `bots[]` | Unary |
| 11 | `SearchServices` | `query`, `language`, `source` | `sections[]` | Unary |

### bale.ghasedak.v1.GhasedakService
Client Namespace: `client.ghasedak.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetDiff` | `states[]`, `optimizations[]` | `updates[]`, `usersRefs[]`, `groupsRefs[]` | Unary |
| 2 | `GetRoutesStates` | `groupPeers[]`, `optimizations[]`, `seqs[]` | `seqs[]` | Unary |

### bale.giftpacket.v1.GiftPacket
Client Namespace: `client.giftPacket.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetGiftPacketPaymentToken` | `token`, `amount`, `peer`, `message` | `paymentToken` | Unary |
| 2 | `OpenGiftPacket` | `msgIdentifier`, `receiverWalletId`, `pageNo`, `orderType` | `giftReceivers[]`, `status`, `openedCount`, `selfWinAmount`, `rank`, `userOutPeers[]` | Unary |
| 3 | `SendGiftPacketWithWallet` | `peer`, `randomId`, `message`, `sourceWalletId` | *(none/response)* | Unary |

### bale.groups.v1.Groups
Client Namespace: `client.groups.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `AddDiscussionGroupAdmin` | `channel`, `discussionGroup` | *(none/response)* | Unary |
| 2 | `CreateGroup` | `rid`, `title`, `users[]`, `groupType`, `optimizations[]`, `nick`, `restriction` | `seq`, `state`, `group`, `users[]`, `userPeers[]`, `notAddedUserPeers[]`, `inviteLink` | Unary |
| 3 | `EditChannelNick` | `groupPeer`, `nick`, `randomId` | *(none/response)* | Unary |
| 4 | `EditGroupAbout` | `groupPeer`, `rid`, `about`, `optimizations[]` | *(none/response)* | Unary |
| 5 | `EditGroupAvatar` | `groupPeer`, `rid`, `fileLocation`, `optimizations[]` | `avatar`, `seq`, `state`, `date` | Unary |
| 6 | `EditGroupDefaultCardNumber` | `groupPeer`, `cardNumber` | *(none/response)* | Unary |
| 7 | `EditGroupTitle` | `groupPeer`, `rid`, `title`, `optimizations[]` | *(none/response)* | Unary |
| 8 | `FetchGroupAdmins` | `groupOutPeer` | `users[]`, `admins[]` | Unary |
| 9 | `GetBannedUsers` | `group` | `bannedUsers[]` | Unary |
| 10 | `GetCanSeeMessages` | `groupPeer`, `userId` | `canSeeMessages` | Unary |
| 11 | `GetFullGroup` | `peer` | `fullGroup` | Unary |
| 12 | `GetGroupDefaultCardNumber` | `groupPeerr` | `defaultCardNumber` | Unary |
| 13 | `GetGroupInviteURL` | `groupPeer` | `url` | Unary |
| 14 | `GetGroupMembersCount` | `group` | `membersCount` | Unary |
| 15 | `GetGroupPreview` | `token`, `isOpenedOutsideBale` | `group`, `action` | Unary |
| 16 | `GetGroupRecommendations` | `source` | `groups[]` | Unary |
| 17 | `GetMemberPermissions` | `group`, `user` | `permissions` | Unary |
| 18 | `GetMutualGroups` | `peer` | `groups[]` | Unary |
| 19 | `GetMyGroups` | `mode`, `isOwner`, `filters[]` | `groups[]` | Unary |
| 20 | `GetPins` | `groupPeer`, `page`, `limit` | `pins[]`, `count` | Unary |
| 21 | `InviteUser` | `groupPeer`, `rid`, `user`, `optimizations[]`, `messageCount` | *(none/response)* | Unary |
| 22 | `InviteUsers` | `groupPeer`, `rid`, `users[]` | `notAddedUserPeers[]` | Unary |
| 23 | `JoinGroup` | `token`, `optimizations[]` | `group`, `inviterUserId`, `users[]`, `userPeers[]`, `rid`, `seq`, `groupSeq`, `state`, `date` | Unary |
| 24 | `JoinPublicGroup` | `peer`, `optimizations[]` | `group`, `inviterUserId`, `users[]`, `userPeers[]`, `rid`, `seq`, `groupSeq`, `state`, `date` | Unary |
| 25 | `KickUser` | `groupPeer`, `rid`, `user`, `optimizations[]` | *(none/response)* | Unary |
| 26 | `LeaveGroup` | `groupPeer`, `rid`, `optimizations[]`, `makeOrphan` | *(none/response)* | Unary |
| 27 | `LoadFullGroups` | `groups[]` | `groups[]` | Unary |
| 28 | `LoadGroupAvatars` | `peer` | `avatars` | Unary |
| 29 | `LoadGroups` | `peers[]` | `groups[]` | Unary |
| 30 | `LoadMembers` | `group`, `limit`, `next`, `condition` | `members[]`, `next` | Unary |
| 31 | `MakeUserAdmin` | `groupPeer`, `userPeer`, `adminTitle` | *(none/response)* | Unary |
| 32 | `PinMessage` | `senderUserId`, `groupPeer`, `date`, `msgRid` | *(none/response)* | Unary |
| 33 | `RemoveDiscussionGroup` | `rid`, `channel` | *(none/response)* | Unary |
| 34 | `RemoveGroupAvatar` | `groupPeer`, `rid`, `optimizations[]`, `avaterId` | *(none/response)* | Unary |
| 35 | `RemovePin` | `groupPeer` | *(none/response)* | Unary |
| 36 | `RemoveSinglePin` | `groupPeer`, `msgRid`, `msgDate` | *(none/response)* | Unary |
| 37 | `RemoveUserAdmin` | `groupPeer`, `userPeer` | *(none/response)* | Unary |
| 38 | `RevokeInviteURL` | `groupPeer` | `url` | Unary |
| 39 | `SetAvailableReactions` | `group`, `codes[]` | *(none/response)* | Unary |
| 40 | `SetCanSeeHistory` | `groupPeer`, `canSeeHistory` | *(none/response)* | Unary |
| 41 | `SetCanSeeMessages` | `groupPeer`, `userId`, `canSeeMessages` | *(none/response)* | Unary |
| 42 | `SetDiscussionGroup` | `rid`, `channel` | `discussionGroup`, `group` | Unary |
| 43 | `SetGroupDefaultPermissions` | `group`, `permissions` | *(none/response)* | Unary |
| 44 | `SetMemberCustomTitle` | `groupId`, `memberId`, `title` | `group`, `seconds` | Unary |
| 45 | `SetMemberPermissions` | `group`, `user`, `permissions` | *(none/response)* | Unary |
| 46 | `SetRestriction` | `groupOutPeer`, `restriction`, `nick` | *(none/response)* | Unary |
| 47 | `SetSignMessages` | `groupPeer`, `signMessages` | *(none/response)* | Unary |
| 48 | `SetSlowMode` | `group`, `seconds` | *(none/response)* | Unary |
| 49 | `TransferOwnership` | `groupPeer`, `newOwner` | *(none/response)* | Unary |
| 50 | `UnBanUser` | `groupPeer`, `user`, `optimizations[]` | `groupPeer`, `userId` | Unary |

### bale.ketf.v1.Ketf
Client Namespace: `client.ketf.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetBotGroupPermissions` | `botUserId`, `groupId` | `hasAccessToMessages` | Unary |
| 2 | `GetBotInfo` | `botUserId` | `botInfo` | Unary |
| 3 | `GetBots` | `pagination` | `pageCount`, `bots[]` | Unary |
| 4 | `GetBotWhiteList` | `botUserId` | `list` | Unary |
| 5 | `GetInlineBotResults` | `query`, `peer`, `botUserId`, `offset` | `results[]`, `nextOffset`, `queryId`, `isGallery` | Unary |
| 6 | `GetPaymentDetails` | `purchaseMessageId`, `invoiceIdentifier` | `title`, `totalAmount`, `paymentsHistory[]`, `session`, `disapproved`, `description`, `labeledPrices[]` | Unary |
| 7 | `GetUserContext` | `botUserId` | `botUserId`, `userId`, `nonce`, `sign` | Unary |
| 8 | `GetWebappHash` | `botUserId`, `data` | `hash`, `queryId`, `authDate` | Unary |
| 9 | `InvokeCustomAction` | `id`, `messageId`, `peer`, `openDialogAction`, `done` | `serviceName` | Unary |
| 10 | `MakePayment` | `paymentSessionId`, `paymentOptionId`, `wallet`, `gateway` | `gatewayRedirect`, `paymentReceipt` | Unary |
| 11 | `SendAuthenticatedInlineCallBackData` | `templateMessageId`, `data` | `botUserId`, `queryId`, `data`, `buttonText` | Unary |
| 12 | `SendInlineCallback` | `peer`, `messageId`, `data` | `answer` | Unary |
| 13 | `SendInlineCallBackData` | `historyMessageIdentifier`, `data` | *(none/response)* | Unary |
| 14 | `SendMiniAppData` | `botUserId`, `queryId`, `data`, `buttonText` | `botUserId` | Unary |

### bale.kifpool.v1.Kifpool
Client Namespace: `client.kifpool.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `CashOut` | `requestId`, `token`, `amount`, `account`, `pan`, `iban` | `referenceNo` | Unary |
| 2 | `Charge` | `paymentToken`, `referenceNo` | `historyId`, `amount`, `description` | Unary |
| 3 | `CheckChargePermission` | `paymentToken` | `paymentToken`, `referenceNo` | Unary |
| 4 | `CreateKifpool` | `nationalId` | `token`, `amount`, `callbackType` | Unary |
| 5 | `CryptoCashOut` | `requestId`, `amount`, `account`, `pan`, `pocketType`, `isMerchant` | `referenceNo` | Unary |
| 6 | `CryptoInvoice` | `token`, `pageSize`, `pageNumber` | `records[]` | Unary |
| 7 | `CryptoPurchase` | `amount`, `srcToken`, `dstToken`, `description`, `terminalId`, `bornaTrxId` | `amount`, `dstToken`, `srcToken`, `description`, `useCredit`, `couponId`, `terminalNo`, `stan` | Unary |
| 8 | `CryptoRefund` | `token`, `amount`, `approvalCode`, `trxRefSrc` | *(none/response)* | Unary |
| 9 | `CryptoTransfer` | `amount`, `srcToken`, `dstToken`, `description`, `dstPhoneNo` | `amount`, `date`, `approvalCode`, `srcToken`, `dstToken` | Unary |
| 10 | `FeeInquiry` | `amount`, `transactionType`, `pocketType` | `amount`, `fee`, `responseData` | Unary |
| 11 | `GetChargePaymentToken` | `token`, `amount`, `callbackType` | `paymentToken` | Unary |
| 12 | `GetCredit` | `balance`, `hasCredit` | `balance`, `hasCredit` | Unary |
| 13 | `GetCryptoChargePaymentToken` | `token`, `amount`, `receiverId` | `paymentToken` | Unary |
| 14 | `GetCryptoWallets` | `myCryptoWallets[]` | `myCryptoWallets[]` | Unary |
| 15 | `GetKifpoolOwner` | `walletToken` | `firstName`, `lastName`, `walletStatus`, `approvalCode` | Unary |
| 16 | `GetKifpoolPointBalance` | `token` | `pointBalanceInfo[]` | Unary |
| 17 | `GetKifpoolPointDetails` | `token`, `count`, `page` | `pointDetailsInfo[]` | Unary |
| 18 | `GetKifpoolPointSummery` | `token` | `pointSummeryInfo[]` | Unary |
| 19 | `GetKifpoolTransactionPoint` | `transactionID`, `amount` | `calculatedPoint`, `point`, `unitAmount` | Unary |
| 20 | `GetMyKifpools` | `myWallets[]`, `firstName`, `lastName` | `userId`, `id`, `label`, `transactionType`, `parentTag`, `color` | Unary |
| 21 | `Invoice` | `token`, `pageSize`, `pageNumber` | `records[]` | Unary |
| 22 | `PayForMessage` | `amount`, `chargeAmount`, `message` | `status`, `paymentToken` | Unary |
| 23 | `Purchase` | `amount`, `dstToken`, `srcToken`, `description`, `useCredit`, `couponId`, `terminalNo`, `stan` | `amount`, `dstToken`, `srcToken`, `description`, `chargeAmount`, `useCredit`, `couponId`, `terminalNo`, `stan` | Unary |
| 24 | `PurchaseMessage` | `historyId`, `amount`, `description` | `historyId`, `amount`, `description`, `chargeAmount` | Unary |
| 25 | `PurchaseMessageWithCharge` | `historyId`, `amount`, `description`, `chargeAmount` | `paymentToken` | Unary |
| 26 | `PurchaseWithCharge` | `amount`, `dstToken`, `srcToken`, `description`, `chargeAmount`, `useCredit`, `couponId`, `terminalNo`, `stan` | `paymentToken` | Unary |
| 27 | `Transfer` | `sourceToken`, `destinationToken`, `destinationPhone`, `destinationUserid`, `amount`, `description` | `paymentToken` | Unary |
| 28 | `UpgradeKifpool` | `type`, `tag`, `amount` | `level` | Unary |
| 29 | `VerifyCashOutKifpool` | `token` | `accountNo`, `firstName`, `lastName` | Unary |
| 30 | `VerifyPurchaseMessage` | `historyId` | `amount`, `paymentTypeTitle`, `paymentTitle` | Unary |

### bale.llm_auth.v1.LLMAuthService
Client Namespace: `client.lLMAuth.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetAuthToken` | `token`, `url`, `expiresIn` | `token`, `url`, `expiresIn` | Unary |

### bale.magazine.v1.Magazine
Client Namespace: `client.magazine.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetMessageUpvoters` | `loadMoreState`, `message` | `loadMoreState`, `users[]` | Unary |
| 2 | `GetMyUpvotes` | `upvotes` | `upvotes` | Unary |
| 3 | `GetSimilarPosts` | `message`, `loadMoreState` | `messages[]`, `loadMoreState`, `similarPosts[]` | Unary |
| 4 | `LoadCategories` | `categories[]` | `categories[]` | Unary |
| 5 | `LoadCategoryFeedMessages` | `categoryId`, `loadMoreState` | `loadMoreState`, `messages[]` | Unary |
| 6 | `LoadFeedMessages` | `loadMoreState` | `loadMoreState`, `messages[]` | Unary |
| 7 | `LoadInternalFeedMessages` | `loadMoreState` | `loadMoreState`, `messages[]` | Unary |
| 8 | `RevokeUpvotedPost` | `message`, `albumId` | `upvotes` | Unary |
| 9 | `UpvotePost` | `message`, `albumId` | `upvotes` | Unary |

### bale.market.v1.Market
Client Namespace: `client.market.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `AcceptCampaignMarket` | `marketId`, `isPermanent` | *(none/response)* | Unary |
| 2 | `AcceptMarketJoinRequest` | `marketPeerId`, `requestId`, `displayName`, `categoryId` | *(none/response)* | Unary |
| 3 | `CreateMarketJoinRequest` | `marketPeerId`, `displayName`, `categoryId`, `tagIds[]` | `marketJoinRequests[]` | Unary |
| 4 | `CreateTag` | `title`, `categoryId` | `tag` | Unary |
| 5 | `GetCategoriesList` | `categoryId`, `level`, `includeSampleMarkets`, `version` | `categories[]`, `version` | Unary |
| 6 | `GetCategoryMarkets` | `categoryId`, `pagination`, `version` | `markets[]`, `version` | Unary |
| 7 | `GetCategoryProducts` | `categoryId`, `pagination`, `version`, `products[]` | `products[]`, `version` | Unary |
| 8 | `GetIndexedProducts` | `startDate`, `endDate`, `categoryId` | `products[]` | Unary |
| 9 | `GetMarket` | `peerId`, `nickName` | `market`, `lastRequest` | Unary |
| 10 | `GetMarketJoinRequests` | `marketJoinRequests[]` | `marketJoinRequests[]` | Unary |
| 11 | `GetMarketsPendingJoinRequest` | `requests[]` | `requests[]` | Unary |
| 12 | `GetNumberOfSales` | `peer` | `numberOfSales`, `isMarket` | Unary |
| 13 | `GetOnboardingStatus` | `status`, `categoryIds[]`, `gender` | `status`, `categoryIds[]`, `gender` | Unary |
| 14 | `GetPendingCampaignMarkets` | `markets[]` | `markets[]` | Unary |
| 15 | `GetStores` | `version` | `stores`, `version` | Unary |
| 16 | `GetTags` | `categoryId` | `tags[]` | Unary |
| 17 | `GetTopMarkets` | `ratingType`, `pagination` | `markets[]` | Unary |
| 18 | `GetYaldaStores` | `version` | `stores`, `version` | Unary |
| 19 | `RejectCampaignMarket` | `marketId`, `isPermanent` | *(none/response)* | Unary |
| 20 | `RejectMarketJoinRequest` | `marketPeerId`, `rejectCause`, `requestId` | *(none/response)* | Unary |
| 21 | `SetGenericDeepLinks` | `links[]` | *(none/response)* | Unary |
| 22 | `SetMarketBanners` | `banners[]` | *(none/response)* | Unary |
| 23 | `SetOnboardingData` | `categoryIds[]`, `gender`, `isSkipped` | `status`, `categoryIds[]`, `gender` | Unary |
| 24 | `SetPopularSearches` | `items[]` | *(none/response)* | Unary |
| 25 | `SubmitMarketFeedback` | `rate`, `userOpinion`, `clientVersion`, `key`, `value` | *(none/response)* | Unary |
| 26 | `UpdateMarketInfo` | `peerId`, `displayName`, `primaryCategoryId`, `isBanned`, `isActive` | *(none/response)* | Unary |

### bale.maviz.v1.MavizStream
Client Namespace: `client.mavizStream.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetDifference` | `routeSequences[]`, `optimizations[]` | `usersRefs[]`, `groupsRefs[]`, `key`, `value` | Unary |
| 2 | `SubscribeToThreadUpdates` | `peer`, `threadId` | *(none/response)* | Unary |
| 3 | `SubscribeToUpdates` | `isMtProto` | `update`, `routeId`, `sequence`, `timestamp`, `weakEvent`, `mtupdate`, `updates` | Req: false, Res: true |
| 4 | `UnsubscribeFromThreadUpdates` | `peer`, `threadId` | *(none/response)* | Unary |

### bale.meet.v1.Meet
Client Namespace: `client.meet.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `AcceptCall` | `callId`, `inviteEnable` | `exPeer`, `messageId`, `chunks[]`, `lastChunks[]` | Unary |
| 2 | `AnswerCallJoinRequest` | `callId`, `requesterIdentifier`, `isAllowed` | *(none/response)* | Unary |
| 3 | `AskToJoinCall` | `callId`, `name` | *(none/response)* | Unary |
| 4 | `DeleteCallLogs` | `callIds[]`, `all`, `invert`, `callLogs[]`, `total` | *(none/response)* | Unary |
| 5 | `DeleteStream` | `streamUser` | *(none/response)* | Unary |
| 6 | `DiscardCall` | `callId`, `duration`, `reason`, `type` | `exPeer`, `messageId`, `chunks[]`, `lastChunks[]` | Unary |
| 7 | `GenerateCallLink` | `isPublic`, `callId`, `title` | `groupCall`, `linkExpirationPeriod` | Unary |
| 8 | `GetCallLinkDetails` | `session` | `groupCall` | Unary |
| 9 | `GetCallLogs` | `pageNumber`, `pageSize`, `afterDate`, `beforeDate` | `callLogs[]`, `total` | Unary |
| 10 | `GetCallState` | `callId` | `groupCall` | Unary |
| 11 | `GetGroupCall` | `peer` | `groupCall` | Unary |
| 12 | `GetOngoingCalls` | `pageNumber`, `pageSize` | `callLogs[]` | Unary |
| 13 | `GetWssURL` | `callId` | `url` | Unary |
| 14 | `InviteToCall` | `callId`, `invitees[]`, `peerStates[]` | `peerStates[]` | Unary |
| 15 | `JoinGroupCall` | `callId`, `name` | `groupCall`, `states[]` | Unary |
| 16 | `LeaveGroupCall` | `callId`, `end` | `groupCall`, `seq` | Unary |
| 17 | `MuteParticipant` | `callId`, `identity`, `trackId`, `revokePublishPermission` | *(none/response)* | Unary |
| 18 | `ReceiveCall` | `callId` | *(none/response)* | Unary |
| 19 | `RemoveParticipant` | `callId`, `identity`, `blockFromCall` | *(none/response)* | Unary |
| 20 | `SendCallReaction` | `callId`, `reaction` | *(none/response)* | Unary |
| 21 | `SendFanoosEvent` | *(none/empty)* | *(none/response)* | Unary |
| 22 | `SetLinkTitle` | `title`, `callId`, `linkUrl` | *(none/response)* | Unary |
| 23 | `StartCall` | `exPeer`, `messageId`, `fromChunkId` | `exPeer`, `messageId`, `chunks[]`, `lastChunks[]` | Unary |
| 24 | `StartGroupCall` | `peer`, `randomId`, `video`, `mode`, `invitees[]`, `groupCall`, `seq` | `groupCall`, `seq` | Unary |
| 25 | `StartRecording` | `callId`, `layout`, `quality` | *(none/response)* | Unary |
| 26 | `StartStream` | `streamUser`, `url`, `rtmpServer` | `streamKey` | Unary |
| 27 | `StopRecording` | `callId` | *(none/response)* | Unary |
| 28 | `SubmitCallFeedback` | `callId`, `rate`, `userOpinion`, `client`, `clientVersion`, `isStream`, `key`, `value` | *(none/response)* | Unary |
| 29 | `TakeCallAction` | `callId`, `lowerHand`, `raiseHand` | `callId` | Unary |
| 30 | `UpdateLayout` | `callId`, `requestedLayout` | *(none/response)* | Unary |

### bale.message_stream.v1.MessageStream
Client Namespace: `client.messageStream.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `CancelMessageStream` | `peer`, `rid`, `message`, `isOnlyForUser`, `quotedMessageReference`, `exPeer`, `isSilent`, `threadId` | `exPeer`, `messageId`, `chunks[]`, `lastChunks[]` | Unary |
| 2 | `ReceiveMessageStream` | `peer`, `date`, `randomId`, `title` | `threadId` | Unary |

### bale.messaging.v2.Messaging
Client Namespace: `client.messaging.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `ArchiveDialogs` | `exPeers[]` | *(none/response)* | Unary |
| 2 | `ClearChat` | `peer` | *(none/response)* | Unary |
| 3 | `CreateFolder` | `name`, `peers[]` | `folderId`, `index`, `unreadPeers[]` | Unary |
| 4 | `CreateReservedFolder` | `folderId` | `index`, `unreadPeers[]` | Unary |
| 5 | `CreateThread` | `packageId`, `couponCode` | `sadadPaymentToken` | Unary |
| 6 | `CreateTopic` | `exPeer`, `title` | `topicId` | Unary |
| 7 | `DeleteChat` | `peer` | *(none/response)* | Unary |
| 8 | `DeleteFolder` | `folderId` | *(none/response)* | Unary |
| 9 | `DeleteMessage` | `categories[]` | *(none/response)* | Unary |
| 10 | `DeleteTopic` | `exPeer`, `topicId` | *(none/response)* | Unary |
| 11 | `EditFolder` | `folderId`, `name`, `addedPeers[]`, `deletedPeers[]` | `unreadPeers[]` | Unary |
| 12 | `EditTopic` | `exPeer`, `topicId`, `title` | *(none/response)* | Unary |
| 13 | `FetchProtectedMessage` | `peer`, `messageId` | `history` | Unary |
| 14 | `ForwardMessages` | `packages[]`, `key`, `value` | *(none/response)* | Unary |
| 15 | `GetDiscussionMessage` | `peer`, `messageId` | `discussionMessage` | Unary |
| 16 | `GetMessagesRepliesInfo` | `peer`, `mids[]` | `containers[]` | Unary |
| 17 | `GetTopicByID` | `exPeer`, `topicId` | `topic` | Unary |
| 18 | `GetTopics` | `exPeer`, `minDate`, `limit` | `topics[]` | Unary |
| 19 | `LoadDialogs` | `minDate`, `limit`, `optimizations[]`, `dialogType`, `excludePinnedDialogs`, `archiveFilter` | `groups[]`, `users[]`, `dialogs[]`, `userPeers[]`, `groupPeers[]` | Unary |
| 20 | `LoadFolderDialogs` | `minDate`, `limit`, `folderId`, `archiveFilter` | `dialogs[]` | Unary |
| 21 | `LoadFolders` | `includeMutedUnreadPeers`, `isNewUser` | `folders[]`, `unreadPeers[]` | Unary |
| 22 | `LoadGroupedDialogs` | `optimizations[]`, `archiveFilter` | `dialogs[]`, `users[]`, `groups[]`, `showArchived`, `showInvite`, `userPeers[]`, `groupPeers[]` | Unary |
| 23 | `LoadHistory` | `peer`, `date`, `loadMode`, `limit`, `optimizations[]` | `history[]`, `users[]`, `userPeers[]`, `groups[]`, `groupPeers[]` | Unary |
| 24 | `LoadPeerDialogs` | `peers[]` | `dialogs[]`, `groups[]`, `users[]`, `userPeers[]`, `groupPeers[]` | Unary |
| 25 | `LoadPeers` | `exPeers[]` | `exPeers[]` | Unary |
| 26 | `LoadPinnedDialogs` | `folderId` | `dialogs[]` | Unary |
| 27 | `LoadPinnedMessages` | `peer` | `pinnedMessages[]` | Unary |
| 28 | `LoadReplies` | `peer`, `threadId`, `date`, `loadMode`, `limit` | `history[]`, `users[]`, `userPeers[]` | Unary |
| 29 | `MarkDialogsAsRead` | `peers[]` | *(none/response)* | Unary |
| 30 | `MarkDialogsAsUnread` | `peers[]` | *(none/response)* | Unary |
| 31 | `MentionRead` | `peer`, `messageId` | *(none/response)* | Unary |
| 32 | `MessageRead` | `categories[]` | *(none/response)* | Unary |
| 33 | `MessageReceived` | `key`, `value` | *(none/response)* | Unary |
| 34 | `PinDialogs` | `peers[]`, `folderId` | `dialogs[]`, `peers[]` | Unary |
| 35 | `PinMessage` | `peer`, `messageId`, `justMine` | *(none/response)* | Unary |
| 36 | `ReorderFolders` | `folderId`, `folderIds[]` | `folderId`, `folderIds[]` | Unary |
| 37 | `ReorderPinnedDialogs` | `peers[]`, `folderId` | `dialogs[]`, `peers[]` | Unary |
| 38 | `SendMessage` | `packageId`, `couponCode` | *(none/response)* | Unary |
| 39 | `SendMultiMediaMessage` | `discountedPrice` | *(none/response)* | Unary |
| 40 | `UnArchiveDialogs` | `exPeers[]` | *(none/response)* | Unary |
| 41 | `UnpinDialogs` | `peers[]`, `folderId` | *(none/response)* | Unary |
| 42 | `UnPinMessages` | `peer`, `messageIds[]`, `all` | *(none/response)* | Unary |
| 43 | `UpdateMessage` | `packages[]`, `key`, `value` | *(none/response)* | Unary |

### bale.microbanki.v1.MicroBanki
Client Namespace: `client.microBanki.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetBamServiceToken` | `service`, `endpoint`, `token` | `endpoint`, `token` | Unary |
| 2 | `GetMoneyRequestDetails` | `message` | `totalAmount`, `payCount`, `lastPayDate`, `responseType` | Unary |
| 3 | `GetMoneyRequestPaymentList` | `message`, `loadMoreState` | `payment[]`, `loadMoreState`, `responseType`, `userPeers[]`, `groupPeers[]` | Unary |

### bale.my_bank.v1.MyBank
Client Namespace: `client.myBank.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetMyBank` | `data`, `version`, `itemsVersion`, `isChanged` | `data`, `version`, `itemsVersion`, `isChanged` | Unary |

### bale.negah.v1.Negah
Client Namespace: `client.negah.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetMessageSeenList` | `peer`, `messageId`, `page`, `limit` | `usersSeen[]`, `count` | Unary |

### bale.organizations.v1.Organizations
Client Namespace: `client.organizations.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetUserOrganizationalContacts` | `userPeers[]` | `userPeers[]` | Unary |
| 2 | `GetUserOrganizationInfo` | `userOrganization` | `userOrganization` | Unary |

### bale.pfm.v1.Pfm
Client Namespace: `client.pfm.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `AddDetailToTransaction` | `id`, `detail` | *(none/response)* | Unary |
| 2 | `AddTransactionTags` | `id`, `tags[]` | *(none/response)* | Unary |
| 3 | `AddUserTags` | `tags[]` | *(none/response)* | Unary |
| 4 | `FilterTaggedTransactions` | `ids[]` | `idsWithTag[]` | Unary |
| 5 | `GetSubTransactions` | `transactionId` | `transactionIds[]` | Unary |
| 6 | `GetTransactionTags` | `id` | `tags[]` | Unary |
| 7 | `GetUserAccounts` | `accounts[]`, `config` | `accounts[]`, `config` | Unary |
| 8 | `GetUserTags` | `getUserTagType` | `tags[]` | Unary |
| 9 | `LoadTransactions` | `accountNumber`, `startDate`, `endDate`, `transactionType`, `label[]`, `limit`, `loadMoreState`, `loadMode`, `userTagType` | `transactions[]`, `totalAmounts[]`, `loadMoreState`, `totalAmountsPerDay[]` | Unary |
| 10 | `LoadTransactionsByIDs` | `transactionIds[]` | `transactions[]` | Unary |
| 11 | `RemoveTransaction` | `transactionIds[]` | *(none/response)* | Unary |
| 12 | `RemoveTransactionTags` | `id`, `tags[]` | *(none/response)* | Unary |
| 13 | `RemoveUserTags` | `tags[]` | *(none/response)* | Unary |
| 14 | `ReviveTransaction` | `transactionId` | *(none/response)* | Unary |
| 15 | `SplitTransaction` | `transactionId`, `units[]` | `splitTransactionIds[]` | Unary |

### bale.pishvaz.v1.Pishvaz
Client Namespace: `client.pishvaz.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetMarketingToolsConfig` | `inApp`, `eventBar`, `dialogListBanner` | `inApp`, `eventBar`, `dialogListBanner` | Unary |
| 2 | `GetOnboardingPageData` | `title`, `sections[]` | `title`, `sections[]` | Unary |
| 3 | `SetMarketingToolAction` | `id`, `actionType` | `inApp`, `eventBar`, `dialogListBanner` | Unary |

### bale.poll.v1.Poll
Client Namespace: `client.poll.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `ClosePoll` | `pollId` | *(none/response)* | Unary |
| 2 | `CreatePoll` | `pollMessage`, `createAt`, `expeer` | `pollId` | Unary |
| 3 | `GetFullPollResult` | `pollId` | `fullPollResult[]` | Unary |
| 4 | `GetPollResults` | `pollIds[]` | `pollResults[]` | Unary |
| 5 | `Vote` | `pollId`, `isRetract`, `voteAt`, `optionIds[]` | `pollResult` | Unary |

### bale.premium.v1.Premium
Client Namespace: `client.premium.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `CalculateDiscountedPrice` | `packageId`, `couponCode` | `discountedPrice` | Unary |
| 2 | `GetBadges` | `categories[]` | `categories[]` | Unary |
| 3 | `GetPackages` | `packages[]`, `key`, `value` | `packages[]`, `key`, `value` | Unary |
| 4 | `IsPremium` | `badgeId`, `faName`, `enName`, `mediaUrl`, `mediaFormat` | `userStatus` | Unary |
| 5 | `IsPremiumBatch` | `userIds[]`, `withDetailOption` | `usersStatus[]` | Unary |
| 6 | `PurchasePackage` | `packageId`, `couponCode` | `sadadPaymentToken` | Unary |
| 7 | `SetUserBadge` | `badgeId` | *(none/response)* | Unary |

### bale.presence.v1.Presence
Client Namespace: `client.presence.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetContactsPresences` | `limit` | `presences[]` | Unary |
| 2 | `GetGroupMembersPresences` | `peer` | `presences[]` | Unary |
| 3 | `GetGroupOnlineCount` | `peer` | `count` | Unary |
| 4 | `GetUsersPresence` | `presences[]`, `userIds[]` | `presences[]` | Unary |
| 5 | `SetOnline` | `isOnline`, `timeout`, `deviceType`, `deviceCategory` | *(none/response)* | Unary |
| 6 | `StopTyping` | `peer`, `typingType` | *(none/response)* | Unary |
| 7 | `SubscribeFromGroupOnline` | `groups[]` | *(none/response)* | Unary |
| 8 | `SubscribeFromOnline` | `users[]` | *(none/response)* | Unary |
| 9 | `SubscribeToGroupOnline` | `groups[]` | *(none/response)* | Unary |
| 10 | `SubscribeToOnline` | `users[]` | *(none/response)* | Unary |
| 11 | `Typing` | `peer`, `typingType` | *(none/response)* | Unary |

### bale.ramz.v1.Ramz
Client Namespace: `client.ramz.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `CheckPassword` | `password`, `servicesType` | `token` | Unary |
| 2 | `CheckPasswordSet` | `hasSet`, `isSessionAuthorized` | `hasSet`, `isSessionAuthorized` | Unary |
| 3 | `DeletePassword` | `kind`, `description`, `peerReport`, `messageReport`, `storyReport` | *(none/response)* | Unary |
| 4 | `ForgetPassword` | `hasSet`, `isSessionAuthorized` | `hasSet`, `isSessionAuthorized` | Unary |
| 5 | `SendOTP` | *(none/empty)* | `hasSet`, `isSessionAuthorized` | Unary |
| 6 | `SetPassword` | `password` | `otp` | Unary |
| 7 | `ValidateOTP` | `otp`, `servicesType`, `serviceName` | `otpValid`, `serviceName` | Unary |

### bale.recommender.v1.Recommender
Client Namespace: `client.recommender.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetChannelRecommendations` | `channels[]` | `channels[]` | Unary |
| 2 | `GetGroupsRecommendation` | `source` | `groups[]` | Unary |
| 3 | `GetRelatedChannels` | `exPeer` | `relatedChannels[]` | Unary |
| 4 | `GetRelatedGroups` | `exPeer` | `relatedGroups[]` | Unary |

### bale.report.v1.Report
Client Namespace: `client.report.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `ReportDismiss` | `exPeer`, `serviceName` | *(none/response)* | Unary |
| 2 | `ReportInappropriateContent` | `report`, `serviceName` | *(none/response)* | Unary |

### bale.sap.v1.Sap
Client Namespace: `client.sap.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `AddDestinationCards` | `cards[]` | `ids[]` | Unary |
| 2 | `AddNewCards` | `cardInfo[]` | `cardId[]` | Unary |
| 3 | `DeliverOtp` | `cardId`, `destinationPan`, `amount`, `accessAddress`, `approvalCode` | `isDone` | Unary |
| 4 | `EditCardExpirationDate` | `cardId`, `cardExpDate` | *(none/response)* | Unary |
| 5 | `EnrollNewCard` | `origin` | `transactionId`, `url` | Unary |
| 6 | `GetCardInfo` | `transactionId`, `cardInfo`, `cardId` | `cardId`, `maskedPan` | Unary |
| 7 | `GetCards` | `userCards[]` | `userCards[]` | Unary |
| 8 | `GetDefaultCard` | `cardId` | `cardId` | Unary |
| 9 | `GetDestinationCardInfo` | `cardId`, `destinationPan`, `amount`, `sourceAddress`, `localize`, `targetUserId`, `messageData`, `cardHolderName`, `approvalCode` | `cardHolderName`, `approvalCode` | Unary |
| 10 | `GetDestinationCards` | `cards[]` | `cards[]` | Unary |
| 11 | `ReactivateApp` | `transactionId`, `reactivationAddress` | `transactionId`, `reactivationAddress` | Unary |
| 12 | `RemoveCard` | `cardId` | *(none/response)* | Unary |
| 13 | `RemoveDefaultCard` | `cardId`, `cardExpDate` | *(none/response)* | Unary |
| 14 | `RemoveDestinationCards` | `ids[]` | *(none/response)* | Unary |
| 15 | `SetDefaultCard` | `cardId` | *(none/response)* | Unary |
| 16 | `TransferMoneyByCard` | `cardId`, `transferCode`, `destinationPan`, `amount`, `pin`, `cvv2`, `expiryDate`, `sourceAddress`, `localize`, `approvalCode`, `encryptedTransferInfo`, `messageData`, `targetUserId`, `description`, `ramzToken` | `traceNumber`, `transactionTime` | Unary |

### bale.schedule.v1.Scheduler
Client Namespace: `client.scheduler.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `ExecuteTaskNow` | `taskID` | *(none/response)* | Unary |
| 2 | `ListTasks` | `exPeer`, `type`, `status` | `tasks[]` | Unary |
| 3 | `PeersWithScheduleTask` | `exPeer[]` | `exPeer[]` | Unary |
| 4 | `ReScheduleTask` | `taskID`, `scheduledAt`, `payload` | *(none/response)* | Unary |
| 5 | `ScheduleTask` | `exPeer`, `scheduledAt`, `payload` | `taskId` | Unary |
| 6 | `UnScheduleTask` | `taskId`, `taskIDs[]` | `taskId`, `failedTaskIDs[]` | Unary |

### bale.search.v1.Search
Client Namespace: `client.search.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `RecommendPeer` | `exPeerType` | `peer[]` | Unary |
| 2 | `SearchContent` | `query`, `contentType`, `loadMoreState` | `contentResults[]`, `loadMoreState`, `resultCount` | Unary |
| 3 | `SearchDialog` | `query` | `dialogResults[]` | Unary |
| 4 | `SearchMarket` | `query`, `withCategory`, `loadMoreState` | `marketResults[]`, `category`, `loadMoreState`, `resultCount` | Unary |
| 5 | `SearchMarketPopular` | `popularResults[]` | `popularResults[]` | Unary |
| 6 | `SearchMedia` | `query`, `date`, `optimizations[]`, `loadMode` | `searchResults[]`, `users[]`, `groups[]`, `loadMoreState`, `userOutPeers[]`, `groupOutPeers[]`, `resultCount` | Unary |
| 7 | `SearchMembers` | `query`, `exPeer`, `loadMoreState`, `users[]` | `users[]`, `loadMoreState` | Unary |
| 8 | `SearchMessageMore` | `loadMoreState`, `query`, `optimizations[]` | `searchResults[]`, `users[]`, `groups[]`, `loadMoreState`, `userOutPeers[]`, `groupOutPeers[]`, `resultCount` | Unary |
| 9 | `SearchMessages` | `query`, `optimizations[]` | `searchResults[]`, `users[]`, `groups[]`, `loadMoreState`, `userOutPeers[]`, `groupOutPeers[]`, `resultCount` | Unary |
| 10 | `SearchPeer` | `query[]`, `optimizations[]` | `searchResults[]`, `users[]`, `groups[]`, `userPeers[]`, `groupPeers[]` | Unary |
| 11 | `SearchProduct` | `query`, `loadMoreState` | `productResults[]`, `loadMoreState`, `resultCount` | Unary |
| 12 | `UpdateSearchContentClick` | `messageId`, `searchTab` | *(none/response)* | Unary |

### bale.shared_media.v1.SharedMediaService
Client Namespace: `client.sharedMedia.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetActiveSharedMedia` | `exPeer` | `activeTab[]` | Unary |
| 2 | `LoadMedia` | `exPeer`, `date`, `contentType`, `loadMode`, `minimumResults` | `mediaResults[]` | Unary |

### bale.story.v1.Story
Client Namespace: `client.story.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `AddBotStory` | `exPeer`, `mediaStory`, `textStory`, `tagIds[]`, `expirationType` | `storyId` | Unary |
| 2 | `AddChannelStory` | `exPeer`, `mediaStory`, `textStory`, `hasReply`, `tagIds[]`, `expirationType` | `storyId` | Unary |
| 3 | `AddStory` | `mediaStory`, `textStory`, `tagIds[]`, `expirationType`, `exceptionType` | `storyId` | Unary |
| 4 | `CanAddBotStory` | `botUserId` | `canAddBotStory` | Unary |
| 5 | `CheckLinkValidity` | `exPeer`, `link` | *(none/response)* | Unary |
| 6 | `GetAllStories` | `userStories[]`, `channelStories[]`, `botStories[]`, `popularityList[]` | `userStories[]`, `channelStories[]`, `botStories[]`, `popularityList[]` | Unary |
| 7 | `GetBotStories` | `result[]`, `popularityList[]` | `result[]`, `popularityList[]` | Unary |
| 8 | `GetChannelStories` | `result[]`, `popularityList[]` | `result[]`, `popularityList[]` | Unary |
| 9 | `GetDefaultStoryBackgrounds` | `defaultStoryBackgrounds[]` | `defaultStoryBackgrounds[]` | Unary |
| 10 | `GetMostPopularStories` | `getSpecialStories`, `optimization` | `result[]`, `popularityList[]` | Unary |
| 11 | `GetStories` | `getUnmutual` | `result[]`, `popularityList[]` | Unary |
| 12 | `GetStoriesByList` | `exPeers[]` | `userStories[]`, `channelStories[]`, `botStories[]` | Unary |
| 13 | `GetStoryById` | `storyId` | `result`, `channelStoryResult`, `botStoryResult` | Unary |
| 14 | `GetStoryReactionEmojis` | `emojis[]` | `emojis[]` | Unary |
| 15 | `GetStoryTags` | `tags[]` | `tags[]` | Unary |
| 16 | `GetStoryWidgets` | `storyId` | `widgets[]` | Unary |
| 17 | `GetUserPrivacyConfig` | `result[]` | `result[]` | Unary |
| 18 | `GetUserStoryConfig` | `key[]`, `exPeer` | `config[]` | Unary |
| 19 | `GetViewers` | `storyId`, `pagination` | `viewers[]`, `viewCount`, `likeCount`, `linkClickCount`, `emojiCount`, `restoryCount` | Unary |
| 20 | `GetViewersCount` | `storyId` | `viewCount`, `likeCount`, `linkClickCount`, `emojiCount`, `restoryCount` | Unary |
| 21 | `ReactToStory` | `storyId`, `reaction`, `type`, `reactionType`, `reactionText` | *(none/response)* | Unary |
| 22 | `RemoveStory` | `storyId` | *(none/response)* | Unary |
| 23 | `SetUserPrivacyConfig` | `config` | `defaultStoryBackgrounds[]` | Unary |
| 24 | `SetUserStoryConfig` | `setType`, `config`, `exPeer` | `exPeers[]` | Unary |

### bale.timche.v1.Timche
Client Namespace: `client.timche.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `AskBotReviewCallback` | `botId`, `payload` | `botId`, `previousRating`, `previousComment`, `payload` | Unary |
| 2 | `GetBotPage` | `url`, `buttonTitle`, `shouldSearchInternal` | `voice`, `outPeer`, `messageId` | Unary |
| 3 | `GetHomePage` | `voice`, `outPeer`, `messageId` | `sections[]` | Unary |
| 4 | `GetSectionPage` | `sectionId` | `sectionId`, `sectionName`, `bots[]` | Unary |
| 5 | `SubmitReview` | `code`, `message`, `details` | `customOpenUrlAction`, `customDoNothingAction` | Unary |

### bale.tldr.v1.TLDR
Client Namespace: `client.tLDR.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetLinkPreview` | `url` | `title`, `description`, `images[]` | Unary |
| 2 | `GetLinkSummary` | `url` | `summary` | Unary |

### bale.top_peer.v1.TopPeer
Client Namespace: `client.topPeer.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetTopPeer` | `topPeers[]` | `topPeers[]` | Unary |
| 2 | `RemovePeer` | `peer` | `isRemoved` | Unary |

### bale.turing.v1.AI
Client Namespace: `client.aI.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `GetTranscript` | `id`, `balances[]`, `walletLink`, `isActive` | `amount`, `currency`, `description`, `dateTime`, `sourceWalletId`, `targetWalletId` | Unary |
| 2 | `SendEvent` | `highCeilingPrice`, `limitationType`, `limitationPeriod`, `limitationPriority`, `status`, `value` | *(none/response)* | Unary |

### bale.users.v1.Users
Client Namespace: `client.users.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `AddCard` | `userId`, `defaultCardNo`, `timeOut`, `retry`, `maxRetries`, `errorCodes[]`, `maxInterval`, `initialInterval`, `excludeRetryErrorCodes[]` | *(none/response)* | Unary |
| 2 | `AddContact` | `uid`, `accessHash` | *(none/response)* | Unary |
| 3 | `BlockUser` | `peer` | *(none/response)* | Unary |
| 4 | `ChangeDefaultCardNumber` | `defaultCardNumber` | *(none/response)* | Unary |
| 5 | `ChangePhoneNumber` | `phoneNumber` | *(none/response)* | Unary |
| 6 | `CheckNickName` | `nickname` | *(none/response)* | Unary |
| 7 | `ConfirmPhoneNumber` | `code` | *(none/response)* | Unary |
| 8 | `EditAbout` | `about` | *(none/response)* | Unary |
| 9 | `EditAvatar` | `fileLocation` | `seq`, `state`, `avatar` | Unary |
| 10 | `EditBirthDate` | `date` | *(none/response)* | Unary |
| 11 | `EditMyPreferredLanguages` | `preferredLanguages[]` | *(none/response)* | Unary |
| 12 | `EditMyTimeZone` | `tz` | *(none/response)* | Unary |
| 13 | `EditName` | `name` | *(none/response)* | Unary |
| 14 | `EditNickName` | `nickname` | *(none/response)* | Unary |
| 15 | `EditSex` | `sex` | *(none/response)* | Unary |
| 16 | `EditUserLocalName` | `uid`, `accessHash`, `name` | *(none/response)* | Unary |
| 17 | `GetContacts` | `contactsHash`, `optimizations[]` | `isNotChanged`, `users[]`, `userPeers[]` | Unary |
| 18 | `GetFullUser` | `peer` | `fullUser` | Unary |
| 19 | `GetUserFullPrivacy` | `userId` | `privacy` | Unary |
| 20 | `GetUserPrivacyStatus` | `userId`, `type` | `status` | Unary |
| 21 | `GetUsersDefaultCardNumber` | `defaultCardNo[]` | `defaultCardNo[]` | Unary |
| 22 | `ImportContacts` | `phones[]`, `optimizations[]` | `seq`, `state`, `users[]`, `userPeers[]` | Unary |
| 23 | `IsNameAllowed` | `name` | *(none/response)* | Unary |
| 24 | `LoadAvatars` | `phoneNumber`, `name` | `invitePrivacy`, `presencePrivacy`, `moneyTransferPrivacy`, `timeOut`, `retry`, `maxRetries`, `errorCodes[]`, `maxInterval`, `initialInterval`, `excludeRetryErrorCodes[]` | Unary |
| 25 | `LoadBlockedUsers` | `userPeers[]` | `userPeers[]` | Unary |
| 26 | `LoadFullUsers` | `key`, `value` | `slashCommand`, `description`, `locKey` | Unary |
| 27 | `LoadFullUsersSequentially` | `key`, `value` | `slashCommand`, `description`, `locKey` | Unary |
| 28 | `LoadUsers` | `peers[]` | `users[]` | Unary |
| 29 | `NotifyAboutDeviceInfo` | `preferredLanguages[]`, `timeZone` | *(none/response)* | Unary |
| 30 | `RemoveAvatar` | `avaterId` | *(none/response)* | Unary |
| 31 | `RemoveContact` | `uid`, `accessHash` | *(none/response)* | Unary |
| 32 | `RemoveDefaultCardNumber` | `phones[]`, `optimizations[]` | *(none/response)* | Unary |
| 33 | `ResetContacts` | `name` | *(none/response)* | Unary |
| 34 | `SearchContacts` | `request`, `optimizations[]` | `users[]`, `userPeers[]`, `groups[]`, `groupPeers[]` | Unary |
| 35 | `SetUserPrivacyStatus` | `userId`, `type`, `status` | *(none/response)* | Unary |
| 36 | `UnblockUser` | `peer` | *(none/response)* | Unary |

### bale.v1.Configs
Client Namespace: `client.configs.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `EditParameter` | `key`, `value` | *(none/response)* | Unary |
| 2 | `GetInAppUpdate` | `fileId`, `accessHash`, `fileSize` | `fileId`, `accessHash`, `fileSize` | Unary |
| 3 | `GetParameters` | `parameters[]` | `parameters[]` | Unary |

### bale.v1.Images
Client Namespace: `client.images.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `AddGif` | `gif`, `thumb`, `mimeType` | *(none/response)* | Unary |
| 2 | `AddStickerCollection` | `id`, `accessHash` | `collections[]`, `seq`, `state` | Unary |
| 3 | `AddStickerPack` | `id` | *(none/response)* | Unary |
| 4 | `GetSavedGifs` | `offset` | `gifs[]`, `offset` | Unary |
| 5 | `LoadOwnStickers` | `offset` | `ownStickers[]`, `offset` | Unary |
| 6 | `LoadStickerCollection` | `id`, `accessHash` | `collection` | Unary |
| 7 | `RemoveGif` | `gif` | *(none/response)* | Unary |
| 8 | `RemoveStickerCollection` | `id`, `accessHash` | `collections[]`, `seq`, `state` | Unary |
| 9 | `RemoveStickerPack` | `id` | *(none/response)* | Unary |
| 10 | `UseGif` | `gif`, `usedAt` | *(none/response)* | Unary |

### bale.wallet.v1.Wallet
Client Namespace: `client.wallet.<methodName>(params)`

| # | Method | Parameters | Return Fields | Streams |
|---|--------|------------|---------------|---------|
| 1 | `ActivateWallet` | `nationalId`, `isAutoActivated` | *(none/response)* | Unary |
| 2 | `CashOutFromWallet` | `token`, `amount` | *(none/response)* | Unary |
| 3 | `GetMoneyRequestPaymentTokenByCard` | `msg`, `amount`, `regarding` | `token`, `endpoint`, `terminalId`, `merchantId` | Unary |
| 4 | `GetMyWallets` | `wallets[]` | `wallets[]` | Unary |
| 5 | `GetPaymentTokenByCard` | `targetWallet`, `amount`, `regarding` | `token`, `endpoint`, `terminalId`, `merchantId` | Unary |
| 6 | `GetWalletChargeToken` | `walletId`, `amount` | `token`, `endpoint`, `terminalId`, `merchantId` | Unary |
| 7 | `GetWalletContracts` | `startDate`, `endDate`, `merchantCustomerUniqueValue`, `limitations[]`, `agreementId`, `status` | `startDate`, `endDate`, `merchantCustomerUniqueValue`, `limitations[]`, `agreementId`, `status` | Unary |
| 8 | `GetWalletInvoice` | `walletId`, `pageNumber` | `invoices[]` | Unary |
| 9 | `PayByWallet` | `sourceWallet`, `targetWallet`, `amount`, `currency`, `regarding` | *(none/response)* | Unary |
| 10 | `PayMoneyRequestByWallet` | `sourceWalletId`, `msg`, `amount`, `regarding` | *(none/response)* | Unary |
| 11 | `VerifyCashOut` | `walletId`, `accountNo`, `nationalId` | `token`, `name` | Unary |
| 12 | `VerifyPeer` | `targetPeer` | `targetWalletName`, `targetUserId`, `walletId` | Unary |
| 13 | `VerifyQRCode` | `targetWalletId` | `targetWalletName`, `targetUserId` | Unary |

