IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getInstitutionById')
	BEGIN
  DROP  Procedure  getInstitutionById
END
GO

CREATE PROCEDURE [dbo].getInstitutionById(
  @id INT
)
AS
BEGIN
  SET NOCOUNT ON

  SELECT  I.[id], I.[sirutaId], U.name uat, I.[type], I.[name], I.[address],
          I.[dateStart], I.[dateEnd], I.[cui], I.[regCom], I.[aditionalInfo],
          I.[requireDecls], I.[deleted]
  FROM    Institution I
          INNER JOIN
          Uat U ON I.sirutaId = U.sirutaId
  WHERE   I.id = @id
END
GO
GRANT EXEC ON [dbo].getInstitutionById TO rpb_role
GO