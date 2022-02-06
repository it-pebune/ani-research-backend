IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getDocumentOriginalPath')
	BEGIN
  DROP  Procedure  getDocumentOriginalPath
END
GO

CREATE PROCEDURE [dbo].getDocumentOriginalPath(@id VARCHAR(50))
AS
BEGIN
  SET NOCOUNT ON

  SELECT  D.id, D.originalPath
  FROM    [Document] D
  WHERE   D.id = @id
END
GO
GRANT EXEC ON [dbo].getDocumentOriginalPath TO rpb_role
GO