import chalk from "chalk";
import STRINGS from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";

module.exports = {
    name: "remove",
    description: STRINGS.remove.DESCRIPTION,
    extendedDescription: STRINGS.remove.EXTENDED_DESCRIPTION,
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
            let owner: string;
            for (const index in WhatsAppBot.groupMembers) {
                if (WhatsAppBot.groupMembers[index].admin === 'superadmin') {
                    owner = WhatsAppBot.groupMembers[index].id.split("@")[0];
                }
            }
            if (WhatsAppBot.isTextReply) {
                let PersonToRemove =
                    chat.message.extendedTextMessage.contextInfo.participant;
                if (PersonToRemove === owner + "@s.whatsapp.net") {
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        "*" + owner + " is the owner of the group*",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                    return;
                }
                if (PersonToRemove === WhatsAppBot.owner) {
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        "```Why man, why?! Why would you use my powers to remove myself from the group?!🥺```\n*Request Rejected.* 😤",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                    return;
                }
                var isMember = inputSanitization.isMember(
                    PersonToRemove,
                    WhatsAppBot.groupMembers
                );
                if (!isMember) {
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        "*person is not in the group*",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                }
                try {
                    if (PersonToRemove) {
                        await client.sock.groupParticipantsUpdate(WhatsAppBot.chatId, [PersonToRemove], 'remove').catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                        return;
                    }
                } catch (err) {
                    throw err;
                }
                return;
            }
            if (!args[0]) {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    STRINGS.remove.INPUT_ERROR,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            }
            if (args[0][0] == "@") {
                const number = args[0].substring(1);
                if (parseInt(args[0]) === NaN) {
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        STRINGS.remove.INPUT_ERROR,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                    return;
                }

                if((number + "@s.whatsapp.net") === WhatsAppBot.owner){
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        "```Why man, why?! Why would you use my powers to remove myself from the group?!🥺```\n*Request Rejected.* 😤",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                    return;
                }

                if (!(number === owner)) {
                    await client.sock.groupParticipantsUpdate(WhatsAppBot.chatId, [number + "@s.whatsapp.net"], 'remove').catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                    return;
                } else {
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        "*" + owner + " is the owner of the group*",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                    return;
                }
            }
            client.sendMessage(
                WhatsAppBot.chatId,
                STRINGS.remove.INPUT_ERROR,
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
        } catch (err) {
            await inputSanitization.handleError(err, client, WhatsAppBot);
            return;
        }
    },
};
