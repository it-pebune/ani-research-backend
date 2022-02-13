IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'jobposList')
	BEGIN
  DROP  Procedure  jobposList
END
GO

CREATE PROCEDURE [dbo].jobposList(
  @subjectId INT
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
  WHERE   J.subjectId = @subjectId
END
GO
GRANT EXEC ON [dbo].jobposList TO rpb_role
GO