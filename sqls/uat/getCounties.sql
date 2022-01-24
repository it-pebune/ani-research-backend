IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getCounties')
	BEGIN
  DROP  Procedure  getCounties
END
GO

CREATE PROCEDURE [dbo].getCounties
AS
BEGIN
  SET NOCOUNT ON

  SELECT  id, [name]
  FROM    [County]
  ORDER BY [name]
END
GO
GRANT EXEC ON [dbo].getCounties TO rpb_role
GO