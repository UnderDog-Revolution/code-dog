const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('익명질문')
        .setDescription('익명 질문을 제출합니다.'),
    async execute(interaction) {
        const channel = interaction.guild.channels.cache.find(ch => ch.name === '익명게시판');
        if (!channel) {
            await interaction.reply({ content: `'익명게시판' 채널을 찾을 수 없습니다. 관리자에게 문의하세요.`, ephemeral: true });
            return;
        }

        // 질문 카테고리 선택 메뉴 생성
        const categoryMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_category')
                    .setPlaceholder('질문 카테고리를 선택하세요.')
                    .addOptions([
                        { label: '일반', value: '일반' },
                        { label: '출석', value: '출석' },
                        { label: '프로젝트', value: '프로젝트' },
                        { label: '스터디', value: '스터디' },
                        { label: '기타', value: '기타' }
                    ])
            );

        await interaction.reply({
            content: '질문 카테고리를 선택해주세요:',
            components: [categoryMenu],
            ephemeral: true
        });

        const filter = i => i.customId === 'select_category' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            const selectedCategory = i.values[0];
            collector.stop();

            // 질문 작성 모달 생성
            const modal = new ModalBuilder()
                .setCustomId('anonymous_question_modal')
                .setTitle('익명 질문 작성')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('question_title')
                            .setLabel('질문 제목')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('question_content')
                            .setLabel('질문 내용')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
                );

            await i.showModal(modal);

            const modalFilter = m => m.customId === 'anonymous_question_modal' && m.user.id === interaction.user.id;

            const modalCollectorCallback = async (modalInteraction) => {
                if (!modalFilter(modalInteraction)) return;

                const questionTitle = modalInteraction.fields.getTextInputValue('question_title');
                const questionContent = modalInteraction.fields.getTextInputValue('question_content');

                const embed = {
                    color: 0x62c1cc,
                    description: `**${questionTitle}**\n\n${questionContent}`, // 제목을 볼드체로 크게 표시
                    fields: [
                        { name: '카테고리', value: selectedCategory, inline: false }
                    ],
                    footer: { text: '익명 질문' }
                };

                await channel.send({ embeds: [embed] });
                await modalInteraction.reply({ content: '질문이 성공적으로 등록되었습니다!', ephemeral: true });

                interaction.client.off('interactionCreate', modalCollectorCallback);
            };

            interaction.client.on('interactionCreate', modalCollectorCallback);
        });

        collector.on('end', collected => {
            if (!collected.size) {
                interaction.followUp({ content: '시간 초과로 질문 생성이 취소되었습니다.', ephemeral: true });
            }
        });
    }
};