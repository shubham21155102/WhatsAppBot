import chalk from 'chalk';
import config from '../config';
import { adminCommands, sudoCommands } from "../sidekick/input-sanitization"
import STRINGS from "../lib/db";
import Users from '../database/user';
import format from 'string-format';
import WhatsAppBot from '../sidekick/sidekick';
import { WASocket } from '@adiwajshing/baileys';
import Client from '../sidekick/client';
import { MessageType } from '../sidekick/message-type';

const GENERAL = STRINGS.general;

const clearance = async (WhatsAppBot: WhatsAppBot, client: Client, isBlacklist: boolean): Promise<boolean> => {
    if (isBlacklist) {
        if (WhatsAppBot.isGroup) {
            await client.getGroupMetaData(WhatsAppBot.chatId, WhatsAppBot);
            if ((!WhatsAppBot.fromMe && !WhatsAppBot.isSenderSUDO && !WhatsAppBot.isSenderGroupAdmin)) {
                return false;
            }
        } else if ((!WhatsAppBot.fromMe && !WhatsAppBot.isSenderSUDO)) {
            console.log(chalk.blueBright.bold(`[INFO] Blacklisted Chat or User.`));
            return false;
        }
    }
    else if ((WhatsAppBot.chatId === "917838204238-1634977991@g.us" || WhatsAppBot.chatId === "120363020858647962@g.us" || WhatsAppBot.chatId === "120363023294554225@g.us")) {
        console.log(chalk.blueBright.bold(`[INFO] Bot disabled in Support Groups.`));
        return false;
    }
    if (WhatsAppBot.isCmd && (!WhatsAppBot.fromMe && !WhatsAppBot.isSenderSUDO)) {
        if (config.WORK_TYPE.toLowerCase() === "public") {
            if (WhatsAppBot.isGroup) {
                await client.getGroupMetaData(WhatsAppBot.chatId, WhatsAppBot);
                if (adminCommands.indexOf(WhatsAppBot.commandName) >= 0 && !WhatsAppBot.isSenderGroupAdmin) {
                    console.log(
                        chalk.redBright.bold(`[INFO] admin commmand `),
                        chalk.greenBright.bold(`${WhatsAppBot.commandName}`),
                        chalk.redBright.bold(
                            `not executed in public Work Type.`
                        )
                    );
                    await client.sendMessage(
                        WhatsAppBot.chatId,
                        GENERAL.ADMIN_PERMISSION,
                        MessageType.text
                    );
                    return false;
                } else if (sudoCommands.indexOf(WhatsAppBot.commandName) >= 0 && !WhatsAppBot.isSenderSUDO) {
                    console.log(
                        chalk.redBright.bold(`[INFO] sudo commmand `),
                        chalk.greenBright.bold(`${WhatsAppBot.commandName}`),
                        chalk.redBright.bold(
                            `not executed in public Work Type.`
                        )
                    );
                    let messageSent: boolean = await Users.getUser(WhatsAppBot.chatId);
                    if (messageSent) {
                        console.log(chalk.blueBright.bold("[INFO] Promo message had already been sent to " + WhatsAppBot.chatId))
                        return false;
                    }
                    else {
                        await client.sendMessage(
                            WhatsAppBot.chatId,
                            format(GENERAL.SUDO_PERMISSION, { worktype: "public", groupName: WhatsAppBot.groupName ? WhatsAppBot.groupName : "private chat", commandName: WhatsAppBot.commandName }),
                            MessageType.text
                        );
                        await Users.addUser(WhatsAppBot.chatId);
                        return false;
                    }
                } else {
                    return true;
                }
            }else if(WhatsAppBot.isPm){
                return true;
            }
        } else if (config.WORK_TYPE.toLowerCase() != "public" && !WhatsAppBot.isSenderSUDO) {
            console.log(
                chalk.redBright.bold(`[INFO] commmand `),
                chalk.greenBright.bold(`${WhatsAppBot.commandName}`),
                chalk.redBright.bold(
                    `not executed in private Work Type.`
                )
            );
            //             let messageSent = await Users.getUser(WhatsAppBot.chatId);
            //             if(messageSent){
            //                 console.log(chalk.blueBright.bold("[INFO] Promo message had already been sent to " + WhatsAppBot.chatId))
            //                 return false;
            //             }
            //             else{
            //                 await client.sendMessage(
            //                     WhatsAppBot.chatId,
            //                     GENERAL.SUDO_PERMISSION.format({ worktype: "private", groupName: WhatsAppBot.groupName ? WhatsAppBot.groupName : "private chat", commandName: WhatsAppBot.commandName }),
            //                     MessageType.text,
            //                     {
            //                         contextInfo: {
            //                             stanzaId: WhatsAppBot.chatId,
            //                             participant: WhatsAppBot.sender,
            //                             quotedMessage: {
            //                                 conversation: WhatsAppBot.body,
            //                             },
            //                         },
            //                     }
            //                 );
            //                 await Users.addUser(WhatsAppBot.chatId)
            //                 return false;
            //             }
        }
    } else {
        return true;
    }
}

export = clearance;