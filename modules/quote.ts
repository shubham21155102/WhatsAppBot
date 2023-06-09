import Strings from "../lib/db";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization";
import { MessageType } from "../sidekick/message-type";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import Axios from "axios";
import { writeFile } from 'fs/promises';
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
const quote = Strings.quote;

export = {
    name: "quote",
    description: quote.DESCRIPTION,
    extendedDescription: quote.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false, },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            if (!WhatsAppBot.isTextReply || (WhatsAppBot.isTextReply && !WhatsAppBot.replyMessage)) {
                await client.sendMessage(
                    WhatsAppBot.chatId,
                    quote.NO_REPLY,
                    MessageType.text
                )
                return;
            }
            var downloading: proto.WebMessageInfo = await client.sendMessage(
                WhatsAppBot.chatId,
                quote.PROCESSING,
                MessageType.text
            );
            console.log(JSON.stringify(chat));
            const contact = client.store?.contacts[WhatsAppBot.replyParticipant] || undefined;
            let quotedReply = WhatsAppBot.replyMessage.replace(/```/g, '');
            let name = contact?.name || contact?.notify || (WhatsAppBot.replyParticipant === WhatsAppBot.owner ? client.sock.user.name : WhatsAppBot.replyParticipant.split("@")[0]);
            let fileName = './tmp/quote-' + chat.key.id;
            let stickerPath = './tmp/quote-' + chat.key.id + ".webp";
            let url: String;
            try {
                url = await client.sock.profilePictureUrl(WhatsAppBot.replyParticipant, "image");
            } catch (err) {
                try {
                    url = await client.sock.profilePictureUrl(WhatsAppBot.replyParticipant);
                } catch {
                    if (err.data === 404 || err.data === 401) {
                        url = "https://i.imgur.com/vjLIqgO.png";
                    } else {
                        await inputSanitization.handleError(err, client, WhatsAppBot);
                    }
                }
            }
            let img = await getQuotly(quotedReply, name, url);
            await writeFile(fileName, img);
            ffmpeg(fileName)
                .outputOptions(["-y", "-vcodec libwebp"])
                .videoFilters(
                    "scale=2000:2000:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=2000:2000:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1"
                )
                .save(stickerPath)
                .on("end", async () => {
                    await client.sendMessage(
                        WhatsAppBot.chatId,
                        fs.readFileSync(stickerPath),
                        MessageType.sticker
                    ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                    await inputSanitization.deleteFiles(
                        fileName,
                        stickerPath
                    );
                    await client.deleteMessage(WhatsAppBot.chatId, {
                        id: downloading.key.id,
                        remoteJid: WhatsAppBot.chatId,
                        fromMe: true,
                    }).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                })
                .on('error', async (err: any) => {
                    inputSanitization.handleError(err, client, WhatsAppBot)
                    await client.deleteMessage(WhatsAppBot.chatId, {
                        id: downloading.key.id,
                        remoteJid: WhatsAppBot.chatId,
                        fromMe: true,
                    }).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                });
        } catch (err) {
            await client.deleteMessage(WhatsAppBot.chatId, {
                id: downloading.key.id,
                remoteJid: WhatsAppBot.chatId,
                fromMe: true,
            }).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
            await inputSanitization.handleError(err, client, WhatsAppBot);
        }
    },
};

const getQuotly = async (text: String, name: Object, url: String) => {
    let body = {
        "type": "quote",
        "format": "webp",
        "backgroundColor": "#1b1429",
        "width": 512,
        "height": 512,
        "scale": 2,
        "messages": [
            {
                "avatar": true,
                "from": {
                    "first_name": name,
                    "language_code": "en",
                    "name": name,
                    "photo": {
                        "url": url
                    }
                },
                "text": text,
                "replyMessage": {}
            }
        ]
    }
    let res = await Axios.post('https://bot.lyo.su/quote/generate', body);
    return Buffer.alloc(res.data.result.image.length, res.data.result.image, "base64");
}