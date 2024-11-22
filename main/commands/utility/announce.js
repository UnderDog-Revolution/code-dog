const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('공지를 작성하고 메시지 ID를 전송')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('공지할 메시지를 입력하세요. (줄바꿈: \\n)')
                .setRequired(true)),
    async execute(interaction) {
        // 명령어에서 입력받은 공지 내용
        let messageContent = interaction.options.getString('message');

        // 사용자가 입력한 줄바꿈 기호(\n)를 실제 줄바꿈으로 변환
        messageContent = messageContent.replace(/\\n/g, '\n');

        try {
            // 공지 메시지 전송
            const announcementMessage = await interaction.channel.send(messageContent);

            // 체크 이모지 추가
            await announcementMessage.react('✅');

            // 메시지 ID 포함하여 새 메시지 전송
            await interaction.channel.send(`메시지 ID: \`${announcementMessage.id}\``);

            // 사용자에게 완료 메시지
            await interaction.reply({ content: '공지 메시지를 성공적으로 전송했습니다.', ephemeral: true });
        } catch (error) {
            console.error('공지 메시지를 전송하는 도중 오류가 발생했습니다:', error);
            await interaction.reply({ content: '공지 메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.', ephemeral: true });
        }
    },
};


// const { SlashCommandBuilder } = require('discord.js');

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('announce')
//         .setDescription('공지를 작성하고 메세지 아이디를 전송')
//         .addStringOption(option =>
//             option.setName('message')
//                 .setDescription('공지할 메시지를 입력하세요')
//                 .setRequired(true)),
//     async execute(interaction) {
//         const messageContent = interaction.options.getString('message');

//         // 공지 메시지 전송
//         const announcementMessage = await interaction.channel.send(messageContent);

//         // 메시지 ID 포함하여 새 메시지 전송
//         await interaction.channel.send(`메시지 ID: \`${announcementMessage.id}\``);

//         await interaction.reply({ content: '공지 메시지를 전송했습니다.', ephemeral: true });
//     },
// };




// const { SlashCommandBuilder } = require('discord.js');

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('announce')
//         .setDescription('공지 메시지를 작성하고 체크 이모지를 추가합니다.')
//         .addStringOption(option =>
//             option.setName('message')
//                 .setDescription('공지할 메시지를 입력하세요')
//                 .setRequired(true)),
//     async execute(interaction) {
//         const messageContent = interaction.options.getString('message');
        
//         // 공지 메시지 전송
//         const announcementMessage = await interaction.channel.send(messageContent);
        
//         // 체크 이모지 추가
//         await announcementMessage.react('✅');
        
//         await interaction.reply({ content: '공지 메시지를 전송했습니다.', ephemeral: true });
//     },
// };
