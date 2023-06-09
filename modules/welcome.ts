import Greetings from "../database/greeting";
import inputSanitization from "../sidekick/input-sanitization";
import Strings from "../lib/db";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const WELCOME = Strings.welcome;

module.exports = {
    name: "welcome",
    description: WELCOME.DESCRIPTION,
    extendedDescription: WELCOME.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [".welcome", ".welcome off", ".welcome delete"],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            if (!WhatsAppBot.isGroup) {
                client.sendMessage(
                    WhatsAppBot.chatId,
                    WELCOME.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            }
            await client.getGroupMetaData(WhatsAppBot.chatId, WhatsAppBot);
            var Msg: any = await Greetings.getMessage(WhatsAppBot.chatId, "welcome");
            if (args.length == 0) {
                var enabled = await Greetings.checkSettings(
                    WhatsAppBot.chatId,
                    "welcome"
                );
                try {
                    if (enabled === false || enabled === undefined) {
                        client.sendMessage(
                            WhatsAppBot.chatId,
                            WELCOME.SET_WELCOME_FIRST,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                        return;
                    } else if (enabled === "OFF") {
                        await client.sendMessage(
                            WhatsAppBot.chatId,
                            WELCOME.CURRENTLY_DISABLED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                        await client.sendMessage(
                            WhatsAppBot.chatId,
                            Msg.message,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                        return;
                    }

                    await client.sendMessage(
                        WhatsAppBot.chatId,
                        WELCOME.CURRENTLY_ENABLED,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                    await client.sendMessage(
                        WhatsAppBot.chatId,
                        Msg.message,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                } catch (err) {
                    throw err;
                }
            } else {
                try {
                    if (
                        args[0] === "OFF" ||
                        args[0] === "off" ||
                        args[0] === "Off"
                    ) {
                        let switched = "OFF";
                        await Greetings.changeSettings(
                            WhatsAppBot.chatId,
                            switched
                        );
                        client.sendMessage(
                            WhatsAppBot.chatId,
                            WELCOME.GREETINGS_UNENABLED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                        return;
                    }
                    if (
                        args[0] === "ON" ||
                        args[0] === "on" ||
                        args[0] === "On"
                    ) {
                        let switched = "ON";
                        await Greetings.changeSettings(
                            WhatsAppBot.chatId,
                            switched
                        );
                        client.sendMessage(
                            WhatsAppBot.chatId,
                            WELCOME.GREETINGS_ENABLED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));

                        return;
                    }
                    if (args[0] === "delete") {
                        var Msg: any = await Greetings.deleteMessage(
                            WhatsAppBot.chatId,
                            "welcome"
                        );
                        if (Msg === false || Msg === undefined) {
                            client.sendMessage(
                                WhatsAppBot.chatId,
                                WELCOME.SET_WELCOME_FIRST,
                                MessageType.text
                            ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                            return;
                        }

                        await client.sendMessage(
                            WhatsAppBot.chatId,
                            WELCOME.WELCOME_DELETED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));

                        return;
                    }
                    let text = WhatsAppBot.body.replace(
                        WhatsAppBot.body[0] + WhatsAppBot.commandName + " ",
                        ""
                    );
                    if (Msg === false || Msg === undefined) {
                        await Greetings.setWelcome(WhatsAppBot.chatId, text);
                        await client.sendMessage(
                            WhatsAppBot.chatId,
                            WELCOME.WELCOME_UPDATED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));

                        return;
                    } else {
                        await Greetings.deleteMessage(
                            WhatsAppBot.chatId,
                            "welcome"
                        );
                        await Greetings.setWelcome(WhatsAppBot.chatId, text);
                        await client.sendMessage(
                            WhatsAppBot.chatId,
                            WELCOME.WELCOME_UPDATED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));

                        return;
                    }
                } catch (err) {
                    throw err;
                }
            }
        } catch (err) {
            inputSanitization.handleError(err, client, WhatsAppBot);
            return;
        }
    },
};
