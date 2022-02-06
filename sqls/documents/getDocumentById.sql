IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getDocumentById')
	BEGIN
  DROP  Procedure  getDocumentById
END
GO

CREATE PROCEDURE [dbo].getDocumentById(@id VARCHAR(50))
AS
BEGIN
  SET NOCOUNT ON

  SELECT  D.id, D.type, D.status, D.name, D.md5, D.downloadedUrl, D.originalPath,
          D.created, D.createdBy, Uc.displayName createdByName, D.updated, D.updatedBy,
          Uu.displayName updatedByName
  FROM    [Document] D
          INNER JOIN
          [User] Uc ON D.createdBy = Uc.id
          LEFT JOIN
          [User] Uu ON D.updatedBy = Uu.id
  WHERE   D.id = @id
END
GO
GRANT EXEC ON [dbo].getDocumentById TO rpb_role
GO