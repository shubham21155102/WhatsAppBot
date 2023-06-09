import inputSanitization from "../sidekick/input-sanitization";
import String from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const REPLY = String.demote;

module.exports = {
    name: "demote",
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
            var owner = false;
            for (const index in WhatsAppBot.groupMembers) {
                if (contact == WhatsAppBot.groupMembers[index].id.split("@")[0]) {
                    console.log(WhatsAppBot.groupMembers[index]);
                    owner = WhatsAppBot.groupMembers[index].admin === 'superadmin';
                    admin = WhatsAppBot.groupMembers[index].admin != undefined;
                }
            }

            if (owner) {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    "*" + contact + " is the owner of the group*",
                    MessageType.text
                );
                return;
            }

            if (isMember) {
                if (admin) {
                    const arr = [contact + "@s.whatsapp.net"];
                    await client.sock.groupParticipantsUpdate(WhatsAppBot.chatId, arr, 'demote');
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        "*" + contact + " is demoted from admin*",
                        MessageType.text
                    );
                    return;
                } else {
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        "*" + contact + " was not an admin*",
                        MessageType.text
                    );
                    return;
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
            return;
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
