import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import inputSanitization from "../sidekick/input-sanitization";
import Strings from "../lib/db";
import Client from "../sidekick/client";
import { downloadContentFromMessage, MediaType, proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { JSDOM } from "jsdom";
import { Transform } from "stream";
const { window } = new JSDOM();
const rename = Strings.rename;

module.exports = {
    name: "rename",
    description: rename.DESCRIPTION,
    extendedDescription: rename.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        // Task starts here
        try {
            var startTime = window.performance.now();

            // Function to convert media to sticker
            const changeName = async (
                replyChat,
                mediaType: string,
                mimetype,
                title
            ) => {
                try{
                    let mediaKey: any = mediaType.substring(
                        0,
                        mediaType.indexOf("Message")
                    );
                    var downloading = await client
                        .sendMessage(
                            WhatsAppBot.chatId,
                            rename.DOWNLOADING,
                            MessageType.text
                        );
                    const updatedName = args.join(" ");
                    const fileName = "./tmp/" + updatedName;
                    const stream: Transform = await downloadContentFromMessage(replyChat.message[mediaType], mediaKey);
                    await inputSanitization.saveBuffer(fileName, stream);
                    var endTime = window.performance.now();
                    const time = ((endTime - startTime) / 1000).toFixed(2);
                    await client
                        .sendMessage(
                            WhatsAppBot.chatId,
                            fs.readFileSync(fileName),
                            MessageType.document,
                            {
                                mimetype: mimetype,
                                filename: updatedName,
                                caption: `WhatsAppBot changed file name from ${title} to ${updatedName} in ${time} second(s).`,
                            }
                        )
                        .catch((err) =>
                            inputSanitization.handleError(err, client, WhatsAppBot)
                        );
                    inputSanitization.deleteFiles(fileName);
                    return client
                        .deleteMessage(WhatsAppBot.chatId, {
                            id: downloading.key.id,
                            remoteJid: WhatsAppBot.chatId,
                            fromMe: true,
                        })
                        .catch((err) =>
                            inputSanitization.handleError(err, client, WhatsAppBot)
                        );
                    }catch(err){
                        await client.sendMessage(
                            WhatsAppBot.chatId,
                            rename.VALID_REPLY,
                            MessageType.text
                        );
                        return;
                    }
                };
            if (WhatsAppBot.isTextReply) {
                if (args.length < 1) {
                    await client.sendMessage(
                        WhatsAppBot.chatId,
                        rename.PROVIDE_NEW_NAME,
                        MessageType.text
                    );
                    return;
                }else if(chat.message.extendedTextMessage.contextInfo.quotedMessage.conversation){
                    await client.sendMessage(
                        WhatsAppBot.chatId,
                        rename.VALID_REPLY,
                        MessageType.text
                    );
                    return;
                }
                let replyChat = {
                    message:
                        chat.message.extendedTextMessage.contextInfo
                            .quotedMessage,
                };
                let mediaType = Object.keys(replyChat.message)[0];
                let title = replyChat.message[mediaType].title || '-no name-';
                let mimetype = replyChat.message[mediaType].mimetype;
                changeName(replyChat, mediaType, mimetype, title);
            } else {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    rename.REPLY_TO_DOCUMENT,
                    MessageType.text
                );
                return;
            }
        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                WhatsAppBot,
                rename.ERROR
            );
        }
    },
};
