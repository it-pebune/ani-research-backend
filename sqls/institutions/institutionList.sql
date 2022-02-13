IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'institutionList')
	BEGIN
  DROP  Procedure  institutionList
END
GO

CREATE PROCEDURE [dbo].institutionList
AS
BEGIN
  SET NOCOUNT ON

  SELECT  I.[id], I.[sirutaId], U.name uat, I.[type], I.[name], I.[address],
          I.[dateStart], I.[dateEnd], I.[cui], I.[regCom], I.[aditionalInfo]
  FROM    Institution I
          INNER JOIN
          Uat U ON I.sirutaId = U.sirutaId
  WHERE   I.deleted = 0
END
GO
GRANT EXEC ON [dbo].institutionList TO rpb_role
GO