IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'documentExists')
	BEGIN
  DROP  Procedure  documentExists
END
GO

CREATE PROCEDURE [dbo].documentExists(
  @md5            VARCHAR(32),
  @downloadedUrl  VARCHAR(MAX)
)
AS
BEGIN
  SET NOCOUNT ON

  SELECT  D.id, D.type, D.status, D.name, D.md5, D.downloadedUrl, D.originalPath,
          D.created, D.createdBy, Uc.displayName createdByName, D.updated, D.updatedBy,
          Uu.displayName updatedByName, D.subjectId, S.firstName, S.middleName, S.lastName
  FROM    [Document] D
          INNER JOIN
          [Subject] S ON D.subjectId = S.id
          INNER JOIN
          [User] Uc ON D.createdBy = Uc.id
          LEFT JOIN
          [User] Uu ON D.updatedBy = Uu.id
  WHERE   D.md5 = @md5
      AND D.downloadedUrl = @downloadedUrl
END
GO
GRANT EXEC ON [dbo].documentExists TO rpb_role
GO