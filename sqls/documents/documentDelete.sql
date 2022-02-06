IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'documentDelete')
	BEGIN
  DROP  Procedure  documentDelete
END
GO

CREATE PROCEDURE [dbo].documentDelete(@docId  VARCHAR(50))
AS
BEGIN
  SET NOCOUNT ON

  DELETE FROM Document WHERE id = @docId
END
GO
GRANT EXEC ON [dbo].documentDelete TO rpb_role
GO