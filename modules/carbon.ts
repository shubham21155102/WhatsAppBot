import chalk from "chalk";
import String from "../lib/db.js";
import * as Carbon from "unofficial-carbon-now";
import inputSanitization from "../sidekick/input-sanitization";
import format from "string-format";
import Client from "../sidekick/client.js";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";

const CARBON = String.carbon;

module.exports = {
    name: "carbon",
    description: CARBON.DESCRIPTION,
    extendedDescription: CARBON.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".carbon Hi! Welcome to WhatsAppBot.",
            '.carbon #include <iostream> \nint main() \n{\n   std::cout << "Hello WhatsAppBot!"; \n   return 0;\n} -t yeti',
            ".carbon -t",
        ],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            let themes: string[] = [
                "3024 night",
                "a11y dark",
                "blackboard",
                "base 16 (dark)",
                "base 16 (light)",
                "cobalt",
                "duotone",
                "hopscotch",
                "lucario",
                "material",
                "monokai",
                "night owl",
                "nord",
                "oceanic next",
                "one light",
                "one dark",
                "panda",
                "paraiso",
                "seti",
                "shades of purple",
                "solarized (dark)",
                "solarized (light)",
                "synthwave '84",
                "twilight",
                "verminal",
                "vscode",
                "yeti",
                "zenburn",
            ];
            let code: string = "";
            let themeInput: string;
            if (args[0] == null && !WhatsAppBot.isTextReply) {
                await client.sendMessage(
                    WhatsAppBot.chatId,
                    CARBON.NO_INPUT,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            } else if (WhatsAppBot.isTextReply && !WhatsAppBot.replyMessage) {
                await client.sendMessage(
                    WhatsAppBot.chatId,
                    CARBON.INVALID_REPLY,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            } else if (WhatsAppBot.isTextReply) {
                code = WhatsAppBot.replyMessage;
                themeInput = themes[Math.floor(Math.random() * themes.length)];
            } else {
                try {
                    let text: string = WhatsAppBot.body.replace(
                        WhatsAppBot.body[0] + WhatsAppBot.commandName + " ",
                        ""
                    );
                    if (text[0] === "-" && text[1] === "t") {
                        if(text[2] == null){
                            let counter: number = 1;
                            let message: string = 'Available themes: ';
                            themes.forEach((theme) => {
                                message += `\n${counter}. ${theme}`;
                                counter += 1;
                            })
                            await client.sendMessage(
                                WhatsAppBot.chatId,
                                "```" + message + "```",
                                MessageType.text
                            )
                            return;
                        }
                        else{
                            await client.sendMessage(
                                WhatsAppBot.chatId,
                                CARBON.NO_INPUT,
                                MessageType.text
                            ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                            return;
                        }
                    }
                    let body: string[] = WhatsAppBot.body.split("-t");
                    code = body[0].replace(
                        WhatsAppBot.body[0] + WhatsAppBot.commandName + " ",
                        ""
                    );
                    themeInput = body[1].substring(1);
                    if (!themes.includes(themeInput)) {
                        await client.sendMessage(
                            WhatsAppBot.chatId,
                            CARBON.INVALID_THEME,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                        return;
                    }
                } catch (err) {
                    if (err instanceof TypeError) {
                        code = WhatsAppBot.body.replace(
                            WhatsAppBot.body[0] + WhatsAppBot.commandName + " ",
                            ""
                        );
                        themeInput =
                            themes[Math.floor(Math.random() * themes.length)];
                    }
                }
            }
            try {
                const processing: proto.WebMessageInfo = await client.sendMessage(
                    WhatsAppBot.chatId,
                    CARBON.CARBONIZING,
                    MessageType.text
                );
                const carbon = new Carbon.createCarbon()
                    .setCode(code)
                    .setPrettify(true)
                    .setTheme(themeInput);
                const output = await Carbon.generateCarbon(carbon);
                await client.sendMessage(
                    WhatsAppBot.chatId,
                    output,
                    MessageType.image,
                    {
                        caption: format(CARBON.OUTPUT, themeInput),
                    }
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return await client.deleteMessage(WhatsAppBot.chatId, {
                    id: processing.key.id,
                    remoteJid: WhatsAppBot.chatId,
                    fromMe: true,
                });
            } catch (err) {
                throw err;
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, WhatsAppBot);
        }
    },
};
