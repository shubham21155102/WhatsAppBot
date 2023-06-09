import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type"
import inputSanitization from "../sidekick/input-sanitization";
import Strings from "../lib/db";
const Reply = Strings.unblock;

module.exports = {
    name: "unblock",
    description: Reply.DESCRIPTION,
    extendedDescription: Reply.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try{
            if (!WhatsAppBot.isTextReply && typeof args[0] == "undefined") {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    Reply.MESSAGE_NOT_TAGGED,
                    MessageType.text
                );
                return;
            }
            const reply = chat.message.extendedTextMessage;
            var contact = "";
            if (!(args.length > 0)) {
                contact = reply.contextInfo.participant.split("@")[0];
            } else {
                contact = await inputSanitization.getCleanedContact(
                    args,
                    client,
                    WhatsAppBot
                );
            }

            if (contact === WhatsAppBot.owner.split("@")[0]) {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    Reply.NOT_UNBLOCK_BOT,
                    MessageType.text
                );
                return;
            }

            if(contact === ""){
                client.sendMessage(
                    WhatsAppBot.chatId,
                    Reply.MESSAGE_NOT_TAGGED,
                    MessageType.text
                );
                return;
            }
                var JID = contact + "@s.whatsapp.net";
                client.sock.updateBlockStatus(JID, "unblock");
                client.sendMessage(
                    WhatsAppBot.chatId,
                    "*" + contact + " unblocked successfully.*",
                    MessageType.text
                );

        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                WhatsAppBot,
                Reply.MESSAGE_NOT_TAGGED
            );
        }
    },
};