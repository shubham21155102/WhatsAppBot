import Strings from "../lib/db";
const ADMINS = Strings.admins;
import inputSanitization from "../sidekick/input-sanitization";
import Client from "../sidekick/client.js";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";

module.exports = {
    name: "admins",
    description: ADMINS.DESCRIPTION,
    extendedDescription: ADMINS.EXTENDED_DESCRIPTION,
    demo: { text: ".admins", isEnabled: true },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            if (!WhatsAppBot.isGroup) {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    ADMINS.NOT_GROUP_CHAT,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            }

            let message: string = "";
            await client.getGroupMetaData(WhatsAppBot.chatId, WhatsAppBot);
            for (let admin of WhatsAppBot.groupAdmins) {
                let number: string = admin.split("@")[0];
                message += `@${number} `;
            }

            client.sendMessage(WhatsAppBot.chatId, message, MessageType.text, {
                contextInfo: {
                    mentionedJid: WhatsAppBot.groupAdmins,
                },
            }).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
            return;
        } catch (err) {
            await inputSanitization.handleError(err, client, WhatsAppBot);
        }
    },
};
