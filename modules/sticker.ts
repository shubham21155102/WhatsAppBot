import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import inputSanitization from "../sidekick/input-sanitization";
import { MessageType } from "../sidekick/message-type";
import Strings from "../lib/db";
import Client from "../sidekick/client";
import { downloadContentFromMessage, proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { Transform } from "stream";
import { Sticker, Categories, StickerTypes } from 'wa-sticker-formatter'

const STICKER = Strings.sticker;

function getStickerType(arg: string): StickerTypes {
    if (Object.values(StickerTypes).includes(arg as StickerTypes)) {
        return arg as StickerTypes;
    }
    return StickerTypes.FULL;
}

export = {
    name: "sticker",
    description: STICKER.DESCRIPTION,
    extendedDescription: STICKER.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        // Task starts here
        try {
            // Function to convert media to sticker
            const convertToSticker = async (imageId: string, replyChat: { message: any; type: any; }, metadata: any): Promise<void> => {
                const fileName: string = "./tmp/convert_to_sticker-" + imageId;
                const stream: Transform = await downloadContentFromMessage(replyChat.message, replyChat.type);
                await inputSanitization.saveBuffer(fileName, stream);
                const stickerPath: string = "./tmp/st-" + imageId + ".webp";

                // if user sent arguments use wa-sticker-formatter to create stickers, else use the old method
                if (metadata.args_length > 0) {
                    const stickerMeta = new Sticker(fileName, {
                        categories: metadata.categories,
                        type: metadata.type,
                        pack: metadata.pack_name,
                        author: metadata.author_name,
                    })
                    await stickerMeta.toFile(stickerPath)

                    await client.sendMessage(
                        WhatsAppBot.chatId,
                        fs.readFileSync(stickerPath),
                        MessageType.sticker
                    ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                    await inputSanitization.deleteFiles(
                        fileName,
                        stickerPath
                    );
                    return;
                }

                // ==== previous code as a backup =====
                // If is an image
                if (WhatsAppBot.type === "image" || WhatsAppBot.isReplyImage) {
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
                        })
                        .on('error', async (err: any) => {
                            inputSanitization.handleError(err, client, WhatsAppBot)

                        });
                    return;
                }
                // If is a video
                ffmpeg(fileName)
                    .duration(8)
                    .outputOptions([
                        "-y",
                        "-vcodec libwebp",
                        "-lossless 1",
                        "-qscale 1",
                        "-preset default",
                        "-loop 0",
                        "-an",
                        "-vsync 0",
                        "-s 600x600",
                    ])
                    .videoFilters(
                        "scale=600:600:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=600:600:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1"
                    )
                    .save(stickerPath)
                    .on("end", async (err: any) => {
                        await client.sendMessage(
                            WhatsAppBot.chatId,
                            fs.readFileSync(stickerPath),
                            MessageType.sticker
                        ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                        await inputSanitization.deleteFiles(fileName, stickerPath);

                    })
                    .on('error', async (err: any) => {
                        inputSanitization.handleError(err, client, WhatsAppBot)

                    });
                return;
            };

            // Get metadata from args (optional)
            const arg_emojis: Categories[] = [];
            if (args.length > 0) {
                for (let i = 0; i < args[0].split(",").length; i++) {
                    arg_emojis.push(args[0].split(",")[i] as Categories);
                }
            }
            let metadata = {
                args_length: args.length,
                categories: args[0] != "null" ? arg_emojis : [],
                type: args[1] != "null" ? getStickerType(args[1]) : StickerTypes.FULL,
                pack_name: args[2] ?? '',
                author_name: args[3] ?? ''
            }

            // User sends media message along with command in caption
            if (WhatsAppBot.isImage || WhatsAppBot.isGIF || WhatsAppBot.isVideo) {
                var replyChatObject = {
                    message: (WhatsAppBot.type === 'image' ? chat.message.imageMessage : chat.message.videoMessage),
                    type: WhatsAppBot.type
                };
                var imageId: string = chat.key.id;
                convertToSticker(imageId, replyChatObject, metadata);
            }
            // Replied to an image , gif or video
            else if (
                WhatsAppBot.isReplyImage ||
                WhatsAppBot.isReplyGIF ||
                WhatsAppBot.isReplyVideo
            ) {
                var replyChatObject = {
                    message: (WhatsAppBot.isReplyImage ? chat.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage : chat.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage),
                    type: (WhatsAppBot.isReplyImage ? 'image' : 'video')
                };
                var imageId: string =
                    chat.message.extendedTextMessage.contextInfo.stanzaId;
                convertToSticker(imageId, replyChatObject, metadata);
            } else {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    STICKER.TAG_A_VALID_MEDIA_MESSAGE,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
            }
            return;
        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                WhatsAppBot,
                STICKER.TAG_A_VALID_MEDIA_MESSAGE
            );
        }
    },
};