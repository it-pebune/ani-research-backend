IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getJobPositionById')
	BEGIN
  DROP  Procedure  getJobPositionById
END
GO

CREATE PROCEDURE [dbo].getJobPositionById(
  @id INT
)
AS
BEGIN
  SET NOCOUNT ON

  SELECT  J.id, J.name, J.institutionId, I.name institution, J.sirutaId, U.name uat, dateStart, dateEnd, aditionalInfo
  FROM    JobPosition J
          INNER JOIN
          Institution I ON J.institutionId = I.id
          INNER JOIN
          Uat U ON J.sirutaId = U.sirutaId
  WHERE   J.id = @id
END
GO
GRANT EXEC ON [dbo].getJobPositionById TO rpb_role
GO