import chalk from "chalk";
import fs from "fs";
const Excel = require('exceljs');
const http = require("https");
const timeStamp = require("unix-timestamp");
import inputSanitization from "../sidekick/input-sanitization";
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const CF = STRINGS.cfs;
module.exports = {
    name: "cfs",
    description: CF.DESCRIPTION,
    extendedDescription: CF.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".cf neal",
        ],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, WhatsAppBot: WhatsAppBot, args: string[]): Promise<void> {
        try {
            if (args.length == 0) {
                await client.sendMessage(
                    WhatsAppBot.chatId,
                    CF.ENTER_USER,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, WhatsAppBot));
                return;
            }
            var reply = await client.sendMessage(
                WhatsAppBot.chatId,
                CF.FETCHING,
                MessageType.text
            );
            var Id = " ";
            console.log(args);
            var data = "";
            try {
                const filePath = `/home/shubham/competete/${args}.cpp`;
                const fileContent = fs.readFileSync(filePath, "utf8");
                // const boldContent = `*${fileContent}*`
                const lines = fileContent.split("\n");
                const formattedText = lines.map((line) => `*${line.trim()}*`).join("\n");
                // console.log(boldContent)
                await client.sendMessage(
                    WhatsAppBot.chatId,
                    formattedText,
                    MessageType.text
                );
            } catch (err) {
                console.error(err);
                // Handle the error if the message sending fails
            }
        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                WhatsAppBot,
                CF.USER_NOT_FOUND,
            );
        }
    },
};

