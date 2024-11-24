# import asyncio
# import discord
# from discord.ext import commands
# from discord.ui import Select, View
# from discord import SelectOption
 
# import json

# # config.json에서 토큰 읽기
# with open("config.json", "r") as config_file:
#     config = json.load(config_file)
#     TOKEN = config["TOKEN"]



# bot = commands.Bot(command_prefix='/', intents=discord.Intents.all())


# # # 봇 설정
# # intents = discord.Intents.default()
# # intents.message_content = True  # 메시지 내용을 읽기 위한 인텐트 설정

# # bot = commands.Bot(command_prefix='!', intents=intents)

# # CHANNEL_NAME = "익명게시판"  # 익명 질문이 게시될 채널 이름
# # question_count = 0  # 질문 번호를 위한 전역 변수 (재시작 시 초기화됨)

# # 봇 이벤트: 봇 준비 완료
# @bot.event
# async def on_ready():
#     print(f"{bot.user.name} 연결 성공!")


# class TagView(View):
#     def __init__(self, tags, ctx):
#         super().__init__()

#         options = []
#         for i in tags :
#             options.append(SelectOption(label=(i.name), value=i.name))

#         self.select = Select(
#             placeholder="질문 카테고리를 선택해주세요.",
#             options=options
#         )
#         self.add_item(self.select)

#         def check(msg): 
#             return msg.author == ctx.author and msg.channel == ctx.channel

#         async def callback(interaction):
#             ctx.bot.selected_tag = interaction.data['values'][0]
#             await interaction.response.send_message(content=f"현재 선택된 질문 카테고리 `{ ctx.bot.selected_tag }`로 익명 질문을 진행하시려면 3분 내로 `질문제목`을 입력해주세요. 질문 작성을 원하지 않으실 경우 `!취소`를 입력해주세요.")
            
#             # 질문 제목 입력받기 
#             try: 
#                 title = await bot.wait_for("message", check=check, timeout=180.0)
#                 title = title.content

#                 if title == "!취소" :
#                     await ctx.send("프로세스가 종료됩니다. 익명 질문을 남기시려면 다시 `/익명질문` 명령어를 사용해주세요.")
#                     return
                
#                 ctx.bot.qTitle = title
                
#             except asyncio.TimeoutError:
#                 await ctx.send("3분이 경과되어 익명 질문 프로세스를 종료합니다.")
#                 return
            
#             # 질문 내용 입력받기 
#             await ctx.send(f"익명 질문을 계속해서 작성하시려면 5분 내로 `/내용 질문내용` 명령어를 사용해서 질문의 내용을 입력해주세요. 질문 작성을 원하지 않으실 경우 `!취소`를 입력해주세요.")
#             try: 
#                 content = await bot.wait_for("message", check=check, timeout=300.0)
#                 content = content.content

#                 if content == "!취소" :
#                     await ctx.send("프로세스가 종료됩니다. 익명 질문을 남기시려면 다시 `/익명질문` 명령어를 사용해주세요.")
#                     return
                
#                 ctx.bot.qContent = content
                
#             except asyncio.TimeoutError:
#                 await ctx.send("3분이 경과되어 익명 질문 프로세스를 종료합니다.")
#                 return
            

#             # 내용 확인용 임베드 
#             embed = discord.Embed(title = f"{ctx.bot.qTitle}",
#             description = f"{ctx.bot.qContent}", color = 0x62c1cc)
#             embed.add_field(name = "카테고리", value = f"{ctx.bot.selected_tag}")
#             embed.set_footer(text = "익명 질문")

#             # 확인 / 취소 버튼 
#             class ButtonView(View):
#                 def __init__(self, *, timeout=180):
#                     super().__init__(timeout=timeout)
#                     ctx.bot.isPublished = False;

#                 @discord.ui.button(label="확인", style=discord.ButtonStyle.green)
#                 async def submit_button(self, button:discord.ui.Button, interaction:discord.Interaction):
#                     if ctx.bot.isPublished : # 이미 작성되었을 경우 버튼 작동 X
#                         return
                    
#                     qChannel = discord.utils.get(bot.guilds[0].channels, name="포럼-테스트용")

#                     await ctx.send('익명 질문이 업로드 됩니다.')
#                     applied_tags = list(filter(lambda tag : tag.name == ctx.bot.selected_tag, tags))
#                     await qChannel.create_thread(name=ctx.bot.qTitle, content=ctx.bot.qContent, applied_tags=applied_tags) 
#                     ctx.bot.isPublished = True
#                     del self
#                     return

