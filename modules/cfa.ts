import chalk from "chalk";
import fs from "fs";
import inputSanitization from "../sidekick/input-sanitization";
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const CF = STRINGS.cfa;
module.exports = {
    name: "cfa",
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
                    MessageType.text,

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
            try {
                const puppeteer = require("puppeteer");
                // const contest = 2;
                const fs = require("fs");
                (async () => {
                    const browser = await puppeteer.launch({
                         headless: false,
                        userDataDir: '/home/shubham/pupp',
                        executablePath: '/usr/bin/google-chrome',
                        defaultViewport: null,
                        args: ["--start-maximized"],
                    });

                    const page = await browser.newPage();
                    await page.goto(`https://codeforces.com/contest/${args}/standings/friends/true`);

                    let subjects = await page.evaluate((args) => {
                        const contestStr = JSON.stringify(args);
        // const subjectElements = document.querySelectorAll("td[contestid='1840'] > span.cell-accepted");
        // const subjectElements = document.querySelectorAll("span.cell-accepted");
        const subjectElements = document.querySelectorAll(`[contestid="${contestStr}"]`);
                        const ids = Array.from(subjectElements).map(td => td.getAttribute("acceptedsubmissionid"));
                        return ids.filter(id => id);
                    });

                    //   console.log(subjects);

                    for (const data of subjects) {
                        try {
                            const fileName = `${data}.cpp`
                            await page.goto(`https://codeforces.com/contest/${args}/submission/${data}`);
                            await page.waitForSelector(".linenums");
                            const textElements = await page.evaluate(() => {
                                const olElement = document.querySelector("ol.linenums");
                                const liElements = Array.from(olElement.getElementsByTagName("li"));
                                return liElements.map(li => li.textContent.trim());
                            });
                            var contents = `${textElements.join('\n')}`;
                            await client.sendMessage(
                                WhatsAppBot.chatId,
                                contents,
                                // fs.readFileSync(`tmp/${args}.xlsx`),
                                MessageType.text,
                            ).catch(err =>
                                inputSanitization.handleError(err, client, WhatsAppBot)
                                // console.log(err)
                            );
                            console.log(textElements);
                        } catch (err) {
                            console.log(err);
                        }
                    }

                    await browser.close();
                })();
            } catch (err) {
                console.log(err);
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
