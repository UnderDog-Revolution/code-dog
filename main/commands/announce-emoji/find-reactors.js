const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('findreactors')
        .setDescription('특정 이모지로 반응한 사람 찾기')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('The ID of the message to check reactions on.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The emoji to check for reactions.')
                .setRequired(true)),
    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');
        const emojiInput = interaction.options.getString('emoji');

        try {
            // 메시지를 가져옵니다
            const message = await interaction.channel.messages.fetch(messageId);
            if (!message) {
                return interaction.reply({ content: '메시지를 찾을 수 없습니다.', ephemeral: true });
            }

            // 이모지 파싱
            const emoji = emojiInput.startsWith('<:') && emojiInput.endsWith('>')
                ? emojiInput.split(':')[2].replace('>', '') // Custom emoji의 ID 추출
                : emojiInput; // Unicode 이모지

            // 리액션 가져오기
            const reaction = message.reactions.cache.find(r => 
                r.emoji.id === emoji || r.emoji.name === emoji
            );

            if (!reaction) {
                return interaction.reply({ content: `이모티콘 '${emojiInput}'에 대한 리액션을 찾을 수 없습니다.`, ephemeral: true });
            }

            // 리액션을 추가한 사용자 목록 가져오기
            const users = await reaction.users.fetch();
            const filteredUsers = users.filter(user => !user.bot); // 봇 제외

            // 사용자 목록을 서버 닉네임으로 변환
            const members = await interaction.guild.members.fetch(); // 서버 멤버 가져오기
            const displayNames = filteredUsers.map(user => {
                const member = members.get(user.id);
                return member ? member.displayName : user.tag; // 닉네임 우선, 없으면 태그
            });

            const userList = displayNames.join('\n') || '이모티콘을 선택한 사람이 없습니다.';

            // 사용자에게 결과 전송
            await interaction.reply({ content: `이모티콘 '${emojiInput}'을 선택한 사용자들:\n${userList}`, ephemeral: true });
        } catch (error) {
            console.error('Error fetching message or reactions:', error);
            await interaction.reply({ content: '오류가 발생했습니다. 다시 시도해주세요.', ephemeral: true });
        }
    },
};




// const { SlashCommandBuilder } = require('discord.js');

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('findreactors')
//         .setDescription('특정 이모지로 반응한 사람 찾기')
//         .addStringOption(option =>
//             option.setName('message_id')
//                 .setDescription('The ID of the message to check reactions on.')
//                 .setRequired(true))
//         .addStringOption(option =>
//             option.setName('emoji')
//                 .setDescription('The emoji to check for reactions.')
//                 .setRequired(true)),
//     async execute(interaction) {
//         const messageId = interaction.options.getString('message_id');
//         const emoji = interaction.options.getString('emoji');

//         try {
//             // 메시지를 가져옵니다
//             const message = await interaction.channel.messages.fetch(messageId);
//             if (!message) {
//                 return interaction.reply({ content: '메시지를 찾을 수 없습니다.', ephemeral: true });
//             }

//             // 이모티콘 리액션 가져오기
//             const reaction = message.reactions.cache.get(emoji);
//             if (!reaction) {
//                 return interaction.reply({ content: `이모티콘 '${emoji}'에 대한 리액션을 찾을 수 없습니다.`, ephemeral: true });
//             }

//             // 리액션을 추가한 사용자 목록 가져오기
//             const users = await reaction.users.fetch();
//             const filteredUsers = users.filter(user => !user.bot); // 봇 제외

//             // 사용자 목록을 서버 닉네임으로 변환
//             const members = await interaction.guild.members.fetch(); // 서버 멤버 가져오기
//             const displayNames = filteredUsers.map(user => {
//                 const member = members.get(user.id);
//                 return member ? member.displayName : user.tag; // 닉네임 우선, 없으면 태그
//             });

//             const userList = displayNames.join('\n') || '이모티콘을 선택한 사람이 없습니다.';

//             // 사용자에게 결과 전송
//             await interaction.reply({ content: `이모티콘 '${emoji}'을 선택한 사용자들:\n${userList}`, ephemeral: true });
//         } catch (error) {
//             console.error('Error fetching message or reactions:', error);
//             await interaction.reply({ content: '오류가 발생했습니다. 다시 시도해주세요.', ephemeral: true });
//         }
//     },
// };