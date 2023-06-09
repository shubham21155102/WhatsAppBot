import Strings from "../lib/db";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization";
import Blacklist from "../database/blacklist";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const rbl = Strings.rbl;

module.exports = {
    name: "rbl",
    description: rbl.DESCRIPTION,
    extendedDescription: rbl.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".rbl" },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            if (WhatsAppBot.isPm && WhatsAppBot.fromMe) {
                let PersonToRemoveFromBlacklist = WhatsAppBot.chatId;
                if (!(await Blacklist.getBlacklistUser(PersonToRemoveFromBlacklist, ""))) {
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        format(rbl.NOT_IN_BLACKLIST, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                }
                Blacklist.removeBlacklistUser(PersonToRemoveFromBlacklist, "");
                client.sendMessage(
                    WhatsAppBot.chatId,
                    format(rbl.PM_ACKNOWLEDGEMENT, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                    MessageType.text
                );
                return;
            } else {
                await client.getGroupMetaData(WhatsAppBot.chatId, WhatsAppBot);
                if (args.length > 0) {
                    let PersonToRemoveFromBlacklist =
                        await inputSanitization.getCleanedContact(
                            args,
                            client,
                            WhatsAppBot
                        );

                    if (PersonToRemoveFromBlacklist === undefined) return;
                    PersonToRemoveFromBlacklist += "@s.whatsapp.net";
                    if (
                        !(await Blacklist.getBlacklistUser(
                            PersonToRemoveFromBlacklist,
                            WhatsAppBot.chatId
                        ))
                    ) {
                        client.sendMessage(
                            WhatsAppBot.chatId,
                            format(rbl.NOT_IN_BLACKLIST, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.removeBlacklistUser(
                        PersonToRemoveFromBlacklist,
                        WhatsAppBot.chatId
                    );
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        format(rbl.GRP_ACKNOWLEDGEMENT, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                } else if (WhatsAppBot.isTextReply) {
                    let PersonToRemoveFromBlacklist = WhatsAppBot.replyParticipant;
                    if (
                        !(await Blacklist.getBlacklistUser(
                            PersonToRemoveFromBlacklist,
                            WhatsAppBot.chatId
                        ))
                    ) {
                        client.sendMessage(
                            WhatsAppBot.chatId,
                            format(rbl.NOT_IN_BLACKLIST, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.removeBlacklistUser(
                        PersonToRemoveFromBlacklist,
                        WhatsAppBot.chatId
                    );
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        format(rbl.GRP_ACKNOWLEDGEMENT, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                } else {
                    if (
                        !(await Blacklist.getBlacklistUser("", WhatsAppBot.chatId))
                    ) {
                        client.sendMessage(
                            WhatsAppBot.chatId,
                            format(rbl.NOT_IN_BLACKLIST, WhatsAppBot.groupName),
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.removeBlacklistUser("", WhatsAppBot.chatId);
                    client.sendMessage(
                        WhatsAppBot.chatId,
                        format(rbl.GRP_BAN, WhatsAppBot.groupName),
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
