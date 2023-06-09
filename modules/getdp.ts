import inputSanitization from "../sidekick/input-sanitization";
import fs from "fs";
import Strings from "../lib/db";
import Client from "../sidekick/client.js";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";
const GETDP = Strings.getdp;  

module.exports = {
    name: "getdp",
    description: GETDP.DESCRIPTION,
    extendedDescription: GETDP.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".getdp" },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        const getDp = async (jid: string) => {
            let url: string;
            try {
                url = await client.sock.profilePictureUrl(jid, "image");
            } catch {
                try {
                    url = await client.sock.profilePictureUrl(jid);
                } catch(err) {
                    if (err.data === 404 || err.data === 401) {
                        return err;
                    } else {
                        console.log('Error in getting profile pic - ' + console.log(err));
                    }
                }
            }
            return url;
        };

        try {
            let url: string;
            if (!args[0]) {
                url = await getDp(WhatsAppBot.chatId);
            } else {
                let jid: string = args[0].split("@")[1] + "@s.whatsapp.net";
                url = await getDp(jid);
            }

            if(typeof(url) === 'object'){
                await client.sendMessage(
                    WhatsAppBot.chatId,
                    fs.readFileSync("./images/default_dp.png"),
                    MessageType.image,
                    {
                        caption: "```This is the display picture visible to me. :P```",
                    }
                );
                return;
            }

            await client.sendMessage(
                WhatsAppBot.chatId,
                { url: url },
                MessageType.image,
                {
                    caption: GETDP.IMAGE_CAPTION
                }
            );
            return
        } catch (err) {
            await inputSanitization.handleError(err, client, WhatsAppBot);
            return;
        }
    },
};
