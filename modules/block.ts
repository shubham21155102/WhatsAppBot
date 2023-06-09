import Strings from "../lib/db";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type"
import inputSanitization from "../sidekick/input-sanitization";
const Reply = Strings.block;

module.exports = {
    name: "block",
    description: Reply.DESCRIPTION,
    extendedDescription: Reply.EXTENDED_DESCRIPTION,
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            const reply: proto.Message.IExtendedTextMessage = chat.message.extendedTextMessage;
            var contact: string = "";
            if(args.length == 0 && !WhatsAppBot.isTextReply){
                client.sendMessage(
                    WhatsAppBot.chatId,
                    Reply.MESSAGE_NOT_TAGGED,
                    MessageType.text
                );
                return;
            }

            if (!(args.length > 0) && WhatsAppBot.isTextReply) {
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
                    Reply.NOT_BLOCK_BOT,
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
            var JID: string = contact + "@s.whatsapp.net";
            client.sock.updateBlockStatus(JID, "block");
            client.sendMessage(
                WhatsAppBot.chatId,
                "*" + contact + " blocked successfully.*",
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
