import Client from "../sidekick/client.js";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";
import got, {Response} from "got";
import inputSanitization from "../sidekick/input-sanitization";
import STRINGS from "../lib/db";

const songlyrics = require("songlyrics").default;

module.exports = {
    name: "lyrics",
    description: STRINGS.lyrics.DESCRIPTION,
    extendedDescription: STRINGS.lyrics.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".lyrics Stairway to heaven" },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        const processing: proto.WebMessageInfo = await client.sendMessage(
            WhatsAppBot.chatId,
            STRINGS.lyrics.PROCESSING,
            MessageType.text
        );
        try {
            var song: string = "";
            if (WhatsAppBot.isTextReply) {
                song = WhatsAppBot.replyMessage;
            } else if (args.length == 0) {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    STRINGS.lyrics.NO_ARG,
                    MessageType.text
                );
                return;
            } else {
                song = args.join(" ");
            }
            let Response: Response<string> = await got(
                `https://some-random-api.ml/lyrics/?title=${song}`
            );
            let data = JSON.parse(Response.body);
            let caption: string =
                "*Title :* " +
                data.title +
                "\n*Author :* " +
                data.author +
                "\n*Lyrics :*\n" +
                data.lyrics;

            try {
                await client.sendMessage(
                    WhatsAppBot.chatId,
                    { url: data.thumbnail.genius },
                    MessageType.image,
                    {
                        caption: caption,
                    }
                );
            } catch (err) {
                client.sendMessage(WhatsAppBot.chatId, caption, MessageType.text);
            }
            await client.deleteMessage(WhatsAppBot.chatId, {
                id: processing.key.id,
                remoteJid: WhatsAppBot.chatId,
                fromMe: true,
            });
            // return;
        } catch (err) {
            try{
                let data = await songlyrics(song)
                let caption: string =
                    "*Title :* " +
                    song +
                    "\n*Source :* " +
                    data.source.link +
                    "\n*Lyrics :*\n" +
                    data.lyrics;
    
                await client.sendMessage(WhatsAppBot.chatId, caption, MessageType.text);
                await client.deleteMessage(WhatsAppBot.chatId, {
                    id: processing.key.id,
                    remoteJid: WhatsAppBot.chatId,
                    fromMe: true,
                });
            }catch(err){
                await inputSanitization.handleError(
                    err,
                    client,
                    WhatsAppBot,
                    STRINGS.lyrics.NOT_FOUND
                );
                return await client.deleteMessage(WhatsAppBot.chatId, {
                    id: processing.key.id,
                    remoteJid: WhatsAppBot.chatId,
                    fromMe: true,
                });
            }
        }
    },
};
