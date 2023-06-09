import inputSanitization from "../sidekick/input-sanitization";
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client.js";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";

module.exports = {
    name: "tagall",
    description: STRINGS.tagall.DESCRIPTION,
    extendedDescription: STRINGS.tagall.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".tagall",
            ".tagall Hey everyone! You have been tagged in this message hehe.",
        ],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            if(WhatsAppBot.chatId === "917838204238-1632576208@g.us"){
                return; // Disable this for Spam Chat
            }
            if (!WhatsAppBot.isGroup) {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    STRINGS.general.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            }
            await client.getGroupMetaData(WhatsAppBot.chatId, WhatsAppBot);
            let members = [];
            for (var i = 0; i < WhatsAppBot.groupMembers.length; i++) {
                members[i] = WhatsAppBot.groupMembers[i].id;
            }
            if (WhatsAppBot.isTextReply) {
                let quote = await client.store.loadMessage(WhatsAppBot.chatId, WhatsAppBot.replyMessageId, undefined);
                await client.sock.sendMessage(
                    WhatsAppBot.chatId,
                    {
                        text: STRINGS.tagall.TAG_MESSAGE,
                        mentions: members
                    },
                    {
                        quoted: quote
                    }
                )
                // client.sendMessage(
                //     WhatsAppBot.chatId,
                //     STRINGS.tagall.TAG_MESSAGE,
                //     MessageType.text,
                //     {
                //         contextInfo: {
                //             stanzaId: WhatsAppBot.replyMessageId,
                //             participant: WhatsAppBot.replyParticipant,
                //             quotedMessage: {
                //                 conversation: WhatsAppBot.replyMessage,
                //             },
                //             mentionedJid: members,
                //         },
                //     }
                // ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            }
            if (args.length) {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    WhatsAppBot.body.replace(
                        WhatsAppBot.body[0] + WhatsAppBot.commandName + " ",
                        ""
                    ),
                    MessageType.text,
                    {
                        contextInfo: {
                            mentionedJid: members,
                        },
                    }
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            }

            client.sendMessage(
                WhatsAppBot.chatId,
                STRINGS.tagall.TAG_MESSAGE,
                MessageType.text,
                {
                    contextInfo: {
                        mentionedJid: members,
                    },
                }
            ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
        } catch (err) {
            await inputSanitization.handleError(err, client, WhatsAppBot);
        }
        return;
    },
};
