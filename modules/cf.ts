import chalk from "chalk";
import fs from "fs";
import Excel from "exceljs";
import http from "https"
import inputSanitization from "../sidekick/input-sanitization";
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import WhatsAppBot from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const CF = STRINGS.cf;
module.exports = {
    name: "cf",
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
                const handle = args;
                const options = {
                    "method": "GET",
                    "hostname": "codeforces.com",
                    "port": null,
                    "path": `/api/user.status?handle=${args}`,
                    "headers": {
                        "Accept": "*/*",
                    }
                };
                const req = http.request(options, function (res) {
                    const chunks = [];

                    res.on("data", function (chunk) {
                        chunks.push(chunk);
                    });

                    res.on("end", async function () {
                        const body = Buffer.concat(chunks);
                        const n = body.toString();
                        const k = JSON.parse(n);
                        async function exTest() {
                            const workbook = new Excel.Workbook();
                            const worksheet = workbook.addWorksheet(`${args}`);

                            worksheet.columns = [
                                { header: 'Contest ID', key: 'contestid', width: 8 },
                                { header: 'I', key: 'index', width: 2 },
                                { header: 'ProblemName', key: 'problem', width: 25 },
                                { header: 'Rating', key: 'rating', width: 7 },
                                { header: 'Link', key: 'link', width: 45 },
                                { header: 'Tags', key: 'tags', width: 15 },
                                { header: 'Language', key: 'lang', width: 5 },
                                { header: 'timeTaken', key: 'tmtk', width: 5 },
                                { header: 'TestCases', key: 'tc', width: 5 },
                                { header: 'Code', key: 'code', width: 80 },
                            ];
                            k.result.forEach(element => {
                                if (element.verdict == "OK") {
                                    worksheet.addRow({
                                        contestid: element.problem.contestId,
                                        index: element.problem.index,
                                        problem: element.problem.name,
                                        rating: element.problem.rating,
                                        link: `https://codeforces.com/problemset/problem/${element.problem.contestId}/${element.problem.index}`,
                                        tags: element.problem.tags,
                                        lang: element.programmingLanguage,
                                        tmtk: element.timeConsumedMillis + "ms",
                                        tc: element.passedTestCount,
                                        code: `https://codeforces.com/contest/${element.contestId}/submission/${element.id}`,
                                    });
                                }
                            });

                            await workbook.xlsx.writeFile(`tmp/${args}.xlsx`);

                            // Send reply after file generation
                            const fileContent = fs.readFileSync(`tmp/${args}.xlsx`);
                            await client.sendMessage(
                                WhatsAppBot.chatId,
                                fileContent,
                                // fs.readFileSync(`tmp/${args}.xlsx`),
                                MessageType.document,
                            ).catch(err =>
                                inputSanitization.handleError(err, client, WhatsAppBot)
                                // console.log(err)
                            );
                            inputSanitization.deleteFiles(`tmp/${args}.xlsx`);

                            console.log("File is written");
                        };

                        await exTest();
                    });
                });

                req.end();
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
