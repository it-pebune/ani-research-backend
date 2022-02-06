IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getDocumentDataRaw')
	BEGIN
  DROP  Procedure  getDocumentDataRaw
END
GO

CREATE PROCEDURE [dbo].getDocumentDataRaw(@id VARCHAR(50))
AS
BEGIN
  SET NOCOUNT ON

  SELECT  D.id, D.dataRaw
  FROM    [Document] D
  WHERE   D.id = @id
END
GO
GRANT EXEC ON [dbo].getDocumentDataRaw TO rpb_role
GO