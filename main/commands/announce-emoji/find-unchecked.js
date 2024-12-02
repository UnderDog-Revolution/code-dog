const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('findunchecked')
        .setDescription('체크 안한 사람 찾기')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('The ID of the announcement message.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to filter members by (optional).')
                .setRequired(false)),
    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');
        const channel = interaction.channel; // 명령어가 사용된 채널
        const selectedRole = interaction.options.getRole('role'); // 선택된 역할 (없을 수도 있음)

        try {
            // 공지 메시지를 가져옵니다
            const announcementMessage = await interaction.channel.messages.fetch(messageId);
            if (!announcementMessage) {
                return interaction.reply({ content: '메시지를 찾을 수 없습니다.', ephemeral: true });
            }

            // 체크 리액션의 사용자 리스트를 가져옵니다
            const checkReaction = announcementMessage.reactions.cache.get('✅');
            const reactedUsers = checkReaction ? await checkReaction.users.fetch() : new Map();

            // 채널에서 읽기 권한이 있는 멤버를 필터링합니다
            const allMembers = await interaction.guild.members.fetch(); // 서버의 모든 멤버 가져오기
            const accessibleMembers = allMembers.filter(member =>
                channel.permissionsFor(member).has('ViewChannel') // '채널 보기' 권한 확인
            );

            // 역할이 선택되었을 경우, 해당 역할을 가진 멤버들만 필터링
            const filteredMembers = selectedRole 
                ? accessibleMembers.filter(member => member.roles.cache.has(selectedRole.id)) 
                : accessibleMembers;

            // 선택된 역할에 해당하는 멤버가 없으면 바로 응답
            if (filteredMembers.size === 0) {
                return interaction.reply({ content: '선택된 역할에 해당하는 멤버가 없습니다. 모두 체크했습니다!', ephemeral: true });
            }

            // 체크하지 않은 멤버를 필터링 (봇 제외)
            const uncheckedMembers = filteredMembers.filter(member =>
                !reactedUsers.has(member.id) && !member.user.bot
            );

            // 체크하지 않은 멤버들의 서버 이름을 리스트로 표시
            const uncheckedList = uncheckedMembers.map(member => member.displayName).join('\n') || '모두 체크했습니다!';

            // 결과를 사용자에게 응답
            await interaction.reply({ content: `체크하지 않은 멤버:\n${uncheckedList}`, ephemeral: true });
        } catch (error) {
            console.error('Error fetching message or reactions:', error);
            await interaction.reply({ content: '오류가 발생했습니다. 다시 시도해주세요.', ephemeral: true });
        }
    },
};




// const { SlashCommandBuilder } = require('discord.js');

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('findunchecked')
//         .setDescription('체크 안한 사람 찾기')
//         .addStringOption(option =>
//             option.setName('message_id')
//                 .setDescription('The ID of the announcement message.')
//                 .setRequired(true))
//         .addRoleOption(option =>
//             option.setName('role')
//                 .setDescription('The role to filter members by (optional).')
//                 .setRequired(false)), // 역할 선택 옵션 추가
//     async execute(interaction) {
//         const messageId = interaction.options.getString('message_id');
//         const channel = interaction.channel; // 명령어가 사용된 채널
//         const selectedRole = interaction.options.getRole('role'); // 선택된 역할 (없을 수도 있음)

//         try {
//             // 공지 메시지를 가져옵니다
//             const announcementMessage = await interaction.channel.messages.fetch(messageId);
//             if (!announcementMessage) {
//                 return interaction.reply({ content: '메시지를 찾을 수 없습니다.', ephemeral: true });
//             }

//             // 체크 리액션의 사용자 리스트를 가져옵니다
//             const checkReaction = announcementMessage.reactions.cache.get('✅');
//             const reactedUsers = checkReaction ? await checkReaction.users.fetch() : new Map();

//             // 채널에서 읽기 권한이 있는 멤버를 필터링합니다
//             const allMembers = await interaction.guild.members.fetch(); // 서버의 모든 멤버 가져오기
//             const accessibleMembers = allMembers.filter(member => 
//                 channel.permissionsFor(member).has('ViewChannel') // '채널 보기' 권한 확인
//             );

//             // 역할이 선택되었을 경우, 해당 역할을 가진 멤버들만 필터링
//             const filteredMembers = selectedRole 
//                 ? accessibleMembers.filter(member => member.roles.cache.has(selectedRole.id)) 
//                 : accessibleMembers;

//             // 체크하지 않은 멤버를 필터링 (봇 제외)
//             const uncheckedMembers = filteredMembers.filter(member => 
//                 !reactedUsers.has(member.id) && !member.user.bot
//             );

//             // 체크하지 않은 멤버들의 서버 이름을 리스트로 표시
//             const uncheckedList = uncheckedMembers.map(member => member.displayName).join('\n') || '모두 체크했습니다!';

//             // 결과를 사용자에게 응답
//             await interaction.reply({ content: `체크하지 않은 멤버:\n${uncheckedList}`, ephemeral: true });
//         } catch (error) {
//             console.error('Error fetching message or reactions:', error);
//             await interaction.reply({ content: '오류가 발생했습니다. 다시 시도해주세요.', ephemeral: true });
//         }
//     },
// };