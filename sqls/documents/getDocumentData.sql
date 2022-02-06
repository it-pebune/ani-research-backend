IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getDocumentData')
	BEGIN
  DROP  Procedure  getDocumentData
END
GO

CREATE PROCEDURE [dbo].getDocumentData(@id VARCHAR(50))
AS
BEGIN
  SET NOCOUNT ON

  SELECT  D.id, D.data
  FROM    [Document] D
  WHERE   D.id = @id
END
GO
GRANT EXEC ON [dbo].getDocumentData TO rpb_role
GO