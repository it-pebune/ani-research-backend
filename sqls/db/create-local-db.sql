USE [master]
GO

CREATE LOGIN [rpb_usr] WITH PASSWORD = 'Parola123!'
GO

CREATE DATABASE [dbo] COLLATE SQL_Latin1_General_CP1_CI_AS;
GO

ALTER DATABASE [dbo] SET ANSI_NULL_DEFAULT OFF
GO
ALTER DATABASE [dbo] SET ANSI_NULLS OFF
GO
ALTER DATABASE [dbo] SET ANSI_PADDING OFF
GO
ALTER DATABASE [dbo] SET ANSI_WARNINGS OFF
GO
ALTER DATABASE [dbo] SET ARITHABORT OFF
GO
ALTER DATABASE [dbo] SET AUTO_SHRINK OFF
GO
ALTER DATABASE [dbo] SET AUTO_UPDATE_STATISTICS ON
GO
ALTER DATABASE [dbo] SET CURSOR_CLOSE_ON_COMMIT OFF
GO
ALTER DATABASE [dbo] SET CONCAT_NULL_YIELDS_NULL OFF
GO
ALTER DATABASE [dbo] SET NUMERIC_ROUNDABORT OFF
GO
ALTER DATABASE [dbo] SET QUOTED_IDENTIFIER OFF
GO
ALTER DATABASE [dbo] SET RECURSIVE_TRIGGERS OFF
GO
ALTER DATABASE [dbo] SET AUTO_UPDATE_STATISTICS_ASYNC OFF
GO
ALTER DATABASE [dbo] SET ALLOW_SNAPSHOT_ISOLATION ON
GO
ALTER DATABASE [dbo] SET PARAMETERIZATION SIMPLE
GO
ALTER DATABASE [dbo] SET READ_COMMITTED_SNAPSHOT ON
GO
ALTER DATABASE [dbo] SET MULTI_USER
GO
ALTER DATABASE [dbo] SET QUERY_STORE = ON
GO
ALTER DATABASE [dbo] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 100, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200)
GO
ALTER DATABASE [dbo] SET READ_WRITE
GO

USE [dbo]
GO
