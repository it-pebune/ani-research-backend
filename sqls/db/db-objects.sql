/****** Object:  User [rpb_usr]    Script Date: 23/01/2022 21:35:24 ******/
CREATE USER [rpb_usr] FOR LOGIN [rpb_usr] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  DatabaseRole [rpb_role]    Script Date: 23/01/2022 21:35:24 ******/
CREATE ROLE [rpb_role]
GO
sys.sp_addrolemember @rolename = N'rpb_role', @membername = N'rpb_usr'
GO
/****** Object:  Table [dbo].[County]    Script Date: 23/01/2022 21:35:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[County](
	[id] [int] NOT NULL,
	[name] [varchar](100) NOT NULL,
 CONSTRAINT [PK_County] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Document]    Script Date: 23/01/2022 21:35:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Document](
	[id] [varchar](50) NOT NULL,
	[subjectId] [int] NOT NULL,
	[created] [datetime2](7) NOT NULL,
	[type] [tinyint] NOT NULL,
	[status] [tinyint] NOT NULL,
	[name] [varchar](max) NOT NULL,
	[md5] [varchar](32) NOT NULL,
	[downloadedUrl] [varchar](max) NOT NULL,
	[originalPath] [varchar](max) NOT NULL,
	[data] [varchar](max) NOT NULL,
 CONSTRAINT [PK_Document] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Institution]    Script Date: 23/01/2022 21:35:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Institution](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[type] [tinyint] NOT NULL,
	[name] [varchar](200) NOT NULL,
	[startDate] [date] NULL,
	[endDate] [date] NULL,
	[cui] [varchar](20) NULL,
	[regCom] [varchar](20) NULL,
	[deleted] [tinyint] NOT NULL,
 CONSTRAINT [PK_Institution] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[JobPosition]    Script Date: 23/01/2022 21:35:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[JobPosition](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[subjectId] [int] NOT NULL,
	[institutionId] [int] NOT NULL,
	[name] [varchar](300) NOT NULL,
	[dateStart] [date] NOT NULL,
	[dateEnd] [date] NOT NULL,
	[deleted] [tinyint] NOT NULL,
 CONSTRAINT [PK_JobPosition] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Relations]    Script Date: 23/01/2022 21:35:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Relations](
	[subjectId] [int] NOT NULL,
	[relationId] [int] NOT NULL,
	[type] [int] NOT NULL,
 CONSTRAINT [PK_Relations] PRIMARY KEY CLUSTERED 
(
	[subjectId] ASC,
	[relationId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Role]    Script Date: 23/01/2022 21:35:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Role](
	[id] [tinyint] NOT NULL,
	[role] [varchar](100) NOT NULL,
 CONSTRAINT [PK_Role] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Subject]    Script Date: 23/01/2022 21:35:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Subject](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[sirutaId] [int] NULL,
	[assignedTo] [int] NULL,
	[firstName] [varchar](100) NOT NULL,
	[middleName] [varchar](50) NULL,
	[lastName] [varchar](100) NOT NULL,
	[dob] [date] NULL,
	[notes] [varchar](max) NULL,
	[status] [tinyint] NULL,
	[created] [datetime2](7) NOT NULL,
	[updated] [datetime2](7) NOT NULL,
	[deleted] [tinyint] NOT NULL,
 CONSTRAINT [PK_Subject] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Uat]    Script Date: 23/01/2022 21:35:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Uat](
	[sirutaId] [int] NOT NULL,
	[countyId] [int] NOT NULL,
	[type] [tinyint] NOT NULL,
	[name] [varchar](100) NOT NULL,
 CONSTRAINT [PK_Uat] PRIMARY KEY CLUSTERED 
(
	[sirutaId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[User]    Script Date: 23/01/2022 21:35:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[email] [varchar](50) NOT NULL,
	[firstName] [varchar](100) NOT NULL,
	[lastName] [varchar](100) NOT NULL,
	[displayName] [varchar](200) NOT NULL,
	[phone] [varchar](50) NULL,
	[created] [datetime2](7) NOT NULL,
	[updated] [datetime2](7) NOT NULL,
	[provider] [varchar](50) NOT NULL,
	[providerData] [varchar](max) NULL,
	[profileImageUrl] [varchar](512) NULL,
	[googleId] [varchar](50) NULL,
	[notes] [varchar](max) NULL,
	[socialInfo] [varchar](max) NULL,
	[lastLogin] [datetime2](7) NULL,
	[refreshToken] [varchar](64) NULL,
	[refreshTokenExpires] [datetime2](7) NULL,
	[settings] [varchar](max) NULL,
	[status] [tinyint] NOT NULL,
	[deleted] [tinyint] NOT NULL,
 CONSTRAINT [PK_User] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserRoles]    Script Date: 23/01/2022 21:35:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserRoles](
	[userId] [int] NOT NULL,
	[roleId] [tinyint] NOT NULL,
 CONSTRAINT [PK_UserRoles] PRIMARY KEY CLUSTERED 
(
	[userId] ASC,
	[roleId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserSubjects]    Script Date: 23/01/2022 21:35:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserSubjects](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[userId] [int] NOT NULL,
	[subjectId] [int] NOT NULL,
	[assignedBy] [int] NOT NULL,
	[assignedOn] [datetime2](7) NOT NULL,
	[revoked] [tinyint] NOT NULL,
	[revokedBy] [int] NULL,
	[revokedOn] [datetime2](7) NULL,
	[status] [tinyint] NOT NULL,
 CONSTRAINT [PK_UserSubjects] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Institution] ADD  CONSTRAINT [DF_Institution_deleted]  DEFAULT ((0)) FOR [deleted]
GO
ALTER TABLE [dbo].[JobPosition] ADD  CONSTRAINT [DF_Position_deleted]  DEFAULT ((0)) FOR [deleted]
GO
ALTER TABLE [dbo].[Subject] ADD  CONSTRAINT [DF_Subject_status]  DEFAULT ((0)) FOR [status]
GO
ALTER TABLE [dbo].[Subject] ADD  CONSTRAINT [DF_Subject_created]  DEFAULT (getdate()) FOR [created]
GO
ALTER TABLE [dbo].[Subject] ADD  CONSTRAINT [DF_Subject_updated]  DEFAULT (getdate()) FOR [updated]
GO
ALTER TABLE [dbo].[Subject] ADD  CONSTRAINT [DF_Subiect_deleted]  DEFAULT ((0)) FOR [deleted]
GO
ALTER TABLE [dbo].[User] ADD  CONSTRAINT [DF_User_created]  DEFAULT (getdate()) FOR [created]
GO
ALTER TABLE [dbo].[User] ADD  CONSTRAINT [DF_User_updated]  DEFAULT (getdate()) FOR [updated]
GO
ALTER TABLE [dbo].[User] ADD  CONSTRAINT [DF_User_status]  DEFAULT ((0)) FOR [status]
GO
ALTER TABLE [dbo].[User] ADD  CONSTRAINT [DF_User_deleted]  DEFAULT ((0)) FOR [deleted]
GO
ALTER TABLE [dbo].[UserSubjects] ADD  CONSTRAINT [DF_UserSubjects_revoked]  DEFAULT ((0)) FOR [revoked]
GO
ALTER TABLE [dbo].[UserSubjects] ADD  CONSTRAINT [DF_UserSubjects_status]  DEFAULT ((0)) FOR [status]
GO
ALTER TABLE [dbo].[Document]  WITH CHECK ADD  CONSTRAINT [FK_Document_Subject] FOREIGN KEY([subjectId])
REFERENCES [dbo].[Subject] ([id])
GO
ALTER TABLE [dbo].[Document] CHECK CONSTRAINT [FK_Document_Subject]
GO
ALTER TABLE [dbo].[JobPosition]  WITH CHECK ADD  CONSTRAINT [FK_JobPosition_Institution] FOREIGN KEY([institutionId])
REFERENCES [dbo].[Institution] ([id])
GO
ALTER TABLE [dbo].[JobPosition] CHECK CONSTRAINT [FK_JobPosition_Institution]
GO
ALTER TABLE [dbo].[JobPosition]  WITH CHECK ADD  CONSTRAINT [FK_JobPosition_Subject] FOREIGN KEY([subjectId])
REFERENCES [dbo].[Subject] ([id])
GO
ALTER TABLE [dbo].[JobPosition] CHECK CONSTRAINT [FK_JobPosition_Subject]
GO
ALTER TABLE [dbo].[Relations]  WITH CHECK ADD  CONSTRAINT [FK_Relations_Subject] FOREIGN KEY([subjectId])
REFERENCES [dbo].[Subject] ([id])
GO
ALTER TABLE [dbo].[Relations] CHECK CONSTRAINT [FK_Relations_Subject]
GO
ALTER TABLE [dbo].[Relations]  WITH CHECK ADD  CONSTRAINT [FK_Subject_Relations] FOREIGN KEY([relationId])
REFERENCES [dbo].[Subject] ([id])
GO
ALTER TABLE [dbo].[Relations] CHECK CONSTRAINT [FK_Subject_Relations]
GO
ALTER TABLE [dbo].[Subject]  WITH CHECK ADD  CONSTRAINT [FK_Subject_Uat] FOREIGN KEY([sirutaId])
REFERENCES [dbo].[Uat] ([sirutaId])
GO
ALTER TABLE [dbo].[Subject] CHECK CONSTRAINT [FK_Subject_Uat]
GO
ALTER TABLE [dbo].[Subject]  WITH CHECK ADD  CONSTRAINT [FK_Subject_User] FOREIGN KEY([assignedTo])
REFERENCES [dbo].[User] ([id])
GO
ALTER TABLE [dbo].[Subject] CHECK CONSTRAINT [FK_Subject_User]
GO
ALTER TABLE [dbo].[Uat]  WITH CHECK ADD  CONSTRAINT [FK_Uat_County] FOREIGN KEY([countyId])
REFERENCES [dbo].[County] ([id])
GO
ALTER TABLE [dbo].[Uat] CHECK CONSTRAINT [FK_Uat_County]
GO
ALTER TABLE [dbo].[UserRoles]  WITH CHECK ADD  CONSTRAINT [FK_UserRoles_Role] FOREIGN KEY([roleId])
REFERENCES [dbo].[Role] ([id])
GO
ALTER TABLE [dbo].[UserRoles] CHECK CONSTRAINT [FK_UserRoles_Role]
GO
ALTER TABLE [dbo].[UserRoles]  WITH CHECK ADD  CONSTRAINT [FK_UserRoles_User] FOREIGN KEY([userId])
REFERENCES [dbo].[User] ([id])
GO
ALTER TABLE [dbo].[UserRoles] CHECK CONSTRAINT [FK_UserRoles_User]
GO
ALTER TABLE [dbo].[UserSubjects]  WITH CHECK ADD  CONSTRAINT [FK_UserSubjects_Subject] FOREIGN KEY([subjectId])
REFERENCES [dbo].[Subject] ([id])
GO
ALTER TABLE [dbo].[UserSubjects] CHECK CONSTRAINT [FK_UserSubjects_Subject]
GO
ALTER TABLE [dbo].[UserSubjects]  WITH CHECK ADD  CONSTRAINT [FK_UserSubjects_User] FOREIGN KEY([userId])
REFERENCES [dbo].[User] ([id])
GO
ALTER TABLE [dbo].[UserSubjects] CHECK CONSTRAINT [FK_UserSubjects_User]
GO
ALTER TABLE [dbo].[UserSubjects]  WITH CHECK ADD  CONSTRAINT [FK_UserSubjects_User_Assigned] FOREIGN KEY([assignedBy])
REFERENCES [dbo].[User] ([id])
GO
ALTER TABLE [dbo].[UserSubjects] CHECK CONSTRAINT [FK_UserSubjects_User_Assigned]
GO
ALTER TABLE [dbo].[UserSubjects]  WITH CHECK ADD  CONSTRAINT [FK_UserSubjects_User_Revoked] FOREIGN KEY([revokedBy])
REFERENCES [dbo].[User] ([id])
GO
ALTER TABLE [dbo].[UserSubjects] CHECK CONSTRAINT [FK_UserSubjects_User_Revoked]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'0 - assigned, 1 - research in progress, 2 - completed' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Subject', @level2type=N'COLUMN',@level2name=N'status'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'11 = CJ = Consiliu Judetean; 
12 = M = Municipiu; 
13 = O  =  Oras; 
14 = C  = Comuna
; 15 = B  =  Primaria M. Buc.; 
16 = S  =  Primaria de sector al M. Buc.	' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Uat', @level2type=N'COLUMN',@level2name=N'type'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'notes about the user' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'User', @level2type=N'COLUMN',@level2name=N'notes'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'info about facebook, linked' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'User', @level2type=N'COLUMN',@level2name=N'socialInfo'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'0 - assigned, 1 - research in progress, 2 - completed' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'UserSubjects', @level2type=N'COLUMN',@level2name=N'status'
GO
