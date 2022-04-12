IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'documentList')
	BEGIN
  DROP  Procedure  documentList
END
GO

CREATE PROCEDURE [dbo].documentList(@subjectId INT)
AS
BEGIN
  SET NOCOUNT ON

  SELECT  D.id, D.type, D.status, D.name, D.date, D.jobId, D.md5, D.downloadedUrl, D.originalPath,
          D.created, D.createdBy, Uc.displayName createdByName, D.updated, D.updatedBy,
          Uu.displayName updatedByName, J.name jobPosition
  FROM    [Document] D
          INNER JOIN
          [User] Uc ON D.createdBy = Uc.id
          INNER JOIN
          JobPosition J ON D.jobId = J.id
          LEFT JOIN
          [User] Uu ON D.updatedBy = Uu.id
  WHERE   D.subjectId = @subjectId
END
GO
GRANT EXEC ON [dbo].documentList TO rpb_role
GO