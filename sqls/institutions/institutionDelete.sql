IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'institutionDelete')
	BEGIN
  DROP  Procedure  institutionDelete
END
GO

CREATE PROCEDURE [dbo].institutionDelete(
  @id  INT
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE  Institution
  SET     deleted = 1
  WHERE   id = @id
END
GO
GRANT EXEC ON [dbo].institutionDelete TO rpb_role
GO