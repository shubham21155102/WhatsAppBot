import inputSanitization from "../sidekick/input-sanitization";
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type"

module.exports = {
    name: "invite",
    description: STRINGS.invite.DESCRIPTION,
    extendedDescription: STRINGS.invite.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            if (!WhatsAppBot.isGroup) {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    STRINGS.general.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            }
            await client.getGroupMetaData(WhatsAppBot.chatId, WhatsAppBot);
            if (!WhatsAppBot.isBotGroupAdmin) {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    STRINGS.general.BOT_NOT_ADMIN,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            }
            const code = await client.sock.groupInviteCode(WhatsAppBot.chatId);
            if (WhatsAppBot.isTextReply) {
                client.sendMessage(
                    chat.message.extendedTextMessage.contextInfo.participant,
                    "https://chat.whatsapp.com/" + code,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                client.sendMessage(
                    WhatsAppBot.chatId,
                    STRINGS.invite.LINK_SENT,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            }
            client.sendMessage(
                WhatsAppBot.chatId,
                "https://chat.whatsapp.com/" + code,
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
            return;
        } catch (err) {
            await inputSanitization.handleError(err, client, WhatsAppBot);
        }
    },
};
