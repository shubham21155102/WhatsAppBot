import Strings from "../lib/db";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization";
import Blacklist from "../database/blacklist";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const abl = Strings.abl;

module.exports = {
    name: "abl",
    description: abl.DESCRIPTION,
    extendedDescription: abl.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".abl" },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            if (WhatsAppBot.isPm && WhatsAppBot.fromMe) {
                let PersonToBlacklist = WhatsAppBot.chatId;
                Blacklist.addBlacklistUser(PersonToBlacklist, "");
                client.sendMessage(
                    WhatsAppBot.chatId,
                    format(abl.PM_ACKNOWLEDGEMENT, PersonToBlacklist.substring(0, PersonToBlacklist.indexOf("@"))),
                    MessageType.text
                );
                return;
            } else {
                await client.getGroupMetaData(WhatsAppBot.chatId, WhatsAppBot);
                if (args.length > 0) {
                    let PersonToBlacklist = await inputSanitization.getCleanedContact(
                        args,
                        client,
                        WhatsAppBot);
                    if (PersonToBlacklist === undefined) return;
                    PersonToBlacklist += "@s.whatsapp.net";
                    if (WhatsAppBot.owner === PersonToBlacklist) {
                        client.sendMessage(
                            WhatsAppBot.chatId,
                            abl.CAN_NOT_BLACKLIST_BOT,
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.addBlacklistUser(
                        PersonToBlacklist,
                        WhatsAppBot.chatId
                    );
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        format(abl.GRP_ACKNOWLEDGEMENT, PersonToBlacklist.substring(0, PersonToBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                } else if (WhatsAppBot.isTextReply) {
                    let PersonToBlacklist = WhatsAppBot.replyParticipant;
                    if (WhatsAppBot.owner === PersonToBlacklist) {
                        client.sendMessage(
                            WhatsAppBot.chatId,
                            abl.CAN_NOT_BLACKLIST_BOT,
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.addBlacklistUser(
                        PersonToBlacklist,
                        WhatsAppBot.chatId
                    );
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        format(abl.GRP_ACKNOWLEDGEMENT, PersonToBlacklist.substring(0, PersonToBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                } else {
                    Blacklist.addBlacklistUser("", WhatsAppBot.chatId);
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        format(abl.GRP_BAN, WhatsAppBot.groupName),
                        MessageType.text
                    );
                    return;
                }
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, WhatsAppBot);
        }
    },
};