#                 @discord.ui.button(label="취소",style=discord.ButtonStyle.gray)
#                 async def cancel_button(self, button:discord.ui.Button, interaction:discord.Interaction):
#                     await ctx.send('프로세스가 종료됩니다. 익명 질문을 남기시려면 다시 `/익명질문` 명령어를 사용해주세요.')
#                     return
                
#             buttons = ButtonView()

#             await ctx.send("아래 내용으로 질문을 올리시려면 확인 버튼을 눌러주시고, 원하지 않으실 경우 취소 버튼을 눌러주세요.", embed=embed, view=buttons)

#         self.select.callback = callback # 초기화 후 등록해줘야 함

# # 익명 질문 기능 
# @bot.command(aliases=['익명질문', '질문'])
# async def anony_question(ctx):
#     # DM을 받은 경우가 아니면 return 
#     if not isinstance(ctx.channel, discord.DMChannel):
#         return
    
#     # 질문 채널 정보 가져오기 
#     qChannel = discord.utils.get(bot.guilds[0].channels, name="포럼-테스트용")
#     tags = qChannel.available_tags

#     # 작성자 정보 가져오기 
#     author_id = ctx.author.id
#     user = await bot.fetch_user(author_id) 

#     # 익명 질문을 위한 태그 input 메세지 내보내기
#     await user.send(view=TagView(tags, ctx))


# bot.run(TOKEN)


# # # 익명 질문 슬래시 명령어
# # @bot.tree.command(name="질문", description="익명 질문을 보냅니다.")
# # @app_commands.describe(question="질문 내용")
# # async def anonymous_question(interaction: discord.Interaction, question: str):
# #     global question_count
# #     question_count += 1  # 질문 번호 증가
# #     question_id = question_count

# #     # 질문 채널 확인
# #     channel = discord.utils.get(interaction.guild.text_channels, name=CHANNEL_NAME)
# #     if not channel:
# #         await interaction.response.send_message(f"'{CHANNEL_NAME}' 채널을 찾을 수 없습니다. 관리자에게 문의하세요.", ephemeral=True)
# #         return

# #     # 익명 질문 전송
# #     await channel.send(f"💬 **질문 {question_id}:** {question}")
# #     await interaction.response.send_message("질문이 익명으로 전송되었습니다!", ephemeral=True)

# #     # DM 전송: 작성자에게 질문 번호 안내
# #     try:
# #         await interaction.user.send(f"질문이 등록되었습니다. 질문 ID: {question_id}")
# #     except discord.Forbidden:
# #         await interaction.response.send_message("DM 전송에 실패했습니다. DM을 활성화해주세요.", ephemeral=True)

# # # 관리자 전용 답변 슬래시 명령어
# # @bot.tree.command(name="답변", description="질문에 대한 답변을 보냅니다. (관리자 전용)")
# # @app_commands.describe(question_id="질문 ID", answer="답변 내용")
# # async def answer_question(interaction: discord.Interaction, question_id: int, answer: str):
# #     if not interaction.user.guild_permissions.manage_messages:  # 관리 권한 확인
# #         await interaction.response.send_message("이 명령어를 사용할 권한이 없습니다.", ephemeral=True)
# #         return

# #     # 질문 채널 확인
# #     channel = discord.utils.get(interaction.guild.text_channels, name=CHANNEL_NAME)
# #     if not channel:
# #         await interaction.response.send_message(f"'{CHANNEL_NAME}' 채널을 찾을 수 없습니다. 관리자에게 문의하세요.", ephemeral=True)
# #         return

# #     # 질문에 답변 전송
# #     await channel.send(f"💬 **질문 {question_id}에 대한 답변:** {answer}")
# #     await interaction.response.send_message("답변이 전송되었습니다!", ephemeral=True)

# # # 예외 처리
# # @bot.event
# # async def on_command_error(ctx, error):
# #     if isinstance(error, commands.MissingPermissions):
# #         await ctx.send("이 명령어를 사용할 권한이 없습니다.")
# #     elif isinstance(error, commands.CommandNotFound):
# #         await ctx.send("존재하지 않는 명령어입니다.")
# #     elif isinstance(error, commands.BadArgument):
# #         await ctx.send("잘못된 인자입니다. 다시 확인해주세요.")
# #     else:
# #         await ctx.send("알 수 없는 오류가 발생했습니다.")

# # # 봇 실행
# # bot.run("MTMwNTQxODYzMjMwMTY0MTc0OA.GQgcFy.a2K-a7rXITTYQjTie914_fEOaTq-1l4fwb5bsU")
