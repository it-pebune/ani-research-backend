IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getUats')
	BEGIN
  DROP  Procedure  getUats
END
GO

CREATE PROCEDURE [dbo].getUats(
  @countyId INT,
  @type     TINYINT
)
AS
BEGIN
  SET NOCOUNT ON

  SELECT  sirutaId, countyId, [type], [name]
  FROM    [Uat]
  WHERE   (countyId = @countyId OR @countyId = 0)
    AND   ([type] = @type OR @type = 0)
  ORDER BY [name]
END
GO
GRANT EXEC ON [dbo].getUats TO rpb_role
GO