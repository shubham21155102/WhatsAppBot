import inputSanitization from "../sidekick/input-sanitization";
import String from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const REPLY = String.promote;

module.exports = {
    name: "promote",
    description: REPLY.DESCRIPTION,
    extendedDescription: REPLY.EXTENDED_DESCRIPTION,
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            if (!WhatsAppBot.isGroup) {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    REPLY.NOT_A_GROUP,
                    MessageType.text
                );
                return;
            }
            await client.getGroupMetaData(WhatsAppBot.chatId, WhatsAppBot);
            if (!WhatsAppBot.isBotGroupAdmin) {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    REPLY.BOT_NOT_ADMIN,
                    MessageType.text
                );
                return;
            }
            if (!WhatsAppBot.isTextReply && typeof args[0] == "undefined") {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    REPLY.MESSAGE_NOT_TAGGED,
                    MessageType.text
                );
                return;
            }
            const reply = chat.message.extendedTextMessage;

            if (WhatsAppBot.isTextReply) {
                var contact = reply.contextInfo.participant.split("@")[0];
            } else {
                var contact = await inputSanitization.getCleanedContact(
                    args,
                    client,
                    WhatsAppBot
                );
            }

            var admin = false;
            var isMember = await inputSanitization.isMember(
                contact,
                WhatsAppBot.groupMembers
            );
            for (const index in WhatsAppBot.groupMembers) {
                if (contact == WhatsAppBot.groupMembers[index].id.split("@")[0]) {
                    admin = WhatsAppBot.groupMembers[index].admin != undefined;
                }
            }
            if (isMember) {
                if (!admin) {
                    const arr = [contact + "@s.whatsapp.net"];
                    await client.sock.groupParticipantsUpdate(WhatsAppBot.chatId, arr, 'promote');
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        "*" + contact + " promoted to admin*",
                        MessageType.text
                    );
                } else {
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        "*" + contact + " is already an admin*",
                        MessageType.text
                    );
                }
            }
            if (!isMember) {
                if (contact === undefined) {
                    return;
                }

                client.sendMessage(
                    WhatsAppBot.chatId,
                    REPLY.PERSON_NOT_IN_GROUP,
                    MessageType.text
                );
                return;
            }
        } catch (err) {
            if (err === "NumberInvalid") {
                await inputSanitization.handleError(
                    err,
                    client,
                    WhatsAppBot,
                    "```Invalid number ```" + args[0]
                );
            } else {
                await inputSanitization.handleError(err, client, WhatsAppBot);
            }
        }
    },
};
