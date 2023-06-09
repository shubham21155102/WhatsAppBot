import yts from "yt-search";
import inputSanitization from "../sidekick/input-sanitization";
import Strings from "../lib/db";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const YT = Strings.yt;

module.exports = {
    name: "yt",
    description: YT.DESCRIPTION,
    extendedDescription: YT.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".yt WhatsAppBot Deployment Tutorial" },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            if(args.length === 0){
                await client.sendMessage(
                    WhatsAppBot.chatId,
                    YT.ENTER_INPUT,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            }
            const keyword = await yts(args.join(" "));
            const videos = keyword.videos.slice(0, 10);
            var topRequests = "";
            var num = 1;
            var reply = await client.sendMessage(
                WhatsAppBot.chatId,
                YT.REPLY,
                MessageType.text
            );

            videos.forEach(function (links) {
                topRequests =
                    topRequests +
                    `*${num}.)* ${links.title} (${links.timestamp}) | *${links.author.name}* | ${links.url}\n\n`;
                num++;
            });

            if (topRequests === "") {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    YT.NO_VIDEOS,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                await client.deleteMessage(WhatsAppBot.chatId, {
                    id: reply.key.id,
                    remoteJid: WhatsAppBot.chatId,
                    fromMe: true,
                });
                return;
            }

            await client.sendMessage(WhatsAppBot.chatId, topRequests, MessageType.text).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
            await client.deleteMessage(WhatsAppBot.chatId, {
                id: reply.key.id,
                remoteJid: WhatsAppBot.chatId,
                fromMe: true,
            });
        } catch (err) {
            await client.sendMessage(
                WhatsAppBot.chatId,
                YT.NO_VIDEOS,
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
            await client.deleteMessage(WhatsAppBot.chatId, {
                id: reply.key.id,
                remoteJid: WhatsAppBot.chatId,
                fromMe: true,
            });
            return;
        }
    },
};
