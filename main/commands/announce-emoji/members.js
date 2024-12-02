const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('channelmembers')
		.setDescription('해당 채널을 볼 수 있는 사람 리스트 전송'),
	async execute(interaction) {
		const channel = interaction.channel; // 명령어가 사용된 채널
		const allMembers = await interaction.guild.members.fetch(); // 서버의 모든 멤버 가져오기

		// 채널에서 읽기 권한이 있는 멤버 필터링
		const accessibleMembers = allMembers.filter(member => 
			channel.permissionsFor(member).has('ViewChannel') // '채널 보기' 권한 확인
		);

		// 필터링된 멤버를 태그 형식으로 나열
		const memberList = accessibleMembers.map(member => member.user.tag).join('\n');

		await interaction.reply(
			memberList.length > 0 
				? `Members with access to this channel:\n${memberList}` 
				: 'No members have access to this channel.'
		);
	},
};



// const { SlashCommandBuilder } = require('discord.js');

// module.exports = {
// 	data: new SlashCommandBuilder()
// 		.setName('members')
// 		.setDescription('Replies with a list of all server members'),
// 	async execute(interaction) {
// 		// 서버의 모든 멤버를 가져옵니다
// 		const members = await interaction.guild.members.fetch();
// 		const memberList = members.map(member => member.user.tag).join('\n'); // 멤버의 유저 태그를 가져옵니다

// 		// 멤버 목록을 전송합니다
// 		await interaction.reply(`Here are all the members in the server:\n${memberList}`);
// 	},
// };