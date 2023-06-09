import inputSanitization from "../sidekick/input-sanitization";
import Strings from "../lib/db";
import { Encoder, QRByte, ErrorCorrectionLevel } from "@nuintun/qrcode";
import fs from "fs";
import Client from "../sidekick/client.js";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";
const QR = Strings.qr;

module.exports = {
    name: "qr",
    description: QR.DESCRIPTION,
    extendedDescription: QR.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".qr Hey, I am WhatsAppBot." },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            if (args.length === 0 && !WhatsAppBot.isTextReply) {
                await client
                    .sendMessage(WhatsAppBot.chatId, QR.INVALID_INPUT, MessageType.text)
                    .catch((err) => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            }

            let message: string;
            if (!WhatsAppBot.isTextReply) {
                message = args.join(" ");
            } else {
                message = WhatsAppBot.replyMessage;
            }

            const qrcode: Encoder = new Encoder();

            qrcode.setEncodingHint(true);
            qrcode.setErrorCorrectionLevel(ErrorCorrectionLevel.Q);
            qrcode.write(new QRByte(message));
            qrcode.make();
            const output: string = qrcode.toDataURL().split(",")[1];

            const imagePath = "./tmp/qr.png";
            fs.writeFileSync(
                imagePath,
                output,
                { encoding: "base64" }
            );

            await client.sendMessage(
                WhatsAppBot.chatId,
                fs.readFileSync(imagePath),
                MessageType.image,
                {
                    caption: QR.IMAGE_CAPTION,
                }).catch((err) =>
                    inputSanitization.handleError(err, client, WhatsAppBot)
                );

            inputSanitization.deleteFiles(imagePath);
            return;

        } catch (err) {
            await inputSanitization.handleError(err, client, WhatsAppBot);
        }
    }
};
