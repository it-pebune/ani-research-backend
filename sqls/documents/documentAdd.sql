IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'documentAdd')
	BEGIN
  DROP  Procedure  documentAdd
END
GO

CREATE PROCEDURE [dbo].documentAdd(
  @docId          VARCHAR(50),
  @subjectId      INT,
  @jobId          INT,
  @userId         INT,
  @type           TINYINT,
  @status         TINYINT,
  @date           DATE,
  @name           VARCHAR(MAX),
  @md5            VARCHAR(32),
  @downloadedUrl  VARCHAR(MAX),
  @originalPath   VARCHAR(MAX)
)
AS
BEGIN
  SET NOCOUNT ON

  INSERT INTO Document(id, subjectId, jobId, [type], [status], [date], [name], md5, downloadedUrl, originalPath, createdBy)
  VALUES (@docId, @subjectId, @jobId, @type, @status, @date, @name, @md5, @downloadedUrl, @originalPath, @userId)
END
GO
GRANT EXEC ON [dbo].documentAdd TO rpb_role
GO