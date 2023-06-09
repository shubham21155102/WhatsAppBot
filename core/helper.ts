import fs from 'fs'
import config from '../config'
import chalk from 'chalk'
import WhatsAppBotClass from '../sidekick/sidekick'
import { Contact, GroupMetadata, GroupParticipant, proto, WASocket } from '@adiwajshing/baileys'


const resolve = async function (messageInstance: proto.IWebMessageInfo, client: WASocket) {
    var WhatsAppBot: WhatsAppBotClass = new WhatsAppBotClass();
    var prefix: string = config.PREFIX + '\\w+'
    var prefixRegex: RegExp = new RegExp(prefix, 'g');
    var SUDOstring: string = config.SUDO;
    try {
        var jsonMessage: string = JSON.stringify(messageInstance);
    } catch (err) {
        console.log(chalk.redBright("[ERROR] Something went wrong. ", err))
    }
    WhatsAppBot.chatId = messageInstance.key.remoteJid;
    WhatsAppBot.fromMe = messageInstance.key.fromMe;
    WhatsAppBot.owner = client.user.id.replace(/:.*@/g, '@');
    WhatsAppBot.mimeType = messageInstance.message ? (Object.keys(messageInstance.message)[0] === 'senderKeyDistributionMessage' ? Object.keys(messageInstance.message)[2] : (Object.keys(messageInstance.message)[0] === 'messageContextInfo' ? Object.keys(messageInstance.message)[1] : Object.keys(messageInstance.message)[0])) : null;
    WhatsAppBot.type = WhatsAppBot.mimeType === 'imageMessage' ? 'image' : (WhatsAppBot.mimeType === 'videoMessage') ? 'video' : (WhatsAppBot.mimeType === 'conversation' || WhatsAppBot.mimeType == 'extendedTextMessage') ? 'text' : (WhatsAppBot.mimeType === 'audioMessage') ? 'audio' : (WhatsAppBot.mimeType === 'stickerMessage') ? 'sticker' : (WhatsAppBot.mimeType === 'senderKeyDistributionMessage' && messageInstance.message?.senderKeyDistributionMessage?.groupId === 'status@broadcast') ? 'status' : null;
    WhatsAppBot.isTextReply = (WhatsAppBot.mimeType === 'extendedTextMessage' && messageInstance.message?.extendedTextMessage?.contextInfo?.stanzaId) ? true : false;
    WhatsAppBot.replyMessageId = messageInstance.message?.extendedTextMessage?.contextInfo?.stanzaId;
    WhatsAppBot.replyParticipant = messageInstance.message?.extendedTextMessage?.contextInfo?.participant.replace(/:.*@/g, '@');;
    WhatsAppBot.replyMessage = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;
    WhatsAppBot.body = WhatsAppBot.mimeType === 'conversation' ? messageInstance.message?.conversation : (WhatsAppBot.mimeType == 'imageMessage') ? messageInstance.message?.imageMessage.caption : (WhatsAppBot.mimeType == 'videoMessage') ? messageInstance.message?.videoMessage.caption : (WhatsAppBot.mimeType == 'extendedTextMessage') ? messageInstance.message?.extendedTextMessage?.text : (WhatsAppBot.mimeType == 'buttonsResponseMessage') ? messageInstance.message?.buttonsResponseMessage.selectedDisplayText : null;
    WhatsAppBot.isCmd = prefixRegex.test(WhatsAppBot.body);
    WhatsAppBot.commandName = WhatsAppBot.isCmd ? WhatsAppBot.body.slice(1).trim().split(/ +/).shift().toLowerCase().split('\n')[0] : null;
    WhatsAppBot.isImage = WhatsAppBot.type === "image";
    WhatsAppBot.isReplyImage = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ? true : false;
    WhatsAppBot.imageCaption = WhatsAppBot.isImage ? messageInstance.message?.imageMessage.caption : null;
    WhatsAppBot.isGIF = (WhatsAppBot.type === 'video' && messageInstance.message?.videoMessage?.gifPlayback);
    WhatsAppBot.isReplyGIF = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.gifPlayback ? true : false;
    WhatsAppBot.isSticker = WhatsAppBot.type === 'sticker';
    WhatsAppBot.isReplySticker = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage ? true : false;
    WhatsAppBot.isReplyAnimatedSticker = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage?.isAnimated;
    WhatsAppBot.isVideo = (WhatsAppBot.type === 'video' && !messageInstance.message?.videoMessage?.gifPlayback);
    WhatsAppBot.isReplyVideo = WhatsAppBot.isTextReply ? (jsonMessage.indexOf("videoMessage") !== -1 && !messageInstance.message?.extendedTextMessage?.contextInfo.quotedMessage.videoMessage.gifPlayback) : false;
    WhatsAppBot.isAudio = WhatsAppBot.type === 'audio';
    WhatsAppBot.isReplyAudio = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ? true : false;
    WhatsAppBot.logGroup = client.user.id.replace(/:.*@/g, '@');;
    WhatsAppBot.isGroup = WhatsAppBot.chatId.endsWith('@g.us');
    WhatsAppBot.isPm = !WhatsAppBot.isGroup;
    WhatsAppBot.sender = (WhatsAppBot.isGroup && messageInstance.message && WhatsAppBot.fromMe) ? WhatsAppBot.owner : (WhatsAppBot.isGroup && messageInstance.message) ? messageInstance.key.participant.replace(/:.*@/g, '@') : (!WhatsAppBot.isGroup) ? WhatsAppBot.chatId : null;
    WhatsAppBot.isSenderSUDO = SUDOstring.includes(WhatsAppBot.sender?.substring(0, WhatsAppBot.sender.indexOf("@")));

    return WhatsAppBot;
}

export = resolve;